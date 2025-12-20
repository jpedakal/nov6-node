const errorHandling = require('../errorHandling');
const Cart = require('../models/Cart');
const Promo = require('../models/Promo');
const {
    checkQuantityAgainstLimitPerOrder,
    calculateSubtotal,
    calculateTaxAmount,
} = require('../../utils/common');

const createCart = async (req, res) => {
    try {
        const cartExist = await Cart.findOne({
            customer_id: req.user.customer_id,
        }).lean();

        const { outOfStockItemsCheck, totalItems } =
            await checkQuantityAgainstLimitPerOrder(
                req.body.items,
                cartExist?.items || []
            );

        if (outOfStockItemsCheck.length > 0) {
            res.status(409).json(outOfStockItemsCheck);
        } else {
            // Fetch Subtotal, Tax and Total
            const subTotal = calculateSubtotal(totalItems);
            const tax = calculateTaxAmount(subTotal);
            const total = subTotal + tax;

            // Create new cart
            if (cartExist) {
                await Cart.findOneAndUpdate(
                    { customer_id: req.user.customer_id },
                    {
                        $set: {
                            items: totalItems,
                            sub_total: subTotal,
                            tax: tax,
                            total: total,
                        },
                    },
                    { new: true }
                );
                res.status(201).json({ message: 'Added to the cart' });
            } else {
                let cart = new Cart({
                    items: totalItems,
                    sub_total: subTotal,
                    tax: tax,
                    total: total,
                });
                cart.customer_id = req.user.customer_id;
                await cart.save();
                res.status(201).json({ message: 'Added to the cart' });
            }
        }
    } catch (err) {
        const errMsg = errorHandling(err);
        console.log('error while creating cart', err);
        res.json({ message: errMsg });
    }
};

const reviewCart = async (req, res) => {
    try {
        const customer_id = req.user.customer_id;

        // Check if cart exists
        const cart = await Cart.findOne({ customer_id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Check item quantity availability
        const { outOfStockItemsCheck } =
            await checkQuantityAgainstLimitPerOrder(cart.items);

        if (outOfStockItemsCheck.length > 0) {
            return res.status(409).json({
                code: 'OUT_OF_STOCK',
                message:
                    'Some items in your cart are no longer available. Please review your cart.',
                items: outOfStockItemsCheck,
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Cart fetched successfully',
            data: cart,
        });
    } catch (err) {
        console.error('error while fetching review cart', err);
        return res.status(500).json({ message: errorHandling(err) });
    }
};

const promoApply = async (req, res) => {
    const customer_id = req.user.customer_id;
    const { promo_code } = req.body;
    try {
        // Check if cart exists
        const cartExist = await Cart.findOne({ customer_id });
        if (!cartExist) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Check if promo is already applied
        if (cartExist.promo_applied) {
            return res.status(400).json({
                success: false,
                message: 'A promo code has already been applied to this cart.',
            });
        }

        const promoDetails = await Promo.findOne({
            promo_code: promo_code,
            is_active: true,
        });

        // Validate promo code
        if (!promoDetails) {
            return res
                .status(404)
                .json({ success: false, message: 'Invalid promo code.' });
        }

        const sub_total = calculateSubtotal(cartExist.items, promoDetails);
        const tax = calculateTaxAmount(sub_total);
        const total = sub_total + tax;

        let promo_details = {
            promo_code: promoDetails.promo_code,
            discount_type: promoDetails.discount_type,
            discount_value: promoDetails.discount_value,
            start_date: promoDetails.start_date,
            end_date: promoDetails.end_date,
        };

        await Cart.findOneAndUpdate(
            { customer_id: customer_id },
            {
                $set: {
                    sub_total,
                    tax,
                    total,
                    promo_applied: true,
                    promo_details,
                },
            },
            { new: true }
        );
        res.status(200).json({
            success: true,
            message: 'Promo code applied successfully.',
        });
    } catch (err) {
        console.error('error while applying promo', err);
        const errMsg = errorHandling(err);
        return res.status(500).json({ message: errMsg });
    }
};

module.exports = { createCart, reviewCart, promoApply };
