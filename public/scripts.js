document.getElementById('menu-toggle').addEventListener('click', () => {
    const navList = document.getElementById('nav-list');
    navList.classList.toggle('active');
});


//slider
let currentSlide = 0;
const slides = document.querySelectorAll(".hero-slider .slide");

function changeSlide(direction) {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
}

// Auto Slide Change (Optional)
setInterval(() => {
    changeSlide(1);
}, 10000); // Change slide every 5 seconds





const isLoggedIn = () => {
    return !!sessionStorage.getItem('patientId');
};

const updateNavBar = () => {
    const profileContainer = document.getElementById('profile-container');
    const profileMenu = document.getElementById('profile-menu');
    const logoutMenu = document.getElementById('logout-button');
    const loginSignupContainer = document.getElementById('login-signup-container');

    if (isLoggedIn()) {
        profileContainer.style.display = 'block'; // Show Profile link and dropdown
        logoutMenu.style.display = 'block'; // Show Logout button
        loginSignupContainer.style.display = 'none'; // Hide Login/SignUp link
    } else {
        profileContainer.style.display = 'none'; // Hide Profile link and dropdown
        profileMenu.style.display = 'none'; // Ensure dropdown is hidden
        logoutMenu.style.display = 'none'; // Hide Logout button
        loginSignupContainer.style.display = 'block'; // Show Login/SignUp link
    }
};

// Toggle dropdown on Profile button click
document.querySelector('.dropbtn').addEventListener('click', (event) => {
    event.preventDefault();
    const profileMenu = document.getElementById('profile-menu');
    profileMenu.style.display = (profileMenu.style.display === 'block') ? 'none' : 'block';
});

// Close dropdown if clicking outside
document.addEventListener('click', (event) => {
    const profileMenu = document.getElementById('profile-menu');
    const dropbtn = document.querySelector('.dropbtn');

    if (!dropbtn.contains(event.target) && !profileMenu.contains(event.target)) {
        profileMenu.style.display = 'none';
    }
});

// Call updateNavBar on page load
updateNavBar();

// Logout functionality
document.getElementById('logout-button').addEventListener('click', () => {
    sessionStorage.removeItem('patientId');
    updateNavBar();
});



