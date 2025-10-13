import { get_merchant_information } from "../../../merchant/scripts/common.js";

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
  const merchant_information = await get_merchant_information();
  console.log(merchant_information);

  const avatarContainers = document.querySelectorAll('.navbar-pfp-container');

  if (merchant_information.image) {
    avatarContainers.forEach(avatarContainer => {
      avatarContainer.innerHTML = `<img src="/media/${merchant_information.image}" alt="${merchant_information.full_name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    })
  } else {
    const fullName = merchant_information.full_name;
    const initials = fullName ? fullName.split(' ').map(n => n[0]).join('') : 'FN';
    avatarContainers.forEach(avatarContainer => {
      avatarContainer.innerHTML = `<span id="profile-initials">${initials}</span>`;
    }) 
  }

  // Set the full name and email in the merchant account-modal
  document.querySelector('.account-user-name').innerHTML = merchant_information.full_name;
  document.querySelector('.account-user-email').innerHTML = merchant_information.email;

  const accountDiv = document.querySelector('.account-div');
  accountDiv.addEventListener('click', function () {
    const accountModal = document.querySelector('.account-modal');
    accountModal.style.display = 'flex';
    accountModal.querySelector('.close-modal-button').addEventListener('click', function () {
      accountModal.style.display = 'none';
    })
    accountModal.querySelector('.navbar-pfp-container').addEventListener('click', function () {
      accountModal.style.display = 'none';
    })
  })

  // Handle clicking the Sign out Button
  const signOutBtn = document.getElementById('account-modal-sign-out-link-div');
  signOutBtn.addEventListener('click', (event) => {
    console.log('click!');
    fetch(`${API_BASE_URL}/session/`, {
      method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to clear session data.');
        return response.json();
    })
    .then(result => {
        window.location.href = "/login/"
      })
  })
})