import React from 'react';

const ModulePage = ({ module }) => {
  const Icon = module.icon;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon className="text-blue-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold">{module.name}</h1>
            {module.developer && (
              <p className="text-sm text-gray-600">
                Developer: {module.developer}
              </p>
            )}
          </div>
        </div>

        <p className="text-gray-700 mb-4">
          This module is under development. Component-specific features will be
          implemented here.
        </p>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Development Guidelines</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Work in your assigned feature folder</li>
            <li>Follow the microservices architecture pattern</li>
            <li>Use the message broker for inter-module communication</li>
            <li>Maintain consistent UI design (blue, white, black)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModulePage;
