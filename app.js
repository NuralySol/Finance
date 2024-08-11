// app.js
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { plaidClient } from './plaidClient.js';
import { Transaction } from './models/transaction.js';
import { User } from './models/user.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

mongoose.connect(process.env.MONGO_URI);

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.redirect('/login?error=User%20already%20exists');
        }

        const user = new User({ username, password });
        await user.save();
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.redirect('/login?error=Invalid%20username%20or%20password');
        }

        req.session.userId = user._id;
        req.session.username = user.username;
        res.redirect('/link-account');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

// Route to handle log out
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session during logout:', err);
            return res.status(500).send('Failed to log out.');
        }

        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/login'); // Redirect to login page
    });
});


app.get('/link-account', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('link-account', { username: req.session.username });
});

app.post('/create-link-token', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const response = await plaidClient.linkTokenCreate({
            user: {
                client_user_id: req.session.userId.toString(),
            },
            client_name: 'Finance Tracker App',
            products: ['transactions'],
            country_codes: ['US'],
            language: 'en',
        });
        res.json({ link_token: response.data.link_token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating link token');
    }
});

app.post('/get-transactions', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const { public_token } = req.body;
        console.log('Public Token:', public_token);

        // Exchange the public token for an access token
        const tokenResponse = await plaidClient.itemPublicTokenExchange({
            public_token: public_token,
        });
        const accessToken = tokenResponse.data.access_token;
        console.log('Access Token:', accessToken);

        // Fetch transactions from Plaid
        const transactionsResponse = await plaidClient.transactionsGet({
            access_token: accessToken,
            start_date: '2021-01-01',
            end_date: '2024-08-07',
        });

        console.log('Transactions Response:', transactionsResponse.data);

        // Create and save transactions to MongoDB
        const transactions = transactionsResponse.data.transactions.map(txn => ({
            date: txn.date,
            name: txn.name,
            amount: txn.amount,
            category: txn.category[0]
        }));

        // Save each transaction individually
        for (const txn of transactions) {
            const transaction = new Transaction(txn);
            await transaction.save();
        }

        res.json('Transactions saved to MongoDB');
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Error fetching transactions');
    }
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const { date, page = 1 } = req.query;
    const selectedDate = date ? new Date(date) : new Date();
    const oneYearAgo = new Date(selectedDate);
    oneYearAgo.setFullYear(selectedDate.getFullYear() - 1);

    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        const transactions = await Transaction.find({
            date: { $gte: oneYearAgo.toISOString(), $lte: selectedDate.toISOString() }
        })
        .skip(skip)
        .limit(limit)
        .exec();

        const totalTransactions = await Transaction.countDocuments({
            date: { $gte: oneYearAgo.toISOString(), $lte: selectedDate.toISOString() }
        });

        const totalPages = Math.ceil(totalTransactions / limit);

        // Convert date strings to readable format before rendering
        const formattedTransactions = transactions.map(txn => ({
            ...txn._doc, // Get the document data
            date: new Date(txn.date).toLocaleDateString('en-US')
        }));

        res.render('dashboard', { 
            transactions: formattedTransactions,
            username: req.session.username,
            selectedDate: selectedDate.toISOString().split('T')[0],
            currentPage: parseInt(page, 10),
            totalPages
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching transactions');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect if not logged in
    }

    // Pass the username to the template
    res.render('dashboard', {
        username: req.session.username, // Pass username from session to EJS
        // Add any other data you need to pass, like transactions, selectedDate, etc.
    });
});

app.delete('/delete-user', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // Find and delete the user by their session ID
        const result = await User.findByIdAndDelete(req.session.userId);

        if (!result) {
            return res.status(404).send('User not found');
        }

        // Destroy the session after deletion
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Failed to delete session');
            }
            res.send('Account successfully deleted');
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});