import { showToast } from "./common.js";
import { getCookie } from "./csrf.js";

const csrftoken = getCookie('csrftoken');

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

// Toggle nav on small screens
document.addEventListener("DOMContentLoaded", async function () {
    const slug = document.body.dataset.slug;
    const links = document.querySelector(".nav-links");
    const cart_data = await get_cart();
    const container = document.getElementById("cart-items-list");
    const totalDisplay = document.getElementById("cart-total");
    let total = 0;
    const products = cart_data.products;

    // Get the template object for cart items
    const template = document.getElementById('cart-item-template');

    // Build the product divs in the cart
    products.forEach(product => {
        const clone = createCartItem(product, cart_data, template);
        container.appendChild(clone);

        // container.appendChild(divider);
        total += parseFloat(product.price * cart_data.raw_data[product.id]);

        // Add event listeners to the edit and remove buttons
        addCloneEventListeners(clone, product, products);

    });

    summarize(container, totalDisplay, total);
})

function summarize(container, totalDisplay, total) {
    totalDisplay.textContent = total.toFixed(2);
    console.log(total);
    document.getElementById('cart-grand-total').innerHTML = total.toFixed(2);

    document.querySelector('.checkout-btn').addEventListener('click', function () {
        const cart_items = container.querySelectorAll('.cart-item');
        const products_and_quantities = [];
        cart_items.forEach(item => {
            const prod_id = item.querySelector('.prod-id').innerHTML;
            const quantity = item.querySelector('.change-qty').value;
            products_and_quantities.push([parseInt(prod_id), parseInt(quantity)]);
        })

        checkout(total, slug, products_and_quantities);
    })
}


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
            document.querySelector(".cart-empty").classList.add('hidden');
            document.querySelector(".cart-contents").classList.remove('hidden');
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
async function edit_item_in_cart(cartItem, product_id, price) {
    const changeQTY = cartItem.querySelector('.change-qty');

    await fetch(`${API_BASE_URL}/cart/`, {
        method: 'PUT',
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({product_id: product_id, quantity: changeQTY.value})
    })
    .then(response => {
        if (!response.ok) throw new Error("Could not change product-in-cart quantity");
    })
    .then(data => {
        cartItem.querySelector('.item-total-price').innerHTML = `$${(changeQTY.value * price).toFixed(2)}`;
        cartItem.dataset.value = changeQTY.value * price;
        return;
    })
    .catch (error => {
        console.error(error);
        showToast("Could not update item quantity in cart!", "error");
    })
    .finally(() => {
    })
}

// Calls the checkout api
function checkout(total, slug, products_and_quantities) {
    if (total == 0) {
        alert("Cannot process $0 checkout");
        return;
    }

    total = total.toFixed(2);

    fetch(`${API_BASE_URL}/checkout/${slug}/`, {
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
        localStorage.setItem('payment_id', data.payment_id);
        window.location.href = `/checkout/${slug}/`;
    })
}

function updateOrderTotal() {
    let total = 0;

    const productDivs = document.querySelectorAll('.cart-item')

    productDivs.forEach(div => {
        total += parseFloat(div.dataset.value);
    })

    document.getElementById('cart-total').innerHTML = total.toFixed(2);
    document.getElementById('cart-grand-total').innerHTML = total.toFixed(2);

    return total;
}

function createCartItem(product, cart_data, template) {
    const temp_clone = template.content.cloneNode(true);
    const clone = temp_clone.firstElementChild;

    const divider = document.createElement('div');
    divider.className = 'divider m-0';

    const id = clone.querySelector('.prod-id');
    const img = clone.querySelector('img');
    const title = clone.querySelector('.card-title');
    const price = clone.querySelector('.card-price');
    const changeQTY = clone.querySelector('.change-qty');
    const itemTotalPrice = clone.querySelector('.item-total-price');

    id.innerHTML = product.id;
    img.src = `/media/${product.image}`;
    img.alt = product.name;
    title.textContent = product.name;
    price.textContent = `$${product.price}`;
    if (product.track_stock) {changeQTY.max = product.quantity;}
    changeQTY.value = cart_data.raw_data[product.id];
    itemTotalPrice.innerHTML = `$${(changeQTY.value * product.price).toFixed(2)}`;
    clone.dataset.value = changeQTY.value * product.price;

    return clone;
}

function addCloneEventListeners(clone, product, products) {
    const changeQTY = clone.querySelector('.change-qty');
    const min = changeQTY.min !== '' ? Number(changeQTY.min) : 1;
    const max = changeQTY.max !== '' ? Number(changeQTY.max) : Infinity;

    // Update the quantity in the cart item
    function setQuantity(next) {
        next = Number(next);

        if (Number.isNaN(next)) return;

        next = Math.min(Math.max(next, min), max);

        if (Number(changeQTY.value) === next) return;

        changeQTY.value = next;
    }

    // Listen for the clone remove button to be pressed
    const removeBtn = clone.querySelector('.remove-btn');
    removeBtn.addEventListener('click', async function() {
        removeBtn.disabled = "disabled";
        removeBtn.innerHTML = `<span class="loading loading-spinner loading-xs"></span>`
        remove_item_from_cart(product.id);
    })

    // Listen for the +/- buttons to be pressed
    const minusBtn = clone.querySelector('.minus');
    minusBtn.addEventListener('click', async function () {
        setQuantity(Number(changeQTY.value) - 1);
        await edit_item_in_cart(clone, product.id, product.price);
        updateOrderTotal(products);
    });

    const plusBtn = clone.querySelector('.plus');
    plusBtn.addEventListener('click', async function () {
        setQuantity(Number(changeQTY.value) + 1);
        await edit_item_in_cart(clone, product.id, product.price);
        updateOrderTotal(products);
    });

    changeQTY.addEventListener('input', async function () {
        setQuantity(changeQTY.value);
        await edit_item_in_cart(clone, product.id, product.price);
        updateOrderTotal(products);
    });
}