// Function to fetch doctors from the API and populate both the select field and the doctor list
async function fetchDoctors() {
    try {
        const response = await fetch('/doctors'); // Update with your actual API endpoint
        
        if (!response.ok) {
            throw new Error('Failed to fetch doctors');
        }

        const doctors = await response.json(); // Parse the JSON data from the response
        
        // Get the doctor_id select element
        const doctorSelect = document.getElementById('doctor_id');

        // Clear any existing options (except for the default one)
        doctorSelect.innerHTML = '<option value="">Select Doctor</option>';

        // Get the doctor list container
        const doctorListContainer = document.querySelector('.doctor-list');
        
        // Clear any existing doctor items
        doctorListContainer.innerHTML = '';

        // Loop through the doctors and create an HTML structure for each
        doctors.forEach(doctor => {
            // Create option for the select element
            const option = document.createElement('option');
            option.value = doctor.id; // Set the value to the doctor's ID
            option.textContent = `${doctor.first_name} ${doctor.last_name} - ${doctor.specialization}`; // Display doctor's name and specialization
            doctorSelect.appendChild(option); // Append the option to the select element

            // Create doctor item for the doctor list
            const doctorItem = document.createElement('div');
            doctorItem.classList.add('doctor-item');

            // Set up the inner HTML for the doctor item
            doctorItem.innerHTML = `
                <img src="images/dr.jpg" alt="${doctor.first_name} ${doctor.last_name}">
                <h3>${doctor.first_name} ${doctor.last_name}</h3>
                <p>Specialist in ${doctor.specialization}</p>
            `;

            // Append the doctor item to the container
            doctorListContainer.appendChild(doctorItem);
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchDoctors);

// Ensure DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Registration Logic
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent form submission
            
            const firstName = document.getElementById('first_name').value;
            const lastName = document.getElementById('last_name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/patients/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
                });

                const message = await response.json();
                
                // Show alert based on the registration response
                alert(message.message || message.error);

                // Refresh the page upon successful registration
                if (response.ok) {
                    location.reload();
                }
                
            } catch (error) {
                console.error('Error during registration:', error);
                alert('An error occurred during registration.');
            }
        });
    } else {
        console.error('Registration form not found in the DOM.');
    }

    // Login Logic
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent form submission
            
            const email = document.getElementById('login_email').value;
            const password = document.getElementById('login_password').value;

            try {
                const response = await fetch('/patients/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const message = await response.json();

                if (response.ok) {
                    sessionStorage.setItem('patientId', message.patientId); // Store patientId in session storage
                    updateNavBar(); // Update the navigation bar
                    alert('Login successful!');
                    
                    // Redirect to index.html after successful login
                    window.location.href = 'index.html';
                } else {
                    alert(message.error || 'Login failed.');
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred during login.');
            }
        });
    } else {
        console.error('Login form not found in the DOM.');
    }

    // Logout Logic
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior

            // Ask the user for confirmation before logging out
            const userConfirmed = confirm("Are you sure you want to log out?");

            if (userConfirmed) {
                // If user clicks "OK", proceed with the logout request
                fetch('/patients/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include' // Include cookies in the request (if session cookies are used)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        // Display the success message
                        alert(data.message);
                        // Optionally redirect or refresh after logout
                        window.location.href = 'index.html'; // Redirect to login page or any other page
                    } else if (data.error) {
                        // Display the error message
                        alert(data.error);
                    }
                })
                .catch(error => {
                    console.error('Logout Error:', error);
                    alert('An unexpected error occurred. Please try again.');
                });
            } else {
                // If user clicks "Cancel", do nothing
                console.log("Logout cancelled by user.");
            }
        });
    } else {
        console.error('Logout button not found in the DOM.');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const appointmentForm = document.getElementById('appointment-form');
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal')); // Initialize Bootstrap modal

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent the form from submitting traditionally

            // Check if the user is logged in
            const patientId = sessionStorage.getItem('patientId'); // Assuming you store it in session storage

            if (!patientId) {
                // User is not logged in, show the login modal
                loginModal.show(); // Show the Bootstrap modal
                return; // Stop further execution
            }

            // Collect form data
            const doctorId = document.getElementById('doctor_id').value;
            const appointmentDate = document.getElementById('appointment_date').value;
            const appointmentTime = document.getElementById('appointment_time').value;

            try {
                // Send the appointment data to the server
                const response = await fetch('/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ doctor_id: doctorId, appointment_date: appointmentDate, appointment_time: appointmentTime }),
                });

                const message = await response.json();

                // Show alert based on the response
                if (response.ok) {
                    alert(message.message);
                    appointmentForm.reset(); // Optionally reset the form
                } else {
                    alert(message.error || 'Failed to book the appointment.');
                }
            } catch (error) {
                console.error('Error during appointment booking:', error);
                alert('An error occurred while booking the appointment.');
            }
        });
    } else {
        console.error("Appointment form not found in the DOM.");
    }

    // Handle login form submission
    document.getElementById('login-form').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from submitting traditionally

        const email = document.getElementById('login_email').value;
        const password = document.getElementById('login_password').value;

        try {
            const response = await fetch('/patients/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const message = await response.json();

            if (response.ok) {
                sessionStorage.setItem('patientId', message.patientId); // Store patientId in session storage
                alert('Login successful!');

                // Close the modal
                loginModal.hide();

                // Refresh the page to allow the user to book an appointment
                location.reload();
            } else {
                alert(message.error || 'Login failed.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred during login.');
        }
    });
});

//view profile
document.getElementById('view-profile').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default link behavior

    fetch('patients/profile', {
        method: 'GET',
        credentials: 'include' // Include session cookies for authentication
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error); // Display error if any
        } else {
            // Populate modal with the profile details
            const modalBody = document.querySelector('#viewProfileModal .modal-body');
            modalBody.innerHTML = `
                <p><strong>First Name:</strong> ${data.first_name}</p>
                <p><strong>Last Name:</strong> ${data.last_name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Date of Birth:</strong> ${data.date_of_birth}</p>
                <p><strong>Gender:</strong> ${data.gender}</p>
                <p><strong>Address:</strong> ${data.address}</p>
            `;

            // Show the modal
            const viewProfileModal = new bootstrap.Modal(document.getElementById('viewProfileModal'));
            viewProfileModal.show();

            // Refresh page when the modal is closed
         document.getElementById('viewProfileModal').addEventListener('hidden.bs.modal', function () {
    location.reload(); // Reload the current page
});
        }
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
        alert('Failed to fetch profile details. Please try again later.');
    });
});


