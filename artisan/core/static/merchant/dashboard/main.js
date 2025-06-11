/*
TODO:

- Use session info server side to get all inventory items, custom requests, 
and current orders to display for the merchant

- Allow merchant to accept or deny custom requests

- Setup email notifications to customer should merchant accept/deny request

- Setup email notifications to merchant when new requests/orders come in
*/

let products = []

document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:8000/api/inventory/', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch inventory products.');
        return response.json();
    })
    .then(result => {
        let inventoryItems = document.getElementById('inventory-items-flex');
        result.forEach(element => {
            console.log(element);
            // Create an inventory item for each retrieved
            let inventoryItem = document.createElement('div');
            inventoryItem.className = 'inventory-item';
            let inventoryItemImg = document.createElement('img');
            inventoryItemImg.src = '/media/' + element.image;
            inventoryItemImg.alt = "inventory item";
            inventoryItem.appendChild(inventoryItemImg);

            let inventoryItemDetails = document.createElement('div');
            inventoryItemDetails.className = 'inventory-details';

            let inventorydetailsh3 = document.createElement('h3');
            inventorydetailsh3.innerText = element.name;
            let inventorydetailsp = document.createElement('p');
            if (element.quantity > 0) {
                inventorydetailsp.innerText = element.price + '\nIn Stock, QTY:' + element.quantity; 
            } else {
                inventorydetailsp.innerText = element.price + '\nOut of Stock';
            }

            inventoryItemDetails.appendChild(inventorydetailsh3);
            inventoryItemDetails.appendChild(inventorydetailsp);

            let actions = document.createElement('div');
            actions.className = 'inventory-actions';

            let editBtn = document.createElement('button');
            let delBtn = document.createElement('button');
            editBtn.innerHTML = 'Edit';
            delBtn.innerHTML = 'Delete';
            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            inventoryItemDetails.appendChild(actions);


            inventoryItem.appendChild(inventoryItemDetails)
            inventoryItems.appendChild(inventoryItem);
        });
    })
    .catch(error => {
        console.error(error);
        alert("Couldn't get inventory.");
    })

    // Create an event listener for "manage inventory" that shows a modal screen that allows you to create, delete, shelf, and edit products
    const modal = document.getElementById('modal');
    const openModalBtn = document.querySelector('.primary-btn');

    openModalBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });

    // Optional: close modal on click outside form
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    document.getElementById('add-item-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData();

        formData.append('name', form.querySelector('#name').value);
        formData.append('price', form.querySelector('#price').value);
        formData.append('description', form.querySelector('#description').value);
        formData.append('quantity', form.querySelector('#quantity').value);
        formData.append('image', form.querySelector('#image-file').files[0]);

        fetch('http://localhost:8000/api/products/', {
            method: 'POST',
            body: formData,
            credentials: 'include' // to send session cookie
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to create product");
            return response.json();
        })
        .then(result => {
            window.location.href = '/dashboard/';
        })
        .catch(error => {
            console.error(error);
            alert('Product creation failed');
        });

        modal.style.display = 'none';
    });

})