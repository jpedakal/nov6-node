const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema(
    {
        customer_id: { type: String, required: true },
        order_id: { type: String, required: true, unique: true },
        sub_total: { type: Number, require: true },
        taxable_amount: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        tax: { type: Number, required: true },
        total: { type: Number, required: true },
        status: {
            type: String,
            enum: ['submitted', 'in_progress', 'delivered'],
        },
        payment_method: { type: String, default: 'COD' },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('orders', orderSchema);

module.exports = Order;
