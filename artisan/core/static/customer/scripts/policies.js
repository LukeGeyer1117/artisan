import { getCookie } from "./csrf.js";

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener("DOMContentLoaded", async function () {
  const slug = document.body.dataset.slug;
  const csrf = getCookie("csrftoken");
  const policies = await get_policies(slug, csrf);

  display_policies(policies);

})

async function get_policies(slug, csrf) {
  // Check if we have cached the policies
  const cacheKey = `policies_${slug}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { policies, deathDate } = JSON.parse(cached);
    const isExpired = (deathDate - Date.now()) < 0;

    if (!isExpired) {
      console.log(`Found policies locally`);
      return policies;
    }
  }

  const response = await fetch(`${API_BASE_URL}/policy/${slug}/`, {
    method: 'GET',
    headers: {
      'X-CSRFToken': csrf,
    },
  });

  if (!response.ok) {
    throw new Error("Couldn't get policy");
  }

  const data = await response.json();
  const policies = data.policies;
  localStorage.setItem(cacheKey, JSON.stringify({
    policies,
    deathDate: Date.now() + policies.ttl,
  }))
  console.log(`Stored policies locally.`);
  return data.policies;
}

function display_policies(policies) {
  document.querySelector('#terms-and-conditions pre').textContent = policies.terms_and_conditions;
  document.querySelector('#refund-exchange-policy pre').textContent = policies.return_policy;
  document.querySelector('#shipping-policy pre').textContent = policies.shipping_policy;
}