
document.getElementById('admin-login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('login-message');

    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok) {
            loginMessage.textContent = result.message; // Success message
            loginMessage.style.color = 'green';
            // Optionally, redirect to the admin dashboard
            window.location.href = '/NiceAdmin/index.html';
        } else {
            loginMessage.textContent = result.error; // Display error message
            loginMessage.style.color = 'red';
        }
    } catch (error) {
        loginMessage.textContent = 'An error occurred. Please try again.';
        loginMessage.style.color = 'red';
    }
});


