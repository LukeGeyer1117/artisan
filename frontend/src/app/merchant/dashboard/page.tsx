"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = `${typeof window !== 'undefined' ? window.location.protocol + "//" + window.location.hostname + ":8000/api" : ""}`;

import DashboardCard from "@/components/DashboardCard";
import TableHolder from "@/components/TableHolder"; 
import Table from "@/components/Table";
import CustomerSummaryCard from "@/components/CustomerSummaryCard";

export default function DashboardPage() {

  type Order = {
    id: number;
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    subtotal?: string;
    date?: string;
    status?: string;
  };

  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOrderClick = (id: number) => {
    const order = activeOrders.find((o) => o.id === id);
    if (order) {
      setSelectedOrder(order);
    }
  };

  // Need to get orders first
  useEffect(() => {
    async function fetchActiveOrders() {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/active/`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error("Failed to fetch active orders");

        const result = await response.json();

        // Map to desired format
        const mappedOrders = result.orders.map((order: any) => ({
          id: order.id,
          name: order.customer_name,
          email: order.customer_email,
          data: order.created_at.slice(0, 10), 
          status: order.status,
        }));

        setActiveOrders(mappedOrders);

      } catch (error) {
        alert('Could not fetch active orders!');
        console.error(error);
      }
    }

    fetchActiveOrders();
  }, []);

  useEffect(() => {
    console.log("Active orders updated:", activeOrders);
  }, [activeOrders]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Merchant Welcome Message */}
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Welcome, Merchant!</h1>

      {/* Main dashboard sections */}
      <div className="space-y-8">
        {/* Orders */}
        <DashboardCard id="orders-section">
          <h2 className="text-2xl font-semibold mb-4">Orders to Complete</h2>

          <TableHolder id="orders-table-holder">

            <Table id="orders-table" headers={['Name', 'Email', 'Order Placed', 'Status']}>
              {activeOrders.map((order) => (
                <tr key={order.id} className="border-t cursor-pointer hover:bg-gray-100" onClick={() => handleOrderClick(order.id)}>
                  <td className="p-3">{order.name}</td>
                  <td className="p-3">{order.email}</td>
                  <td className="p-3">{order.date}</td>
                  <td className="p-3 capitalize">{order.status}</td>
                </tr>
              ))}
            </Table>
          </TableHolder>

          {/* Conditionally render the summary card ic selectedOrder is not null */}

          {selectedOrder && (
            <CustomerSummaryCard
              name={selectedOrder.name}
              contact={selectedOrder.email}
              address={selectedOrder.address}
              city={selectedOrder.city}
              state={selectedOrder.state}
              zip={selectedOrder.zip}
              subtotal={selectedOrder.subtotal}
              orderDate={selectedOrder.date}
              status={selectedOrder.status}
              onStatusChange={(newStatus) =>
                setSelectedOrder({ ...selectedOrder, status: newStatus })
              }
            />
          )}
        </DashboardCard>

        {/* Custom Orders */}
        <DashboardCard id="custom-section">
          <h2 className="text-2xl font-semibold mb-2">Custom Requests</h2>
          <p className="text-gray-600">No Custom Requests</p>
        </DashboardCard>

        {/* Inventory Management */}
        <DashboardCard id="inventory-section">
          <h2 className="text-2xl font-semibold mb-2">Inventory</h2>
          <p className="text-gray-600 mb-4">Add, update, or remove products from your shop.</p>
          <div id="inventory-items-flex" className="flex flex-wrap gap-4">
            <div
              id="new-item-box"
              className="border-2 border-dashed border-indigo-300 rounded-xl p-6 flex flex-col items-center justify-center text-indigo-600 hover:bg-indigo-50 cursor-pointer transition"
            >
              <h3 className="text-4xl font-bold mb-2"></h3>
              <h4 className="text-lg font-medium">Add a New Item</h4>
            </div>
          </div>
        </DashboardCard>
      </div>
    </main>
  );
}