// Show the Update Profile form
document.getElementById('update-profile').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    
    // Fetch the patient profile to populate the form
    fetch('patients/profile', {
        method: 'GET',
        credentials: 'include', // Include session cookies
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error); // Display error if any
        } else {
            // Populate the form with existing patient data
            document.getElementById('update_first_name').value = data.first_name;
            document.getElementById('update_last_name').value = data.last_name;
            document.getElementById('update_phone').value = data.phone;
            document.getElementById('update_date_of_birth').value = data.date_of_birth;
            document.getElementById('update_gender').value = data.gender;
            document.getElementById('update_address').value = data.address;
            
            // Show the form
            document.getElementById('update-profile-form').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
        alert('Failed to fetch profile data. Please try again later.');
    });
});

// Handle Update Profile Form Submission
document.getElementById('submit-profile').addEventListener('click', () => {
    // Get the values from the form
    const first_name = document.getElementById('update_first_name').value;
    const last_name = document.getElementById('update_last_name').value;
    const phone = document.getElementById('update_phone').value;
    const date_of_birth = document.getElementById('update_date_of_birth').value;
    const gender = document.getElementById('update_gender').value;
    const address = document.getElementById('update_address').value;

    // Create a data object to send in the request
    const updatedProfile = {
        first_name,
        last_name,
        phone,
        date_of_birth,
        gender,
        address
    };

    // Send a PUT request to update the profile
    fetch('patients/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify(updatedProfile)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error); // Display error if any
        } else {
            alert(data.message); // Display success message
            document.getElementById('update-profile-form').style.display = 'none'; // Hide the form
            
            // Refresh the page after a successful update
            location.reload(); // Reload the current page
        }
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again later.');
    });
});


// Front-End JavaScript (Client-Side)
document.getElementById('delete-account').addEventListener('click', () => {
    const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');

    if (confirmation) {
        fetch('/patients/delete-account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Account deleted successfully.');
                window.location.href = '/logout'; // Redirect to logout
            }
        })
        .catch(error => {
            console.error('Error deleting account:', error);
        });
    } else {
        alert('Account deletion canceled.');
    }
});

//view appointment
document.getElementById('view-appointments').addEventListener('click', () => {
    fetch('/appointments/get-appointment', {
        method: 'GET',
        credentials: 'include', // Include session cookies
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            const appointmentsList = document.getElementById('appointmentsList');
            appointmentsList.innerHTML = ''; // Clear previous content

            // Check if there are no appointments
            if (data.length === 0) {
                appointmentsList.innerHTML = '<p>No upcoming appointments.</p>';
            } else {
                // Build the appointments display
                let appointmentsHTML = '<h5>Upcoming Appointments:</h5>';
                data.forEach(appointment => {
                    // Log the raw date and time values for debugging
                    console.log('Raw date:', appointment.appointment_date);
                    console.log('Raw time:', appointment.appointment_time);

                    // Use the raw appointment date directly
                    const appointmentDate = new Date(appointment.appointment_date); // "2024-10-22T21:00:00.000Z"

                    // Check if the date is valid
                    if (isNaN(appointmentDate)) {
                        console.error('Invalid date:', appointment.appointment_date);
                        return; // Skip this appointment if the date is invalid
                    }

                    // Format the date in the East Africa Time (EAT) timezone
                    const formattedDate = appointmentDate.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'Africa/Kampala' // Uganda's timezone (EAT)
                    });

                    // To include the time separately, create a Date object with the local time
                    const appointmentTime = new Date(`1970-01-01T${appointment.appointment_time}Z`); // Use a placeholder date for time conversion

                    // Format the time in the East Africa Time (EAT) timezone
                    const formattedTime = appointmentTime.toLocaleTimeString('en-GB', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'Africa/Kampala' // Uganda's timezone (EAT)
                    });

                    // Construct the appointment details with separate lines for clarity
                    appointmentsHTML += `
                        <div class="appointment">
                            <p><strong>Appointment ID:</strong> ${appointment.id}</p>
                            <p><strong>Doctor:</strong> ${appointment.doctor_first_name} ${appointment.doctor_last_name} - ${appointment.specialization}</p>
                            <p><strong>Date:</strong> ${formattedDate}</p>
                            <p><strong>Time:</strong> ${formattedTime}</p>
                            <hr> <!-- Add a line to separate appointments -->
                        </div>
                    `;
                });
                appointmentsList.innerHTML = appointmentsHTML; // Insert the built HTML into the modal
            }

            // Show the modal
            const viewAppointmentsModal = new bootstrap.Modal(document.getElementById('viewAppointmentsModal'));
            viewAppointmentsModal.show();
        }
    })
    .catch(error => {
        console.error('Error fetching appointments:', error);
    });
});

