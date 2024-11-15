// routes/patients.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Register a new patient
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

    // Hash the password using bcrypt
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert patient into the database
        pool.query(
            `INSERT INTO Patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, hashedPassword, phone, date_of_birth, gender, address],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Error registering patient.' });
                }
                res.status(201).json({ message: 'Patient registered successfully!' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

// Patient login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if patient exists
    pool.query(`SELECT * FROM Patients WHERE email = ?`, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        const patient = results[0];

        // Compare password hashes
        const match = await bcrypt.compare(password, patient.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Set session data if login is successful
        req.session.patientId = patient.id;
        req.session.email = patient.email;

        // Send success response
        res.status(200).json({ 
            message: 'Login successful!', 
            patientId: patient.id 
        });
    });
});

// Logout patient
router.post('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out. Please try again.' });
        }
        // Optionally clear the session ID cookie
        res.clearCookie('connect.sid'); // Adjust the cookie name if needed
        res.status(200).json({ message: 'Logout successful!' });
    });
});

// Get patient profile
router.get('/profile', (req, res) => {
    // Check if the patient is logged in
    if (!req.session.patientId) {
        return res.status(401).json({ error: 'You must be logged in to view your profile.' });
    }

    // Fetch the patient details from the database
    pool.query(`SELECT first_name, last_name, email, phone, date_of_birth, gender, address FROM Patients WHERE id = ?`, 
    [req.session.patientId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Patient not found.' });
        }

        res.status(200).json(results[0]);
    });
});

// Update patient profile
router.put('/profile', (req, res) => {
    // Check if the patient is logged in
    if (!req.session.patientId) {
        return res.status(401).json({ error: 'You must be logged in to update your profile.' });
    }

    const { first_name, last_name, phone, date_of_birth, gender, address } = req.body;

    // Update the patient details in the database
    pool.query(
        `UPDATE Patients SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE id = ?`,
        [first_name, last_name, phone, date_of_birth, gender, address, req.session.patientId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }
            res.status(200).json({ message: 'Profile updated successfully!' });
        }
    );
});



// View upcoming appointments
router.get('/appointments', (req, res) => {
    const patient_id = req.session.patientId;

    if (!patient_id) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    pool.query(
        `SELECT a.id, a.appointment_date, a.appointment_time, a.status, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name 
         FROM Appointments a 
         JOIN Doctors d ON a.doctor_id = d.id 
         WHERE a.patient_id = ?`,
        [patient_id],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            res.status(200).json(results);
        }
    );
});

router.delete('/patients/delete-account', (req, res) => {
    if (!req.session.patientId) {
        return res.status(401).json({ error: 'You must be logged in to delete your account.' });
    }

    const patientId = req.session.patientId;

    // Delete related appointments
    pool.query(`DELETE FROM Appointments WHERE patient_id = ?`, [patientId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error. Could not delete related appointments.' });
        }

        // Delete the patient record
        pool.query(`DELETE FROM Patients WHERE id = ?`, [patientId], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error. Could not delete patient account.' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Patient account not found.' });
            }

            // Destroy session and clear cookie
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ error: 'Could not delete account. Please try again.' });
                }
                res.clearCookie('connect.sid');
                return res.status(200).json({ message: 'Account deleted successfully.' });
            });
        });
    });
});

module.exports = router;
