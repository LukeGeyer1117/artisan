const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

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
      color: ${theme.text_color};
      background-color: ${theme.background_color};
    }

    a {
      color: ${theme.text_color};
    }

    a:hover {
      color: ${theme.link_hover_color};
    }

    .add-to-cart-button {
      color: ${theme.text_color};
      background-color: ${theme.accent_color};
    }

    .checkout-btn:hover {
      background-color: ${theme.accent_color};
    }

    .edit-btn:hover, .remove-btn:hover {
      background-color: ${theme.accent_color};
    }

    svg {
      fill: ${theme.text_color}
    }
  `;
  document.head.appendChild(globalStyle);
}
