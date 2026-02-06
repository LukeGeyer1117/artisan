let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

// Initialize this page. 
// Includes Getting the Hero Image, Display Text, and Featured Products
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("menu-toggle");
  const links = document.querySelector(".nav-links");

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
    const hero_image = document.querySelector('#hero-image');
    hero_image.style.backgroundImage = `url("${hero_image_url}")`;
  })
}

async function GetAndDisplayText() {
  const text_response = await fetch(`${API_BASE_URL}/text/${slug}/`, {
    method: 'GET'
  });

  if (!text_response.ok) throw new Error("Couldn't get Text Content");

  const text_data = await text_response.json();
  const text_content = text_data.text_content;

  console.log(text_content);

  document.getElementById('hero-title').textContent = text_content.hero_title;
  document.getElementById('hero-sentence').textContent = text_content.hero_sentence;

  document.querySelector('.featured-header').textContent = text_content.featured_header;
  document.querySelector('.featured-text').textContent = text_content.featured_text;

}

function GetAndDisplayFeaturedProducts() {
  fetch(`${API_BASE_URL}/products/${slug}/featured/`, {
    method: 'GET',
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch all products!");
    return response.json();
  })
  .then(result => {
    // Select the parent section
    const carousel = document.getElementById('product-carousel');

    const total = result.length;

    result.forEach((product, index) => {

      const pony = document.createElement('div');
      pony.id = `slide${index + 1}`
      pony.className = 
      `
      carousel-item 
      w-full md:w-1/2 lg:w-1/3 max-h-[80vh] 
      flex items-center justify-center p-2 
      transform transition
      `;

      // Calculate the next/prev slid
      const cur = index + 1;
      const prev = cur === 1 ? total : cur - 1;
      const next = cur === total ? 1 : cur + 1;
      
      pony.innerHTML = `
        <div class="relative w-full h-full overflow-hidden group flex items-center justify-center">
          <!-- Product image -->
          <img 
            src="/media/${product.image}" 
            alt="${product.name}"
            class="w-full max-h-full h-auto md:h-full object-contain md:object-cover rounded-md shadow-md"
          />

          <!-- overlay -->
          <div class="
            absolute inset-0 
            bg-black/70 
            text-white 
            flex flex-col justify-between 
            p-8 pt-12 pb-12
            translate-y-full 
            transition-transform duration-500 ease-out
            group-hover:translate-y-0
          ">
            <!-- Top content: Name + Price -->
            <div class="text-center">
              <p class="text-4xl font-semibold">${product.name}</p>
              <p class="text-2xl font-medium mt-1">$${product.price}</p>
            </div>

            <!-- Middle content: truncated description -->
            <div class="mt-2 flex-1 flex items-center justify-center">
              <p class="text-xl line-clamp-4 overflow-hidden">${product.description}</p>
            </div>

            <div class="text-center mt-2">
              <button class="btn btn-square btn-lg w-full border-none transform translate hover:bg-amber-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      `;




      // Click event to go to product page
      pony.addEventListener('click', () => {
        window.location.href = `/item/${slug}/${product.id}/`;
      });

      carousel.appendChild(pony);
      })

  })
  .catch(error => console.error('Error fetching featured products:', error));
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