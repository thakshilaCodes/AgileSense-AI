import React from 'react';
import { MessageSquare } from 'lucide-react';

const InclusiveCommunicationPage = ({ module }) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="text-blue-600" size={32} />
        <h1 className="text-3xl font-bold text-black">{module.name}</h1>
      </div>
      <p className="text-gray-700 mb-2">Facilitate equitable communication for all team members</p>
      <p className="text-xs text-gray-600">Developer: {module.developer}</p>
    </div>
  );
};

export default InclusiveCommunicationPage;