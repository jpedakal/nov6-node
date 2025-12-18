const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: { type: String, required: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: {
                validator: value => /^[6-9]\d{9}$/.test(value),
                message: "Invalid mobile number"
            }
        },
        role: {
            type: String,
            enum: ["customer", "admin", "seller"],
            default: "customer"
        },
        customer_id: { type: String, required: true },
        is_active: { type: Boolean, default: true },
        last_login: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const User = mongoose.model("users", userSchema);

module.exports = User;
