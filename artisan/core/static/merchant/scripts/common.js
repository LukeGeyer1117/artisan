import { getCookie } from "./csrf.js";

const csrftoken = getCookie('csrftoken');
let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

let links = document.querySelectorAll('.links-group a');

links.forEach(link => {
  link.classList.remove('active');

  if (window_location == link.querySelector('h3').innerHTML) {
    link.classList.add('active');
  }
})

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');

  btn.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });
});

document.querySelector('.navbar a').addEventListener('click', function () {window.location.href = '/login/'});

function showModal(modal) {
  modal.classList.add('active'); // Make it display: flex
  requestAnimationFrame(() => {
    modal.classList.add('show'); // Trigger animation
  });
}

function hideModal(modal) {
  modal.classList.remove('show'); // Start exit animation
  setTimeout(() => {
    modal.classList.remove('active'); // Hide after animation
  }, 150);
}

function searchAndFilter(searchInput, filteredData) {
  const searchTerm = searchInput.value.toLowerCase().trim();

  // Filter by search term
  if (searchTerm) {
    filteredData = filteredData.filter(item => {
      // Check if it's a product (has name property)
      if (item.name) {
        return item.name.toLowerCase().includes(searchTerm) || 
               item.id.toString().includes(searchTerm);
      }
      
      // Check if it's an order (has customer_name property)
      if (item.customer_name && !item.budget) {
        return item.customer_name.toLowerCase().includes(searchTerm) ||
               item.id.toString().includes(searchTerm) ||
               (item.customer_email && item.customer_email.toLowerCase().includes(searchTerm)) ||
               (item.customer_phone && item.customer_phone.includes(searchTerm)) ||
               (item.total_price && String(item.total_price).includes(searchTerm)) ||
               (item.created_at && formatTimestamp(item.created_at).includes(searchTerm));
      }

      // Check if it's a custom request (has the budget property)
      if (item.budget) {
        return item.customer_name.toLowerCase().includes(searchTerm) ||
               item.id.toString().includes(searchTerm) ||
               (item.customer_email && item.customer_email.toLowerCase().includes(searchTerm)) ||
               (item.customer_phone && item.customer_phone.includes(searchTerm)) ||
               (item.budget && String(item.budget).includes(searchTerm));
      }
      
      // Fallback: just search by id if structure is unknown
      return item.id.toString().includes(searchTerm);
    });

    // Sort by relevance (exact matches, then partial)
    filteredData.sort((a, b) => {
      const aScore = getRelevanceScore(a, searchTerm);
      const bScore = getRelevanceScore(b, searchTerm);
      return bScore - aScore;
    });
  }

  renderResults(filteredData, searchTerm);
}

function getRelevanceScore(item, searchTerm) {
  let score = 0;
  
  // Check if it's a product
  if (item.name) {
    if (item.name.toLowerCase() === searchTerm) score += 100;
    else if (item.name.toLowerCase().startsWith(searchTerm)) score += 50;
    else if (item.name.toLowerCase().includes(searchTerm)) score += 25;
  }
  
  // Check if it's an order or customer_request
  if (item.customer_name) {
    if (item.customer_name.toLowerCase() === searchTerm) score += 100;
    else if (item.customer_name.toLowerCase().startsWith(searchTerm)) score += 50;
    else if (item.customer_name.toLowerCase().includes(searchTerm)) score += 25;
    
    if (item.customer_email && item.customer_email.toLowerCase().includes(searchTerm)) {
      score += item.customer_email.toLowerCase() === searchTerm ? 80 : 20;
    }
    
    if (item.customer_phone && item.customer_phone.includes(searchTerm)) {
      score += item.customer_phone === searchTerm ? 80 : 20;
    }
  }
  
  // ID match (works for both products and orders)
  if (item.id.toString() === searchTerm) score += 90;
  else if (item.id.toString().includes(searchTerm)) score += 15;
  
  return score;
}

