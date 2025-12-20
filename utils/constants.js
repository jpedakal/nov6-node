const tokenOptions = {
    expiresIn: '12h',
    audience: 'myapp.com',
    issuer: 'myapp.com',
    subject: 'auth_token',
    algorithm: 'HS256',
    jwtid: 'uniqueTokenId',
    notBefore: '0s',
};

module.exports = { tokenOptions };
