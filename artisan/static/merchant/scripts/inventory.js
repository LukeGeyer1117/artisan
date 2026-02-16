import { getCookie } from "./csrf.js";
import { showToast } from "./common.js";

const csrftoken = getCookie('csrftoken');
import { searchAndFilter, showModal, hideModal } from "./common.js";

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
  const searchInput = document.getElementById('search-input');
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
  let categories = await getCategories();
  const categoriesSelect = document.getElementById('product-drawer-category');

  categories.forEach(category => {
    categoriesSelect.innerHTML += `
      <option value='${category.id}'>${category.name}</option>
    `
  })

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
  
  inventoryTable.addEventListener('mouseover', (e) => {
    const row = e.target.closest("tr.inventory-row");
    if (!row) return;

    row.querySelectorAll('td').forEach(td => {
      td.classList.add('bg-base-300');
    })
  });

  inventoryTable.addEventListener('mouseout', (e) => {
    const row = e.target.closest("tr.inventory-row");
    if (!row) return;

    row.querySelectorAll('td').forEach(td => {
      td.classList.remove('bg-base-300');
    })
  });

  setupCategoryList(categories, API_BASE_URL);

  // Function to show product details in modal
  function showProductDetails(product) {
    currentProduct = product; // Set the current product
    const drawerToggle = document.getElementById('product-details-drawer');
    drawerToggle.checked = true;

    // Populate modal with product data;
    document.getElementById('product-drawer-image').src = product.image;
    document.getElementById('product-drawer-name').value = product.name;
    document.getElementById('product-drawer-price').value = product.price;

    const productTrackStock = document.getElementById('product-track-stock');
    const productDrawerStock = document.getElementById('product-drawer-stock');
    productTrackStock.checked = product.track_stock;
    productDrawerStock.value = parseInt(product.quantity);

    document.getElementById('product-drawer-description').textContent = product.description;
    document.getElementById('product-drawer-category').value = product.category;
    document.getElementById('product-drawer-featured').checked = product.is_featured;

    // disable stock input if stock isn't being tracke
    if (!productTrackStock.checked) {
      productDrawerStock.disabled = true;
    }

    productTrackStock.addEventListener('input', function () {
      if (productTrackStock.checked) {productDrawerStock.disabled = false;} else {productDrawerStock.disabled = true;}
    })

    // Listen for a new product image to be updated.
    const productImageInput = document.getElementById('product-drawer-image-input');

    productImageInput.value = '';
    productImageInput.addEventListener('change', function () {
      const file = productImageInput.files[0];

      if (!file) return;

      document.getElementById('product-drawer-image').src = URL.createObjectURL(file);

    })

    // Edit form submit handler (add once)
    const savebutton = document.getElementById('product-save-button');
    savebutton.addEventListener('click', function () {
      savebutton.disabled = 'disabled';
      handleProductEdit(currentProduct);
    });

    // Listen for product delete button to be pressed
    const deleteButton = document.getElementById('product-delete-button');
    deleteButton.addEventListener('click', function () {
      handleProductDelete(currentProduct);
    })
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
  const category_list = document.getElementById('category-list');

  // render the categories
  categories.forEach(category => {
    const category_row = CreateCategoryRow(category);

    // Create a listener for category delete
    category_row.querySelector('.delete-category-btn').addEventListener('click', function () {
      deleteCategory(category, category_row);
    });

    // Append the actual element
    category_list.appendChild(category_row);
  });


  // Add event listener for creating a new category
  document.getElementById('add-category-btn').addEventListener('click', function () {
    CreateCategory();
  });
}

// Get the merchant's categories
async function getCategories() {
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

// Handle edit modal
function handleEditModal(currentProduct, categories) {
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
  document.getElementById('edit-featured').checked = !!currentProduct.is_featured;
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

function handleProductEdit(currentProduct) {
  console.log(currentProduct);
  if (!currentProduct) return;
  const formData = new FormData();

  formData.set('name', document.getElementById('product-drawer-name').value);
  formData.set('price', document.getElementById('product-drawer-price').value);
  formData.set('description', document.getElementById('product-drawer-description').value);
  formData.set('track_stock', document.getElementById('product-track-stock').checked);
  formData.set('quantity', document.getElementById('product-drawer-stock').value);
  formData.set('category', document.getElementById('product-drawer-category').value);

  // Add/override fields
  formData.set('id', currentProduct.id);
  formData.set('_method', 'PATCH');

  // Ensure checkbox is always sent
  const featured = document.getElementById('product-drawer-featured').checked;
  formData.set('is_featured', featured ? 'true' : 'false');

  // Optional: override main image
  const mainImageFile =
    document.getElementById('product-drawer-image-input').files[0];
  if (mainImageFile) {
    formData.set('image', mainImageFile);
  }

  // Debug
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
    .then(res => {
      if (!res.ok) throw new Error('Failed to Patch Product');
      return res.json();
    })
    .then(() => window.location.reload())
    .catch(console.error);
}

function CreateCategoryRow(category) {
  let category_row = document.createElement('tr');
  category_row.className = "category-record";
  category_row.innerHTML = `
    <li class="list-row w-full flex flex-row justify-between items-center p-0 pl-4">
      <span class="h-fit w-fit text-sm">${category.name}</span>
      <button class="delete-category-btn btn btn-square btn-ghost">
        <svg class="fill-current text-error" xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="24px"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
      </button>
    </li>
    `
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

function deleteCategory(category, category_row) {
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

async function handleProductDelete(currentProduct) {
  const confirmed = await confirmDelete(currentProduct);
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE_URL}/product`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({ id: currentProduct.id })
    });

    if (!response.ok) throw new Error("Couldn't delete product");

    const text = await response.text();
    showToast(text, "success");
    window.location.reload();
  } catch (err) {
    console.error(err);
  }
}


function confirmDelete(currentProduct) {
  return new Promise((resolve) => {
    const modal = document.getElementById('deleteModal');
    const confirmBtn = modal.querySelector('.btn-error');
    const cancelBtn = modal.querySelector('.btn:not(.btn-error)');

    modal.showModal();

    confirmBtn.onclick = () => {
      modal.close();
      resolve(true);
    };

    cancelBtn.onclick = () => {
      modal.close();
      resolve(false);
    };
  });
}