// Highlight matching text
function highlightText(text, searchTerm) {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

function renderResults(filteredData, searchTerm = '') {
  const tables = document.querySelectorAll('.records-table');

  const emptyTableHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 20px; color: #666; font-size: 18px;">
                <div style="font-size: 32px; margin-bottom: 15px;">
                  <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px"><path d="M428.67-326.67q.66-75 15.83-108.83t59.5-73.83q41.67-37.34 63.83-67.84 22.17-30.5 22.17-66.5 0-43.66-29.17-72.66-29.16-29-81.5-29-51.66 0-79.16 30t-39.84 62L270-692.67q21.67-60.66 75.33-104Q399-840 479.33-840q101.67 0 156.5 56.5 54.84 56.5 54.84 135.83 0 48.67-20.84 86.5-20.83 37.84-66.16 81.5-49 47-59.17 71.84-10.17 24.83-10.83 81.16h-105ZM479.33-80Q449-80 427.5-101.5T406-153.33q0-30.34 21.5-51.84 21.5-21.5 51.83-21.5 30.34 0 51.84 21.5 21.5 21.5 21.5 51.84 0 30.33-21.5 51.83T479.33-80Z"/></svg>
                </div>
                No products found matching your search criteria.
            </td>
        </tr>
        `;

  tables.forEach(table => {
    const tableBody = table.querySelector('tbody'); // Get the specific tbody for this table
    table.style.display = 'table';
    if (table.id == 'inventory-table') {
      if (filteredData.length > 0) {
        tableBody.innerHTML = filteredData.map(item => `
          <tr class='inventory-row' data-item='${JSON.stringify(item).replace(/'/g, '&apos;')}'>
            <td class='id-td'>${highlightText(String(item.id), searchTerm)}</td>
            <td class='name-td'><img src='/media/${item.image}' alt='${item.name}'> <div>${highlightText(item.name, searchTerm)}</div></td>
            <td class='price-td'>${highlightText(String(item.price), searchTerm)}</td>
            <td class='stock-td'>${highlightText(String(item.quantity), searchTerm)}</td>
          </tr>
        `).join('');
      } else {
        tableBody.innerHTML = emptyTableHTML;
      }

    } else if (table.id == 'orders-table') {
      // Filter orders to only show pending, approved, or in_progress statuses
      const validStatuses = ['pending', 'approved', 'in_progress'];
      const filteredOrders = filteredData.filter(item => 
        validStatuses.includes(item.status)
      );
      if (filteredOrders.length > 0) {
        tableBody.innerHTML = filteredOrders.map(item => `
          <tr class='order-row' data-item='${JSON.stringify(item).replace(/'/g, '&apos;')}'>
            <td class='id-td'>${highlightText(String(item.id), searchTerm)}</td>
            <td class='customer-name-td'>${highlightText(String(item.customer_name), searchTerm)}</td>
            <td class='order-date-td'>${highlightText(String(formatTimestamp(item.created_at)), searchTerm)}</td>
            <td class='order-total-td'>${highlightText(String(item.total_price), searchTerm)}</td>
            <td class='order-status-td'>${highlightText(String(item.status), searchTerm)}</td>
          </tr>
        `).join('');
      } else {tableBody.innerHTML = emptyTableHTML;}

    } else if (table.id == 'inactive-orders-table') {
      const validStatuses = ['denied'];
      const filteredOrders = filteredData.filter(item => 
        validStatuses.includes(item.status)
      );
      if (filteredOrders.length > 0) {
        tableBody.innerHTML = filteredOrders.map(item => `
          <tr class='order-row' data-item='${JSON.stringify(item).replace(/'/g, '&apos;')}'>
            <td class='id-td'>${highlightText(String(item.id), searchTerm)}</td>
            <td class='customer-name-td'>${highlightText(String(item.customer_name), searchTerm)}</td>
            <td class='order-date-td'>${highlightText(String(formatTimestamp(item.created_at)), searchTerm)}</td>
            <td class='order-total-td'>${highlightText(String(item.total_price), searchTerm)}</td>
            <td class='order-status-td'>${highlightText(String(item.status), searchTerm)}</td>
          </tr>
        `).join('');
      } else {tableBody.innerHTML = emptyTableHTML;}

    } else if (table.id == 'completed-orders-table') {
      const validStatuses = ['completed'];
      const filteredOrders = filteredData.filter(item => 
        validStatuses.includes(item.status)
      );
      if (filteredOrders.length > 0) {
        tableBody.innerHTML = filteredOrders.map(item => `
          <tr class='order-row' data-item='${JSON.stringify(item).replace(/'/g, '&apos;')}'>
            <td class='id-td'>${highlightText(String(item.id), searchTerm)}</td>
            <td class='customer-name-td'>${highlightText(String(item.customer_name), searchTerm)}</td>
            <td class='customer-contact-td'>${highlightText(String(item.customer_phone) + ' / ' + String(item.customer_email), searchTerm)}</td>
            <td class='order-date-td'>${highlightText(String(formatTimestamp(item.created_at)), searchTerm)}</td>
            <td class='order-total-td'>${highlightText(String(item.total_price), searchTerm)}</td>
            <td class='order-status-td'>${highlightText(String(item.status), searchTerm)}</td>
          </tr>
        `).join('');
      } else {tableBody.innerHTML = emptyTableHTML;}
    }

    // Requests
    else if (table.id == 'requests-table') {
      // filter request to only show pending, approved, or in_progress
      const validStatuses = ['pending', 'approved', 'in_progress'];
      const filteredRequests = filteredData.filter(item =>
        validStatuses.includes(item.status)
      );
      if (filteredRequests.length > 0) {
        tableBody.innerHTML = filteredRequests.map(item => `
          <tr class='request-row' data-item='${JSON.stringify(item).replace(/'/g, '&apos;')}'>
            <td class='id-td'>${highlightText(String(item.id), searchTerm)}</td>
            <td class='request-name-td'>${highlightText(String(item.customer_name), searchTerm)}</td>
            <td class='request-contact-td'>${highlightText(String(item.customer_phone) + ' / ' + String(item.customer_email), searchTerm)}</td>
            <td class='request-budget-td'>${highlightText(String(item.budget), searchTerm)}</td>
            <td class='request-status-td'>${highlightText(String(item.status), searchTerm)}</td>
          </tr>
        `).join('');
      }
    } else if (table.id == 'denied-requests-table') {
      // filter request to only show pending, approved, or in_progress
      const validStatuses = ['denied'];
      const filteredRequests = filteredData.filter(item =>
        validStatuses.includes(item.status)
      );
      if (filteredRequests.length > 0) {
        tableBody.innerHTML = filteredRequests.map(item => `
          <tr class='request-row' data-item='${JSON.stringify(item).replace(/'/g, '&apos;')}'>
            <td class='id-td'>${highlightText(String(item.id), searchTerm)}</td>
            <td class='request-name-td'>${highlightText(String(item.customer_name), searchTerm)}</td>
            <td class='request-contact-td'>${highlightText(String(item.customer_phone) + ' / ' + String(item.customer_email), searchTerm)}</td>
            <td class='request-budget-td'>${highlightText(String(item.budget), searchTerm)}</td>
            <td class='request-status-td'>${highlightText(String(item.status), searchTerm)}</td>
          </tr>
        `).join('');
      }
    } else if (table.id == 'completed-requests-table') {
      // filter request to only show pending, approved, or in_progress
      const validStatuses = ['completed'];
      const filteredRequests = filteredData.filter(item =>
        validStatuses.includes(item.status)
      );
      if (filteredRequests.length > 0) {
        tableBody.innerHTML = filteredRequests.map(item => `
          <tr class='request-row' data-item='${JSON.stringify(item).replace(/'/g, '&apos;')}'>
            <td class='id-td'>${highlightText(String(item.id), searchTerm)}</td>
            <td class='request-name-td'>${highlightText(String(item.customer_name), searchTerm)}</td>
            <td class='request-contact-td'>${highlightText(String(item.customer_phone) + ' / ' + String(item.customer_email), searchTerm)}</td>
            <td class='request-budget-td'>${highlightText(String(item.budget), searchTerm)}</td>
            <td class='request-status-td'>${highlightText(String(item.status), searchTerm)}</td>
          </tr>
        `).join('');
      }
    }
  })
}

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

async function get_merchant_information() {
    const response = await fetch(`${API_BASE_URL}/artisan/`, {
        method: 'GET',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Could not get merchant info');
    }

    const data = await response.json();
    return data.artisan;
}


export {searchAndFilter, showModal, hideModal, formatTimestamp, get_merchant_information};