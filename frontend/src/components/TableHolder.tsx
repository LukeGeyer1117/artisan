import React from 'react';

type TableHolderProps = {
  children: React.ReactNode,
  id?: string;
};

export default function TableHolderProps({ children, id }: TableHolderProps) {
  return (
    <section
      id={id}
      className='overflow-x-auto'
    >
      <div className='text-gray-600'>{children}</div>
    </section>
  )
}