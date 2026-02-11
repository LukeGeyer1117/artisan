
let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

const slug = window.slug;

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
  // globalStyle.innerHTML = `
  //   * {
  //   }

  //   a {
  //     color: var(--text-color);
  //   }

  //   a:hover {
  //     color: var(--link-hover-color);
  //   }

  //   .action-button {
  //     background-color: var(--accent-color);
  //   }

  //   .add-to-cart-button {
  //     color: var(--text-color);
  //     background-color: var(--accent-color);
  //   }

  //   .checkout-btn:hover {
  //     background-color: var(--accent-color);
  //   }

  //   .edit-btn:hover, .remove-btn:hover {
  //     background-color: var(--accent-color);
  //   }

  //   svg {
  //     fill: var(--text-color);
  //     transition: all .15s ease-in-out;
  //   }

  //   svg:hover {
  //     fill: var(--accent-color);
  //   }

  //   .nav-links.show.menu-item-1 {
  //     background-color: var(--background-color);
  //   }
  // `;
  // document.head.appendChild(globalStyle);
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

/**
 * Displays a DaisyUI toast notification.
 * @param {string} message - The text to display
 * @param {string} type - 'success', 'error', 'info', or 'warning'
 * @param {number} duration - Time in ms before removal (default 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast');
    
    // 1. Create the alert element
    const alert = document.createElement('div');
    
    // 2. Add DaisyUI classes
    // Base class: 'alert'
    // Type class: 'alert-success', 'alert-error', etc.
    alert.className = `alert alert-${type} shadow-lg mb-2 transition-all duration-500 opacity-0 translate-x-full`;
    
    // 3. Add inner content (icon + message)
    // You can customize icons here based on type if you want
    alert.innerHTML = `
        <span>${message}</span>
    `;

    // 4. Append to container
    container.appendChild(alert);

    // 5. Trigger animation in (small delay to allow DOM to render for transition)
    requestAnimationFrame(() => {
        alert.classList.remove('opacity-0', 'translate-x-full');
    });

    // 6. Remove after duration
    setTimeout(() => {
        // Fade out
        alert.classList.add('opacity-0', 'translate-x-full');
        
        // Remove from DOM after transition finishes (500ms matches Tailwind duration-500)
        setTimeout(() => {
            alert.remove();
        }, 500);
    }, duration);
}

async function getCategories(slug) {
  let categories;

  try {
    const response = await fetch(`${API_BASE_URL}/categories/${slug}/`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Could not get categories");
    }

    const data = await response.json();
    return data.categories;
  } catch (error) {
    console.error(error);
  }
}

function createProductCard(product, category_name) {
  const productCard = document.createElement('div');
  productCard.classList = "shop-item card bg-base-100 shadow-sm hover:shadow-md transition cursor-pointer w-72 flex-shrink-0";
  productCard.innerHTML = `
    <figure class="px-4 pt-4">
      <img
        src="/media/${product.image}"
        alt="${product.name}"
        class="rounded-lg h-48 w-full object-cover"
      />
    </figure>
    <div class="card-body p-4 gap-2">
      <div class="hidden prod-id">${product.id}</div>
      <h3 class="cart-title text-base">${product.name}</h3>
      <div class="flex flex-row w-full justify-between items-center">
        <p class="text-lg font-semibold">${product.price}</p>
        <div class="badge">${category_name}</div>
      </div>
    </div>
  `

  return productCard;
}

async function getFeaturedProducts(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${slug}/featured/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error("Could not get featured products.");
    }

    const data = await response.json();
    return data;
  } catch (error) {}
}

async function getMerchantInformation(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/artisan/${slug}/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error("Couldn't get merchant information.");
    }

    const data = await response.json();
    return data.artisan;
  } catch (error) {
    console.error("Error fetching merchant information:", error);
    throw error;
  }
}

async function getLogoImage(slug) {
  const response = await fetch(`${API_BASE_URL}/logo/${slug}/`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error("Couldn't get logo image.");

  const data = await response.json();
  return data.image_url;
}

export {showToast, GetProduct, GetProductImages, getCategories, createProductCard, getFeaturedProducts, getMerchantInformation, getLogoImage};