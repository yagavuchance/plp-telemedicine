const bcrypt = require('bcrypt');

// Password to hash
const password = 'Solar1909@';

// Generate hash
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
    } else {
        console.log("Hashed password:", hash);
    }
});
