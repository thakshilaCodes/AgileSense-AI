import React, { useState, useEffect } from 'react';
import { Users, User, CheckCircle, FileText, LayoutDashboard } from 'lucide-react';
import axios from 'axios';
import DeveloperProfileView from '../components/DeveloperProfileView';
import ProjectManagerDashboard from './ProjectManagerDashboard';
import { getCurrentUser } from '../utils/userContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ExpertiseRecommendationPage = ({ module }) => {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'dashboard'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictedCategory, setPredictedCategory] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [submitterEmailForProfile, setSubmitterEmailForProfile] = useState(null);
  const [assigningIssue, setAssigningIssue] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Get logged-in user on component mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setPredictedCategory('');
    setRecommendations([]);

    if (!description.trim()) {
      setError('Please enter an issue description.');
      return;
    }

    try {
      setLoading(true);
      // Create issue - this will predict category and get top 3 experts
      const issueRes = await axios.post(`${API_BASE_URL}/api/expertise/issues`, {
        title: title || `Issue in ${new Date().toLocaleDateString()}`,
        description,
        submittedBy: currentUser?.email || 'user@example.com',
        submittedByName: currentUser?.name || 'Current User',
        priority: 'medium',
      });

      const issue = issueRes.data;
      setPredictedCategory(issue.category);
      
      // Extract top experts from issue
      if (issue.topExperts) {
        // Fetch full developer profiles for the top experts
        const expertEmails = issue.topExperts.map(e => e.email);
        const developers = [];
        for (const email of expertEmails) {
          try {
            const devRes = await axios.get(`${API_BASE_URL}/api/expertise/developers/${email}`);
            developers.push(devRes.data);
          } catch (err) {
            console.error(`Failed to fetch developer ${email}:`, err);
          }
        }
        setRecommendations(developers);
      }

      setSuccessMessage('Issue created successfully! It will appear on the Project Manager dashboard.');
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Clear form
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignIssue = async (developerEmail, developerName) => {
    if (!title.trim() && !description.trim()) {
      setError('Please provide issue title or description to assign.');
      return;
    }

    try {
      setAssigningIssue({ ...assigningIssue, [developerEmail]: true });
      setError('');
      setSuccessMessage('');

      // Generate a unique issue ID
      const issueId = `ISSUE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the issue object
      const issue = {
        id: issueId,
        title: title || `Issue in ${predictedCategory}`,
        description: description,
        category: predictedCategory,
        status: 'pending',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        submittedBy: currentUser?.email || null,
      };

      // Assign issue to developer
      await axios.post(`${API_BASE_URL}/api/expertise/assign-issue`, {
        developerEmail: developerEmail,
        issue: issue,
      });

      setSuccessMessage(`Issue assigned to ${developerName}! Check their profile to see it.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to assign issue. Please try again.');
    } finally {
      setAssigningIssue({ ...assigningIssue, [developerEmail]: false });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Users className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-black">{module.name}</h1>
            <p className="text-xs text-gray-600">Developer: {module.developer}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'submit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Submit Issue
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'dashboard'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 inline mr-2" />
          Project Manager Dashboard
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <ProjectManagerDashboard />
      ) : (
        <>
    
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4 max-w-3xl"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issue Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Eg: API returns 500 error when updating user profile"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issue Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste the detailed Jira issue description here..."
          />
        </div>


        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Analyzing...' : 'Predict & Recommend Experts'}
        </button>
      </form>

      {predictedCategory && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 max-w-3xl space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Predicted category</p>
              <p className="text-xl font-semibold text-blue-700">{predictedCategory}</p>
            </div>
            {currentUser?.email && (
              <button
                onClick={() => setSubmitterEmailForProfile(currentUser.email)}
                className="inline-flex items-center px-3 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                View My Profile
              </button>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Recommended developers for this issue
            </p>

            {recommendations.length === 0 ? (
              <p className="text-sm text-gray-500">
                No developer profiles found yet. Add profiles through the backend API to see
                recommendations.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendations.map((dev) => {
                  const expertiseScore = dev.expertise?.[predictedCategory] ?? 0;
                  const isAssigning = assigningIssue[dev.email] || false;
                  return (
                    <div
                      key={dev.email}
                      className="border border-gray-200 rounded-lg p-4 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <p className="font-semibold text-gray-900 text-sm">{dev.name}</p>
                        </div>
                        <span className="text-xs font-medium text-blue-600">
                          {(expertiseScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{dev.email}</p>
                      <div className="text-xs space-y-1 mb-3">
                        <p>
                          <span className="font-medium">Expertise score:</span>{' '}
                          {expertiseScore.toFixed(2)}
                        </p>
                        <p>
                          <span className="font-medium">Jira issues solved:</span>{' '}
                          {dev.jiraIssuesSolved?.[predictedCategory] ?? 0}
                        </p>
                        <p>
                          <span className="font-medium">GitHub commits:</span>{' '}
                          {dev.githubCommits?.[predictedCategory] ?? 0}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-gray-200 space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignIssue(dev.email, dev.name);
                          }}
                          disabled={isAssigning}
                          className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {isAssigning ? 'Assigning...' : 'Assign Issue'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeveloper(dev.email);
                          }}
                          className="w-full text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors"
                        >
                          View Profile →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

          {/* Developer Profile Modal */}
          {selectedDeveloper && (
            <DeveloperProfileView
              developerEmail={selectedDeveloper}
              onClose={() => setSelectedDeveloper(null)}
            />
          )}

          {/* Submitter Profile Modal */}
          {submitterEmailForProfile && (
            <DeveloperProfileView
              developerEmail={submitterEmailForProfile}
              onClose={() => setSubmitterEmailForProfile(null)}
              isSubmitter={true}
              submitterName={currentUser?.name}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ExpertiseRecommendationPage;