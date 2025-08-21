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
    console.log(data);
    return data;
  })
}