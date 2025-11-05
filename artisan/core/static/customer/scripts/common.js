
let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

// Assuming `slug` is already defined somewhere in your script
document.addEventListener('DOMContentLoaded', async function () {
  try {
    const response = await fetch(`${API_BASE_URL}/theme/${slug}/`, {
      method: 'GET'
    });
    
    if (!response.ok) throw new Error("Could not get theme");
    
    const data = await response.json();
    const theme = data.theme;

    // Apply theme to global styles
    applyGlobalTheme(theme);
  } catch (error) {
    console.error('Theme load error:', error);
  }
});

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

    .nav-links.show.menu-item-1.open {
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
