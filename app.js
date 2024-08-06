import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
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
    secret: 'your_secret_key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set secure: true if using HTTPS
}));

mongoose.connect(process.env.MONGO_URI);

// Plaid configuration
const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

const plaidClient = new PlaidApi(configuration);

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
        if (user && await user.comparePassword(password)) {
            req.session.userId = user._id; // Store user ID in session
            req.session.username = user.username; // Store username in session
            res.redirect('/link-account');
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

app.get('/link-account', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login if user is not logged in
    }
    res.render('link-account', { username: req.session.username }); // Pass username to template
});

// Go to dashboard once the bank is linked

app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    try {
        const transactions = await Transaction.find({}); // Adjust query to fetch only user-specific transactions
        res.render('dashboard', { transactions });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching transactions');
    }
});

app.post('/create-link-token', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized'); // Deny access if user is not logged in
    }
    try {
        const response = await plaidClient.linkTokenCreate({
            user: {
                client_user_id: req.session.userId.toString(), // Use user ID from session
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
        return res.status(401).send('Unauthorized'); // Deny access if user is not logged in
    }
    try {
        const { public_token } = req.body;
        const tokenResponse = await plaidClient.itemPublicTokenExchange({
            public_token: public_token,
        });
        const accessToken = tokenResponse.data.access_token;
        const transactionsResponse = await plaidClient.transactionsGet({
            access_token: accessToken,
            start_date: '2021-01-01',
            end_date: '2021-12-31',
        });

        const transactions = transactionsResponse.data.transactions.map(txn => ({
            date: txn.date,
            name: txn.name,
            amount: txn.amount,
            category: txn.category[0]
        }));

        await Transaction.insertMany(transactions);
        res.json('Transactions saved to MongoDB');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching transactions');
    }
});

app.delete('/delete-user', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        await User.findByIdAndDelete(req.session.userId);
        req.session.destroy(); // Destroy the session
        res.send('User deleted successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting user');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});