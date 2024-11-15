const express  = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../config/db.js');
const adminAuth = require('../middleware/adminAuth');



// Admin login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the admin by username
    pool.query(
        `SELECT * FROM Admin WHERE username = ?`,
        [username],
        async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            if (results.length === 0) {
                return res.status(400).json({ error: 'Invalid username or password.' });
            }

            const admin = results[0];

            try {
                // Compare the provided password with the stored hashed password
                const match = await bcrypt.compare(password, admin.password_hash);

                if (match) {
                    // Set session data
                    req.session.adminId = admin.id;
                    res.status(200).json({ message: 'Admin login successful!' });
                } else {
                    res.status(400).json({ error: 'Invalid username or password.' });
                }
            } catch (err) {
                res.status(500).json({ error: 'Server error.' });
            }
        }
    );
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed.' });
        }
        res.status(200).json({ message: 'Logout successful!' });
    });
});


// Route to get the total number of registered doctors
router.get('/doctors/count', (req, res) => {
    pool.query(
        `SELECT COUNT(*) AS totalDoctors FROM Doctors`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }
            const totalDoctors = results[0].totalDoctors;
            res.status(200).json({ totalDoctors });
        }
    );
});
// Route to get the total number of registered patients
router.get('/patients/count', (req, res) => {
    pool.query(
        `SELECT COUNT(*) AS totalPatients FROM Patients`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }
            const totalPatients = results[0].totalPatients;
            res.status(200).json({ totalPatients });
        }
    );
});

