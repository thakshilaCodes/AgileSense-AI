import React, { useState, useEffect } from 'react';
import { X, User, Mail, TrendingUp, CheckCircle, Clock, AlertCircle, FileCheck } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const DeveloperProfileView = ({ developerEmail, onClose, isSubmitter = false, submitterName = null }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pendingIssues, setPendingIssues] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned', 'pending', or 'resolved'
  const [resolvingIssue, setResolvingIssue] = useState({});
  const [completingIssue, setCompletingIssue] = useState({});

  const categories = ['API', 'Authentication', 'Database', 'DevOps', 'Documentation', 'Performance', 'Security', 'Testing', 'UI'];

  useEffect(() => {
    fetchProfile();
    fetchAssignedIssues();
  }, [developerEmail]);

  useEffect(() => {
    if (selectedCategory) {
      fetchPendingIssues(selectedCategory);
      fetchResolvedIssues(selectedCategory);
    } else {
      setPendingIssues([]);
      setResolvedIssues([]);
    }
  }, [selectedCategory, developerEmail]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/expertise/developers/${developerEmail}/detail`);
      setProfile(response.data);
    } catch (err) {
      // If profile doesn't exist and this is a submitter, try to create it
      if (isSubmitter && err.response?.status === 404 && submitterName) {
        try {
          await axios.post(`${API_BASE_URL}/api/expertise/create-submitter-profile`, null, {
            params: { email: developerEmail, name: submitterName }
          });
          // Retry fetching
          const retryResponse = await axios.get(`${API_BASE_URL}/api/expertise/developers/${developerEmail}/detail`);
          setProfile(retryResponse.data);
        } catch (createErr) {
          setError('Failed to create or load developer profile');
        }
      } else {
        setError(err.response?.data?.detail || 'Failed to load developer profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingIssues = async (category) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/expertise/developers/${developerEmail}/pending-issues/${category}`
      );
      setPendingIssues(response.data || []);
    } catch (err) {
      setPendingIssues([]);
    }
  };

  const fetchResolvedIssues = async (category) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/expertise/developers/${developerEmail}/resolved-issues/${category}`
      );
      setResolvedIssues(response.data || []);
    } catch (err) {
      setResolvedIssues([]);
    }
  };

  const fetchAssignedIssues = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/expertise/developers/${developerEmail}/issues`
      );
      setAssignedIssues(response.data || []);
    } catch (err) {
      setAssignedIssues([]);
    }
  };

  const handleMarkAsDone = async (issueId) => {
    try {
      setCompletingIssue({ ...completingIssue, [issueId]: true });
      
      await axios.post(`${API_BASE_URL}/api/expertise/issues/${issueId}/complete`, null, {
        params: { developerEmail: developerEmail }
      });

      // Refresh assigned issues and profile
      await fetchAssignedIssues();
      await fetchProfile();
      
      // If category is selected, refresh those too
      if (selectedCategory) {
        await fetchPendingIssues(selectedCategory);
        await fetchResolvedIssues(selectedCategory);
      }
      
      alert('Issue marked as done! It will appear as resolved on the dashboard.');
    } catch (err) {
      console.error('Failed to mark issue as done:', err);
      alert(err.response?.data?.detail || 'Failed to mark issue as done. Please try again.');
    } finally {
      setCompletingIssue({ ...completingIssue, [issueId]: false });
    }
  };

  const handleResolveIssue = async (category, issueId) => {
    try {
      setResolvingIssue({ ...resolvingIssue, [issueId]: true });
      
      await axios.post(`${API_BASE_URL}/api/expertise/resolve-issue`, {
        developerEmail: developerEmail,
        category: category,
        issueId: issueId,
        resolvedAt: new Date().toISOString(),
      });

      // Refresh both pending and resolved issues
      await fetchPendingIssues(category);
      await fetchResolvedIssues(category);
      
      // Refresh profile to get updated data
      await fetchProfile();
    } catch (err) {
      console.error('Failed to resolve issue:', err);
      alert(err.response?.data?.detail || 'Failed to resolve issue. Please try again.');
    } finally {
      setResolvingIssue({ ...resolvingIssue, [issueId]: false });
    }
  };

  const getExpertiseColor = (score) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Error</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const dev = profile.profile;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{dev.name}</h2>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{dev.email}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Expertise Levels Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Expertise Levels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category) => {
                const expertiseScore = dev.expertise?.[category] || 0;
                const jiraCount = dev.jiraIssuesSolved?.[category] || 0;
                const ghCount = dev.githubCommits?.[category] || 0;
                const isSelected = selectedCategory === category;

                return (
                  <div
                    key={category}
                    onClick={() => setSelectedCategory(isSelected ? null : category)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{category}</span>
                      <span className="text-sm font-medium text-gray-600">
                        {(expertiseScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full ${getExpertiseColor(expertiseScore)}`}
                        style={{ width: `${expertiseScore * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Jira Issues: {jiraCount}</p>
                      <p>GitHub Commits: {ghCount}</p>
                    </div>
                    {isSelected && (
                      <p className="text-xs text-blue-600 font-medium mt-2">
                        Click to view pending issues ↓
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Issues Section with Tabs */}
          {selectedCategory && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Jira Issues - {selectedCategory}
                </h3>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'pending'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Pending ({pendingIssues.length})
                </button>
                <button
                  onClick={() => setActiveTab('resolved')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'resolved'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileCheck className="w-4 h-4 inline mr-2" />
                  Resolved ({resolvedIssues.length})
                </button>
              </div>

              {/* Pending Issues Tab */}
              {activeTab === 'pending' && (
                <>
                  {pendingIssues.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No pending issues in {selectedCategory}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingIssues.map((issue) => {
                        const isResolving = resolvingIssue[issue.id] || false;
                        return (
                          <div
                            key={issue.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(issue.status)}
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(
                                    issue.priority
                                  )}`}
                                >
                                  {issue.priority || 'medium'}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Status: {issue.status || 'pending'}</span>
                                {issue.createdAt && <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>}
                                {issue.dueDate && (
                                  <span className="text-orange-600">
                                    Due: {new Date(issue.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleResolveIssue(selectedCategory, issue.id)}
                                disabled={isResolving}
                                className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {isResolving ? 'Resolving...' : 'Mark as Resolved'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Resolved Issues Tab */}
              {activeTab === 'resolved' && (
                <>
                  {resolvedIssues.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No resolved issues in {selectedCategory}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resolvedIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="border border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(
                                issue.priority
                              )}`}
                            >
                              {issue.priority || 'medium'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {issue.createdAt && <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>}
                            {issue.resolvedAt && (
                              <span className="text-green-600 font-medium">
                                Resolved: {new Date(issue.resolvedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfileView;

