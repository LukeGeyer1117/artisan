
let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

// Assuming `slug` is already defined somewhere in your script
document.addEventListener('DOMContentLoaded', async function () {
  try {
    loadTheme(slug);
  } catch (error) {
    console.error('Theme load error:', error);
  }
});

async function loadTheme(slug) {
  const cacheKey = `theme_${slug}`;
  const cached = localStorage.getItem(cacheKey);

  // Apply the saved theme if it exists and ttl has not expired
  if (cached) {
    const { theme, deathDate } = JSON.parse(cached);
    const isExpired = (deathDate - Date.now()) < 0;

    if (!isExpired) {
      applyGlobalTheme(theme);
      console.log(`Applied stored theme`);
      return;
    }
  }

  // Fetch the theme here if the saved one doesn't exist or is expired.
  const response = await fetch(`${API_BASE_URL}/theme/${slug}/`, {
    method: 'GET'
  });
  const data = await response.json();
  const theme = data.theme;
  localStorage.setItem(cacheKey, JSON.stringify({
    theme,
    deathDate: Date.now() + theme.ttl,
  }));
  applyGlobalTheme(theme);
  console.log(`Applied fetched theme`);
}

function applyGlobalTheme(theme) {
  const rootStyle = document.documentElement.style;

  // Option 1: Use inline styles via JS variables
  rootStyle.setProperty('--text-color', theme.text_color);
  rootStyle.setProperty('--background-color', theme.background_color);
  rootStyle.setProperty('--accent-color', theme.accent_color);
  rootStyle.setProperty('--link-hover-color', theme.link_hover_color);

  // Option 2: Apply * selector styles directly
  const globalStyle = document.createElement('style');
  globalStyle.innerHTML = `
    * {
      color: var(--text-color);
      background-color: var(--background-color);
    }

    a {
      color: var(--text-color);
    }

    a:hover {
      color: var(--link-hover-color);
    }

    .action-button {
      background-color: var(--accent-color);
    }

    .add-to-cart-button {
      color: var(--text-color);
      background-color: var(--accent-color);
    }

    .checkout-btn:hover {
      background-color: var(--accent-color);
    }

    .edit-btn:hover, .remove-btn:hover {
      background-color: var(--accent-color);
    }

    svg {
      fill: var(--text-color);
      transition: all .15s ease-in-out;
    }

    svg:hover {
      fill: var(--accent-color);
    }

    .nav-links.show.menu-item-1 {
      background-color: var(--background-color);
    }
  `;
  document.head.appendChild(globalStyle);
}

async function GetShopSettingsSlug() {
  try {
    const response = await fetch(`${API_BASE_URL}/shop-settings/${slug}/`, {
      method: 'GET',
    });

    if (!response.ok) throw new Error("Could not get shop settings");

    const data = await response.json();
    const shop_settings = data.shop_settings;

    return shop_settings;

  } catch (error) {
    console.error(`Error while getting shop settings: ${error}`);
  }
}

async function GetProduct(item_id) {
  const response = await fetch(`${API_BASE_URL}/product/${String(item_id)}/`, {
    method: 'GET'
  });

  if (!response.ok) throw new Error("Couldn't get product");

  const data = await response.json();
  console.log(data);
  return data.product;
}

async function GetProductImages(item_id) {
  const response = await fetch(`${API_BASE_URL}/product/images/${item_id}/`, {
    method: 'GET'
  });

  if (!response.ok) throw new Error("Couldn't get product images.");

  const data = await response.json();
  return data.product_images;
}