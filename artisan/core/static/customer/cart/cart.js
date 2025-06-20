// Toggle nav on small screens
  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");

    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });

    fetch("http://127.0.0.1:8000/api/cart", {
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
      console.log(data);
      if (data.products.length > 0) {
        document.querySelector(".cart-empty").style.display = 'none';
        document.querySelector(".cart-contents").style.display = 'block';
      }
      const container = document.getElementById("cart-items-list");
      const totalDisplay = document.getElementById("cart-total");
      let total = 0;

      const products = data.products;

      products.forEach(product => {
        console.log(product);
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

        container.appendChild(itemDiv);
        console.log(container)

        total += parseFloat(product.price * product.quantity);

        // Add event listeners to the edit and remove buttons
        // Remove
        removeBtn.addEventListener('click', async function() {
          console.log('removing item from cart:', product_id); 

          await fetch('http://127.0.0.1:8000/api/cart/', {
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
            console.log(data);
            window.location.reload();
          })
        })

        // Edit
        
      });

      totalDisplay.textContent = total.toFixed(2);
    })
  });