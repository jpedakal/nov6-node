const { promoValidator } = require("../validator");
const Promo = require("../models/Promo");
const errorHandling = require("../errorHandling");

const createPromo = async (req, res) => {
  try {
    // Validate request body
    const { error } = promoValidator.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: error?.details,
      });
    }
    const promo = new Promo(req.body);
    await promo.save();
    res
      .status(201)
      .json({ success: true, message: "Promo created successfully" });
  } catch (err) {
    const errorMsg = errorHandling(err);
    res.status(500).json({ success: false, message: errorMsg });
  }
};

const updatePromo = async (req, res) => {
  try {
    const { error } = promoValidator.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: error?.details,
      });
    }

    const updateDocument = await Promo.findOneAndUpdate(
      { promo_code: req.body.promo_code },
      { $set: req.body },
      { new: true }
    );

    if (!updateDocument) {
      return res
        .status(404)
        .json({ success: false, message: "Promo code not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Promo updated successfully" });
  } catch (err) {
    const errorMsg = errorHandling(err);
    res.status(500).json({ success: false, message: errorMsg });
  }
};

const fetchPromo = async (req, res) => {
  try {
    const promoCode = req.query.promo_code
      ? { promo_code: req.query.promo_code }
      : {};
    const data = await Promo.find(promoCode);
    if (!data.length) {
      return res
        .status(404)
        .json({ success: false, message: "No promo code found", data: [] });
    }
    res
      .status(200)
      .json({ success: true, message: "Data fetched successfully", data });
  } catch (err) {
    const errorMsg = errorHandling(err);
    res.status(500).json({ success: false, message: errorMsg });
  }
};

module.exports = { createPromo, updatePromo, fetchPromo };
