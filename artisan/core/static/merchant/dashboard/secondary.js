document.addEventListener('DOMContentLoaded', async function () {
  // Get the Artisan information at page load
    await fetch(`${API_BASE_URL}/artisan`, {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => {
        if (!response.ok) throw new Error("Could Not Get Artisan Info!");
        return response.json();
    })
    .then(data => {
        artisan = data.artisan;
        console.log(artisan)
    })
})