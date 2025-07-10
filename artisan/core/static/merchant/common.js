let links = document.querySelectorAll('.links-group a');

links.forEach(link => {
  link.classList.remove('active');

  if (window_location == link.querySelector('h3').innerHTML) {
    link.classList.add('active');
    link.querySelector('img').src = active_URL;
  }
})

document.querySelector('.navbar a').addEventListener('click', function () {window.location.href = '/login/'});