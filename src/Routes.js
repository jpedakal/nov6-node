const express = require("express");
const router = express.Router();
const {
  welcomeMsg,
  fetchProduct,
  insertProduct,
  deleteProduct,
} = require("./Handlers/product");
const { createUser, signin } = require("./Handlers/user");
const { createCart, reviewCart } = require("./Handlers/cart");
const { authorization } = require("../utils/auth");
const { placeOrder } = require("./Handlers/order");
const { createPromo, fetchPromo } = require("./Handlers/promo");

router.get("/welcome", welcomeMsg);

// Product
router.get("/fetchProduct/:id", authorization, fetchProduct);
router.post("/saveProduct", insertProduct);
// router.put("/updateProduct", updateProduct);
router.delete("/deleteProduct", deleteProduct);

// User
router.post("/user/create", createUser);
router.post("/user/login", signin);

// Cart
router.post("/cart/create", authorization, createCart);
router.get("/cart/review", authorization, reviewCart);

// Order
router.post("/order/place-order", authorization, placeOrder);

// Promo
router.post("/promo/create", authorization, createPromo);
router.get("/promo/fetch", authorization, fetchPromo);

module.exports = router;
