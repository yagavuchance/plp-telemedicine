const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Import the database connection

// Create (book) an appointment
router.post('/', (req, res) => {
    // Check if the patient is logged in
    if (!req.session.patientId) {
        return res.status(401).json({ error: 'You must be logged in to book an appointment.' });
    }

    const { doctor_id, appointment_date, appointment_time } = req.body;

    // Insert the new appointment into the database
    pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, 'scheduled')`,
        [req.session.patientId, doctor_id, appointment_date, appointment_time],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }
            res.status(201).json({ message: 'Appointment booked successfully!' });
        }
    );
});


// Get upcoming appointments for the logged-in patient
router.get('/get-appointment', (req, res) => {
    // Check if the patient is logged in
    if (!req.session.patientId) {
        return res.status(401).json({ error: 'You must be logged in to view your appointments.' });
    }

    // Fetch appointments from the database
    pool.query(
        `SELECT Appointments.id, Doctors.first_name AS doctor_first_name, Doctors.last_name AS doctor_last_name, Doctors.specialization, Appointments.appointment_date, Appointments.appointment_time, Appointments.status
         FROM Appointments
         JOIN Doctors ON Appointments.doctor_id = Doctors.id
         WHERE Appointments.patient_id = ? AND Appointments.status = 'scheduled'`,
        [req.session.patientId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            res.status(200).json(results);
        }
    );
});

// Route to update (reschedule) an appointment
router.put('/:id', (req, res) => {
    // Check if the user is logged in
    if (!req.session.patientId) {
        return res.status(401).json({ error: 'You must be logged in to update your appointment.' });
    }

    const { id } = req.params;
    const { appointment_date, appointment_time } = req.body;

    // First query: Check if the appointment exists and is reschedulable
    pool.query(
        `SELECT * FROM Appointments WHERE id = ? AND patient_id = ? AND status = 'scheduled'`,
        [id, req.session.patientId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            // If no appointment is found, return a 404 error
            if (results.length === 0) {
                return res.status(404).json({ error: 'Appointment not found or cannot be rescheduled.' });
            }

            // Proceed to update the appointment if found
            pool.query(
                `UPDATE Appointments SET appointment_date = ?, appointment_time = ? WHERE id = ? AND patient_id = ?`,
                [appointment_date, appointment_time, id, req.session.patientId],
                (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({ error: 'Database error while updating.' });
                    }
                    res.status(200).json({ message: 'Appointment rescheduled successfully!' });
                }
            );
        }
    );
});

router.delete('/:id', (req, res) => {
    // Check if the patient is logged in
    if (!req.session.patientId) {
        return res.status(401).json({ error: 'You must be logged in to cancel your appointment.' });
    }

    const { id } = req.params;

    // First, check if the appointment exists and belongs to the logged-in patient
    pool.query(
        `SELECT * FROM Appointments WHERE id = ? AND patient_id = ?`,
        [id, req.session.patientId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }

            if (results.length === 0) {
                // If no appointment is found with this ID and patient ID, return a "not found" message
                return res.status(404).json({ error: 'Appointment not found.' });
            }

            // If appointment exists, proceed to cancel it
            pool.query(
                `UPDATE Appointments SET status = 'canceled' WHERE id = ? AND patient_id = ?`,
                [id, req.session.patientId],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error.' });
                    }

                    res.status(200).json({ message: 'Appointment canceled successfully!' });
                }
            );
        }
    );
});


module.exports = router;
