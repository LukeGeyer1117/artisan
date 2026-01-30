import { getCookie } from "./csrf.js";
import { showToast, daisyColor } from "./common.js";

const csrftoken = getCookie('csrftoken');

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;}
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

// Get some of the base styling properties
const root = document.documentElement;
const linecolor1 = getComputedStyle(root).getPropertyValue('--line-color-1');
const linecolor2 = getComputedStyle(root).getPropertyValue('--line-color-2');
const lineTransparency = '73';

// track the chart instance
let chartInstance = null;

document.addEventListener('DOMContentLoaded', async function () {

  // Do initial page setup - Target 1 Week.
  PageInit(7);

  // Listen for select to change, reload page data
  const timeFrameSelect = document.querySelector('#analytics-card .chart-header select');
  timeFrameSelect.addEventListener('change', (event) => {
    const nTimeframe =  event.target.value;
    PageInit(Number(nTimeframe));
  })

  // Initial Page setup, with order fetch, graph setup, etc.
  async function PageInit(timeframe=7) {
    const data = await getOrders(timeframe);
    const orders = data.orders;

    if (orders.length > 3000) {
      showToast('Only showing 3000 most recent orders', "info");
    }

    renderAnalytics(orders);
    CreateOrdersNRevenueLineChart('sales-chart', 'revenue-chart', orders, undefined, timeframe);
  }

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
        showToast(`Couldn't get orders. Status: ${response.status}`, "error");
        throw new Error(`Couldn't get orders!`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      showToast(`Could not get orders. Abandoning attempt...`, "error");
      throw error; // rethrow to let caller handle it
    }
  }

  // Analyze the results
  function Analyze(orders) {
    console.log(orders);
    var sales_amount = 0;
    var completed_orders = 0;
    var pending_orders = 0;
    var incomplete_orders = 0;
    var custom_requests = 0;

    orders.forEach(order => {
      sales_amount += Number(order.total_price);
      if (order.status == 'completed') {completed_orders += 1;}
      if (order.status == 'pending') {pending_orders += 1;}
      if (order.status == 'approved' || order.status == 'in_progress') {incomplete_orders += 1;}
    })

    console.log(`Sales: ${sales_amount}, Completed: ${completed_orders}, Pending: ${pending_orders}, Incomplete: ${incomplete_orders}`);

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
    document.querySelector("#sales-amount .stat-value").innerHTML = `$${Number(analyzed_data.sales_amount)}`;
    document.querySelector("#sales-volume .stat-value").innerHTML = `${Number(analyzed_data.completed_orders)}`;
    document.querySelector("#pending-orders .stat-value").innerHTML = `${Number(analyzed_data.pending_orders)}`;
    document.querySelector("#incomplete-orders .stat-value").innerHTML = `${Number(analyzed_data.incomplete_orders)}`;
    document.querySelector("#custom-requests .stat-value").innerHTML = `${Number(analyzed_data.custom_requests)}`;
  }

  let salesChartInstance = null;
  let revenueChartInstance = null;

  function CreateOrdersNRevenueLineChart(
    sales_canvas_name,
    revenue_canvas_name,
    orders,
    chart_type = 'line',
    timeframe = 7
  ) {
    // Create date labels (oldest → newest)
    const labels = Array.from({ length: timeframe }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (timeframe - i - 1));
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    // Count orders & revenue per day
    const order_counts = {};
    const revenue_counts = {};

    orders.forEach(order => {
      const date = new Date(order.created_at);
      const key = `${date.getMonth() + 1}/${date.getDate()}`;

      order_counts[key] = (order_counts[key] || 0) + 1;
      revenue_counts[key] =
        (revenue_counts[key] || 0) + Number(order.total_price);
    });

    const orders_data = labels.map(label => order_counts[label] || 0);
    const revenue_data = labels.map(label => revenue_counts[label] || 0);

    /* ======================
      SALES / ORDERS CHART
      ====================== */

    const salesCtx = document.getElementById(sales_canvas_name);

    if (salesChartInstance) {
      salesChartInstance.destroy();
    }

    const primaryLineColor = daisyColor('--color-primary', 0.9);
    console.log(`PrimaryLinecolor: ${primaryLineColor}`)

    salesChartInstance = new Chart(salesCtx, {
      type: chart_type,
      data: {
        labels,
        datasets: [
          {
            label: 'Orders',
            data: orders_data,
            borderColor: primaryLineColor,
            tension: 0.25,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { display: false }
          }
        }
      }
    });

    /* ======================
      REVENUE CHART
      ====================== */

    const revenueCtx = document.getElementById(revenue_canvas_name);

    if (revenueChartInstance) {
      revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(revenueCtx, {
      type: chart_type,
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenue_data,
            borderColor: primaryLineColor,
            tension: 0.25,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            grid: { display: false },
            ticks: {
              callback: value => `$${value}`
            }
          }
        }
      }
    });
  }

})
