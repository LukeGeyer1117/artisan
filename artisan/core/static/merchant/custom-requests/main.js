import { searchAndFilter, showModal, hideModal, formatTimestamp } from "../common.js";

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', async function () {
  const searchInput = document.querySelector('.search-container input');
  const searchIcon = document.querySelector('.search-container span img');
  let searchActive = false;
  let currentRequest = null;

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

  // Listen for row clicks to open request details
  const tables = document.querySelectorAll('.records-table');
  tables.forEach(table => {
    table.addEventListener('click', function (e) {
      const row = e.target.closest('tr.request-row');
      if (row) {
        const request = JSON.parse(row.dataset.item);
        showRequestDetails(request);
      }
    })
  })

  // Modal Close handlers
  const closeModalButton = document.querySelector('#request-details-modal #close-modal-btn');
  closeModalButton.addEventListener('click', function () {
    const detailsModal = document.getElementById('request-details-modal');
    hideModal(detailsModal);
    document.querySelector('.dashboard-sections').classList.remove('compressed');
  })

  // Fetch the custom requests belonging to the merchant
  try {
    const response = await fetch(`${API_BASE_URL}/custom/`, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) throw new Error("Could not get orders.");

    const data = await response.json();
    const requests = data.customRequests;
    console.log(requests);

    searchAndFilter(searchInput, requests);

    searchInput.addEventListener('input', function () {
      searchAndFilter(searchInput, requests);
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
  }

  function showRequestDetails(request) {
    currentRequest = request;
    const detailsModal = document.getElementById('request-details-modal');
    showModal(detailsModal);
    // document.querySelector('.dashboard-sections').classList.add('compressed');

    // Populate modal with request data
    document.getElementById('request-name').innerHTML = request.customer_name;
    document.getElementById('request-contact').innerHTML = request.customer_phone + ' / ' + request.customer_email;
    document.getElementById('request-budget').innerHTML = request.budget; // Fixed typo
    document.getElementById('request-description').innerHTML = request.description;
    const orderStatusSelect = document.getElementById('request-status');
    orderStatusSelect.value = currentRequest.status;

    // Check for request status changes
    const oldStatus = request.status;
    
    // Remove existing listener to prevent memory leaks
    const oldBtn = document.getElementById('request-status-change-button');
    const statusChangeBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(statusChangeBtn, oldBtn);
    
    statusChangeBtn.addEventListener('click', function (e) {
      e.preventDefault();

      let currentStatus = orderStatusSelect.value;
      if (currentStatus === oldStatus) { // Fixed comparison
        alert('Request status was not changed');
      } else {
        fetch(`${API_BASE_URL}/custom/status`, {
          method: 'POST',
          credentials: 'include',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({'request_id': request.id, 'status': currentStatus}) // Fixed variable
        })
        .then(response => {
          if (!response.ok) throw new Error("Error updating request status!");
          return response.json();
        })
        .then(data => {
          console.log(data);
          window.location.reload();
        });
      }
    });
  }
})