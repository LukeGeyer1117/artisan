import { getCookie } from "./csrf.js";

document.addEventListener("DOMContentLoaded", async function () {
  const slug = document.body.dataset.slug;
  const csrf = getCookie("csrftoken");
  const data = await get_policies(slug, csrf);
  const policies = data.policies;

  console.log(policies);
  
  display_policies(policies);

})

async function get_policies(slug, csrf) {
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
  return data;
}

function display_policies(policies) {
  document.querySelector('#terms-and-conditions pre').textContent = policies.terms_and_conditions;
  document.querySelector('#refund-exchange-policy pre').textContent = policies.return_policy;
  document.querySelector('#shipping-policy pre').textContent = policies.shipping_policy;
}