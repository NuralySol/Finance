import express from 'express';
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
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

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

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await user.comparePassword(password)) {
            res.redirect('/link-account');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

app.get('/link-account', (req, res) => {
    res.render('link-account');
});

app.post('/create-link-token', async (req, res) => {
    try {
        const response = await plaidClient.linkTokenCreate({
            user: {
                client_user_id: 'unique_user_id', // Replace with actual user id
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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});