let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

const slug = document.body.dataset.slug;

document.addEventListener('DOMContentLoaded', async function () {
  const merchant_data = await get_merchant_information();

  if (!merchant_data.facebook_link && !merchant_data.youtube_link && !merchant_data.instagram_link) {
    document.getElementById('social-links-nav').classList.add('hidden');
  }

  // Fill in the data from the merchant_data
  const facebookLink = document.getElementById('facebook-link');
  if (merchant_data.facebook_link) {
    facebookLink.href = merchant_data.facebook_link;
  } else {facebookLink.classList.add('hidden');}

  // Fill in the data from the merchant_data
  const youtubeLink = document.getElementById('youtube-link');
  if (merchant_data.youtube_link) {
    youtubeLink.href = merchant_data.youtube_link;
  } else {youtubeLink.classList.add('hidden');}

  // Fill in the data from the merchant_data
  const instagramLink = document.getElementById('instagram-link');
  if (merchant_data.instagram_link) {
    instagramLink.href = merchant_data.instagram_link;
  } else {instagramLink.classList.add('hidden');}
  
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
    console.log(data);
    return data.artisan;
    
  } catch (error) {
    console.error('Error fetching merchant information:', error);
    throw error; // Re-throw so calling code can handle it
  }
}