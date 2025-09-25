const slug = document.body.dataset.slug;


document.addEventListener('DOMContentLoaded', async function () {
  const merchant_data = await get_merchant_information();

  // Fill in the data from the merchant_data
  document.getElementById('footer-email').innerHTML += merchant_data.contact_email;
})

async function get_merchant_information() {
  try {
    const response = await fetch(`${API_BASE_URL}/artisan/${slug}/`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Merchant information retrieved:', data);
    return data.artisan;
    
  } catch (error) {
    console.error('Error fetching merchant information:', error);
    throw error; // Re-throw so calling code can handle it
  }
}