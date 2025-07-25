
// Toggle nav on small screens
document.addEventListener("DOMContentLoaded", function () {
    const slug = document.body.dataset.slug;
    console.log(slug);
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");

    toggle.addEventListener("click", () => {
    links.classList.toggle("open");
    });

    fetch(`${API_BASE_URL}/cart`, {
    method: 'GET',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
    })
    .then(response => {
    if (!response.ok) throw new Error("Failed to retrieve cart");
    return response.json();
    })
    .then(data => {
    if (data.products.length > 0) {
        document.querySelector(".cart-empty").style.display = 'none';
        document.querySelector(".cart-contents").style.display = 'block';
    }
    const container = document.getElementById("cart-items-list");
    const totalDisplay = document.getElementById("cart-total");
    let total = 0;

    const products = data.products;

    products.forEach(product => {
        const product_id = product.id;

        // Create cart items for all product_ids in a session cart
        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";

        const img = document.createElement("img");
        img.src = '/media/' + product.image || "/static/images/default-product.png";
        img.alt = product.name;

        const detailsDiv = document.createElement("div");
        detailsDiv.className = "cart-item-details";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.textContent = `Price: $${product.price}`;

        const quantity = document.createElement("p");
        quantity.textContent = `Quantity: ${data.raw_data[product.id]}`;

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "remove-btn";

        const changeQTY = document.createElement('input');
        changeQTY.type = 'number';
        changeQTY.max = product.quantity;
        changeQTY.min = 1;
        changeQTY.value = data.raw_data[product.id];
        // changeQTY.style.display = 'none';

        const confirmChangeBtn = document.createElement('button');
        confirmChangeBtn.innerHTML = 'Confirm Change'

        detailsDiv.appendChild(name);
        detailsDiv.appendChild(price);
        detailsDiv.appendChild(quantity);
        detailsDiv.appendChild(editBtn);
        detailsDiv.appendChild(removeBtn);

        itemDiv.appendChild(img);
        itemDiv.appendChild(detailsDiv);
        itemDiv.appendChild(changeQTY);
        itemDiv.appendChild(confirmChangeBtn);

        changeQTY.style.display = 'none';
        confirmChangeBtn.style.display = 'none';

        container.appendChild(itemDiv);

        total += parseFloat(product.price * data.raw_data[product.id]);

        // Add event listeners to the edit and remove buttons
        // Remove
        removeBtn.addEventListener('click', async function() {

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
        })

        // Edit
        editBtn.addEventListener('click', async function () {
        // Appear the mod button and field
        changeQTY.style.display = 'block';
        confirmChangeBtn.style.display = 'block';
        
        // If customer confirms, update the session cart info
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
        })
    });

    document.querySelector(".checkout-btn").addEventListener('click', function () {
        // Make sure there are items in the cart to checkout.
        if (total == 0) {
            alert("Please add items to cart before checkout!");
            return;
        }

        fetch(`${API_BASE_URL}/checkout/`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'total': total})
        })
        .then(response => {
            if (!response.ok) throw new Error("Could not create a checkout!");
            return response.json();
        })
        .then(data => {
            console.log(data);
            window.location.href = `/checkout/${slug}/`;
        })
    })
    totalDisplay.textContent = total.toFixed(2);
    })
});