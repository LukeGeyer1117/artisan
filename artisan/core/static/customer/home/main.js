
// Toggle nav on small screens
  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");

    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });

    // Select all inventory items to populate the home screen
    const slug = document.body.dataset.slug;
    console.log(slug);

    fetch(`http://127.0.0.1:8000/api/${slug}/products/`, {
      method: 'GET',
    })
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch all products!");
      return response.json();
    })
    .then(result => {
      result.forEach(element => {
        // console.log(element);

        // Select the parent section
        const section = document.getElementById('products-available');

        // Create the product container
        const productDiv = document.createElement('div');
        productDiv.className = 'product';

        // Create and append image
        const img = document.createElement('img');
        img.src = '/media/' + element.image;
        productDiv.appendChild(img);

        // Create and append product name
        const h2 = document.createElement('h2');
        h2.className = 'product-name';
        h2.textContent = element.name;
        productDiv.appendChild(h2);

        // Create and append price
        const h4 = document.createElement('h4');
        h4.className = 'price';
        h4.textContent = `$${element.price}`;
        productDiv.appendChild(h4);

        // Create and append description
        const p = document.createElement('p');
        p.className = 'product-description-in-brief';
        p.textContent = element.description;
        productDiv.appendChild(p);

        // Insert before the "See All Products" link
        const seeMoreSection = section.querySelector('.scroll-see-more');
        section.insertBefore(productDiv, seeMoreSection);
      });
    })

  });