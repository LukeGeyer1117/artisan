"use client";

type CustomerSummaryCardProps = {
  name: string;
  contact: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  subtotal?: string;
  orderDate?: string;
  status?: string;
  onStatusChange?: (value: string) => void;
};

export default function CustomerSummaryCard({
  name,
  contact,
  address,
  city,
  state,
  zip,
  subtotal,
  orderDate,
  status = 'pending',
  onStatusChange,
}: CustomerSummaryCardProps) {
  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Info</h3>
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <th className="py-1 pr-2 text-left font-medium">Customer Name:</th>
            <td colSpan={2}>{name}</td>
          </tr>
          <tr>
            <th className="py-1 pr-2 text-left font-medium">Email/Phone#:</th>
            <td colSpan={2}>{contact}</td>
          </tr>
          <tr>
            <th className="py-1 pr-2 text-left font-medium">Shipping Address:</th>
            <td colSpan={2}>{address}</td>
          </tr>
          <tr>
            <th className="py-1 pr-2 text-left font-medium">City:</th>
            <td colSpan={2}>{city}</td>
          </tr>
          <tr>
            <th className="py-1 pr-2 text-left font-medium">State:</th>
            <td colSpan={2}>{state}</td>
          </tr>
          <tr>
            <th className="py-1 pr-2 text-left font-medium">ZipCode:</th>
            <td colSpan={2}>{zip}</td>
          </tr>
          <tr>
            <td className="py-1 pr-2">{subtotal}</td>
            <td className="py-1 pr-2">{orderDate}</td>
            <td className="py-1">
              <select
                id="order-status-select"
                name="order-status"
                className="w-full border rounded px-2 py-1"
                value={status}
                onChange={(e) => onStatusChange?.(e.target.value)}
              >
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="completed">completed</option>
                <option value="denied">denied</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
