const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
    {
        customer_id: { type: String, required: true },
        items: [
            {
                product_id: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true }
            }
        ],
        sub_total: { type: Number },
        tax: { type: Number },
        total: { type: Number }
    },
    {
        timestamps: true
    }
);

const Cart = mongoose.model("cart", cartSchema);

module.exports = Cart;