// Refresh page when the modal is closed (optional)
document.getElementById('viewAppointmentsModal').addEventListener('hidden.bs.modal', function () {
    location.reload(); // Reload the current page
});


//reschedule appointment
document.addEventListener("DOMContentLoaded", function () {
    // Get reschedule link and reschedule form elements
    const rescheduleLink = document.getElementById("reschedule-appointment");
    const rescheduleForm = document.getElementById("reschedule-form");
    const appointmentIdField = document.getElementById("appointment-id");
    const newDateField = document.getElementById("new-date");
    const newTimeField = document.getElementById("new-time");

    // Toggle reschedule form when the link is clicked
    if (rescheduleLink) {
        rescheduleLink.addEventListener("click", () => {
            // Prompt user for appointment ID
            const appointmentId = prompt("Enter Appointment ID to Reschedule:");
            if (appointmentId) {
                // Set the ID field with the entered appointment ID
                appointmentIdField.value = appointmentId;

                // Fetch appointment details and display the form
                fetch(`/appointments/get-appointment`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Appointment not found.");
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.error) {
                            alert(data.error);
                            // Hide form if there's an error
                            rescheduleForm.style.display = 'none';
                        } else {
                            // Populate the fields with fetched data
                            newDateField.value = data.appointment_date;
                            newTimeField.value = data.appointment_time;
                            // Show the reschedule form
                            rescheduleForm.style.display = 'block';
                        }
                    })
                    .catch(error => {
                        alert("Error fetching appointment details: " + error.message);
                        console.error('Error fetching appointment details:', error);
                        rescheduleForm.style.display = 'none'; // Hide the form on error
                    });
            } else {
                alert("Appointment ID is required to proceed.");
            }
        });
    }

    // Reschedule an appointment
    document.getElementById('submit-reschedule').addEventListener('click', () => {
        const appointmentId = appointmentIdField.value;
        const newDate = newDateField.value;
        const newTime = newTimeField.value;

        // Validate input fields
        if (!newDate || !newTime) {
            alert("Both new date and new time are required.");
            return;
        }

        // Send PUT request to update the appointment
        fetch(`/appointments/${appointmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                appointment_date: newDate,
                appointment_time: newTime
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Appointment rescheduled successfully!');
                    // Hide the form again
                    rescheduleForm.style.display = 'none';

                    // Refresh the page after successful rescheduling
                    location.reload(); // Reload the current page
                }
            })
            .catch(error => {
                alert("An error occurred while rescheduling the appointment.");
                console.error('Error rescheduling appointment:', error);
            });
    });
});

//cancel appointment
document.getElementById('cancel-appointment').addEventListener('click', () => {
    // Ask the user to enter the appointment ID to be canceled
    const appointmentId = prompt('Please enter the Appointment ID you want to cancel:');

    // Confirm cancellation with the user
    if (appointmentId && confirm('Are you sure you want to cancel this appointment?')) {
        fetch(`/appointments/${appointmentId}`, { // Properly format the URL with the appointment ID
            method: 'DELETE', // Use DELETE method to match server-side route
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Include session cookies
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Appointment canceled successfully!');
                // Optionally, refresh the list of appointments or update the UI accordingly
            }
        })
        .catch(error => {
            console.error('Error canceling appointment:', error);
        });
    } else {
        alert('Cancellation process aborted.');
    }
});
