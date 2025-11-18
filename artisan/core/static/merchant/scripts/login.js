import { getCookie } from "./csrf.js";
import { showToast } from "./common.js";

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {
    API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;
} else {
    API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;
}

document.addEventListener('DOMContentLoaded', function () {
    
    // Handle signup form submission
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent form from reloading page

            // Clear any previous error messages
            clearErrors(signupForm);

            // Get values from updated HTML structure
            const data = {
                name: document.getElementById('signup-name').value.trim(),
                username: document.getElementById('signup-username').value.trim(),
                email: document.getElementById('signup-email').value.trim(),
                phone: document.getElementById('signup-phone').value.trim(),
                password: document.getElementById('signup-password').value,
                shop_name: document.getElementById('signup-shop-name').value.trim(),
            };

            // Basic client-side validation
            if (!validateSignupForm(data)) {
                return;
            }

            console.log('Signup data:', data);

            // Disable submit button to prevent double submission
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');

            fetch(`${API_BASE_URL}/artisan/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
            .then(response => {
                if (!response.ok) {
                    console.error(`HTTP Error: ${response.status}`);
                    return response.text().then(text => {
                        showToast(text || 'Signup failed. Please try again.', 'error');
                        console.error('Response body:', text);
                        throw new Error(`Request failed: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(result => {
                showToast('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            })
            .catch(error => {
                console.error('Signup error:', error);
                showToast('An error occurred during signup. Please try again.', 'error');
            })
            .finally(() => {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            });
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Clear any previous error messages
            clearErrors(loginForm);

            // Get values from updated HTML structure
            const data = {
                email: document.getElementById('login-email').value.trim(),
                password: document.getElementById('login-password').value
            };

            // Basic client-side validation
            if (!validateLoginForm(data)) {
                return;
            }

            // Disable submit button to prevent double submission
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');

            try {
                // Get CSRF token
                await fetch(`${API_BASE_URL}/csrf/`, {
                    credentials: 'include',
                });

                const csrftoken = getCookie('csrftoken');

                // Attempt login
                const response = await fetch(`${API_BASE_URL}/login/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken
                    },
                    body: JSON.stringify(data),
                    credentials: 'include'  // Important to include session cookies
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    showToast(errorText || 'Invalid email or password', 'error');
                    throw new Error("Login failed");
                }

                const result = await response.json();
                showToast('Login successful! Redirecting...', 'success');
                
                // Short delay before redirect for better UX
                setTimeout(() => {
                    window.location.href = '/dashboard/';    // Redirect to merchant dashboard
                }, 1000);

            } catch (error) {
                console.error('Login error:', error);
                showToast('Login failed. Please check your credentials.', 'error');
                
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
            }
        });
    }
});

/**
 * Validate signup form data
 */
function validateSignupForm(data) {
    let isValid = true;

    // Validate name
    if (!data.name || data.name.length < 2) {
        showFieldError('signup-name', 'Please enter your full name');
        isValid = false;
    }

    // Validate username
    if (!data.username || data.username.length < 3) {
        showFieldError('signup-username', 'Username must be at least 3 characters');
        isValid = false;
    }

    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
        showFieldError('signup-email', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate phone
    if (!data.phone || data.phone.length < 10) {
        showFieldError('signup-phone', 'Please enter a valid phone number');
        isValid = false;
    }

    // Validate password
    if (!data.password || data.password.length < 8) {
        showFieldError('signup-password', 'Password must be at least 8 characters');
        isValid = false;
    }

    // Validate shop name
    if (!data.shop_name || data.shop_name.length < 2) {
        showFieldError('signup-shop-name', 'Please enter your shop name');
        isValid = false;
    }

    return isValid;
}

/**
 * Validate login form data
 */
function validateLoginForm(data) {
    let isValid = true;

    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
        showFieldError('login-email', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    if (!data.password) {
        showFieldError('login-password', 'Please enter your password');
        isValid = false;
    }

    return isValid;
}

/**
 * Show error message for a specific field
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('error');
        const errorSpan = field.parentElement.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = message;
        }
    }
}

/**
 * Clear all error messages in a form
 */
function clearErrors(form) {
    const errorInputs = form.querySelectorAll('input.error');
    errorInputs.forEach(input => input.classList.remove('error'));

    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.textContent = '');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}