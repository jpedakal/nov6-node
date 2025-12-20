const Stripe = require('stripe');
const errorHandling = require('../errorHandling');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { calculateTax, checkLimitPerOrder } = require('../../utils/common');

let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
}

const placeOrder = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const { customer_id } = req.user;

        const cartInfo = await Cart.findOne({ customer_id });
        if (!cartInfo || cartInfo.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const { outOfStockItems } = await checkLimitPerOrder(cartInfo.items);
        console.log('outOfStockItems:', outOfStockItems);
        if (outOfStockItems.length > 0) {
            return res.status(409).json({
                code: 'OUT_OF_STOCK',
                message:
                    'Some items are out of stock. Please update your cart.',
            });
        }

        const { sub_total, taxable_amount, discount, tax, total } = cartInfo;

        // 1️⃣ Create order
        const order = await Order.create(
            [
                {
                    customer_id,
                    order_id: `ORD-${Date.now()}`,
                    items: cartInfo.items,
                    sub_total,
                    taxable_amount,
                    discount,
                    tax,
                    total,
                    status: 'submitted',
                    payment_method: 'Online',
                },
            ],
            { session }
        );

        // 2️⃣ Update inventory
        for (const item of cartInfo.items) {
            await Product.updateOne(
                { product_id: item.product_id },
                { $inc: { stock: -item.quantity } },
                { session }
            );
        }

        // 3️⃣ Clear cart
        await Cart.deleteOne({ customer_id }).session(session);

        // ✅ COMMIT
        await session.commitTransaction();

        return res.json({
            message: 'Order placed successfully',
            order_id: order[0].order_id,
        });
    } catch (err) {
        await session.abortTransaction();
        console.error('Order failed:', err);
        return res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
};

module.exports = { placeOrder };
