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
            type: {
                promo_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Promo',
                },
                promo_code: { type: String },
                discount_type: {
                    type: String,
                    enum: ['FLAT', 'PERCENTAGE'],
                },
                discount_value: { type: Number },
                applied_at: { type: Date, default: Date.now },
                start_date: { type: Date },
                end_date: { type: Date },
            },
            default: null,
        },
        promo_applied: { type: Boolean, default: false },
        sub_total: { type: Number },
        discount: { type: Number, default: 0 },
        taxable_amount: { type: Number, default: 0 },
        tax: { type: Number },
        total: { type: Number },
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart;
