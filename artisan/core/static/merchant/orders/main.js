import { searchAndFilter, showModal, hideModal, formatTimestamp } from "../common.js";

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', async function () {
  const searchInput = document.querySelector('.search-container input');
  const searchIcon = document.querySelector('.search-container span img');
  let searchActive = false;
  let currentOrder = null; // Track which order is being operated on

  // Search Bar Expansion 
  searchIcon.addEventListener('click', function () {
    if (!searchActive) {
      searchInput.style.width = '200px';
      searchInput.style.minWidth = '50px';
      searchInput.style.padding = '.8rem .5rem';
      searchActive = true;
    } else {
      searchInput.style.width = '0px';
      searchInput.style.minWidth = '0px';
      searchInput.style.padding = '0';
      searchActive = false;
    }
  });

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
    document.querySelector('.dashboard-sections').classList.add('compressed');

    // Populate modal with product data
    document.getElementById('order-name').innerHTML = order.customer_name;
    document.getElementById('order-contact').innerHTML = order.customer_phone + ' / ' + order.customer_email;
    document.getElementById('order-date').innerHTML = formatTimestamp(order.created_at);
    document.getElementById('order-total').innerHTML = order.total_price;
    const orderStatusSelect = document.getElementById('order-status');
    orderStatusSelect.value = order.status;

    // Check for order status changes
    const oldStatus = currentOrder.status;
    const statusChangeBtn = document.getElementById('order-status-change-button');
    statusChangeBtn.addEventListener('click', function (e) {
      e.preventDefault();

      let currentStatus = orderStatusSelect.value;
      if (currentStatus === oldStatus) {
        alert('Order status was not changed.');
      } else {
        fetch(`${API_BASE_URL}/order/status/`, {
          method: 'POST',
          credentials: 'include',
          headers: {'Content-Type': 'application/json'},
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
    })
  }

  function clearActiveRows(table) {
    const rows = table.querySelector('tbody tr');
    rows.forEach(r => {
      r.classList.remove('active');
      r.classlis.remove('gradient-background');
    });
  }
})
