document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tab');
  const cached_tab = localStorage.getItem('tab');
  if (cached_tab) {
    tabs.forEach(tab => {
      if (tab.dataset.tab === cached_tab) {
        tab.classList.add('tab-active');
        tab.classList.add('tab-primary');
      }
    })
  } else {
    const initialTab = document.querySelector('.tab');
    initialTab.classList.add('tab-active');
    initialTab.classList.add('text-primary');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      tabs.forEach(tab => {
        tab.classList.remove('tab-active');
        tab.classList.remove('text-primary');
      })
      tab.classList.add('tab-active');
      tab.classList.add('text-primary');
      localStorage.setItem('tab', tab.dataset.tab);
    })
  })
})