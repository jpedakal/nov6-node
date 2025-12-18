const errorHandling = require("../errorHandling");
const Cart = require("../models/Cart");
const {
    calculateTax,
    checkItemStock,
    checkQuantityAgainstLimitPerOrder
} = require("../../utils/common");

const createCart = async (req, res) => {
    try {
        const cartExist = await Cart.findOne({
            customer_id: req.user.customer_id
        }).lean();

        const {
            outOfStockItemsCheck,
            totalItems
        } = await checkQuantityAgainstLimitPerOrder(req.body.items, cartExist?.items || []);

        if (outOfStockItemsCheck.length > 0) {
            res.status(409).json(outOfStockItemsCheck);
        } else {
            // Create new cart
            if (cartExist) {
                await Cart.findOneAndUpdate(
                    { customer_id: req.user.customer_id },
                    { $set: {items: totalItems} },
                    { new: true }
                );
                res.status(201).json({ message: "Added to the cart" });
            } else {
                let cart = new Cart({items: totalItems});
                cart.customer_id = req.user.customer_id;
                await cart.save();
                res.status(201).json({ message: "Added to the cart" });
            }
        }
    } catch (err) {
        const errMsg = errorHandling(err);
        console.log("error while creating cart", err);
        res.json({ message: errMsg });
    }
};

const reviewCart = async (req, res) => {
    try {
        const customer_id = req.user.customer_id;

        // Check if cart exists
        const cart = await Cart.findOne({ customer_id });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Check item quantity availability
        const outOfStockItems = await checkItemStock(cart.items);

        if (outOfStockItems.length > 0) {
            return res.status(409).json({
                code: "OUT_OF_STOCK",
                message:
                    "Some items in your cart are no longer available. Please review your cart.",
                items: outOfStockItems
            });
        }

        // Calculate subtotal, tax, and total
        const { sub_total, tax, total } = calculateTax(cart.items);
        cart.sub_total = sub_total;
        cart.tax = tax;
        cart.total = total;

        return res.json(cart);
    } catch (err) {
        console.error("error while fetching review cart", err);
        return res.status(500).json({ message: errorHandling(err) });
    }
};

module.exports = { createCart, reviewCart };
