const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', async function () {

  let addItemButton = document.getElementById('add-item-button');
  addItemButton.addEventListener('click', function () {
    window.location.href = '/add-item/';
  })

  // Get all the Inventory items the merchant has created.

  const inventoryTableBody = document.querySelector('#inventory-table tbody');
  fetch(`${API_BASE_URL}/inventory/`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error('Failed to fetch inventory products.')
    return response.json();
  })
  .then(data => {
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
        productStock.innerHTML ="<span style='color: #FF6E6E'>Out of Stock</span>";
      } else {
        productStock.append(product.quantity);
      }
      productRow.appendChild(productStock);

      // Product Actions
      const productActions = document.createElement('td');
      productActions.className = 'product-actions';
      const splitDiv = document.createElement('div');
      // const detailsIcon = document.createElement('img');
      // detailsIcon.className = 'action-btn';
      // detailsIcon.title = 'See details'
      // detailsIcon.src = '/media/icons/active/eye_purple.svg';
      // splitDiv.appendChild(detailsIcon);
      const editIcon = document.createElement('img');
      editIcon.className = 'action-btn';
      editIcon.src = '/media/icons/active/ink_pen_purple.svg';
      splitDiv.appendChild(editIcon);
      const trashIcon = document.createElement('img');
      trashIcon.className = 'action-btn';
      trashIcon.src = '/media/icons/active/trash_can_purple.svg';
      splitDiv.appendChild(trashIcon);
      productActions.appendChild(splitDiv);
      productRow.appendChild(productActions);

      inventoryTableBody.appendChild(productRow);

      productRow.addEventListener('click', function () {
        const rows = document.querySelectorAll('#inventory-table tr');
        // Remove the classes from all rows
        rows.forEach(r => {
          r.classList.remove('active');
          r.classList.remove('gradient-background');
        })
        // Readd it to this row
        productRow.classList.add('active');
        productRow.classList.add('gradient-background');

        const detailsModal = document.getElementById('product-details-modal');
        showModal(detailsModal);
        document.querySelector('.dashboard-sections').classList.add('compressed');

        document.querySelector('#product-details img').src = '/media/' + product.image;
        document.getElementById('product-title').innerHTML = product.name;
        document.getElementById('product-price').innerHTML = product.price;
        if (product.quantity == '0') {
            document.getElementById('product-stock').innerHTML = "<span style='color: #FF6E6E'>Out of Stock</span>";
        } else {
            document.getElementById('product-stock').innerHTML = product.quantity;
        }
        document.getElementById('product-description').innerHTML = product.description;

        detailsModal.querySelector("#product-details #close-modal-btn").addEventListener('click', function () {
          hideModal(detailsModal);
          document.querySelector('.dashboard-sections').classList.remove('compressed');
          rows.forEach(r => {r.classList.remove('active');r.classList.remove('gradient-background');})
        });

        document.getElementById('delete-button').addEventListener('click', function () {
          document.querySelector('.modal').style.display = 'flex';

          document.getElementById('cancel-delete-button').addEventListener('click', function() {
            document.querySelector('.modal').style.display = 'none';
          })

          document.getElementById('confirm-delete-button').addEventListener('click', function() {
            fetch(`${API_BASE_URL}/product/?id=`+product.id, {
              method: 'DELETE',
              credentials: 'include'
            })
            .then(response => {
              if (!response.ok) throw new Error("Failed to delete product");
              return response.json();
            })
            .then(result => {
              alert("Product deleted!");
              window.location.reload();
            })
            .catch(error => {
              console.error(error);
              alert("Failed to delete product");
            });
          })

        })
      })
    });
  })
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