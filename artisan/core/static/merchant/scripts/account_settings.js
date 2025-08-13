const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', async function () {
  try {
    // Await the result of get_merchant_information
    const merchant_information = await get_merchant_information();

    // Now merchant_information is the resolved data
    document.getElementById('merchant-name').innerHTML = merchant_information.full_name;
    document.getElementById('merchant-email').innerHTML = merchant_information.email;
    document.getElementById('merchant-username').innerHTML = merchant_information.username;
    document.getElementById('merchant-phone').innerHTML = merchant_information.phone_number;
  } catch (error) {
    console.error('Error setting merchant information:', error);
  }
});

async function get_merchant_information() {
  return await fetch(`${API_BASE_URL}/artisan/`, {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) throw new Error('Could not get merchant info');
      return response.json();
    })
    .then(data => {
      console.log(data);
      return data.artisan;
    });
}