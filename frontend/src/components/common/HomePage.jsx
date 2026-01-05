import React from 'react';
import { Heart, Users, FileText, MessageSquare, ChevronRight } from 'lucide-react';

const HomePage = ({ setActiveModule }) => {
  const modules = [
    {
      id: 'emotion-monitoring',
      name: 'Emotion Monitoring',
      icon: Heart,
      developer: 'Fonseka A.A.T.N.',
    },
    {
      id: 'expertise-recommendation',
      name: 'Expertise Recommendation',
      icon: Users,
      developer: 'Amarasinghe C.N.',
    },
    {
      id: 'requirement-tracker',
      name: 'Requirement & Sprint Tracker',
      icon: FileText,
      developer: 'Vithana P.I',
    },
    {
      id: 'inclusive-communication',
      name: 'Inclusive Communication',
      icon: MessageSquare,
      developer: 'M.B.H. De Silva',
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to AgileSense-AI
        </h1>
        <p className="text-gray-600 mt-2">
          Emotion-Aware Agile System for Enhanced Team Collaboration
        </p>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className="bg-white border-2 border-blue-100 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Icon className="text-blue-600" size={28} />
                  <h2 className="text-lg font-semibold text-gray-800">
                    {module.name}
                  </h2>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>

              <p className="text-sm text-gray-600">
                Developer: {module.developer}
              </p>
            </div>
          );
        })}
      </div>

      {/* Architecture */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">System Architecture</h2>
        <p className="text-gray-600 mb-4">
          This system uses a microservices architecture with independent
          components for emotion monitoring, expertise recommendation,
          requirement tracking, and inclusive communication.
        </p>

        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>
            <strong>API Gateway:</strong> Synchronous REST endpoints
          </li>
          <li>
            <strong>Message Broker:</strong> Asynchronous event processing
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
