const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', async function () {
  let currentProduct = null; // Track which product is being operated on

  // Add Item Button
  let addItemButton = document.getElementById('add-item-button');
  addItemButton.addEventListener('click', function () {
    window.location.href = '/add-item/';
  });

  // Modal close handlers (add once)
  document.querySelector('#product-details-modal #close-modal-btn').addEventListener('click', function () {
    const detailsModal = document.getElementById('product-details-modal');
    hideModal(detailsModal);
    document.querySelector('.dashboard-sections').classList.remove('compressed');
    clearActiveRows();
  });

  // Edit button handler (add once)
  document.getElementById('edit-button').addEventListener('click', function () {
    if (!currentProduct) return;
    
    const detailsModal = document.getElementById('product-details-modal');
    const editModal = document.getElementById('product-edit-modal');
    
    hideModal(detailsModal);
    showModal(editModal);

    // Populate edit form with current product data
    document.getElementById('edit-title').value = currentProduct.name;
    document.getElementById('edit-price').value = currentProduct.price;
    document.getElementById('edit-stock').value = currentProduct.quantity;
    document.getElementById('edit-description').value = currentProduct.description;
  });

  // Edit form submit handler (add once)
  document.querySelector('#product-edit-modal form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentProduct) return;

    const form = e.target;
    const formData = new FormData();

    formData.append('id', currentProduct.id);
    formData.append('name', form.querySelector('#edit-title').value);
    formData.append('price', form.querySelector('#edit-price').value);
    formData.append('description', form.querySelector('#edit-description').value);
    formData.append('quantity', form.querySelector('#edit-stock').value);
    formData.append('image', form.querySelector('#edit-image').files[0]);
    formData.append('_method', 'PATCH');

    fetch(`${API_BASE_URL}/product/`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) throw new Error("Failed to Patch Product");
      return response.json();
    })
    .then(result => {
      window.location.reload();
    })
    .catch(error => {
      console.error(error);
    });
  });

  // Delete button handler (add once)
  document.getElementById('delete-button').addEventListener('click', function () {
    if (!currentProduct) return;
    document.querySelector('#confirm-delete-modal').style.display = 'flex';
  });

  // Delete confirmation handlers (add once)
  document.getElementById('cancel-delete-button').addEventListener('click', function() {
    document.querySelector('#confirm-delete-modal').style.display = 'none';
  });

  document.getElementById('confirm-delete-button').addEventListener('click', async function() {
    if (!currentProduct) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/product/?id=${currentProduct.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error("Failed to delete product");
      
      const result = await response.json();
      alert("Product deleted!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  });

  // Function to clear active row styling
  function clearActiveRows() {
    const rows = document.querySelectorAll('#inventory-table tr');
    rows.forEach(r => {
      r.classList.remove('active');
      r.classList.remove('gradient-background');
    });
  }

  // Function to show product details in modal
  function showProductDetails(product) {
    currentProduct = product; // Set the current product
    
    const detailsModal = document.getElementById('product-details-modal');
    showModal(detailsModal);
    document.querySelector('.dashboard-sections').classList.add('compressed');

    // Populate modal with product data
    document.querySelector('#product-details img').src = '/media/' + product.image;
    document.getElementById('product-title').innerHTML = product.name;
    document.getElementById('product-price').innerHTML = product.price;
    if (product.quantity == '0') {
      document.getElementById('product-stock').innerHTML = "<span style='color: #FF6E6E'>Out of Stock</span>";
    } else {
      document.getElementById('product-stock').innerHTML = product.quantity;
    }
    document.getElementById('product-description').innerHTML = product.description;
  }

  // Get all the Inventory items the merchant has created
  const inventoryTableBody = document.querySelector('#inventory-table tbody');
  
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to fetch inventory products.');
    
    const data = await response.json();
    console.log(data);

    data.forEach(product => {
      console.log(product);
      const productRow = document.createElement('tr');

      // Create the table datums
      // Product ID
      const productID = document.createElement('td');
      productID.className = 'product-id';
      productID.innerHTML = product.id;
      productRow.appendChild(productID);

      // Product name and img
      const productName = document.createElement('td');
      productName.className = 'product-name';
      const productImg = document.createElement('img');
      productImg.src = '/media/' + product.image;
      productName.appendChild(productImg);
      productName.append(' ', product.name);
      productRow.appendChild(productName);

      // Product Price
      const productPrice = document.createElement('td');
      productPrice.className = 'product-price';
      productPrice.append('$' + product.price);
      productRow.appendChild(productPrice);

      // Product Stock
      const productStock = document.createElement('td');
      productStock.className = 'product-stock';
      if (product.quantity == '0') {
        productStock.innerHTML = "<span style='color: #FF6E6E'>Out of Stock</span>";
      } else {
        productStock.append(product.quantity);
      }
      productRow.appendChild(productStock);

      inventoryTableBody.appendChild(productRow);

      // Row click handler - simplified
      productRow.addEventListener('click', function () {
        // Close the editModal, if it's open
        hideModal(document.getElementById('product-edit-modal'));

        // Clear active styling from all rows
        clearActiveRows();
        
        // Add active styling to clicked row
        productRow.classList.add('active');
        productRow.classList.add('gradient-background');

        // Show product details
        showProductDetails(product);
      });
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
  }
});

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