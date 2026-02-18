import { getCookie } from "./csrf.js";
import { showToast, daisyColor } from "./common.js";

/* =========================================================
   CONFIG
========================================================= */

const csrftoken = getCookie("csrftoken");

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? `${window.location.protocol}//${window.location.hostname}:8000/api`
    : `${window.location.protocol}//${window.location.hostname}/api`;

const MAX_ORDERS_WARNING = 3000;

/* =========================================================
   DASHBOARD CONTROLLER
========================================================= */

class Dashboard {
  constructor() {
    this.salesChart = null;
    this.revenueChart = null;

    this.timeFrameSelect = document.getElementById("timeframe");

    this.init();
  }

  async init() {
    this.attachEvents();
    await this.loadPage(7);
  }

  attachEvents() {
    this.timeFrameSelect.addEventListener("change", (e) => {
      this.loadPage(Number(e.target.value));
    });
  }

  async loadPage(timeframe) {
    try {
      const { orders } = await API.getOrders(timeframe);

      if (orders.length > MAX_ORDERS_WARNING) {
        showToast("Only showing 3000 most recent orders", "info");
      }

      const analytics = Analytics.analyze(orders);

      Renderer.renderStats(analytics);
      this.renderCharts(orders, timeframe);
    } catch (err) {
      console.error(err);
    }
  }

  renderCharts(orders, timeframe) {
    const hasData = orders && orders.length > 0;

    if (!hasData) {
      this.destroyCharts();
      this.showNoDataMessage("sales-chart");
      this.showNoDataMessage("revenue-chart");
      return;
    }

    // If data exists, restore canvases in case message was shown before
    this.restoreCanvas("sales-chart");
    this.restoreCanvas("revenue-chart");

    const { labels, ordersData, revenueData } =
      Analytics.groupByDay(orders, timeframe);

    const primaryColor = daisyColor("--color-primary", 0.9);

    this.salesChart = ChartFactory.createOrReplace(
      this.salesChart,
      "sales-chart",
      "bar",
      {
        labels,
        label: "Orders",
        data: ordersData,
        backgroundColor: `${primaryColor}9e`,
        yStepSize: 1
      }
    );

    this.revenueChart = ChartFactory.createOrReplace(
      this.revenueChart,
      "revenue-chart",
      "line",
      {
        labels,
        label: "Revenue",
        data: revenueData,
        borderColor: primaryColor,
        fillColor: `${primaryColor}4e`,
        currency: true
      }
    );
  }

  destroyCharts() {
    if (this.salesChart) {
      this.salesChart.destroy();
      this.salesChart = null;
    }

    if (this.revenueChart) {
      this.revenueChart.destroy();
      this.revenueChart = null;
    }
  }

  showNoDataMessage(canvasId) {
    const canvas = document.getElementById(canvasId);
    const parent = canvas.parentElement;

    canvas.style.display = "none";

    let message = parent.querySelector(".no-data-message");

    if (!message) {
      message = document.createElement("div");
      message.className =
        "no-data-message flex items-center justify-center h-full text-base-content/60 text-center p-4";
      message.textContent =
        "No data for the requested timeframe. Please widen your search.";

      parent.appendChild(message);
    }
  }

  restoreCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const parent = canvas.parentElement;

    const message = parent.querySelector(".no-data-message");
    if (message) message.remove();

    canvas.style.display = "block";
  }


}

/* =========================================================
   API LAYER
========================================================= */

const API = {
  async getOrders(timeframe = 7) {
    const response = await fetch(
      `${API_BASE_URL}/orders/${timeframe}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "X-CSRFToken": csrftoken }
      }
    );

    if (!response.ok) {
      showToast(
        `Couldn't get orders. Status: ${response.status}`,
        "error"
      );
      throw new Error("Failed to fetch orders");
    }

    return response.json();
  }
};

/* =========================================================
   ANALYTICS
========================================================= */

const Analytics = {
  analyze(orders) {
    return orders.reduce(
      (acc, order) => {
        const price = Number(order.total_price) || 0;

        acc.salesAmount += price;

        switch (order.status) {
          case "completed":
            acc.completed++;
            break;
          case "pending":
            acc.pending++;
            break;
          case "approved":
          case "in_progress":
            acc.incomplete++;
            break;
        }

        return acc;
      },
      {
        salesAmount: 0,
        completed: 0,
        pending: 0,
        incomplete: 0,
        customRequests: 0
      }
    );
  },

  groupByDay(orders, timeframe) {
    const labels = Array.from({ length: timeframe }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (timeframe - i - 1));
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const orderCounts = {};
    const revenueCounts = {};

    orders.forEach((order) => {
      const d = new Date(order.created_at);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;

      orderCounts[key] = (orderCounts[key] || 0) + 1;
      revenueCounts[key] =
        (revenueCounts[key] || 0) + Number(order.total_price);
    });

    return {
      labels,
      ordersData: labels.map((l) => orderCounts[l] || 0),
      revenueData: labels.map((l) => revenueCounts[l] || 0)
    };
  }
};

/* =========================================================
   RENDERING
========================================================= */

const Renderer = {
  renderStats(data) {
    this.set("#sales-amount .stat-value", formatCurrency(data.salesAmount));
    this.set("#sales-volume .stat-value", data.completed);
    this.set("#pending-orders .stat-value", data.pending);
    this.set("#incomplete-orders .stat-value", data.incomplete);
    this.set("#custom-requests .stat-value", data.customRequests);
  },

  set(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }
};

/* =========================================================
   CHART FACTORY
========================================================= */

const ChartFactory = {
  createOrReplace(instance, canvasId, type, config) {
    if (instance) instance.destroy();

    const ctx = document.getElementById(canvasId);

    return new Chart(ctx, {
      type,
      data: {
        labels: config.labels,
        datasets: [
          {
            label: config.label,
            data: config.data,
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
            tension: 0.25,
            fill: config.fillColor
              ? {
                  target: "origin",
                  above: config.fillColor
                }
              : false
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
              stepSize: config.yStepSize,
              callback: config.currency
                ? (v) => formatCurrency(v)
                : undefined
            }
          }
        }
      }
    });
  }
};

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value) {
  return `$${Number(value).toLocaleString()}`;
}

/* =========================================================
   BOOTSTRAP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  new Dashboard();
});
