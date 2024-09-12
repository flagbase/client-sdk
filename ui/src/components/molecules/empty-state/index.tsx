import React from 'react';

import { BackspaceIcon } from '@heroicons/react/24/outline';

import { Button } from '../../atoms/form/button';

export const EmptyState = ({
  title,
  description,
  cta = (
    <Button className="py-2" prefix={BackspaceIcon}>
      Go back
    </Button>
  ),
}: {
  title: string;
  description: string;
  cta: React.ReactNode;
}) => {
  return (
    <div className="text-center">
      <svg
        className="mx-auto size-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      <div className="mt-6">{cta}</div>
    </div>
  );
};
