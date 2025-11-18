import { getCookie } from "./csrf.js";
import { showToast } from "./common.js";

const csrftoken = getCookie('csrftoken');
import { searchAndFilter, showModal, hideModal } from "./common.js";

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
  const searchInput = document.querySelector('.search-container input');
  let currentProduct = null; // Track which product is being operated on

  // Track extra image files for editing
  let extraImageFiles = [];
  const extraImagesInput = document.getElementById('edit-extra-images');
  const previewsContainer = document.getElementById('extra-image-previews');

  if (extraImagesInput) {
    extraImagesInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      extraImageFiles = extraImageFiles.concat(files);
      renderExtraImagePreviews();
    });
  }

  function renderExtraImagePreviews() {
    previewsContainer.innerHTML = ''; // Clear existing previews

    extraImageFiles.forEach((file, index) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.width = '80px';
        wrapper.style.height = '80px';

        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.border = '1px solid #ccc';
        img.style.borderRadius = '4px';

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.style.position = 'absolute';
        removeBtn.style.top = '0';
        removeBtn.style.right = '0';
        removeBtn.style.background = 'rgba(0,0,0,0.6)';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.width = '20px';
        removeBtn.style.height = '20px';
        removeBtn.style.borderRadius = '50%';

        removeBtn.addEventListener('click', () => {
          extraImageFiles.splice(index, 1);
          renderExtraImagePreviews();
        });

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        previewsContainer.appendChild(wrapper);
      };

      reader.readAsDataURL(file);
    });
  }

  // Get the categories tied to this merchant
  let categories = await get_categories();

  // Add Item Button
  let addItemButton = document.getElementById('add-item-button');
  addItemButton.addEventListener('click', function () {
    window.location.href = '/add-item/';
  });

  // Listen for row clicks to open product details
  const inventoryTable = document.getElementById('inventory-table');
  inventoryTable.addEventListener('click', function (e) {
    const row = e.target.closest('tr.inventory-row');
    if (row) {
      const item = JSON.parse(row.dataset.item);
      showProductDetails(item);
    }
  });

  // Modal close handlers (add once)
  const closeModalButton = document.querySelector('#product-details-modal .close-modal-btn');
  closeModalButton.addEventListener('click', function () {
    const detailsModal = document.getElementById('product-details-modal');
    hideModal(detailsModal);
    document.querySelector('.dashboard-sections').classList.remove('compressed');
    clearActiveRows();
  });

  // Edit button handler (add once)
  document.getElementById('edit-button').addEventListener('click', function () {
    handle_edit_modal(currentProduct, categories);
  });

  // Edit form submit handler (add once)
  document.querySelector('#product-edit-modal form').addEventListener('submit', function (e) {
    handle_product_edit(e, currentProduct, categories, extraImageFiles);
  });

  // Delete button handler (add once)
  document.getElementById('delete-button').addEventListener('click', function () {
    if (!currentProduct) return;
    document.querySelector('#confirm-delete-modal').style.display = 'flex';
  });

  // Delete confirmation handlers (add once)
  document.getElementById('cancel-delete-button').addEventListener('click', function () {
    document.querySelector('#confirm-delete-modal').style.display = 'none';
  });

  document.getElementById('confirm-delete-button').addEventListener('click', async function () {
    if (!currentProduct) return;

      fetch(`${API_BASE_URL}/product/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({id: currentProduct.id})
      })
      .then(response => {
        if (!response.ok) {
          console.error(`HTTP Error: ${response.status}`);
          return response.text();
        }
      })
      .then(text => {
        showToast(text);
        window.location.reload();
      })
      .catch(error => {
        console.error(error);
      })
    }
  )

  setupCategoryList(categories, API_BASE_URL);

  // Function to show product details in modal
  function showProductDetails(product) {
    currentProduct = product; // Set the current product

    const detailsModal = document.getElementById('product-details-modal');
    showModal(detailsModal);

    // Populate modal with product data
    document.querySelector('#product-details img').src = product.image;
    document.getElementById('product-title').innerHTML = product.name;
    document.getElementById('product-price').innerHTML = product.price;
    if (product.quantity == '0') {
      document.getElementById('product-stock').innerHTML = "<span style='color: #FF6E6E'>Out of Stock</span>";
    } else {
      document.getElementById('product-stock').innerHTML = product.quantity;
    }
    document.getElementById('product-description').innerHTML = product.description;

    categories.forEach(category => {
      if (category.id === product.category_id) {
        document.getElementById('product-category').innerHTML = category.name;
      }
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products/`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to fetch inventory products.');

    const data = await response.json();
    const products = data.products;
    searchAndFilter(searchInput, products);

    searchInput.addEventListener('input', function () {
      searchAndFilter(searchInput, products);
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
  }
});

function setupCategoryList(categories, API_BASE_URL) {
  const category_table = document.getElementById('categories-table');

  // render the categories
  categories.forEach(category => {
    const category_row = CreateCategoryRow(category);

    // Create a listener for category delete
    category_row.querySelector('.delete-category-button').addEventListener('click', function () {
      DeleteCategory(category, category_row);
    });

    // Append the actual element
    category_table.querySelector('tbody').appendChild(category_row);
  });


  // Add event listener for creating a new category
  document.getElementById('add-category-btn').addEventListener('click', function () {
    CreateCategory();
  });
}

// Get the merchant's categories
async function get_categories() {
  return await fetch(`${API_BASE_URL}/categories/`, {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) throw new Error("Could not get categories");
      return response.json();
    })
    .then(data => {
      return data.categories;
    });
}

// Function to clear active row styling
function clearActiveRows() {
  const rows = document.querySelectorAll('#inventory-table tr');
  rows.forEach(r => {
    r.classList.remove('active');
    r.classList.remove('gradient-background');
  });
}

// Handle edit modal
function handle_edit_modal(currentProduct, categories) {
  // First, listen for close-modal button to be pressed
  const close_button = document.querySelector('#edit-details .close-modal-btn');
  close_button.addEventListener('click', function () {
    hideModal(document.getElementById('product-edit-modal'));
  });

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
  const selector = document.getElementById('edit-category');

  // Clear existing options (if needed)
  selector.innerHTML = '';

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;

    if (currentProduct.category_id === category.id) {
      option.selected = true;
    }

    selector.appendChild(option);
  });
}

