const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

let form = document.querySelector(".custom-order-form");

// Example form submission logic
// Example form submission logic
form.addEventListener('submit', function (e) {
  e.preventDefault();

  // Get form data
  const formData = new FormData(form);
  
  // Extract individual fields
  const name = formData.get('name');
  const email = formData.get('email');
  const details = formData.get('details');
  const budgetLow = formData.get('budget-low');
  const budgetHigh = formData.get('budget-high');
  const acknowledgement = formData.get('acknowledgement'); // will be 'on' if checked, null if not
  const referenceFiles = formData.getAll('reference-files'); // array of File objects

  // Log the extracted data
  console.log('Form Data:');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Project Description:', details);
  console.log('Budget Range:', `$${budgetLow} - $${budgetHigh}`);
  console.log('Acknowledgement:', acknowledgement ? 'Accepted' : 'Not checked');
  console.log('Reference Files:', referenceFiles);
  
  // Log file details if any files were uploaded
  if (referenceFiles.length > 0) {
    console.log('File Details:');
    referenceFiles.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });
    });
  }

  // validate and send data...
  // Need to create a custom order request on the slug given
  fetch(`${API_BASE_URL}/`)

  // if successful:
  // window.location.href = '../custom-order-portal/success.html';
});

// Toggle nav on small screens
  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");

    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  });