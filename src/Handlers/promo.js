const { promoValidator } = require("../validator");
const Promo = require("../models/Promo");

const createPromo = async (req, res) => {
  const { error, value } = promoValidator.validate(req.body);
  console.log("error", error?.details);
  if (error) {
    return res.json({ message: error?.details });
  }
  const promo = new Promo(req.body);
  await promo.save();
  res.json({ message: "Promo created successfully" });
};

module.exports = { createPromo };