// Route to get the total number of scheduled and canceled appointments
router.get('/appointments/count', (req, res) => {
    // Query to get total scheduled appointments this year
    pool.query(
        `SELECT 
            COUNT(*) AS totalScheduled 
         FROM Appointments 
         WHERE status = 'scheduled' AND YEAR(appointment_date) = YEAR(CURDATE())`,
        (err, scheduledResults) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            // Query to get total scheduled appointments last year (for percentage calculation)
            pool.query(
                `SELECT 
                    COUNT(*) AS totalScheduledLastYear 
                 FROM Appointments 
                 WHERE status = 'scheduled' AND YEAR(appointment_date) = YEAR(CURDATE()) - 1`,
                (err, lastYearScheduledResults) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error.' });
                    }

                    // Query to get total canceled appointments this year
                    pool.query(
                        `SELECT 
                            COUNT(*) AS totalCancelled 
                         FROM Appointments 
                         WHERE status = 'canceled' AND YEAR(appointment_date) = YEAR(CURDATE())`,
                        (err, cancelledResults) => {
                            if (err) {
                                return res.status(500).json({ error: 'Database error.' });
                            }

                            // Query to get total canceled appointments last year (for percentage calculation)
                            pool.query(
                                `SELECT 
                                    COUNT(*) AS totalCancelledLastYear 
                                 FROM Appointments 
                                 WHERE status = 'canceled' AND YEAR(appointment_date) = YEAR(CURDATE()) - 1`,
                                (err, lastYearCancelledResults) => {
                                    if (err) {
                                        return res.status(500).json({ error: 'Database error.' });
                                    }

                                    const totalScheduled = scheduledResults[0].totalScheduled;
                                    const totalScheduledLastYear = lastYearScheduledResults[0].totalScheduledLastYear || 0;
                                    const totalCancelled = cancelledResults[0].totalCancelled;
                                    const totalCancelledLastYear = lastYearCancelledResults[0].totalCancelledLastYear || 0;

                                    // Calculate percentage increase for scheduled appointments
                                    const scheduledIncrease = totalScheduledLastYear > 0 
                                        ? ((totalScheduled - totalScheduledLastYear) / totalScheduledLastYear) * 100 
                                        : 0;

                                    // Calculate percentage increase for canceled appointments
                                    const cancelledIncrease = totalCancelledLastYear > 0 
                                        ? ((totalCancelled - totalCancelledLastYear) / totalCancelledLastYear) * 100 
                                        : 0;

                                    // Send the data to the frontend
                                    res.status(200).json({
                                        totalScheduled,
                                        totalCancelled,
                                        scheduledIncrease: scheduledIncrease.toFixed(2),
                                        cancelledIncrease: cancelledIncrease.toFixed(2)
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});


// View all appointments (admin only)
router.get('/appointments', adminAuth, (req, res) => {
    pool.query(
        `SELECT a.id, a.appointment_date, a.appointment_time, a.status, 
                p.first_name AS patient_first_name, p.last_name AS patient_last_name, 
                d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, d.specialization
         FROM Appointments a
         JOIN Patients p ON a.patient_id = p.id
         JOIN Doctors d ON a.doctor_id = d.id`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            res.status(200).json(results);
        }
    );
});



// Add a new doctor (admin only)
router.post('/doctors', adminAuth, (req, res) => {
    const { first_name, last_name, specialization, email, phone, schedule } = req.body;

    pool.query(
        `INSERT INTO Doctors (first_name, last_name, specialization, email, phone, schedule) VALUES (?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, specialization, email, phone, schedule],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            res.status(201).json({ message: 'Doctor added successfully!' });
        }
    );
});

// Get all doctors' information (admin only)
router.get('/doctors', adminAuth, (req, res) => {
    pool.query(
        'SELECT * FROM Doctors',  // Query to select all doctors from the database
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            // Return the list of doctors in the response
            res.status(200).json({ doctors: results });
        }
    );
});

// Route to get a specific doctor by ID (admin only)
router.get('/doctors/:id', adminAuth, (req, res) => {
    const doctorId = req.params.id;

    pool.query(
        'SELECT * FROM Doctors WHERE id = ?', // Query to fetch the doctor by ID
        [doctorId],
        (err, results) => {
            if (err) {
                console.error('Error fetching doctor:', err);
                return res.status(500).json({ message: 'Server error while fetching doctor' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            // Send the doctor data as JSON
            res.json({ doctor: results[0] });
        }
    );
});

// Update a doctor's information (admin only)
router.put('/doctors/:id', adminAuth, (req, res) => {
    const doctorId = req.params.id;
    const { first_name, last_name, specialization, email, phone, schedule } = req.body;

    pool.query(
        `UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, email = ?, phone = ?, schedule = ? WHERE id = ?`,
        [first_name, last_name, specialization, email, phone, schedule, doctorId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            res.status(200).json({ message: 'Doctor updated successfully!' });
        }
    );
});

// Delete a doctor (admin only)
router.delete('/doctors/:id', adminAuth, (req, res) => {
    const doctorId = req.params.id;

    pool.query(
        `DELETE FROM Doctors WHERE id = ?`,
        [doctorId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            res.status(200).json({ message: 'Doctor deleted successfully!' });
        }
    );
});


// Update a doctor's details (admin only)
router.put('/:id', (req, res) => {
    // Check if the user is logged in and is an admin
    if (!req.session.adminId) {
        return res.status(401).json({ error: 'You must be an admin to update a doctor profile.' });
    }

    const { id } = req.params;
    const { first_name, last_name, specialization, email, phone, schedule } = req.body;

    // Update the doctor's details in the database
    pool.query(
        `UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, email = ?, phone = ?, schedule = ? WHERE id = ?`,
        [first_name, last_name, specialization, email, phone, schedule, id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            res.status(200).json({ message: 'Doctor profile updated successfully!' });
        }
    );
});


//patients
// List all patients (admin only)
router.get('/patients', adminAuth, (req, res) => {
    pool.query(
        `SELECT id, first_name, last_name, email, phone, address, date_of_birth FROM Patients`,
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            res.status(200).json(results);
        }
    );
});

// Search Patients Route
router.get('/search-patients', (req, res) => {
    const query = req.query.query;

    // Search for patients with the query in either first name or last name
    pool.query(
        `SELECT * FROM Patients WHERE first_name LIKE ? OR last_name LIKE ?`,
        [`%${query}%`, `%${query}%`],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }
            res.json(results);
        }
    );
});

// Search Appointments Route
router.get('/search-appointments', (req, res) => {
    const query = req.query.query;

    // Search for appointments with the query in either patient's first name, last name,
    // doctor's first name, last name, or doctor's specialization
    pool.query(
        `SELECT a.id, p.first_name AS patient_first_name, p.last_name AS patient_last_name, 
                a.date, a.time, a.status, d.first_name AS doctor_first_name, 
                d.last_name AS doctor_last_name, d.specialization
         FROM Appointments a
         JOIN Patients p ON a.patient_id = p.id
         JOIN Doctors d ON a.doctor_id = d.id
         WHERE p.first_name LIKE ? OR p.last_name LIKE ? OR 
               d.first_name LIKE ? OR d.last_name LIKE ? OR 
               d.specialization LIKE ?`,
        [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }
            res.json(results); // Send the matching appointment records
        }
    );
});

// Search Doctors Route
router.get('/search-doctors', (req, res) => {
    const query = req.query.query;

    // Search for doctors with the query in either first name, last name, or specialization
    pool.query(
        `SELECT * FROM Doctors WHERE first_name LIKE ? OR last_name LIKE ? OR specialization LIKE ?`,
        [`%${query}%`, `%${query}%`, `%${query}%`],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }
            res.json(results); // Send the matching doctor records
        }
    );
});



module.exports = router;