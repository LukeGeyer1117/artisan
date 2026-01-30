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
  return data.orders;
}

async function fetchOrderItems(orderId) {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items/`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) throw new Error("Could not fetch Order Items");

  const data = await response.json();
  return data.orderItems;
}

async function updateOrderItem(item_id, fulfilled) {
  const response = await fetch(`${API_BASE_URL}/order-item/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
    },
    body: JSON.stringify({'item_id': item_id, 'fulfilled': fulfilled})
  })

  if (!response.ok) throw new Error("Could not update order item.");

  const data = await response.json();

  return data;
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

function createOrderItemElement(product, item) {
  const orderProduct = document.createElement("div");
  orderProduct.className =
    "order-item flex items-center gap-4 p-3 rounded-lg bg-base-100 hover:bg-base-200 transition-colors";
  orderProduct.dataset.item_id = item.id;

  console.log(item);

  orderProduct.innerHTML = `
    <!-- Product image -->
    <div class='flex flex-row gap-4 items-center'>
      <input type="checkbox" class="checkbox checkbox-info" />
      <div class="avatar">
        <div class="w-8 rounded">
          <img src="${product.image}" alt="${product.name}" />
        </div>
      </div>
    </div>

    <!-- Product info -->
    <div class="flex-1">
      <p class="font-medium text-sm">${product.name}</p>

      <div class="text-xs text-base-content/70 flex gap-4 mt-1">
        <span>Price: <span class="font-medium">$${product.price}</span></span>
        <span>Qty: <span class="font-medium">${item.quantity}</span></span>
      </div>
    </div>

    <!-- Line total -->
    <div class="text-right flex flex-row gap-4">
      <p class="font-semibold">
        $${(product.price * item.quantity).toFixed(2)}
      </p>
    </div>
  `;

  if (item.fulfilled) {
    orderProduct.querySelector('.checkbox').checked = true;
  }

  return orderProduct;
}

async function renderOrderItem(orderItem) {
  try {
    const product = await fetchProduct(orderItem.product_id);
    const orderProductElement = createOrderItemElement(product, orderItem);
    console.log('here');
    document.getElementById('order-products').appendChild(orderProductElement);
  } catch (error) {
    console.error('Error adding order item:', error);
  }
}


// ========================================
// MODAL MANAGEMENT
// ========================================

async function showOrderDetails(order) {
  currentOrder = order;

  // Fetch and render order items
  try {
    const orderItems = await fetchOrderItems(order.id);
    
    document.getElementById("order-products").innerHTML = '';
    for (const item of orderItems) {
      await renderOrderItem(item);
    }
  } catch (error) {
    console.error('Error loading order items:', error);
  }
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

    // Get the 'checked' or 'unchecked' of each order item fulfullment checkbox
    for (const item of document.querySelectorAll('.order-item')) {
      const fulfilled = item.querySelector('.checkbox').checked;
      const item_id = parseInt(item.dataset.item_id);

      console.log(fulfilled, item_id);

      const data = await updateOrderItem(item_id, fulfilled);

      console.log(data);
    }

    try {
      updateOrderStatus(order.id, currentStatus);
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
    const tableBody = table.querySelector('tbody');

    tableBody.addEventListener('click', (e) => {
      const row = e.target.closest(".order-row");
      if (!row) return;

      const raw_data = row.dataset.item;
      console.log(raw_data);

      const row_data = JSON.parse(row.dataset.item);

      openOrderDrawer(row_data);
    });

    tableBody.addEventListener('mouseover', (e) => {
      const row = e.target.closest(".order-row");
      if (!row) return;

      row.querySelectorAll('td').forEach(td => {
        td.classList.add('bg-base-300');
      })
    });

    tableBody.addEventListener('mouseout', (e) => {
      const row = e.target.closest(".order-row");
      if (!row) return;

      row.querySelectorAll('td').forEach(td => {
        td.classList.remove('bg-base-300');
      })
    });
  });
}

function setupSearchHandler(searchInput, orders) {
  searchAndFilter(searchInput, orders);

  searchInput.addEventListener('input', function () {
    searchAndFilter(searchInput, orders);
  });
}

function openOrderDrawer(order_data) {
  const drawerToggle = document.getElementById("order-details-drawer");

  showOrderDetails(order_data);

  document.getElementById('order-name').innerHTML = order_data.customer_name;
  document.getElementById('order-contact').innerHTML = `${order_data.customer_email} / ${order_data.customer_phone}`;
  document.getElementById('order-date').innerHTML = new Date(order_data.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  document.getElementById('order-status').value = order_data.status;
  document.getElementById('order-total').innerHTML = `$${order_data.total_price}`;

  drawerToggle.checked = true;

  setupStatusChangeHandler(order_data);
}

// ========================================
// INITIALIZATION
// ========================================

async function initializeOrdersPage() {
  const searchInput = document.querySelector('#search-input');

  setupOrderRowClickHandlers();

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