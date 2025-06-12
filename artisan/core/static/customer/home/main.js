
// Toggle nav on small screens
  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");

    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  });

  // Select the parent section
    const section = document.getElementById('products-available');

    // Create the product container
    const productDiv = document.createElement('div');
    productDiv.className = 'product';

    // Create and append image
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = name;
    productDiv.appendChild(img);

    // Create and append product name
    const h2 = document.createElement('h2');
    h2.className = 'product-name';
    h2.textContent = name;
    productDiv.appendChild(h2);

    // Create and append price
    const h4 = document.createElement('h4');
    h4.className = 'price';
    h4.textContent = `$${price}`;
    productDiv.appendChild(h4);

    // Create and append description
    const p = document.createElement('p');
    p.className = 'product-description-in-brief';
    p.textContent = description;
    productDiv.appendChild(p);

    // Insert before the "See All Products" link
    const seeMoreSection = section.querySelector('.scroll-see-more');
    section.insertBefore(productDiv, seeMoreSection);