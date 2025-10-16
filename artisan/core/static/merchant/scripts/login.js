import { getCookie } from "./csrf.js";
import { showToast } from "./common.js";

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

const csrftoken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', function () {
    
    // Handle a signup form submission
    const signupForm = document.getElementById('signup-form');

    signupForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent form from reloading page

        const data = {
            name: document.getElementById('name').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email2').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password2').value,
            shop_name: document.getElementById('shop-name').value,
        };

        console.log(data);

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
                    showToast(text);
                    console.error('Response body:', text);
                    throw new Error(`Request failed: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(result => {
            window.location.reload();
        })
        .catch(error => {
            console.error(error);
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
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
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
