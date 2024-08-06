import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    date: String,
    name: String,
    amount: Number,
    category: String
});

export const Transaction = mongoose.model('Transaction', transactionSchema);