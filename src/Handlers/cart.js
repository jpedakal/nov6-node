const errorHandling = require('../errorHandling');
const Cart = require('../models/Cart');
const Promo = require('../models/Promo');
const {
    checkQuantityAgainstLimitPerOrder,
    calculateSubtotal,
    calculateTax,
    calculateDiscount,
} = require('../../utils/common');

const createCart = async (req, res) => {
    try {
        const { customer_id } = req.user;
        const cartExist = await Cart.findOne({
            customer_id,
        }).lean();

        const { outOfStockItemsCheck, totalItems } =
            await checkQuantityAgainstLimitPerOrder(
                req.body.items,
                cartExist?.items || []
            );

        if (outOfStockItemsCheck.length > 0) {
            return res.status(409).json(outOfStockItemsCheck);
        } else {
            // Fetch Subtotal, Tax and Total
            const subTotal = calculateSubtotal(totalItems);
            const tax = calculateTax(subTotal);
            const total = Number((subTotal + tax).toFixed(2));

            const cartInfo = {
                items: totalItems,
                sub_total: subTotal,
                taxable_amount: subTotal,
                tax: tax,
                total: total,
            };

            /**
               - Atomic upsert to safely handle concurrent requests:
               - Updates cart data if the cart already exists
               - Creates a new cart if none exists
               - Prevents duplicate carts for the same customer
             **/
            await Cart.findOneAndUpdate(
                { customer_id },
                {
                    $set: cartInfo,
                    $setOnInsert: { customer_id },
                },
                { upsert: true }
            );
            return res.status(201).json({ message: 'Added to the cart' });
        }
    } catch (err) {
        const errMsg = errorHandling(err);
        console.log('error while creating cart', err);
        res.json({ message: errMsg });
    }
};

const reviewCart = async (req, res) => {
    try {
        const { customer_id } = req.user;

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
        const errMsg = errorHandling(err);
        return res.json({ message: errMsg });
    }
};

const promoApply = async (req, res) => {
    const { customer_id } = req.user;
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

        // Fetch promo details
        const promoDetails = await Promo.findOne({
            promo_code: promo_code,
            is_active: true,
        });

        // Check promo validity
        if (
            promoDetails.end_date < new Date() ||
            promoDetails.start_date > new Date()
        ) {
            return res
                .status(404)
                .json({ success: false, message: 'Invalid promo code.' });
        }

        // Check minimum order value
        if (cartExist.sub_total < promoDetails.min_order_value) {
            return res.status(400).json({
                success: false,
                message: `Minimum order value of ${promoDetails.min_order_value} is required to apply this promo code.`,
            });
        }

        const discount = calculateDiscount(cartExist.sub_total, promoDetails);
        const taxable_amount = cartExist.sub_total - discount;
        const tax = calculateTax(taxable_amount);
        const total = taxable_amount + tax;

        let promo_details = {
            promo_id: promoDetails._id,
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
                    discount,
                    taxable_amount,
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
        return res.json({ success: false, message: errMsg });
    }
};

const promoRemove = async (req, res) => {
    const { customer_id } = req.user;
    try {
        const promoCode = req.body.promo_code;
        const cartExist = await Cart.findOne({ customer_id });
        if (!cartExist) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        if (!cartExist.promo_applied) {
            return res.status(400).json({
                success: false,
                message: 'No promo code applied to this cart.',
            });
        }

        if (cartExist.promo_details.promo_code !== promoCode) {
            return res.status(400).json({
                success: false,
                message:
                    'The provided promo code does not match the applied promo code.',
            });
        }

        const tax = calculateTax(cartExist.sub_total);
        const total = Number((cartExist.sub_total + tax).toFixed(2));
        const discount = 0;
        const promo_details = {
            promo_code: '',
            discount_type: '',
            discount_value: 0,
            start_date: null,
            end_date: null,
        };

        await Cart.findOneAndUpdate(
            { customer_id: customer_id },
            {
                $set: {
                    tax,
                    discount,
                    total,
                    taxable_amount: cartExist.sub_total,
                    promo_applied: false,
                    promo_details,
                },
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Promo code removed successfully.',
        });
    } catch (err) {
        const errMsg = errorHandling(err);
        console.error('error while removing promo', err);
        return res.status(500).json({ success: false, message: errMsg });
    }
};
module.exports = { createCart, reviewCart, promoApply, promoRemove };
