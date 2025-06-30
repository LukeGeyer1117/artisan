import React from 'react';

type TableProps = {
  headers: string[];
  children: React.ReactNode;
  id?: string;
};

export default function Table({ headers, children, id }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        id={id}
        className="w-full text-sm border border-gray-200 bg-white rounded-md"
      >
        <thead className="bg-indigo-100 text-gray-700">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="p-3 text-left font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
