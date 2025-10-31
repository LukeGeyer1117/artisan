// Initialize this page. 
// Includes Getting the Hero Image, Display Text, and Featured Products
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");

  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
  });

  GetAndDisplayHero();
  GetAndDisplayText();
  GetAndDisplayFeaturedProducts();
});

// Open the modal and populate it
function openProductModal(product) {
  document.getElementById('modal-product-image').src = '/media/' + product.image;
  document.getElementById('modal-product-title').innerText = product.name;
  document.getElementById('modal-product-price').innerText = `$${product.price}`;
  document.getElementById('modal-product-description').innerText = product.description;
  document.getElementById('modal-product-quantity').innerText = `In stock: ${product.quantity}`;
  let quantityDesired = document.getElementById('quantity-desired');
  quantityDesired.min = 1;
  quantityDesired.max = product.quantity;

  quantityDesired.addEventListener('input', () => {
    const value = parseInt(quantityDesired.value, 10);
    const max = product.quantity;

    if (isNaN(value)) {
      quantityDesired.value = 1; // fallback for non-number input
    } else if (value > max) {
      quantityDesired.value = max;
    } else if (value < 1) {
      quantityDesired.value = max > 0 ? 1 : 0;
    }
  });


  const modal = document.getElementById('product-modal');
  modal.style.display = 'block';
}

// Close modal on button click
document.querySelector('.close-button').addEventListener('click', () => {
  document.getElementById('product-modal').style.display = 'none';
});

// Optional: close modal if user clicks outside the modal content
window.addEventListener('click', (e) => {
  const modal = document.getElementById('product-modal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

function GetAndDisplayHero() {
  fetch(`${API_BASE_URL}/hero/${slug}/`, {
    method: 'GET'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get hero image.");
    return response.json();
  })
  .then(data => {
    const hero_image_url = data.image_url;
    const hero_section = document.getElementById('home-hero-section');
    hero_section.style.backgroundImage = `url(${hero_image_url})`;
  })
}

function GetAndDisplayText() {
  fetch(`${API_BASE_URL}/text/${slug}/`, {
    method: 'GET'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get text content");
    return response.json();
  })
  .then(data => {
    const text_content = data.text_content;
    document.getElementById('hero-sentence-draw').innerHTML = text_content.hero_sentence_draw;
    document.getElementById('hero-header-draw').innerHTML = text_content.hero_header_draw;
  })
}

function GetAndDisplayFeaturedProducts() {
  fetch(`${API_BASE_URL}/${slug}/products-limit/`, {
    method: 'GET',
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch all products!");
    return response.json();
  })
  .then(result => {
    result.forEach(element => {
      // Select the parent section
      const section = document.getElementById('products-available');

      // Create the product container
      const productDiv = document.createElement('div');
      productDiv.className = 'product';
      productDiv.innerHTML = `
        <img src='/media/${element.image}'>
        <div class='product-info'>
          <div class='info-subdiv'></div>
          <h2 class='product-name'>${element.name}</h2>
          <div class='info-subdiv' id='price-subdiv'>
            <h4 class='price'>$${element.price}</h4>
          </div>
        </div>
      `;

      productDiv.addEventListener('click', function () {
        window.location.href = `/item/${slug}/${element.id}/`;
      })

      // Insert before the "See All Products" link
      const seeMoreSection = section.querySelector('.scroll-see-more');
      section.insertBefore(productDiv, seeMoreSection);
      new ProductScroller();
    });
  })
}

class ProductScroller {
  constructor() {
    this.container = document.getElementById('products-available');
    this.prevBtn = document.getElementById('scroll-left-button');
    this.nextBtn = document.getElementById('scroll-right-button');
    this.scrollContainer = this.container.querySelector('.scroll-see-more') || this.container;
    this.indicatorContainer = document.getElementById('indicator-container');
    
    this.currentIndex = 0;
    this.itemsToShow = this.calculateItemsToShow();
    this.totalItems = this.container.children.length;
    this.maxIndex = Math.max(0, this.totalItems - this.itemsToShow);
    
    this.init();
  }
  
  calculateItemsToShow() {
    const containerWidth = this.container.parentElement.clientWidth;
    const itemWidth = 320; // Product width + gap
    return Math.floor(containerWidth / itemWidth);
  }
  
  init() {
    this.createIndicators();
    this.updateButtons();
    this.updateIndicators();
    
    // Event listeners
    this.prevBtn.addEventListener('click', () => this.scrollPrev());
    this.nextBtn.addEventListener('click', () => this.scrollNext());
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.itemsToShow = this.calculateItemsToShow();
      this.maxIndex = Math.max(0, this.totalItems - this.itemsToShow);
      this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
      this.updateScroll();
      this.createIndicators();
      this.updateButtons();
      this.updateIndicators();
    });
    
    // Touch/swipe support for mobile
    this.addTouchSupport();
  }
  
  createIndicators() {
    this.indicatorContainer.innerHTML = '';
    const totalPages = this.maxIndex + 1;
    
    if (totalPages <= 1) {
        this.indicatorContainer.style.display = 'none';
        return;
    }
    
    this.indicatorContainer.style.display = 'flex';
    
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('div');
      dot.className = 'indicator-dot';
      dot.addEventListener('click', () => this.scrollToIndex(i));
      this.indicatorContainer.appendChild(dot);
    }
  }
  
  scrollPrev() {
    if (this.currentIndex > 0) {
        this.currentIndex--;
        this.updateScroll();
        this.updateButtons();
        this.updateIndicators();
    }
  }
  
  scrollNext() {
    if (this.currentIndex < this.maxIndex) {
        this.currentIndex++;
        this.updateScroll();
        this.updateButtons();
        this.updateIndicators();
    }
  }
  
  scrollToIndex(index) {
    this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
    this.updateScroll();
    this.updateButtons();
    this.updateIndicators();
  }
  
  updateScroll() {
    const scrollAmount = this.currentIndex * (320); // item width + gap
    this.container.querySelectorAll('.product').forEach(product => {
      product.style.transform = `translateX(-${scrollAmount}px)`;
    })
  }
  
  updateButtons() {
    this.prevBtn.disabled = this.currentIndex <= 0;
    this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
  }
  
  updateIndicators() {
    const dots = this.indicatorContainer.querySelectorAll('.indicator-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }
  
  addTouchSupport() {
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let isHorizontalSwipe = false;
    
    this.scrollContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
      isHorizontalSwipe = false;
    }, { passive: true });
    
    this.scrollContainer.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);
      
      // Determine if this is a horizontal swipe
      if (deltaX > deltaY && deltaX > 10) {
          isHorizontalSwipe = true;
      }
      
      // Only prevent default for horizontal swipes to allow vertical scrolling
      if (isHorizontalSwipe) {
          e.preventDefault();
      }
    }, { passive: false });
    
    this.scrollContainer.addEventListener('touchend', (e) => {
      if (!isDragging || !isHorizontalSwipe) {
          isDragging = false;
          return;
      }
      
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
          if (diff > 0) {
              this.scrollNext();
          } else {
              this.scrollPrev();
          }
      }
      
      isDragging = false;
      isHorizontalSwipe = false;
    }, { passive: true });
  }
}