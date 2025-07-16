let links = document.querySelectorAll('.links-group a');

links.forEach(link => {
  link.classList.remove('active');

  if (window_location == link.querySelector('h3').innerHTML) {
    link.classList.add('active');
    link.querySelector('img').src = active_URL;
  }
})

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
      if (item.customer_name) {
        return item.customer_name.toLowerCase().includes(searchTerm) ||
               item.id.toString().includes(searchTerm) ||
               (item.customer_email && item.customer_email.toLowerCase().includes(searchTerm)) ||
               (item.customer_phone && item.customer_phone.includes(searchTerm)) ||
               (item.total_price && String(item.total_price).includes(searchTerm));
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
  
  // Check if it's an order
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
  const tableBody = document.querySelector('.records-table tbody');
  const table = document.querySelector('.records-table');
  
  if (filteredData.length === 0) {
    // Show "no results" message in the table body instead of separate div
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 40px; color: #666; font-size: 18px;">
                <div style="font-size: 48px; margin-bottom: 15px;">🔍</div>
                No products found matching your search criteria.
            </td>
        </tr>
    `;
    return;
  }

  table.style.display = 'table';
  if (table.id == 'inventory-table') {
    tableBody.innerHTML = filteredData.map(item => `
      <tr class='inventory-row' data-item='${JSON.stringify(item).replace(/'/g, '&apos;')}'>
        <td class='id-td'>${highlightText(String(item.id), searchTerm)}</td>
        <td class='name-td'><img src='/media/${item.image}' alt='${item.name}'> ${highlightText(item.name, searchTerm)}</td>
        <td class='price-td'>${highlightText(String(item.price), searchTerm)}</td>
        <td class='stock-td'>${highlightText(String(item.quantity), searchTerm)}</td>
      </tr>
    `).join('');
  } else if (table.id == 'orders-table') {
    tableBody.innerHTML = filteredData.map(item => `
      <tr class='order-row' data-item='${JSON.stringify(item).replace(/'/g, '&apos;')}'>
        <td class='id-td'>${highlightText(String(item.id), searchTerm)}</td>
        <td class='customer-name-td'>${highlightText(String(item.customer_name), searchTerm)}</td>
        <td class='customer-contact-td'>${highlightText(String(item.customer_phone) + ' / ' + String(item.customer_email), searchTerm)}</td>
        <td class='order-date-td'>${highlightText(String(item.created_at), searchTerm)}</td>
        <td class='order-total-td'>${highlightText(String(item.total_price), searchTerm)}</td>
        <td class='order-status-td'>${highlightText(String(item.status), searchTerm)}</td>
      </tr>
    `).join('');
  }
}

export {searchAndFilter, showModal, hideModal};