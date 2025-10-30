import { showToast } from "./common.js";
import { getCookie } from "./csrf.js";

const csrftoken = getCookie("csrftoken");

let API_BASE_URL;
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;
} else {
  API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("back-button-div").addEventListener("click", function () {
    window.location.href = "/inventory/";
  });

  document.getElementById("new-product-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();

    formData.append("name", form.querySelector("#product-name").value);
    formData.append("price", form.querySelector("#product-price").value);
    formData.append("description", form.querySelector("#product-description").value);
    formData.append("quantity", form.querySelector("#product-quantity").value);
    formData.append("image", form.querySelector("#product-image").files[0]);

    formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
    })

    // helpful debug logging
    if (window.location.hostname === "localhost") {
      console.log("[DEBUG] Sending product form:", Object.fromEntries(formData));
    }

    try {
        const call = `${API_BASE_URL}/product/`
        console.log(call);
      const response = await fetch(`${API_BASE_URL}/product/`, {
        method: "POST",
        body: formData,
        credentials: "include", // send session cookie
        headers: {
          "X-CSRFToken": csrftoken,
        },
      });

      // Try parsing JSON safely
      let data;
      try {
        data = await response.json();
      } catch (err) {
        data = null;
      }

      if (!response.ok) {
        // Try to show the most informative message possible
        let errorMessage = `Request failed with status ${response.status}`;
        if (data?.error) errorMessage = data.error;
        else if (data?.message) errorMessage = data.message;
        else if (response.status === 403) errorMessage = "CSRF token invalid or missing.";
        else if (response.status === 404) errorMessage = "Endpoint not found. Check URL routing.";
        else if (response.status === 500) errorMessage = "Server error — check Django logs.";

        showToast(errorMessage, 4000);
        throw new Error(errorMessage);
      }

      // Success path
      showToast("Product created successfully!", 3000);
      window.location.href = "/inventory/";
    } catch (error) {
      // Network errors or fetch-level issues
      console.error("[Product creation error]", error);

      const message = error.message.includes("NetworkError")
        ? "Network error — is your backend running?"
        : error.message;

      showToast(`Product creation failed: ${message}`, 5000);
      alert(`Product creation failed: ${message}`);
    }
  });
});
