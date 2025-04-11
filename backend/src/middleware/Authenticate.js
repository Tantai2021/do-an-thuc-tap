// authenticate.js
const jwt = require('jsonwebtoken');

function Authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Missing token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;

        next();
    } catch (err) {
        console.log(err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = Authenticate;
