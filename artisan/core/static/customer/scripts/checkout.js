import { getCookie } from "./csrf.js";
import { GetProduct, showToast } from "./common.js";

const csrftoken = getCookie('csrftoken');

let gwTokenResolve;
let gwTokenReject;

const gwTokenPromise = new Promise((resolve, reject) => {
    gwTokenResolve = resolve;
    gwTokenReject = reject;
})

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

const slug = document.body.dataset.slug;
const STATES = {'AL':'ALABAMA','AK':'ALASKA','AZ':'ARIZONA','AR':'ARKANSAS','CA':'CALIFORNIA','CO':'COLORADO','CT':'CONNECTICUT','DE':'DELAWARE','FL':'FLORIDA','GA':'GEORGIA','HI':'HAWAII','ID':'IDAHO','IL':'ILLINOIS','IN':'INDIANA','IA':'IOWA','KS':'KANSAS','KY':'KENTUCKY','LA':'LOUISIANA','ME':'MAINE','MD':'MARYLAND','MA':'MASSACHUSETTS','MI':'MICHIGAN','MN':'MINNESOTA','MS':'MISSISSIPPI','MO':'MISSOURI','MT':'MONTANA','NE':'NEBRASKA','NV':'NEVADA','NH':'NEW HAMPSHIRE','NJ':'NEW JERSEY','NM':'NEW MEXICO','NY':'NEW YORK','NC':'NORTH CAROLINA','ND':'NORTH DAKOTA','OH':'OHIO','OK':'OKLAHOMA','OR':'OREGON','PA':'PENNSYLVANIA','RI':'RHODE ISLAND','SC':'SOUTH CAROLINA','SD':'SOUTH DAKOTA','TN':'TENNESSEE','TX':'TEXAS','UT':'UTAH','VT':'VERMONT','VA':'VIRGINIA','WA':'WASHINGTON','WV':'WEST VIRGINIA','WI':'WISCONSIN','WY':'WYOMING'};

document.addEventListener("DOMContentLoaded", async function () {
    // Immediately attach the token-ready event listener
    window.addEventListener('gw:token-ready', () => {
        const token = document.getElementById('gw-token')?.value;

        if (!token) {
            gwTokenReject(new Error('gw:token-ready fired but token missing'));
            return;
        }

        gwTokenResolve(token);
    }, { once: true });

    // Get the total amount from the session info
    let response = await fetch(`${API_BASE_URL}/checkout/${slug}/`, {
        method: 'GET',
        headers: {
            'X-CSRFToken': csrftoken
        }
    })

    if (!response.ok) throw new Error("Couldn't get checkout total");

    let data = await response.json();

    const total = data.total;
    const products = data.products;
    const payment_id = data.payment;

    summarize(total, products)

    document.getElementById('amount').value = total;

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
        checkout_button.setAttribute('disabled', true);
        checkout_button.innerHTML = `<span class="loading loading-spinner loading-sm"></span>`;
        checkout(payment_id);
    })
})

function formListen() {
    const checkout_field_ids = [
        'first-name', 'last-name', 'email', 'phone', 'street-address',
        'city', 'state', 'zip-code', 'card-number', 'exp-date', 'exp-year', 
        'cvc'
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

async function checkout(payment_id) {

    const gatewayForm =
        document.getElementById('gateway-card-container')?.closest('form');

    if (!gatewayForm) {
        throw new Error('Gateway form not found');
    }

    // 🔥 This is the missing piece
    gatewayForm.requestSubmit();

    try {
        const checkout_field_ids = {
            'first-name': '', 'last-name': '', 'email': '', 'phone': '', 'street-address': '',
            'city': '', 'state': '', 'zip-code': '', 'card-number': '', 'exp-date': '', 'exp-year': '', 
            'cvc': '', 'billing-fname': '', 'billing-lname': '', 'billing-zip': '' 
        }

        for (const field in checkout_field_ids) {
            checkout_field_ids[field] = document.getElementById(field).value;
        }

        let ok = true;
        for (const field in checkout_field_ids) {
            if (checkout_field_ids[field] == '') {
                showToast(`Missing field: ${field}`, 'error');
                ok = false;
                const checkout_button = document.getElementById('checkout-btn');
                checkout_button.removeAttribute('disabled');
                checkout_button.innerHTML = `Complete Payment`;
            }
        }
        if (!ok) { return; }

        console.log('here1');

        const token = await withTimeout(gwTokenPromise, 10000);

        // Once the token has been created, create the payload and 
        // request that the server attempt the payment
        const billing = {
            "first_name": checkout_field_ids['first-name'],
            "last_name": checkout_field_ids['last-name'],
            "address": checkout_field_ids['street-address'],
            "city": checkout_field_ids['city'],
            "state": checkout_field_ids['state'],
            "zip": checkout_field_ids['billing-zip'],
            "country": 'USA',
            "email": checkout_field_ids['email'],
        }

        const order = {
            "full_name": `${checkout_field_ids["first-name"]} ${checkout_field_ids["last-name"]}`,
            "email": checkout_field_ids['email'],
            "phone": checkout_field_ids['phone'],
            "shipping_addr": checkout_field_ids['street-address'],
            "city": checkout_field_ids['city'],
            "state": checkout_field_ids['state'],
            "zip_code": checkout_field_ids['zip-code'],
        }

        const payload = {
            "payment_id": localStorage.getItem('payment_id'),
            "token": token,
            "billing": billing,
            "order": order,
            "slug": slug
        }

        console.log('here2');

        const response = await fetch(`${API_BASE_URL}/checkout/${slug}/`, {
            method: 'PATCH',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            showToast("Payment Failed", 'error');
            throw new Error("Couldn't process payment.");
        } else {
            window.location.href = `/order-complete/${slug}/`;
        }



    } catch (err) {
        console.error(err);
        showToast(err.message, 'error');

        const checkout_button = document.getElementById('checkout-btn');
        checkout_button.disabled = false;
        checkout_button.innerText = 'Complete Payment';
    }
}

async function summarize(total, products) {
    const order_items_list = document.getElementById('order-items-list');
    for (const [id, quantity] of Object.entries(products)) {

        const product_object = await GetProduct(id);
        
        const prod = document.createElement('div');
        prod.className = `flex items-center gap-4`;
        prod.innerHTML = `
            <img src='${product_object.image}' style="width: 5rem; height: 5rem; object-fit: cover;">

            <div class="flex-1">
                <p class="font-medium text-lg">${product_object.name}</p>
                <p class="text-sm opacity-60">QTY: ${quantity}</p>
            </div>

            <p class="font-semibold text-lg text-right">$${product_object.price * quantity}</p>
        `

        order_items_list.appendChild(prod);

        document.getElementById('subtotal').textContent = `$${total}`;

    }
}

function withTimeout(promise, ms=10000) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Tokenization timed out')), ms))
    ]);
}