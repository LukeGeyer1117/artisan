const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', async function () {
  const data = await get_shop_settings();
  console.log(data);
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
    console.log(data.shop_settings);
    populate_fields_initial(data.shop_settings);
  })
}

function populate_fields_initial(shop_settings) {
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
  document.getElementById('shipping-policy').value = shop_settings.shipping_policy;
  document.getElementById('return-policy').value = shop_settings.return_policy;
}