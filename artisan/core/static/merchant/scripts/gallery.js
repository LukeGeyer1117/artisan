let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

class GalleryManager {
  constructor() {
    this.images = [];
    this.draggedItem = null;
    this.csrfToken = this.getCSRFToken();
    this.initializeEventListeners();
    this.loadExistingGallery();
  }

  getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    return '';
  }

  initializeEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.querySelector('.upload-area');
    const saveBtn = document.getElementById('saveBtn');

    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    saveBtn.addEventListener('click', () => this.saveGalleryOrder());

    // Drag and drop for upload area
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#764ba2';
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#667eea';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#667eea';
      this.handleFileSelect({ target: { files: e.dataTransfer.files } });
    });
  }

  async handleFileSelect(event) {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length === 0) {
      this.showMessage('Please select valid image files', 'error');
      return;
    }

    // Upload files to server
    for (const file of validFiles) {
      await this.uploadFile(file);
    }
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('csrfmiddlewaretoken', this.csrfToken);

    try {
      const response = await fetch(`${API_BASE_URL}/gallery/upload/`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': this.csrfToken
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.addImageToGallery(data.url, data.id);
        this.showMessage('Image uploaded successfully', 'success');
      } else {
        this.showMessage('Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      this.showMessage('Upload failed. Please try again.', 'error');
    }
  }

  addImageToGallery(url, id) {
    const imageData = {
      id: id,
      url: url,
      order: this.images.length
    };

    this.images.push(imageData);
    this.renderGallery();
    this.updateSaveButton();
  }

  renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const emptyState = document.getElementById('emptyState');

    if (this.images.length === 0) {
      emptyState.style.display = 'block';
      galleryGrid.innerHTML = '';
      return;
    }

    emptyState.style.display = 'none';
    galleryGrid.innerHTML = '';

    this.images.forEach((image, index) => {
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';
      galleryItem.draggable = true;
      galleryItem.dataset.index = index;

      galleryItem.innerHTML = `
        <img src="${image.url}" alt="Gallery image ${index + 1}" loading="lazy">
        <div class="gallery-item-controls">
          <button class="control-btn delete-btn" data-index="${index}">×</button>
        </div>
        <div class="gallery-item-order">${index + 1}</div>
      `;

      // Add drag event listeners
      galleryItem.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
      galleryItem.addEventListener('dragover', (e) => this.handleDragOver(e));
      galleryItem.addEventListener('drop', (e) => this.handleDrop(e, index));
      galleryItem.addEventListener('dragend', (e) => this.handleDragEnd(e));

      // Add delete button event listener
      const deleteBtn = galleryItem.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => this.removeImage(index));

      galleryGrid.appendChild(galleryItem);
    });
  }

  handleDragStart(e, index) {
    this.draggedItem = index;
    e.target.classList.add('dragging');
  }

  handleDragOver(e) {
    e.preventDefault();
  }

  handleDrop(e, dropIndex) {
    e.preventDefault();
    
    if (this.draggedItem === null || this.draggedItem === dropIndex) return;

    // Reorder images array
    const draggedImage = this.images[this.draggedItem];
    this.images.splice(this.draggedItem, 1);
    this.images.splice(dropIndex, 0, draggedImage);

    // Update order values
    this.images.forEach((image, index) => {
      image.order = index;
    });

    this.renderGallery();
    this.updateSaveButton();
  }

  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    this.draggedItem = null;
  }

  async removeImage(index) {
    if (confirm('Are you sure you want to remove this image?')) {
      const imageToRemove = this.images[index];
      
      // First, try to delete from server
      try {
        const response = await fetch(`${API_BASE_URL}/gallery/delete/${imageToRemove.id}/`, {
          method: 'DELETE',
          headers: {
            'X-CSRFToken': this.csrfToken
          }
        });

        if (response.ok) {
          // Remove from local array
          this.images.splice(index, 1);
          
          // Recalculate order values starting from 0
          this.images.forEach((image, idx) => {
            image.order = idx;
          });

          this.renderGallery();
          this.updateSaveButton();
          this.showMessage('Image removed successfully', 'success');
        } else {
          this.showMessage('Failed to remove image', 'error');
        }
      } catch (error) {
        console.error('Delete error:', error);
        this.showMessage('Failed to remove image', 'error');
      }
    }
  }

  updateSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = this.images.length === 0;
  }

  async saveGalleryOrder() {
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    // Ensure all images have proper sequential order values
    const validImages = this.images.filter(img => img.id && img.id !== null);
    validImages.forEach((img, idx) => {
      img.order = idx;
    });

    const payload = {
      images: validImages.map(img => ({
        id: img.id,
        order: img.order
      }))
    };

    console.log('Sending payload:', payload);
    console.log('CSRF Token:', this.csrfToken);

    try {
      const response = await fetch(`${API_BASE_URL}/gallery/save-order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.csrfToken
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        this.showMessage('Gallery order saved successfully!', 'success');
        
        // Update local images array with the cleaned data
        this.images = validImages;
        this.renderGallery();
      } else {
        // Try to get the error message from the response
        const errorText = await response.text();
        console.error('Error response:', errorText);
        this.showMessage(`Failed to save gallery order: ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      this.showMessage('Save failed. Please try again.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Gallery Order';
    }
  }

  async loadExistingGallery() {
    try {
      const response = await fetch(`${API_BASE_URL}/gallery/`);
      if (response.ok) {
        const data = await response.json();
        this.images = data.images || [];
        this.renderGallery();
        this.updateSaveButton();
      }
    } catch (error) {
      console.error('Failed to load existing gallery:', error);
    }
  }

  showMessage(message, type) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';

    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 3000);
  }
}

// Initialize the gallery manager
const galleryManager = new GalleryManager();