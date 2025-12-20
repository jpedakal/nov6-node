const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { tokenOptions } = require('./constants');

const generateToken = payload => {
    const data = {
        mobile: payload.mobile,
        role: payload.role,
        customer_id: payload.customer_id,
    };
    const secret = process.env.SECRET_KEY;
    const token = jwt.sign(data, secret, tokenOptions);
    return token;
};

const authorization = async (req, res, next) => {
    try {
        const token = req?.headers['authorization']?.split(' ')[1];
        if (!token)
            return res
                .status(401)
                .json({ message: 'Authorization token missing' });
        const secret = process.env.SECRET_KEY;
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        console.log('error', err);
        return res.status(500).json({ message: 'Authentication failed' });
    }
};

const encryptedPassword = password => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

const generateCustomerId = () => {
    const id = crypto.randomBytes(16).toString('hex'); // 16 bytes = 32 hex chars
    return id.match(/.{1,8}/g).join('-'); // xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx
};

module.exports = {
    generateToken,
    encryptedPassword,
    authorization,
    generateCustomerId,
};
