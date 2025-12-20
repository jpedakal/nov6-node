const Joi = require('joi');

const promoValidator = Joi.object({
    promo_code: Joi.string().alphanum().min(6).max(10).required(),
    description: Joi.string().required(),
    promo_scope: Joi.string().valid('BASKET', 'ITEM').required(),
    discount_type: Joi.string().valid('FLAT', 'PERCENTAGE').required(),
    discount_value: Joi.number().required(),
    min_cart_value: Joi.number().optional(),
    max_discount_value: Joi.number().optional(),
    applicable_products: Joi.array().items(Joi.string()).optional(),
    per_user_limit: Joi.number().optional(),
    is_active: Joi.boolean().optional(),
    start_date: Joi.string().isoDate().required(),
    end_date: Joi.string().isoDate().required(),
});

module.exports = { promoValidator };
