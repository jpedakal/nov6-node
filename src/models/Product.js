const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    product_id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    // discount: { type: Number, required: true },
    stock: { type: Number, required: true },
    limit_per_order: { type: Number, required: true },
    is_active: { type: Boolean, required: true },
});

productSchema.index({ product_id: 1 });

const Product = mongoose.model('products', productSchema);

module.exports = Product;
