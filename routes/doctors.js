const express =require('express');
const router = express.Router();
const pool = require('../config/db.js');


// Get all doctors
router.get('/', (req, res) => {
    // Fetch all doctors from the database
    pool.query(
        `SELECT id, first_name, last_name, specialization, email, phone, schedule FROM Doctors`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            res.status(200).json(results);
        }
    );
});


module.exports = router;