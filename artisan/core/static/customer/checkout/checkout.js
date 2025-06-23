const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener("DOMContentLoaded", function () {
    const slug = document.body.dataset.slug;
    console.log(slug);
    
    document.getElementById("checkout-back-to-cart").addEventListener('click', function () {
        window.location.href = `/cart/${slug}`;
    })

    fetch(`${API_BASE_URL}/checkout/`, {
        method: "GET",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Failed to get checkout data.");
        return response.json();
    })
    .then(data => {
        console.log(data);
        document.getElementById("checkout-btn").innerHTML = "Pay $" + data.total + " Now";
    })
})