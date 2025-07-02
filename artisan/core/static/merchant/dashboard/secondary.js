let products = []
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;
let artisan;

document.addEventListener('DOMContentLoaded', async function () {
  // Get the Artisan information at page load
  await fetch(`${API_BASE_URL}/artisan`, {
      method: 'GET',
      credentials: 'include',
  })
  .then(response => {
      if (!response.ok) throw new Error("Could Not Get Artisan Info!");
      return response.json();
  })
  .then(data => {
      artisan = data.artisan;
      console.log(artisan)
  })

  // Handle Signout button click
  const signOutBtn = document.querySelector('.navbar a');
  signOutBtn.addEventListener('click', (event) => {
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

  // Get all orders assigned to an artisan
  
})