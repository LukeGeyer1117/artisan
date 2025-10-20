import { getCookie } from "./csrf.js";
import { showToast } from "./common.js";

const csrftoken = getCookie('csrftoken');

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;}
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', function () {

  // Load analytics
  renderAnalytics();

  async function renderAnalytics() {
    const data = await getOrders();
    const analyzed_data = Analyze(data.orders);
    
    // Render the changes to the dashboard
    document.querySelector("#sales-amount-card .stat-value").innerHTML = `$${Number(analyzed_data.sales_amount)}`;
    document.querySelector("#sales-volume-card .stat-value").innerHTML = `${Number(analyzed_data.completed_orders)} Orders`
  }

  // Make the api call to get all orders on this merchant
  async function getOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrftoken
        }
      });

      if (!response.ok) {
        showToast(`Couldn't get orders. Status: ${response.status}`);
        throw new Error(`Couldn't get orders!`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      showToast(`Could not get orders. Abandoning attempt...`);
      throw error; // rethrow to let caller handle it
    }
  }

  // Analyze the results
  function Analyze(orders) {
    var sales_amount = 0;
    var completed_orders = 0;
    var pending_orders = 0;
    var incomplete_orders = 0;
    var custom_requests = 0;

    orders.forEach(order => {
      sales_amount += order.total_price;
      if (order.status == 'complete') {completed_orders += 1;}
      if (order.status == 'pending') {pending_orders += 1;}
      if (order.status in ['approved', 'in_progress']) {incomplete_orders += 1;}
    })

    return {
      'sales_amount': sales_amount, 
      'completed_orders': completed_orders, 
      'pending_orders': pending_orders,
      'incomplete_orders': incomplete_orders,
      'custom_requests': custom_requests
    };
  }
})
