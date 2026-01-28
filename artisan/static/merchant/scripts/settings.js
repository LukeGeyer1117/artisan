document.addEventListener('DOMContentLoaded', function () {
  const initialTab = document.querySelector('.tab');
  initialTab.classList.add('tab-active');
  initialTab.classList.add('text-info');


  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      tabs.forEach(tab => {
        tab.classList.remove('tab-active');
        tab.classList.remove('text-info');
      })
      tab.classList.add('tab-active');
      tab.classList.add('text-info');
    })
  })
})