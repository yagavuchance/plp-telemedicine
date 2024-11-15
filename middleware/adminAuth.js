// middleware/adminAuth.js

module.exports = function (req, res, next) {
    // Check if the user is logged in and is an admin
    if (req.session && req.session.adminId) {
        next(); // Proceed to the next middleware or route
    } else {
        res.status(401).json({ error: 'Unauthorized access. Admins only.' });
    }
};
