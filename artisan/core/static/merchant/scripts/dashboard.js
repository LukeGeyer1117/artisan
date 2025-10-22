import { getCookie } from "./csrf.js";
import { showToast } from "./common.js";

const csrftoken = getCookie('csrftoken');

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;}
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
  // Get orders
  const data = await getOrders(10);
  const orders = data.orders;

  // Load analytics
  renderAnalytics(orders);

  // Plot Chart
  CreateOrdersLineChart('analytics-chart', orders);

  async function renderAnalytics(orders) {
    // Analyze the data and render it to the basic divs
    const analyzed_data = Analyze(orders);
    RenderDivs(analyzed_data);
  }

  // Make the api call to get all orders on this merchant
  async function getOrders(timeframe = 7) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${timeframe}`, {
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
      console.log(data);
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
      sales_amount += Number(order.total_price);
      if (order.status == 'complete') {completed_orders += 1;}
      if (order.status == 'pending') {pending_orders += 1;}
      if (order.status == 'approved' || order.status == 'in_progress') {incomplete_orders += 1;}
    })

    return {
      'sales_amount': sales_amount, 
      'completed_orders': completed_orders, 
      'pending_orders': pending_orders,
      'incomplete_orders': incomplete_orders,
      'custom_requests': custom_requests
    };
  }

  // add analyzed data to divs
  function RenderDivs(analyzed_data) {
    // Render the changes to the dashboard
    document.querySelector("#sales-amount-card .stat-value").innerHTML = `$${Number(analyzed_data.sales_amount)}`;
    document.querySelector("#sales-volume-card .stat-value").innerHTML = `${Number(analyzed_data.completed_orders)}`;
    document.querySelector("#pending-orders-card .stat-value").innerHTML = `${Number(analyzed_data.pending_orders)}`;
    document.querySelector("#incomplete-orders-card .stat-value").innerHTML = `${Number(analyzed_data.incomplete_orders)}`;
    document.querySelector("#custom-requests-card .stat-value").innerHTML = `${Number(analyzed_data.custom_requests)}`;
  }

  // Do chart setup
  function CreateOrdersLineChart(canvas_name, orders, chart_type='line', timeframe=7) {

    // Create the date labels
    const labels = Array.from({length: timeframe}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i)); // dates oldest to newest
      const month = (date.getMonth() + 1);
      const day = date.getDate();
      return `${month}/${day}`;
    })

    // Count order totals per day
    const order_counts = {}
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const key = `${date.getMonth() + 1}/${date.getDate()}`;
      order_counts[key] = (order_counts[key] || 0) + 1;
    })
    const orders_data = labels.map(label => order_counts[label] || 0);
    const maxValue = Math.max(orders_data);

    const ctx = document.getElementById(canvas_name);
    const config = {
      type: chart_type,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            // max: maxValue,
            ticks: {
              callback: function(value) {
                return Number.isInteger(value) ? value : null;
              },
              stepSize: 1,
            },
            beginAtZero: true
          }
        },
      },

      data: {
        labels: labels,
        datasets: [
          {
            label: "test",
            data: orders_data
          }
        ]
      },
    }

    new Chart(ctx, config);
  }
})
