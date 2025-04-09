// authorize.js
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: No user info' });
        }

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden: Access denied' });
        }

        next(); // User has permission
    };
}

module.exports = authorize;
