import { getCookie } from "./csrf.js";
import { searchAndFilter, showModal, hideModal, formatTimestamp } from "./common.js";

// ========================================
// CONSTANTS & CONFIGURATION
// ========================================

const csrftoken = getCookie('csrftoken');

const API_BASE_URL = (() => {
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const port = isLocal ? ':8000' : '';
  return `${window.location.protocol}//${window.location.hostname}${port}/api`;
})();

const ORDER_STATUSES = {
  ACTIVE: ['pending', 'approved', 'in_progress'],
  INACTIVE: ['complete'],
  DEAD: ['denied']
};

// ========================================
// STATE MANAGEMENT
// ========================================

let currentOrder = null;

// ========================================
// API CALLS
// ========================================

async function fetchOrders() {
  const response = await fetch(`${API_BASE_URL}/orders/`, {
    method: 'GET',
    credentials: 'include'
  });

  if (!response.ok) throw new Error("Could not get orders.");

  const data = await response.json();
  console.log(data);
  return data.orders;
}

async function fetchOrderItems(orderId) {
  const response = await fetch(`${API_BASE_URL}/orderitems/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 'order_id': orderId })
  });

  if (!response.ok) throw new Error("Could not fetch Order Items");

  const data = await response.json();
  return data.orderItems;
}

async function fetchProduct(productId) {
  const response = await fetch(`${API_BASE_URL}/product/${encodeURIComponent(productId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) throw new Error("Could not find product!");

  const data = await response.json();
  return data.product;
}

async function updateOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE_URL}/order/status/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
    },
    body: JSON.stringify({ 'order_id': orderId, 'status': status })
  });

  if (!response.ok) throw new Error("Error updating order status!");

  return await response.json();
}

async function restockOrder(orderId) {
  const response = await fetch(`${API_BASE_URL}/order/restock/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 'order_id': orderId })
  });

  if (!response.ok) throw new Error('Could not restock order!');

  return await response.json();
}

// ========================================
// DOM MANIPULATION
// ========================================

function populateOrderDetails(order) {
  document.getElementById('order-name').innerHTML = order.customer_name;
  document.getElementById('order-contact').innerHTML = `${order.customer_phone} / ${order.customer_email}`;
  document.getElementById('order-total').innerHTML = order.total_price;
  document.getElementById('order-status').value = order.status;
}

function clearOrderProducts() {
  document.getElementById('order-products').innerHTML = '';
}

function createOrderItemElement(product, quantity) {
  const orderProduct = document.createElement('div');
  orderProduct.className = 'order-product';
  orderProduct.innerHTML = `
    <img src='${product.image}' alt='${product.name}'>
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
  return orderProduct;
}

async function renderOrderItem(orderItem) {
  try {
    const product = await fetchProduct(orderItem.product_id);
    const orderProductElement = createOrderItemElement(product, orderItem.quantity);
    document.getElementById('order-products').appendChild(orderProductElement);
  } catch (error) {
    console.error('Error adding order item:', error);
  }
}

function clearActiveRows() {
  const rows = document.querySelectorAll('.records-table tbody tr');
  rows.forEach(row => {
    row.classList.remove('active');
    row.classList.remove('gradient-background');
  });
}

function compressDashboard(compress = true) {
  document.querySelector('.dashboard-sections').classList.toggle('compressed', compress);
}

// ========================================
// MODAL MANAGEMENT
// ========================================

function closeOrderDetailsModal() {
  const detailsModal = document.getElementById('order-details-modal');
  hideModal(detailsModal);
  compressDashboard(false);
  clearActiveRows();
}

async function showOrderDetails(order) {
  currentOrder = order;
  const detailsModal = document.getElementById('order-details-modal');
  
  showModal(detailsModal);
  populateOrderDetails(order);
  clearOrderProducts();

  // Fetch and render order items
  try {
    const orderItems = await fetchOrderItems(order.id);
    
    for (const item of orderItems) {
      await renderOrderItem(item);
    }
  } catch (error) {
    console.error('Error loading order items:', error);
  }

  // Setup status change handler
  setupStatusChangeHandler(order);
}

// ========================================
// EVENT HANDLERS
// ========================================

function setupStatusChangeHandler(order) {
  const orderStatusSelect = document.getElementById('order-status');
  const statusChangeBtn = document.getElementById('order-status-change-button');
  const oldStatus = order.status;

  // Remove previous event listeners by cloning
  const newStatusChangeBtn = statusChangeBtn.cloneNode(true);
  statusChangeBtn.parentNode.replaceChild(newStatusChangeBtn, statusChangeBtn);

  newStatusChangeBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    const currentStatus = orderStatusSelect.value;
    
    if (currentStatus === oldStatus) {
      alert('Order status was not changed.');
      return;
    }

    try {
      await updateOrderStatus(order.id, currentStatus);
      window.location.reload();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  });
}

function setupOrderRowClickHandlers() {
  const tables = document.querySelectorAll('.records-table');
  
  tables.forEach(table => {
    table.addEventListener('click', function (e) {
      const row = e.target.closest('tr.order-row');
      
      if (row) {
        const order = JSON.parse(row.dataset.item);
        showOrderDetails(order);
      }
    });
  });
}

function setupModalCloseHandler() {
  const closeModalButton = document.querySelector('#order-details-modal #close-modal-btn');
  
  closeModalButton.addEventListener('click', closeOrderDetailsModal);
}

function setupSearchHandler(searchInput, orders) {
  searchAndFilter(searchInput, orders);

  searchInput.addEventListener('input', function () {
    searchAndFilter(searchInput, orders);
  });
}

// ========================================
// INITIALIZATION
// ========================================

async function initializeOrdersPage() {
  const searchInput = document.querySelector('.search-container input');

  setupOrderRowClickHandlers();
  setupModalCloseHandler();

  try {
    const orders = await fetchOrders();
    setupSearchHandler(searchInput, orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

// ========================================
// ENTRY POINT
// ========================================

document.addEventListener('DOMContentLoaded', initializeOrdersPage);

// ========================================
// EXPORTED FUNCTIONS (if needed elsewhere)
// ========================================

export { updateOrderStatus, restockOrder };