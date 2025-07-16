const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', function () {
    
    // Handle a signup form submission
    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent form from reloading page

        const data = {
            username: document.getElementById('username').value,
            email: document.getElementById('email2').value,
            password: document.getElementById('password2').value,
            shop_name: document.getElementById('shop-name').value,
            product_specialty: '',
            price_range_low: 0,
            price_range_high: 100,
            accepting_custom_orders: true
        };

        console.log(data);

        fetch(`${API_BASE_URL}/artisan/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to sign up");
            return response.json();
        })
        .then(result => {
            window.location.reload();
        })
        .catch(error => {
            console.error(error);
            alert('Signup failed');
        });
    });

    // Handle a login form submission
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const data = {
        email: document.getElementById('email1').value,
        password: document.getElementById('password1').value
        }

        fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
            credentials: 'include'  // Important to include session cookies
        })
        .then(response => {
            if (!response.ok) throw new Error("Login failed");
            return response.json();
        })
        .then(result => {
            window.location.href = '/dashboard/';    // Redirect to merchant dashboard
        })
        .catch(error => {
            console.error(error);
            alert('Login failed');
        })
    });
});