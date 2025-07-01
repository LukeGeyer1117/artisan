import React from 'react';

type DashboardCardProps = {
  children: React.ReactNode,
  id?: string;
};

export default function DashboardCard({ children, id }: DashboardCardProps) {
  return (
    <section
      id={id}
      className='bg-white rounded-x1 shadow-md p-6'
    >
      <div className='text-gray-600 flex flex-col gap-5'>{children}</div>
    </section>
  )
}