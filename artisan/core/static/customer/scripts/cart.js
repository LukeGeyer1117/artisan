
import { getCookie } from "./csrf.js";

const csrftoken = getCookie('csrftoken');

// Toggle nav on small screens
document.addEventListener("DOMContentLoaded", async function () {
    const slug = document.body.dataset.slug;
    const links = document.querySelector(".nav-links");
    const cart_data = await get_cart();
    const container = document.getElementById("cart-items-list");
    const totalDisplay = document.getElementById("cart-total");
    let total = 0;
    const products = cart_data.products;

    // Build the product divs in the cart
    products.forEach(product => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src='/media/${product.image}' alt='${product.name}'>
            <div class='cart-item-details'>
                <h3>${product.name}</h3>
                <p>Price: $${product.price}</p>
                <p>Quantity: <span class='prod-quantity'>${cart_data.raw_data[product.id]}</span></p>
                <button class='edit-btn'>Edit</button>
                <button class='remove-btn'>Remove</button>
                <p class='prod-id' style='display:none;'>${product.id}</p>
            </div>
            <input type='number' max=${product.quantity} min=1 value=${cart_data.raw_data[product.id]} style='display: none;' class='change-qty'>
            <button style='display: none;' class='confirm-change-btn'>Confirm Change</button>
        `

        container.appendChild(cartItem);
        total += parseFloat(product.price * cart_data.raw_data[product.id]);

        // Add event listeners to the edit and remove buttons
        // Remove
        const removeBtn = cartItem.querySelector('.remove-btn');
        removeBtn.addEventListener('click', async function() {
            remove_item_from_cart(product.id);
        })

        // Edit
        const editBtn = cartItem.querySelector('.edit-btn');
        editBtn.addEventListener('click', async function () {
            edit_item_in_cart(cartItem, product.id);
        })
    });

    document.querySelector(".checkout-btn").addEventListener('click', function () {
        const cart_items = container.querySelectorAll('.cart-item')
        const products_and_quantities = []
        cart_items.forEach(item => {
            const prod_id = item.querySelector('.prod-id').innerHTML;
            const quantity = item.querySelector('.prod-quantity').innerHTML;
            products_and_quantities.push([parseInt(prod_id), parseInt(quantity)])
        })
        checkout(total, slug, products_and_quantities);
    })
    totalDisplay.textContent = total.toFixed(2);
})


async function get_cart() {
    return await fetch(`${API_BASE_URL}/cart/`, {
        method: 'GET', 
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error("Could not get cart.");
        return response.json();
    })
    .then(data => {
        if (data.products.length > 0) {
            document.querySelector(".cart-empty").style.display = 'none';
            document.querySelector(".cart-contents").style.display = 'block';
        }
        return data;
    })
}


// Fuction to remove an item from the cart
async function remove_item_from_cart(product_id) {
    await fetch(`${API_BASE_URL}/cart/`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({product_id: product_id})
    })
    .then(response => {
        if (!response.ok) throw new Error("Could not remove product from cart!");
        return response.json();
    })
    .then(data => {
        window.location.reload();
})
}

// function to handle cart item edits
function edit_item_in_cart(cartItem, product_id) {
    const changeQTY = cartItem.querySelector('.change-qty');
    const confirmChangeBtn = cartItem.querySelector('.confirm-change-btn');

    changeQTY.style.display = 'block';
    confirmChangeBtn.style.display = 'block';

    // Listen for customer confirmation
    confirmChangeBtn.addEventListener('click', function () {
        fetch(`${API_BASE_URL}/cart/`, {
            method: 'PUT',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({product_id: product_id, quantity: changeQTY.value})
        })
        .then(response => {
            if (!response.ok) throw new Error("Could not change product-in-cart quantity");
            return response.json();
        })
        .then(data => {
            window.location.reload();
        })
        .catch (error => {
            console.error(error);
            alert("Could not update cart item!");
        })
    })
}

function checkout(total, slug, products_and_quantities) {
    if (total == 0) {
        alert("Please add items to cart before checkout!");
        return;
    }

    fetch(`${API_BASE_URL}/checkout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({'total': total, 'products_and_quantities': products_and_quantities})
    })
    .then(response => {
        if (!response.ok) throw new Error("Could not create a checkout!");
        return response.json();
    })
    .then(data => {
        console.log(data);
        window.location.href = `/checkout/${slug}/`;
    })
}