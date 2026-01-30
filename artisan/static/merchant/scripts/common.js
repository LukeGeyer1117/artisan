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
  let searchTerm;
  
  if (searchInput) {
    searchTerm = searchInput.value.toLowerCase().trim();
  }

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
            <td colspan="6" style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                No Results Found
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
            <td><div class='flex flex-row gap-4 items-center'><img class='h-8 w-8 rounded' src='${item.image}' alt='${item.name}'> <div>${highlightText(item.name, searchTerm)}</div></div></td>
            <td class='price-td'>${highlightText(String(formatCurrency(item.price)), searchTerm)}</td>
            <td class='stock-td'>${highlightText(String(item.quantity), searchTerm)}</td>
            <td class='category-td'>${item.category}</td>
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
            <td class='order-total-td'>$${highlightText(String(item.total_price), searchTerm)}</td>
            <td class='order-status-td'>${highlightText(String(item.status).replace('_', ' '), searchTerm)}</td>
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
          <tr class='order-row hover:bg-gray-300' data-item='${JSON.stringify(item).replace(/'/g, '&apos;')}'>
            <td class='id-td'>${highlightText(String(item.id), searchTerm)}</td>
            <td class='customer-name-td'>${highlightText(String(item.customer_name), searchTerm)}</td>
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
  console.log(timestamp);
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
    if (data.artisan.troute_key == "False" || data.artisan.troute_login == "False") {
      showToast("You are not fully registered. Please contact your System Administrator or Agent", "error");
    }

    return data.artisan;
}

function showToast(message, message_type, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) {
    console.warn('Toast element not found in DOM');
    return;
  }

  // Set the new message
  const alert = document.createElement('div');
  alert.classList.add('alert');
  const alertMessage = document.createElement('span');
  alertMessage.classList.add('text-primary-content');
  alertMessage.innerHTML = message;

  alert.appendChild(alertMessage);
  toast.appendChild(alert);

  console.log(message_type);

  if (message_type == "info") {alert.classList.add('alert-info');} 
  else if (message_type == "success") {alert.classList.add('alert-success');}
  else if (message_type == "warning") {alert.classList.add('alert-warning');}
  else if (message_type == "error") {alert.classList.add('alert-error');}

  toast.classList.remove('hidden');
  console.log(toast);

  // Hide after duration
  setTimeout(() => {
    toast.classList.add('hidden');
    alert.remove();
  }, duration);
}

function formatCurrency(value, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}

function daisyColor(varName, alpha = 1) {
  const themeEl =
    document.querySelector('[data-theme]') || document.documentElement;

  const hsl = getComputedStyle(themeEl)
    .getPropertyValue(varName)
    .trim();

  const hex = oklchToHex(hsl);
  return hex;
}

function oklchToHex(oklchString) {
  // Parse OKLCH string
  const match = oklchString.match(/oklch\s*\(\s*([0-9.]+)%?\s+([0-9.]+)\s+([0-9.]+)(?:deg)?\s*\)/i);
  
  if (!match) {
    throw new Error('Invalid OKLCH string format');
  }
  
  let l = parseFloat(match[1]);
  let c = parseFloat(match[2]);
  let h = parseFloat(match[3]);
  
  // Convert percentage lightness to 0-1 range
  if (oklchString.includes('%')) {
    l = l / 100;
  }
  
  // Convert OKLCH to OKLAB
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  
  // Convert OKLAB to linear LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  
  // Convert linear LMS to linear RGB
  let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let b_rgb = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  
  // Convert linear RGB to sRGB
  r = linearToSrgb(r);
  g = linearToSrgb(g);
  b_rgb = linearToSrgb(b_rgb);
  
  // Clamp and convert to 8-bit
  r = Math.max(0, Math.min(255, Math.round(r * 255)));
  g = Math.max(0, Math.min(255, Math.round(g * 255)));
  b_rgb = Math.max(0, Math.min(255, Math.round(b_rgb * 255)));
  
  // Convert to hex
  return '#' + [r, g, b_rgb].map(x => x.toString(16).padStart(2, '0')).join('');
}

function linearToSrgb(val) {
  // Clamp to valid range first
  val = Math.max(0, Math.min(1, val));
  
  if (val <= 0.0031308) {
    return 12.92 * val;
  }
  return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
}



export {searchAndFilter, showModal, hideModal, formatTimestamp, get_merchant_information, showToast, daisyColor};