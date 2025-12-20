const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema(
    {
        customer_id: { type: String, required: true },
        items: [
            {
                product_id: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        promo_details: {
            promo_code: { type: String, default: null },
            discount_type: {
                type: String,
                enum: ['FLAT', 'PERCENTAGE'],
                default: null,
            },
            discount_value: { type: Number, default: 0 },
            start_date: { type: Date, default: null },
            end_date: { type: Date, default: null },
        },
        promo_applied: { type: Boolean, default: false },
        sub_total: { type: Number },
        tax: { type: Number },
        total: { type: Number },
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart;
