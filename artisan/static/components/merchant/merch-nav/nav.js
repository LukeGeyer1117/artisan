import { get_merchant_information, signOut } from "../../../merchant/scripts/common.js";
import { getCookie } from "../../../merchant/scripts/csrf.js";

const csrf = getCookie("csrftoken");

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
  const merchant_information = await get_merchant_information();

  const avatarContainer = document.getElementById('navbar-pfp-container');
  // Get the stored theme from localstorage, if one exists, and apply that theme to the page
  const documentEl = document.documentElement;
  const themes = document.getElementById('themes-dropdown-list').querySelectorAll('li input');

  // See if we have a stored theme matching one of the themes in the list.
  const saved_theme = localStorage.getItem('theme');
  if (saved_theme) {
    themes.forEach(theme => {
      if (saved_theme === theme.value) {
        theme.checked = true;
      }
    })
  }

  themes.forEach(theme => {
    theme.addEventListener('click', function () {
      documentEl.setAttribute('data-theme', theme.value);
      localStorage.setItem('theme', theme.value);

      if (window.location.pathname == "/dashboard/") {
        window.location.reload();
      }
    })
  })

  // Use merchant information to fill navbar fields

  document.getElementById('merchant-identifier-shop-name').innerHTML = merchant_information.shop_name;

  if (merchant_information.image) {
    avatarContainer.innerHTML = `<img src="/media/${merchant_information.image}" alt="${merchant_information.full_name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
  } else {
    const fullName = merchant_information.full_name;
    const initials = fullName ? fullName.split(' ').map(n => n[0]).join('') : 'FN';
    avatarContainers.forEach(avatarContainer => {
      avatarContainer.innerHTML = `<span id="profile-initials">${initials}</span>`;
    }) 
  }

  // Handle clicking the Sign out Button
  const signOutBtn = document.getElementById('account-modal-sign-out-link-div');
  signOutBtn.addEventListener('click', (event) => {
    signOut(csrf);
  })
})