import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    date: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to User model
});

export const Transaction = mongoose.model('Transaction', transactionSchema);