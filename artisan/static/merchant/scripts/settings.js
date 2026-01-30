document.addEventListener('DOMContentLoaded', function () {
  const initialTab = document.querySelector('.tab');
  initialTab.classList.add('tab-active');
  initialTab.classList.add('text-primary');


  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      tabs.forEach(tab => {
        tab.classList.remove('tab-active');
        tab.classList.remove('text-primary');
      })
      tab.classList.add('tab-active');
      tab.classList.add('text-primary');
    })
  })
})