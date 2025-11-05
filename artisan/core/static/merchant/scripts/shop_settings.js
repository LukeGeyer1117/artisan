import { getCookie } from "./csrf.js";

const csrftoken = getCookie('csrftoken');
let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
  // Get the data and populate the fields
  const data_settings = await get_shop_settings();
  const data_policies = await get_policies();

  const shop_settings = data_settings.shop_settings;
  const policies = data_policies.policies;

  populate_fields_initial(shop_settings, policies, data_settings.slug);

  // Detect changes
  let changed = false;
  const setting_inputs = document.querySelectorAll('.shop-setting-input');
  setting_inputs.forEach(input => {
    input.addEventListener('change', function () {
      changed = true;
    })
  })

  // Now, if there was a change, submit the shop settings changes
  const save_shop_changes_btn = document.getElementById('submit-shop-changes');
  save_shop_changes_btn.addEventListener('click', function () {
    if (!changed) {alert("No changes detected!");return;}

    save_shop_changes();
  })
})

async function get_shop_settings() {
  return await fetch(`${API_BASE_URL}/shop-settings/`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get shop settings");
    return response.json();
  })
  .then(data => {
    return data;
  })
}

async function get_policies() {
  return await fetch(`${API_BASE_URL}/policy/`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get policies");
    return response.json();
  })
  .then(data => {
    return data;
  })
  
}

async function save_shop_changes() {
  const shop_name = document.getElementById('shop-name').value;
  const shop_description = document.getElementById('shop-description').value;
  const accepting_custom_orders = document.getElementById('accepting-custom-orders').checked;
  const maximum_active_orders = document.getElementById('max-active-orders').value;
  const standard_processing_days = document.getElementById('processing-time').value;
  const shop_location = document.getElementById('shop-location').value;
  const currency = document.getElementById('currency').value;
  const shop_status = document.getElementById('shop-status').value;
  const status_message = document.getElementById('vacation-message').value;
  const minimum_order_amount = document.getElementById('minimum-order').value;
  const terms_and_conditions = document.getElementById('terms-and-conditions').value;
  const shipping_policy = document.getElementById('shipping-policy').value;
  const return_policy = document.getElementById('return-policy').value;

  // Create a JavaScript object with the data
  const shopData = {
    shopName: shop_name,
    shopDescription: shop_description,
    acceptingCustomOrders: accepting_custom_orders,
    maximumActiveOrders: maximum_active_orders,
    standardProcessingDays: standard_processing_days,
    shopLocation: shop_location,
    currency: currency,
    shopStatus: shop_status,
    statusMessage: status_message,
    minimumOrderAmount: minimum_order_amount,
    termsAndConditions: terms_and_conditions,
    shippingPolicy: shipping_policy,
    returnPolicy: return_policy
  };

  fetch(`${API_BASE_URL}/shop-settings/edit/global/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken
    },
    body: JSON.stringify(shopData) // Corrected line
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Couldn't update shop settings");
    }
    return response.json();
  })
  .then(data => {
    console.log(data);
    window.location.reload();
  })
  .catch(error => {
    console.error('Error:', error);
    // You could display an error message to the user here.
  });
}

function populate_fields_initial(shop_settings, policies, slug) {
  document.getElementById('shop-name').value = shop_settings.shop_name;
  document.getElementById('shop-description').value = shop_settings.shop_description;
  document.getElementById('accepting-custom-orders').checked = shop_settings.accepting_custom_orders;
  document.getElementById('max-active-orders').value = shop_settings.maximum_active_orders;
  document.getElementById('processing-time').value = shop_settings.standard_processing_days;
  document.getElementById('shop-location').value = shop_settings.shop_location;
  document.getElementById('currency').value = shop_settings.currency.toUpperCase();
  document.getElementById('shop-status').value = shop_settings.shop_status;
  document.getElementById('vacation-message').value = shop_settings.status_message;
  document.getElementById('minimum-order').value = shop_settings.minimum_order_amount;
  document.getElementById('terms-and-conditions').value = policies.terms_and_conditions;
  document.getElementById('shipping-policy').value = policies.shipping_policy;
  document.getElementById('return-policy').value = policies.return_policy;

  // Build the base URL depending on environment
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const BASE_URL = `${window.location.protocol}//${window.location.hostname}${isLocal ? ':8000' : ''}/home/`;

  // Update the shop URL element
  const shopUrl = document.getElementById('shop-url');
  const fullUrl = `${BASE_URL}${slug}`;

  shopUrl.textContent = fullUrl;
  shopUrl.href = fullUrl;
  shopUrl.target = '_blank';  
}