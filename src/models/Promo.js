const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promoSchema = new Schema({
    promo_code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    promo_scope: {
        type: String,
        enum: ['BASKET', 'ITEM'],
        required: true,
    },
    discount_type: {
        type: String,
        enum: ['FLAT', 'PERCENTAGE'],
        required: true,
    },
    discount_value: {
        type: Number,
        required: true,
    },
    min_cart_value: {
        type: Number,
    },
    max_discount_value: {
        type: Number,
    },
    applicable_products: {
        type: [String],
        default: [],
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    per_user_limit: {
        type: Number,
        default: 1,
    },
    is_active: {
        type: Boolean,
        required: true,
        default: true,
    },
});

const Promo = mongoose.model('promos', promoSchema);

module.exports = Promo;
