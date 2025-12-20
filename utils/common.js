const Product = require('../src/models/Product');


// Calculate Subtotal
const calculateSubtotal = (items = []) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);


// Calculate discount
const calculateDiscount = (subtotal, promoDetails) => {
    let discount = 0;

    if (promoDetails) {
        if (promoDetails.discount_type === 'PERCENTAGE') {
            discount = (subtotal * promoDetails.discount_value) / 100;
        } else if (promoDetails.discount_type === 'FLAT') {
            discount = promoDetails.discount_value;
        }
    }
    return discount;
};


// Calculate Tax
const calculateTax = (subtotal, discount = 0) => {
    const taxableAmount = subtotal - discount;
    return Number((taxableAmount * 0.18).toFixed(2));
};


// Check limit_per_order for each item
const checkLimitPerOrder = async items => {
    const outOfStockItems = [];
    for (let item of items) {
        const dbItem = await Product.findOne({
            product_id: item.product_id,
        }).lean();

        if (item.quantity > dbItem?.limit_per_order) {
            outOfStockItems.push({
                message: `Maximum ${dbItem.limit_per_order} items allowed per order`,
            });
        }
    }
    return { outOfStockItems };
};


// Condition to check the existing quantity against limit_per_order (With or without existing cart)
const checkQuantityAgainstLimitPerOrder = async (
    inputItems,
    existingCartItems = []
) => {
    const merged = new Map();
    let outOfStockItemsCheck;

    const allItems =
        existingCartItems.length > 0
            ? [...existingCartItems, ...inputItems]
            : inputItems;

    allItems.forEach(item => {
        if (merged.get(item.product_id)) {
            merged.get(item.product_id).quantity += item.quantity;
        } else merged.set(item.product_id, { ...item });
    });

    const mergedItems = Array.from(merged.values());
    outOfStockItemsCheck = await checkLimitPerOrder(mergedItems);

    return { outOfStockItemsCheck, totalItems: mergedItems };
};


module.exports = {
    calculateSubtotal,
    calculateDiscount,
    calculateTax,
    checkLimitPerOrder,
    checkQuantityAgainstLimitPerOrder,
};