// Handle when the edit form is submitted
function handle_product_edit(e, currentProduct, categories, extraImageFiles) {
  e.preventDefault();
  if (!currentProduct) return;

  const form = e.target;
  const formData = new FormData();

  formData.append('id', currentProduct.id);
  formData.append('name', form.querySelector('#edit-title').value);
  formData.append('price', form.querySelector('#edit-price').value);
  formData.append('description', form.querySelector('#edit-description').value);
  formData.append('quantity', form.querySelector('#edit-stock').value);

  const mainImageFile = form.querySelector('#edit-image').files[0];
  if (mainImageFile) {
    formData.append('image', mainImageFile);
  }

  // Append extra images
  extraImageFiles.forEach(file => {
    formData.append('extra_images', file);
  });

  const edit_category = form.querySelector('#edit-category').value;
  categories.forEach(category => {
    if (category.id == edit_category) {
      formData.append('category', category.id);
    }
  });

  formData.append('_method', 'PATCH');

  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  fetch(`${API_BASE_URL}/product/`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: {
      'X-CSRFToken': csrftoken
    }
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
}

function CreateCategoryRow(category) {
  let category_row = document.createElement('tr');
  category_row.className = "category-record";
  category_row.innerHTML = `
    <td style="display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
      ${category.name}
      <div>
        <button class="edit-category-button" style="color: var(--edit-color); border: none; background-color: #00000000">Edit</button>
        <button class="delete-category-button" style="color: var(--error-color); border: none; background-color: #00000000;">Delete</button>
      </div>
    </td>`;

  return category_row;
}

function CreateCategory() {
  const categoryInput = document.getElementById('new-category-input');

  if (categoryInput.value) {
    fetch(`${API_BASE_URL}/category/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({ name: categoryInput.value })
    })
      .then(response => {
        if (!response.ok) throw new Error("Could not create a category");
        return response.json();
      })
      .then(() => {
        window.location.reload();
      })
      .catch(error => {
        console.error(error);
      });
  }
}

function DeleteCategory(category, category_row) {
  // Ask for confirmation
  const confirmed = window.confirm(`Are you sure you want to permanently delete the category "${category.name}"?`);
  
  if (!confirmed) {
    return; // stop here if user canceled
  }

  // Proceed with API call
  fetch(`${API_BASE_URL}/category/${category.id}/`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'X-CSRFToken': csrftoken
    }
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not delete category!");
    return response.json();
  })
  .then(data => {
    console.log(data);
    category_row.remove(); // remove from DOM on success
  })
  .catch(err => {
    console.error(err);
    alert("Something went wrong while deleting the category.");
  });
}
