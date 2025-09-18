import { getCookie } from "./csrf.js";

const csrftoken = getCookie('csrftoken');
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('back-button-div').addEventListener('click', function () {window.location.href = '/inventory/'});

    document.getElementById('new-product-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData();

        formData.append('name', form.querySelector('#product-name').value);
        formData.append('price', form.querySelector('#product-price').value);
        formData.append('description', form.querySelector('#product-description').value);
        formData.append('quantity', form.querySelector('#product-quantity').value);
        formData.append('image', form.querySelector('#product-image').files[0]);

        fetch(`${API_BASE_URL}/product/`, {
            method: 'POST',
            body: formData,
            credentials: 'include', // to send session cookie
            headers: {
                'X-CSRFToken': csrftoken
            }
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to create product");
            return response.json();
        })
        .then(result => {
            window.location.href = '/inventory/';
        })
        .catch(error => {
            console.error(error);
            alert('Product creation failed');
        });
    });
})