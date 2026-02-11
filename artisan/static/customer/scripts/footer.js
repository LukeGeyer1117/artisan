import { getMerchantInformation, getLogoImage } from "./common.js";

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

const slug = document.body.dataset.slug;

document.addEventListener('DOMContentLoaded', async function () {
  const merchant_data = await getMerchantInformation(slug);

  console.log(merchant_data);

  if (!merchant_data.facebook_link && !merchant_data.youtube_link && !merchant_data.instagram_link) {
    document.getElementById('social-links-nav').classList.add('hidden');
  }

  // Add the merchant's shop name to the footer
  const merchantName = document.getElementById('footer-merchant-name');
  merchantName.innerHTML = merchant_data.shop_name;

  // Add all social media links (if they exist) to the footer
  // FB
  const facebookLink = document.getElementById('facebook-link');
  if (merchant_data.facebook_link) {
    facebookLink.href = merchant_data.facebook_link;
  } else {facebookLink.classList.add('hidden');}
  // YT
  const youtubeLink = document.getElementById('youtube-link');
  if (merchant_data.youtube_link) {
    youtubeLink.href = merchant_data.youtube_link;
  } else {youtubeLink.classList.add('hidden');}
  // INSTAGRAM
  const instagramLink = document.getElementById('instagram-link');
  if (merchant_data.instagram_link) {
    instagramLink.href = merchant_data.instagram_link;
  } else {instagramLink.classList.add('hidden');}

  // Add the merchant's logo image to the footer
  const image_url = await getLogoImage(slug);
  document.getElementById('footer-logo-image').src = image_url;
})