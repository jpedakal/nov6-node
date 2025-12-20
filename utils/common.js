const Product = require("../src/models/Product");

// Calculate subtotal, tax, and total
const calculateTax = (items) => {
  const sub_total = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );
  const tax = Number((sub_total * 0.18).toFixed(2));
  const total = Number((sub_total + tax).toFixed(2));
  return { sub_total, tax, total };
};

const checkLimitPerOrder = async (items) => {
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
  return outOfStockItems;
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

  allItems.forEach((item) => {
    if (merged.get(item.product_id)) {
      merged.get(item.product_id).quantity += item.quantity;
    } else merged.set(item.product_id, { ...item });
  });

  const mergedItems = Array.from(merged.values());
  outOfStockItemsCheck = await checkLimitPerOrder(mergedItems);

  return { outOfStockItemsCheck, totalItems: mergedItems };
};

module.exports = {
  calculateTax,
  checkQuantityAgainstLimitPerOrder,
};
