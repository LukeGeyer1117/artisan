import { getCookie } from "./csrf.js";

const csrftoken = getCookie('csrftoken');
import { searchAndFilter, showModal, hideModal, formatTimestamp } from "./common.js";

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
  const searchInput = document.querySelector('.search-container input');
  let currentOrder = null; // Track which order is being operated on

  // Listen for row clicks to open order details
  const tables = document.querySelectorAll('.records-table');
  tables.forEach(table => {
    table.addEventListener('click', function (e) {
      const row = e.target.closest('tr.order-row');
      if (row) {
        const order = JSON.parse(row.dataset.item);
        showOrderDetails(order);
      }
    })
  })

  // Modal close handlers
  const closeModalButton = document.querySelector('#order-details-modal #close-modal-btn');
  closeModalButton.addEventListener('click', function () {
    const detailsModal = document.getElementById('order-details-modal');
    hideModal(detailsModal);
    document.querySelector('.dashboard-sections').classList.remove('compressed');
    clearActiveRows();
  })

  // Fetch the orders belonging to the merchant
  try {
    const response = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) throw new Error("Could not get orders.");

    const data = await response.json();
    const orders = data.orders;
    console.log(orders);

    searchAndFilter(searchInput, orders);

    searchInput.addEventListener('input', function () {
      searchAndFilter(searchInput, orders);
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
  function showOrderDetails(order) {
    currentOrder = order;
    const detailsModal = document.getElementById('order-details-modal');
    showModal(detailsModal);
    // document.querySelector('.dashboard-sections').classList.add('compressed');

    // Populate modal with product data
    document.getElementById('order-name').innerHTML = order.customer_name;
    document.getElementById('order-contact').innerHTML = order.customer_phone + ' / ' + order.customer_email;
    document.getElementById('order-date').innerHTML = formatTimestamp(order.created_at);
    document.getElementById('order-total').innerHTML = order.total_price;
    const orderStatusSelect = document.getElementById('order-status');
    orderStatusSelect.value = order.status;

    fetch(`${API_BASE_URL}/orderitems/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({'order_id': order.id})
    })
    .then(response => {
      if (!response.ok) throw new Error("could not fetch Order Items");
      return response.json();
    })
    .then(data => {
      const orderItems = data.orderItems;
      console.log(orderItems);

      document.getElementById('order-products').innerHTML = '';

      orderItems.forEach(item => {
        addOrderItem(item);
      })
    })

    // Check for order status changes
    const oldStatus = currentOrder.status;
    const statusChangeBtn = document.getElementById('order-status-change-button');

    const active_statuses = ['pending', 'approved', 'in_progress']
    const inactive_statuses = ['complete']
    const dead_statuses = ['denied']

    statusChangeBtn.addEventListener('click', function (e) {
      e.preventDefault();

      let currentStatus = orderStatusSelect.value;
      if (currentStatus === oldStatus) {
        alert('Order status was not changed.');
      }
      update_status(currentOrder, currentStatus);
    })
  }

  function clearActiveRows(table) {
    const rows = table.querySelector('tbody tr');
    rows.forEach(r => {
      r.classList.remove('active');
      r.classlis.remove('gradient-background');
    });
  }

  function addOrderItem(orderItem) {
      const ordersProducts = document.getElementById('order-products');
      const quantity = orderItem.quantity;

      fetch(`${API_BASE_URL}/product/${encodeURIComponent(orderItem.product_id)}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      })
      .then(response => {
        if (!response.ok) throw new Error("Could not find product!");
        return response.json();
      })
      .then(data => {
        const product = data.product;        
        // Create a order-product listing
        const order_product = document.createElement('div');
        order_product.className = 'order-product';
        order_product.innerHTML = `
          <img src='/media/${product.image}' alt='${product.name}'>
          <div class="order-product-details">
            <div>
              <h4>Name:</h4>
              <p>${product.name}</p>
            </div>
            <div>
              <h4>Price:</h4>
              <p>${product.price}</p>
            </div>
            <div>
              <h4>Quantity:</h4>
              <p>${quantity}</p>
            </div>
          </div>
        `;
        ordersProducts.appendChild(order_product);
      })
      .catch(error => {
        console.error('Error adding order item:', error);
      });
  }
})

function update_status(currentOrder, currentStatus) {
  fetch(`${API_BASE_URL}/order/status/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
    },
    body: JSON.stringify({'order_id': currentOrder.id, 'status': currentStatus})
  })
  .then(response => {
    if (!response.ok) throw new Error("Error updating order status!");
    return response.json();
  })
  .then(data => {
    console.log(data);
    window.location.reload();
  })
}

function restock(currentOrder) {
  fetch(`${API_BASE_URL}/order/restock/`, {
    method: 'POST',
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({'order_id': currentOrder.id})
  })
  .then(response => {
    if (!response.ok) throw new Error('Could not restock order!');
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
}
