const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

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
    let backgroundColorSelect = document.getElementById('backgroundColor');
    let accentColorSelect = document.getElementById('accentColor');
    let linkHoverColorSelect = document.getElementById('linkHoverColor');

    const theme = data.theme;
    textColorSelect.value = theme.text_color;
    backgroundColorSelect.value = theme.background_color;
    accentColorSelect.value = theme.accent_color;
    linkHoverColorSelect.value = theme.link_hover_color;

    const colorSelectors = [textColorSelect, backgroundColorSelect, accentColorSelect, linkHoverColorSelect];
    colorSelectors.forEach(selector => {
      selector.addEventListener('input', function () {
        changed = true;
      })
    })
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
      const newBackgroundColor = document.getElementById('backgroundColor').value;
      const newAccentColor = document.getElementById('accentColor').value;
      const newLinkHoverColor = document.getElementById('linkHoverColor').value;

      fetch(`${API_BASE_URL}/update/theme/`, {
        method: 'PUT',
        credentials: 'include',
        body: JSON.stringify({'text_color': newTextColor, 'background_color': newBackgroundColor, 'accent_color': newAccentColor, 'link_hover_color': newLinkHoverColor}),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        window.location.reload();
      })
    }

    // If logo changed
    if (changedLogo) {
      const fileInput = document.getElementById('logoUpload');
      const file = fileInput.files[0];

      if (file) {
        const formData = new FormData();
        formData.append('logo', file);

        fetch(`${API_BASE_URL}/update/logo/`, {
          method: 'POST',
          credentials: 'include',
          body: formData
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
          body: formData
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