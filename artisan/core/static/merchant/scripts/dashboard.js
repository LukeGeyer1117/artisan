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
    })

    // Handle Signout button click
    const signOutBtn = document.querySelector('.navbar a');
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
    fetch(`${API_BASE_URL}/orders/active/`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error("Could not fetch orders!");
        return response.json();
    })
    .then(data => {
        // Populate the orders table with active orders
        let ordersTableBody = document.querySelector('#orders-table tbody');

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
                if (field != 'status' && field != 'created_at'){
                    const td = document.createElement('td');
                    td.textContent = order[field];
                    orderRow.appendChild(td);
                } else if (field == 'created_at') {
                    const td = document.createElement('td');
                    td.textContent = formatTimestamp(order.created_at);
                    orderRow.appendChild(td);
                } else {
                    const td = document.createElement('td');
                    if (order[field] == 'pending') {
                        td.textContent = 'pending';
                        td.style.color = '#FACC15x';
                    } else if (order[field] == 'approved') {
                        td.textContent = 'approved';
                        td.style.color = '#10B981';
                    } else if (order[field] == 'denied') {
                        td.textContent = 'denied';
                        td.style.color = 'red';
                    }
                    orderRow.appendChild(td);
                }
            });

            ordersTableBody.appendChild(orderRow);

            orderRow.addEventListener('click', async function () {
                const rows = document.querySelectorAll('#orders-table tbody tr');
                let alreadyActive = false;
                rows.forEach(r => {
                    if (r.classList.contains('active')) {
                        r.classList.remove('active');
                    }
                })

                orderRow.classList.add('active');

                document.getElementById('order-items').innerHTML = '';
                let subtotal = 0;
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
                    document.getElementById("chosen-order-card").style.display = 'flex';
                    // Populate the customer summary table with customer contact and shipping info
                    document.querySelector('#chosen-order-card #order-details h3').innerHTML = 'Order #' + order.id;
                    document.getElementById("close-chosen-order").addEventListener('click', function () {
                        rows.forEach(r => {
                            if (r.classList.contains('active')) {
                                r.classList.remove('active');
                            }
                        })
                        document.getElementById("chosen-order-card").style.display = 'none';
                    })

                    // Create a summary of the items in the order for the merchant to fulfil
                    const orderItems = data.orderItems;

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

                            subtotal += price * quantity;;
                            document.getElementById("total").innerHTML = '$' + order['total_price'];

                            // Create little product things
                            // Create an inventory item for each retrieved

                            let itemRow = document.createElement('div');
                            itemRow.className = 'item-row';

                            let itemName = document.createElement('div');
                            itemName.innerHTML = product.name;
                            let itemQuantity = document.createElement('div');
                            itemQuantity.innerHTML = item.quantity + ' @ $' + product.price;
                            let itemPrice = document.createElement('div');
                            itemPrice.innerHTML = '$' + parseInt(itemQuantity.innerHTML) * product.price;

                            itemRow.appendChild(itemName);
                            itemRow.appendChild(itemQuantity);
                            itemRow.appendChild(itemPrice);

                            document.getElementById('order-items').appendChild(itemRow);
                        })
                    })
                })
            })
        });
    })

    // Fetch all the inventory items for the merchant
    let inStock = 0;
    let outOfStock = 0;
    let totalValue = 0;

    fetch(`${API_BASE_URL}/inventory/`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch inventory products.');
        return response.json();
    })
    .then(data => {
        const products = data;
        // Populate the inventory table with inventory items
        let inventoryTableBody = document.querySelector('#inventory-table tbody');

        products.forEach(product => {
            let productRow = document.createElement('tr');

            // Define the fields you want in order
            const fields = [
                'id', 
                'name', 
                'price',
                'quantity'
            ];
            fields.forEach(field => {
                if (field != 'quantity'){
                    const td = document.createElement('td');
                    td.textContent = product[field];
                    productRow.appendChild(td);
                } else {
                    const td = document.createElement('td');
                    td.textContent = product[field];
                    productRow.appendChild(td);

                    if (parseInt(product[field]) > 0) {
                        inStock += 1;
                    } else {outOfStock += 1; td.innerHTML = "<span style='color: red;'>Out of Stock</span>"}
                }
            });
            totalValue += parseInt(product['price']) * parseInt(product['quantity']);
            inventoryTableBody.appendChild(productRow);
        })
    })
})

function formatTimestamp(timestamp) {
  const [datePart, timePart] = timestamp.split(' '); // "2025-06-24", "22:02"
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');

  const date = new Date(year, month - 1, day, hour, minute);

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return `${date.toLocaleDateString('en-US', options)}`;
}
