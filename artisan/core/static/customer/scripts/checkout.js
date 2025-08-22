let paymentTotal = 0;
const slug = document.body.dataset.slug;

document.addEventListener("DOMContentLoaded", function () {
    // Get the slug from URL, used for redirect back to cart.
    console.log(slug);

    // Go back to cart if clicked
    document.getElementById("checkout-back-to-cart").addEventListener('click', function () {
        window.location.href = `/cart/${slug}`;
    })

    // Process the checkout
    checkout();

    // Listen for form submission
    document.getElementById("customer-profile-form").addEventListener('submit', async function (event) {
        event.preventDefault();
        // Process the payment
        process_payment()
    })
})

function checkout() {
    // Create a checkout item. If receives a good status, calls an order view.
    fetch(`${API_BASE_URL}/checkout/`, {
        method: "GET",
        credentials: "include",
    })
    .then(response => {
        if (!response.ok) throw new Error("Failed to get checkout data.");
        return response.json();
    })
    .then(data => {
        paymentTotal = data.total;
        document.getElementById("checkout-btn").innerHTML = "Secure Checkout - Total: $" + data.total;
    })
}

async function process_payment() {
    const fullName = document.getElementById("full-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const shipping_addr = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip_code = document.getElementById("zip").value;

    // Call a fetch to process the payment, passing in the amount.
    await fetch(`${API_BASE_URL}/process_payment/`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"total": paymentTotal})
    })
    .then(response => {
        if (!response.ok) throw new Error("Payment Could not be processed at this time.");
        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.payment_status == "SUCCEED") {
            fetch(`${API_BASE_URL}/order/`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        full_name: fullName,
                        email: email,
                        phone: phone,
                        shipping_addr: shipping_addr,
                        city: city,
                        state: state,
                        zip_code: zip_code,
                        slug: slug,
                        total_price: paymentTotal
                    }
                )
            })
            .then(response => {
                if (!response.ok) throw new Error("Could not create an Order!");
                return response.json();
            })
            .then(data => {
                console.log(data);
                window.location.href = `/order-complete/${slug}`;
            })
        }
    })
}