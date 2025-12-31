const errorHandling = require('../errorHandling');
const Product = require('../models/Product');

const fetchProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const result = await Product.findOne({ product_id: productId });
        res.json(result);
    } catch (err) {
        const errMsg = errorHandling(err);
        res.json({ message: errMsg });
    }
};

const insertProduct = async (req, res) => {
    try {
        const productId = req.body.product_id;
        const product = new Product(req.body);
        const existingProduct = await Product.findOne({
            product_id: productId,
        });
        if (existingProduct) {
            await Product.findOneAndUpdate(
                { product_id: existingProduct.product_id },
                {
                    $set: req.body,
                },
                { new: true }
            );
            return res.json({
                message: `Product ${productId} updated successfully`,
            });
        }
        const result = await product.save();
        res.json(result);
    } catch (err) {
        console.log('Failed to insert products', err);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const data = await Product.deleteMany({});
        res.status(200).json({ message: 'Products deleted successfully' });
    } catch (err) {
        console.log('Failed to delete products');
    }
};

module.exports = { fetchProduct, insertProduct, deleteProduct };
