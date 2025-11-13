import { getCookie } from "./csrf.js";
import { showToast } from "./common.js";

const csrftoken = getCookie('csrftoken');
let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
  // Track if a settings change is made
  let changed = false;
  let changedLogo = false;
  let changedHero = false;
  // Get the theme for this merchant
  await fetch(`${API_BASE_URL}/theme/`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get theme!");
    return response.json();
  })
  .then(data => {
    // set the theme values
    let textColorSelect = document.getElementById('textColor');
    let textColor2Select = document.getElementById('textSecondaryColor');
    let backgroundColorSelect = document.getElementById('backgroundColor');
    let accentColorSelect = document.getElementById('accentColor');
    let linkHoverColorSelect = document.getElementById('linkHoverColor');

    const theme = data.theme;
    textColorSelect.value = theme.text_color;
    textColor2Select.value = theme.text_color_secondary;
    backgroundColorSelect.value = theme.background_color;
    accentColorSelect.value = theme.accent_color;
    linkHoverColorSelect.value = theme.link_hover_color;

    const colorSelectors = [textColorSelect, textColor2Select, backgroundColorSelect, accentColorSelect, linkHoverColorSelect];
    colorSelectors.forEach(selector => {
      selector.addEventListener('input', function () {
        changed = true;
      })
    })

    // Live preview updates for colors
    const textColorInput = document.getElementById("textColor");
    const textColor2Input = document.getElementById("textSecondaryColor");
    const backgroundColorInput = document.getElementById("backgroundColor");
    const accentColorInput = document.getElementById("accentColor");
    const linkHoverColorInput = document.getElementById("linkHoverColor");

    const previewHeader = document.getElementById("previewHeader");
    const previewContent = document.querySelector('.preview-content');
    const previewText = document.getElementById("previewText");
    const previewText2 = document.getElementById('inline-secondary-text-color');
    const previewLink = document.getElementById("previewLink");
    const previewAccentText = document.getElementById('inline-accent-color-text');

    previewHeader.style.backgroundColor = theme.background_color;
    previewContent.style.backgroundColor = theme.background_color;
    previewText.style.color = theme.text_color;
    previewText2.style.color = theme.text_color_secondary;
    previewLink.style.color = theme.text_color;
    previewAccentText.style.color = theme.accent_color;

    previewLink.addEventListener('mouseover', () => {
      previewLink.style.color = theme.link_hover_color;
    })
    previewLink.addEventListener('mouseout', () => {
      previewLink.style.color = theme.text_color;
    })

    textColorInput.addEventListener("input", () => {
      previewText.style.color = textColorInput.value;
      previewLink.style.color = textColorInput.value;
    });

    textColor2Input.addEventListener("input", () => {
      previewText2.style.color = textColor2Input.value;
    })

    backgroundColorInput.addEventListener("input", () => {
      previewHeader.style.backgroundColor = backgroundColorInput.value;
      previewContent.style.backgroundColor = backgroundColorInput.value;
    });

    linkHoverColorInput.addEventListener("input", () => {
      previewLink.addEventListener("mouseover", () => {
        previewLink.style.color = linkHoverColorInput.value;
      });
      previewLink.addEventListener("mouseout", () => {
        previewLink.style.color = textColorInput.value;
      });
    });

    accentColorInput.addEventListener('input', () => {
      previewAccentText.style.color = accentColorInput.value;
    })

    // Live preview for logo upload
    const logoUploadInput = document.getElementById("logoUpload");
    const previewLogo = document.getElementById("previewLogo");

    logoUploadInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          previewLogo.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    // Live preview for hero upload
    const heroUploadInput = document.getElementById("heroUpload");
    const previewHeroImage = document.getElementById("previewHeroImage");

    heroUploadInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          previewHeroImage.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

  })

  // Get the Logo Image for this merchant
  await fetch(`${API_BASE_URL}/logo/`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get logo image");
    return response.json();
  })
  .then(data => {
    const logo_url = data.image_url;
    const logo_img = document.getElementById('currentLogoImage');
    logo_img.src = logo_url;
    document.querySelector('.preview-header img').src = logo_url;

    const logoUpload = document.getElementById('logoUpload');
    logoUpload.addEventListener('change', function () {
      changedLogo = true;
      const file = this.files[0];
      if (file) {
        logo_img.src = URL.createObjectURL(file);
        changedLogo = true;
      }
    })
  })

  // Get the Hero Image for this merchant
  await fetch(`${API_BASE_URL}/hero/`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get hero image");
    return response.json();
  })
  .then(data => {
    const hero_url = data.image_url;
    const hero_img = document.getElementById('currentHeroImage');
    hero_img.src = hero_url;
    document.querySelector('.preview-hero img').src = hero_url;

    const heroUpload = document.getElementById('heroUpload');
    heroUpload.addEventListener('change', function () {
      changed = true;
      const file = this.files[0];
      if (file) {
        hero_img.src = URL.createObjectURL(file);
        changedHero = true;
      }
    })
  })

  // Now, we can add an event listener to the save button that checks for changes before submitting api call
  const saveChangeBtn = document.getElementById('save-theme-images-btn');
  saveChangeBtn.addEventListener('click', function () {
    // If colors changed
    if (changed) {
      const newTextColor = document.getElementById('textColor').value;
      const newSecondaryTextColor = document.getElementById('textSecondaryColor').value;
      const newBackgroundColor = document.getElementById('backgroundColor').value;
      const newAccentColor = document.getElementById('accentColor').value;
      const newLinkHoverColor = document.getElementById('linkHoverColor').value;

      fetch(`${API_BASE_URL}/update/theme/`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          'text_color': newTextColor, 
          'text_color_secondary': newSecondaryTextColor,
          'background_color': newBackgroundColor, 
          'accent_color': newAccentColor, 
          'link_hover_color': newLinkHoverColor}),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        }
      })
      .then(response => {
        showToast("Theme Updated");
      })
    }

    // If logo changed
    if (changedLogo) {
      const fileInput = document.getElementById('logoUpload');
      const file = fileInput.files[0];

      if (file) {
        const formData = new FormData();
        formData.append('logo', file);

        fetch(`${API_BASE_URL}/logo/`, {
          method: 'POST',
          credentials: 'include',
          body: formData, 
          headers: {
            'X-CSRFToken': csrftoken
          }
        })
        .then(response => {
          if (response.ok) {
            window.location.reload();
          }
        })
        .catch(error => {
          console.error('Error uploading logo:', error);
        });
      }
    }

    // If hero changed
    if (changedHero) {
      const fileInput = document.getElementById('heroUpload');
      const file = fileInput.files[0];

      if (file) {
        const formData = new FormData();
        formData.append('hero', file);

        fetch(`${API_BASE_URL}/update/hero/`, {
          method: 'POST',
          credentials: 'include',
          body: formData, 
          headers: {
            'X-CSRFToken': csrftoken
          }
        })
        .then(response => {
          if (response.ok) {
            window.location.reload();
          }
        })
        .catch(error => {
          console.error('Error uploading hero:', error);
        })
      }
    }
  })
})