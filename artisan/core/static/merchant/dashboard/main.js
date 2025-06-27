/*
TODO:

- Use session info server side to get all inventory items, custom requests, 
and current orders to display for the merchant

- Allow merchant to accept or deny custom requests

- Setup email notifications to customer should merchant accept/deny request

- Setup email notifications to merchant when new requests/orders come in
*/

let products = []
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;
let artisan;


document.addEventListener('DOMContentLoaded', async function () {
    // Get the Artisan information at page load
    await fetch(`${API_BASE_URL}/artisan`, {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => {
        if (!response.ok) throw new Error("Could Not Get Artisan Info!");
        return response.json();
    })
    .then(data => {
        artisan = data.artisan;
        document.querySelector('.dashboard-main h1').innerHTML = 'Welcome, ' +  data.artisan.username;
    })

    // Handle Signout button click
    const signOutBtn = document.getElementById('sign-out-button');
    signOutBtn.addEventListener('click', (event) => {
        fetch(`${API_BASE_URL}/session/`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to clear session data.');
            return response.json();
        })
        .then(result => {
            window.location.href = "/login/"
        })
    })

    // Get all the orders assigned to the artisan
    fetch(`${API_BASE_URL}/orders/`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error("Could not fetch orders!");
        return response.json();
    })
    .then(data => {
        // Populate the orders table with active orders
        let ordersTable = document.getElementById('orders-table');

        data.orders.forEach(order => {
            
            let orderRow = document.createElement('tr');

            // Define the fields you want in order
            const fields = [
                'customer_name', 
                'customer_email', 
                'created_at',
                'status'
            ];

            fields.forEach(field => {
                if (field != 'status'){
                    const td = document.createElement('td');
                    td.textContent = order[field];
                    orderRow.appendChild(td);
                } else {
                    const td = document.createElement('td');
                    const img = document.createElement('img');
                    if (order[field] == 'pending') {
                        img.src = '/media/images/pending_24dp_EAC452_FILL0_wght400_GRAD0_opsz24.svg'
                    } else if (order[field] == 'approved') {
                        img.src = '/media/images/check_circle_24dp_48752C_FILL0_wght400_GRAD0_opsz24.svg'
                    } else if (order[field] == 'denied') {
                        img.src = '/media/images/block_24dp_BB271A_FILL0_wght400_GRAD0_opsz24.svg'
                    }
                    td.appendChild(img);
                    orderRow.appendChild(td);
                }
            });

            ordersTable.appendChild(orderRow);

            orderRow.addEventListener('click', async function () {

                // Fetch the OrderItems attached to this order ID
                await fetch(`${API_BASE_URL}/orderitems/`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({'order_id': order.id})
                })
                .then(response => {
                    if (!response.ok) throw new Error("Could not fetch Order Items!");
                    return response.json();
                })
                .then(data => {
                    // Populate the customer summary table with customer contact and shipping info
                    document.querySelector('.summary').style.display = 'flex';
                    document.querySelector("#tr-customer-name td").innerHTML = order.customer_name;
                    document.querySelector("#tr-customer-contact td").innerHTML = order.customer_email + " / " + order.customer_phone;
                    document.querySelector("#tr-customer-addr td").innerHTML = order.shipping_addr;
                    document.querySelector("#tr-customer-city td").innerHTML = order.city;
                    document.querySelector("#tr-customer-state td").innerHTML = order.state;
                    document.querySelector("#tr-customer-zip td").innerHTML = order.zip_code;

                    // Create a summary of the items in the order for the merchant to fulfil
                    const orderItems = data.orderItems;
                    let subtotal = 0;
                    document.querySelector("#td-order-date").innerHTML = order.created_at;
                    document.querySelector("#td-order-status select").value = order.status;
                    document.getElementById('order-products-scroll').innerHTML = '';
                    orderItems.forEach(item => {
                        fetch(`${API_BASE_URL}/product/${encodeURIComponent(item.product_id)}/`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                        })
                        .then(response => {
                            if (!response.ok) throw new Error("Could not find product!")
                            return response.json()
                        })
                        .then(data => {
                            const product = data.product;
                            const price = parseFloat(product.price);
                            const quantity = parseFloat(item.quantity);

                            subtotal += quantity * price;
                            document.getElementById("td-order-subtotal").innerHTML = '$' + subtotal;

                            // Create little product things
                            // Create an inventory item for each retrieved
                            let inventoryItem = document.createElement('div');
                            inventoryItem.className = 'inventory-item';
                            let inventoryItemImg = document.createElement('img');
                            inventoryItemImg.src = '/media/' + product.image;
                            inventoryItemImg.alt = "inventory item";
                            inventoryItem.appendChild(inventoryItemImg);

                            let inventoryItemDetails = document.createElement('div');
                            inventoryItemDetails.className = 'inventory-details';

                            let inventorydetailsh3 = document.createElement('h3');
                            inventorydetailsh3.innerText = product.name;
                            let inventorydetailsp = document.createElement('p');
                            inventorydetailsp.innerHTML = 'Q: '+ item.quantity;

                            inventoryItemDetails.appendChild(inventorydetailsh3);
                            inventoryItemDetails.appendChild(inventorydetailsp);
                            inventoryItem.appendChild(inventoryItemDetails);

                            document.getElementById('order-products-scroll').appendChild(inventoryItem);
                        })
                    })
                })
            })
        });
    })


    // Get all the Products in the artisans inventory
    fetch(`${API_BASE_URL}/inventory/`, {
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
                inventorydetailsp.innerText = '$' + element.price; 
            } else {
                inventorydetailsp.innerText = element.price;
            }

            inventoryItemDetails.appendChild(inventorydetailsh3);
            inventoryItemDetails.appendChild(inventorydetailsp);
            inventoryItem.appendChild(inventoryItemDetails);

            // Insert the item before the add more items button
            const target = document.getElementById('new-item-box');
            target.parentNode.insertBefore(inventoryItem, target);

            // Add an event listener to open the modal screen when you click an inventory item
            inventoryItem.addEventListener('click', function () {
                let inventoryItemModal = document.getElementById('inventory-item-modal');

                // Fill the Modal content with product details.
                let modalItemName = document.getElementById('modal-item-name');
                let modalItemDescription = document.getElementById('modal-item-description');
                let modalItemPrice = document.getElementById('modal-price');
                let modalItemQuantity = document.getElementById('modal-quantity');
                let modalItemProdID = document.getElementById('modal-id');
                modalItemName.innerHTML = element.name;
                modalItemDescription.innerHTML = element.description;
                modalItemPrice.innerHTML = 'Unit Price: $' + element.price;
                modalItemQuantity.innerHTML = 'Quantity In Stock: ' + element.quantity;
                modalItemProdID.innerHTML = 'Product ID: ' + element.id;

                let inventoryItemModalImg = document.querySelector('#inventory-item-modal .modal-content img');
                inventoryItemImg = inventoryItem.querySelector('img');
                inventoryItemModalImg.src = inventoryItemImg.src;
                inventoryItemModal.style.display = 'flex';

                let editBtn = document.getElementById('edit-btn');
                let deleteBtn = document.getElementById('delete-btn');

                // If the user clicks the edit button, we need to disappear this modal and appear the edit modal
                editBtn.addEventListener('click', function () {
                    inventoryItemModal.style.display = 'none';

                    let editItemModal = document.getElementById('edit-item-modal');
                    editItemModal.style.display = 'flex';

                    // Check if user clicks cancel button
                    let editCancelBtn = document.getElementById('edit-item-cancel-btn');
                    editCancelBtn.addEventListener('click', function () {
                        editItemModal.style.display = 'none';
                    })

                    let editItemForm = document.getElementById('edit-item-form');
                    document.getElementById('edit-name').value = element.name;
                    document.getElementById('edit-price').value = element.price;
                    document.getElementById('edit-description').value = element.description;
                    document.getElementById('edit-quantity').value = element.quantity;

                    let cancelled = false
                    document.getElementById("edit-item-cancel-btn").addEventListener('click', function () {
                        cancelled = true;
                    });

                    editItemForm.onsubmit = async function (e) {
                        if (cancelled) {
                            return;
                        }
                        e.preventDefault();

                        const form = e.target;
                        const formData = new FormData();
                        
                        formData.append('id', element.id);
                        formData.append('name', form.querySelector('#edit-name').value);
                        formData.append('price', form.querySelector('#edit-price').value);
                        formData.append('description', form.querySelector('#edit-description').value);
                        formData.append('quantity', form.querySelector('#edit-quantity').value);
                        formData.append('image', form.querySelector('#edit-image-file').files[0]);
                        formData.append('_method', 'PATCH');

                        await fetch(`${API_BASE_URL}/product/`, {
                            method: 'POST',
                            body: formData,
                            credentials: 'include'
                        })
                        .then(response => {
                            if (!response.ok) throw new Error("Failed to Patch Product");
                            return response.json();
                        })
                        .then(result => {
                            editItemModal.style.display = 'none';
                            alert('Product successfully updated!');
                            window.location.reload();
                        })
                        .catch(error => {
                            console.error(error);
                            alert("Failed to Patch Product");
                        })
                    }
                })

                // If the user clicks the delete button, we need to disappear this modal, appear a delete modal
                deleteBtn.addEventListener('click', function () {
                    inventoryItemModal.style.display = 'none';

                    let deleteItemModal = document.getElementById('delete-item-modal');
                    deleteItemModal.style.display = 'flex';

                    let confirmDeleteBtn = document.getElementById('confirm-delete');
                    let cancelDeleteBtn = document.getElementById('cancel-delete');

                    confirmDeleteBtn.addEventListener('click', function () {
                        // fetch request to delete
                        fetch(`${API_BASE_URL}/product/?id=`+element.id, {
                            method: 'DELETE',
                            credentials: 'include'
                        })
                        .then(response => {
                            if (!response.ok) throw new Error("Failed to delete product");
                            return response.json();
                        })
                        .then(result => {
                            alert("Product deleted!");
                            window.location.href = '/dashboard/'
                        })
                        .catch(error => {
                            console.error(error);
                            alert("Failed to delete product");
                        });
                    })
                    cancelDeleteBtn.addEventListener('click', function () {
                        deleteItemModal.style.display = 'none';
                    })
                })
            })
        });
    })
    .catch(error => {
        console.error(error);
        alert("Couldn't get inventory.");
    })

    // Create an event listener for "manage inventory" that shows a modal screen that allows you to create, delete, shelf, and edit products
    const newItemModal = document.getElementById('new-item-modal');
    const openModalBtn = document.querySelector('.primary-btn');

    document.getElementById("new-item-box").addEventListener('click', () => {
      newItemModal.style.display = 'flex';
    });

    // Optional: close modal on click outside form
    newItemModal.addEventListener('click', (e) => {
      if (e.target === newItemModal) {
        newItemModal.style.display = 'none';
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

        fetch(`${API_BASE_URL}/product/`, {
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

        newItemModal.style.display = 'none';
    });

    // Create an event listener for "item-summary-modal" that
    const itemSummaryModal = document.getElementById("inventory-item-modal");
    itemSummaryModal.addEventListener('click', (e) => {
        if (e.target === itemSummaryModal) {
            itemSummaryModal.style.display = 'none';
        }
    });

})

// Check image upload size is < 2MB
let imageFile = document.getElementById('image-file');
const MAX_SIZE_MB = 2;
imageFile.addEventListener('change', function() {
    const file = this.files[0];

    if (file && file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert("File size is too large. Maximum is 2MB.")
        this.value = ''; // Clear the input
    }
});