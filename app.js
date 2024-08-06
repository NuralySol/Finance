import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Transaction } from './models/transaction.js';
import { plaidClient } from './plaidClient.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI);

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/get-transactions', async (req, res) => {
    try {
        const accessTokenResponse = await plaidClient.exchangePublicToken('public-sandbox-token');
        const accessToken = accessTokenResponse.access_token;
        const transactionsResponse = await plaidClient.getTransactions(accessToken, '2021-01-01', '2021-12-31', {});

        const transactions = transactionsResponse.transactions.map(txn => ({
            date: txn.date,
            name: txn.name,
            amount: txn.amount,
            category: txn.category[0]
        }));

        await Transaction.insertMany(transactions);
        res.send('Transactions saved to MongoDB');
    } catch (error) {
        console.error(error);
        res.send('Error fetching transactions');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});