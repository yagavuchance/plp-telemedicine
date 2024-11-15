// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;



// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Import Routes
const patientRoutes = require('./routes/patients');
const appointmentsRoutes = require('./routes/appointments');
const doctorsRoutes = require('./routes/doctors');
const adminRoutes = require('./routes/admin');


// Use Routes
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/doctors', doctorsRoutes);
app.use('/admin', adminRoutes)

app.use(express.static('public')); // Serve static files from 'public' directory



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
