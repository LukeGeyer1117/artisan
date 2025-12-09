import { getCookie } from "./csrf.js";
import { showToast } from "./common.js";

const csrftoken = getCookie('csrftoken');

let paymentTotal = 0;
const slug = document.body.dataset.slug;
const STATES = {'AL':'ALABAMA','AK':'ALASKA','AZ':'ARIZONA','AR':'ARKANSAS','CA':'CALIFORNIA','CO':'COLORADO','CT':'CONNECTICUT','DE':'DELAWARE','FL':'FLORIDA','GA':'GEORGIA','HI':'HAWAII','ID':'IDAHO','IL':'ILLINOIS','IN':'INDIANA','IA':'IOWA','KS':'KANSAS','KY':'KENTUCKY','LA':'LOUISIANA','ME':'MAINE','MD':'MARYLAND','MA':'MASSACHUSETTS','MI':'MICHIGAN','MN':'MINNESOTA','MS':'MISSISSIPPI','MO':'MISSOURI','MT':'MONTANA','NE':'NEBRASKA','NV':'NEVADA','NH':'NEW HAMPSHIRE','NJ':'NEW JERSEY','NM':'NEW MEXICO','NY':'NEW YORK','NC':'NORTH CAROLINA','ND':'NORTH DAKOTA','OH':'OHIO','OK':'OKLAHOMA','OR':'OREGON','PA':'PENNSYLVANIA','RI':'RHODE ISLAND','SC':'SOUTH CAROLINA','SD':'SOUTH DAKOTA','TN':'TENNESSEE','TX':'TEXAS','UT':'UTAH','VT':'VERMONT','VA':'VIRGINIA','WA':'WASHINGTON','WV':'WEST VIRGINIA','WI':'WISCONSIN','WY':'WYOMING'};

document.addEventListener("DOMContentLoaded", function () {
    // Get the slug from URL, used for redirect back to cart.

    // Process the checkout
    // checkout();

    // Listen for form submission
    // document.getElementById("payment-form").addEventListener('submit', async function (event) {
    //     event.preventDefault();
    //     // Process the payment
    //     process_payment()
    // })

    // Handle navigation between form tabs
    const tabs = document.querySelectorAll('.tabs a');
    tabNavInit(tabs);

    // Initialize toggles
    setupToggle('check-billing-name', 'billing-fname', 'first-name');
    setupToggle('check-billing-name', 'billing-lname', 'last-name');
    setupToggle('check-billing-zip', 'billing-zip', 'zip-code');

    // Add states to state selector
    addStates();

    // Listen for form submission
    const checkout_button = document.getElementById('checkout-btn');
    formListen(checkout_button);
    checkout_button.addEventListener('click', function () {
        checkout();
    })
})

function formListen() {
    const checkout_field_ids = [
        'first-name', 'last-name', 'email', 'phone', 'street-address',
        'city', 'state', 'zip-code', 'card-number', 'exp-date', 'exp-year', 
        'cvv'
    ];

    const submitBtn = document.getElementById('checkout-btn');

    // 1. Define a reusable function to check ALL fields at once
    const checkAllFields = () => {
        let allFilled = true;

        for (const id of checkout_field_ids) {
            const element = document.getElementById(id);
            
            // Safety check: Does element exist? Is value empty?
            if (!element || element.value.trim() === '') {
                allFilled = false;
                break; // Stop checking if we find one empty field
            }
        }

        // Update button state based on the result
        if (allFilled) {
            submitBtn.removeAttribute('disabled');
        } else {
            submitBtn.setAttribute('disabled', 'true');
        }
    };

    // 2. Add listeners to every field in your list
    for (const id of checkout_field_ids) {
        const element = document.getElementById(id);
        
        if (element) {
            // Listen for typing
            element.addEventListener('input', checkAllFields);
            // Listen for dropdown changes (Fixes your 'state' issue)
            element.addEventListener('change', checkAllFields); 
        } else {
            console.warn(`Element with ID '${id}' not found in DOM.`);
        }
    }
}

class Tab {
    constructor(mDiv) {
        this.mDiv = mDiv;
    }
}

function tabNavInit(tabs) {
    tabs.forEach(tab => {

        tab.addEventListener('click', function () {
            const target_tab = tab.id.replace('-nav', '');
            const tabO = new Tab(target_tab);

            tabs.forEach(tab => {
                tab.classList.remove('tab-active');
            })
            tab.classList.add('tab-active');

            document.querySelectorAll('.step-card').forEach(card => {card.classList.add('hidden')})
            document.getElementById(tabO.mDiv).classList.remove('hidden');
        })
    })

    document.getElementById('customer-tab').querySelector('button').addEventListener('click', function () {
        document.getElementById('customer-tab').classList.add('hidden');
        document.getElementById('shipping-tab').classList.remove('hidden');

        document.getElementById('customer-tab-nav').classList.remove('tab-active');
        document.getElementById('shipping-tab-nav').classList.add('tab-active');
    })
    document.getElementById('shipping-tab').querySelector('button').addEventListener('click', function () {
        document.getElementById('shipping-tab').classList.add('hidden');
        document.getElementById('billing-tab').classList.remove('hidden');

        document.getElementById('shipping-tab-nav').classList.remove('tab-active');
        document.getElementById('billing-tab-nav').classList.add('tab-active');
    })
}

// Function to handle toggle logic
const setupToggle = (checkboxId, inputId, sourceID) => {
    const checkbox = document.getElementById(checkboxId);
    const input = document.getElementById(inputId);

    checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        // Show field and enable input
        input.value = document.getElementById(sourceID).value;
        input.setAttribute('disabled', 'true');
    } else {
        // Hide field and disable input (prevents validation errors on hidden fields)
        input.removeAttribute('disabled');
        input.value = ''; // Optional: clear value when unchecked
    }
    });
};

function addStates() {
    const state_selector = document.getElementById('state');
    state_selector.innerHTML = '<option value="" disabled selected>State</option>'; 

    for (const [abbr, name] of Object.entries(STATES)) {
        const option = document.createElement('option');
        option.value = abbr;
        option.textContent = name;
        state_selector.appendChild(option);
    }
}

function checkout() {
    const checkout_field_ids = {
        'first-name': '', 'last-name': '', 'email': '', 'phone': '', 'street-address': '',
        'city': '', 'state': '', 'zip-code': '', 'card-number': '', 'exp-date': '', 'exp-year': '', 
        'cvv': '', 'billing-fname': '', 'billing-lname': '', 'billing-zip': '' 
    }

    for (const field in checkout_field_ids) {
        checkout_field_ids[field] = document.getElementById(field).value;
    }

    let ok = true;
    for (const field in checkout_field_ids) {
        if (checkout_field_ids[field] == '') {
            showToast(`Missing field: ${field}`, 'error');
            ok = false;
        }
    }
    if (!ok) { return; }

    // Validate the inputs
    if (!validateInputs()) { return; }
    const validateInputs = () => {
        let ok = true;
        const cc_number     = checkout_field_ids['card-number'];
        const month         = checkout_field_ids['exp-date'];
        const year          = checkout_field_ids['exp-year'];
        const cvc           = checkout_field_ids['cvv'];

        if (!cc_number || cc_number == '') { showToast(`Missing Field: Card Number`, 'error'); }
        if (!month || month == '') { showToast(`Missing Field: Expiration Month`, 'error'); }
        if (!year || year == '') { showToast(`Missing Field: Expiration Year`, 'error'); }
        if (!cvc || cvc == '') { showToast(`Missing Field: CVV`, 'error'); }

        const patterns = {
            cc_number: /^\d{16}$/,
            month: /^(0[1-9]|1[0-2])$/,
            year: /^\d{2}$/,
            cvc: /^\d{3,4}$/
        };
        if (cc_number && !patterns.cc_number.test(cc_number)) { showToast(`Invalid Field: Card Number`, 'error'); }
        if (month && !patterns.month.test(month)) { showToast(`Invalid Field: Expiration Month`, 'error'); }
        if (year && !patterns.year.test(year)) { showToast(`Invalid Field: Expiration Year`, 'error'); }
        if (cvc && !patterns.cvc.test(cvc)) { showToast(`Invalid Field: CVV`, 'error'); }

        return ok;
    }

    // // Create a checkout item. If receives a good status, calls an order view.
    // fetch(`${API_BASE_URL}/checkout/`, {
    //     method: "GET",
    //     credentials: "include",
    // })
    // .then(response => {
    //     if (!response.ok) throw new Error("Failed to get checkout data.");
    //     return response.json();
    // })
    // .then(data => {
    //     paymentTotal = data.total;
    //     document.getElementById("checkout-btn").innerHTML = "Secure Checkout - Total: $" + data.total;
    // })
}

async function process_payment() {
    const fname = document.getElementById("first-name").value;
    const lname = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const shipping_addr = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip_code = document.getElementById("zip").value;

   // Call a fetch to process the payment, passing in the amount.
    const paymentResponse = await fetch(`${API_BASE_URL}/process_payment/`, {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({"total": paymentTotal})
    });

    if (!paymentResponse.ok) throw new Error("Payment could not be processed at this time.");

    const paymentData = await paymentResponse.json();
    console.log(paymentData);

    if (paymentData.payment_status === "SUCCEED") {
        const body = JSON.stringify({
            full_name: `${fname} ${lname}`,
            email: email,
            phone: phone,
            shipping_addr: shipping_addr,
            city: city,
            state: state,
            zip_code: zip_code,
            slug: slug,
            total_price: paymentTotal
        })
        console.log(body)

        const orderResponse = await fetch(`${API_BASE_URL}/order/`, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: body
        });
        
        if (!orderResponse.ok) throw new Error("Could not create an Order!");
        
        const orderData = await orderResponse.json();
        console.log(orderData);
        
        window.location.href = `/order-complete/${slug}`;
    }
}