import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  UserCheck,
  Filter
} from 'lucide-react';
import axios from 'axios';
import DeveloperProfileView from '../components/DeveloperProfileView';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ProjectManagerDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigning, setAssigning] = useState({});

  useEffect(() => {
    fetchIssues();
    // Refresh every 30 seconds
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await axios.get(`${API_BASE_URL}/api/expertise/issues`, { params });
      setIssues(response.data.issues || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignIssue = async (issue, developerEmail, developerName) => {
    try {
      setAssigning({ ...assigning, [issue.id]: true });
      await axios.post(`${API_BASE_URL}/api/expertise/issues/assign`, {
        issueId: issue.id,
        developerEmail: developerEmail,
        developerName: developerName,
      });
      
      // Refresh issues
      await fetchIssues();
      setSelectedIssue(null);
      alert(`Issue assigned to ${developerName} successfully!`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign issue');
    } finally {
      setAssigning({ ...assigning, [issue.id]: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'resolved':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'assigned':
      case 'in_progress':
        return <UserCheck className="w-4 h-4" />;
      case 'done':
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredIssues = statusFilter === 'all' 
    ? issues 
    : issues.filter(issue => issue.status === statusFilter);

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    assigned: issues.filter(i => i.status === 'assigned' || i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'done').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <LayoutDashboard className="text-blue-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-black">Project Manager Dashboard</h1>
          <p className="text-xs text-gray-600">Manage and assign issues to experts</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Issues</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading issues...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <LayoutDashboard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No issues found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Submitted By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{issue.id}</td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{issue.title}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{issue.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                        {issue.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">{issue.submittedByName || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{issue.submittedBy}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(issue.status)}`}>
                        {getStatusIcon(issue.status)}
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {issue.assignedToName ? (
                        <div>
                          <p className="font-medium">{issue.assignedToName}</p>
                          <p className="text-xs text-gray-500">{issue.assignedTo}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </button>
                        {issue.status === 'pending' && (
                          <button
                            onClick={() => setSelectedIssue(issue)}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedIssue.title}</h2>
                <p className="text-sm text-gray-600 mt-1">ID: {selectedIssue.id}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedIssue(null);
                  setSelectedDeveloper(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                <p className="text-gray-900">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Category</h3>
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-sm font-medium">
                    {selectedIssue.category}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Status</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium border ${getStatusColor(selectedIssue.status)}`}>
                    {getStatusIcon(selectedIssue.status)}
                    {selectedIssue.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Submitted By</h3>
                  <p className="text-gray-900">{selectedIssue.submittedByName || selectedIssue.submittedBy}</p>
                  <p className="text-xs text-gray-500">{selectedIssue.submittedBy}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Created</h3>
                  <p className="text-gray-900">
                    {selectedIssue.createdAt ? new Date(selectedIssue.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Top 3 Experts */}
              {selectedIssue.topExperts && selectedIssue.topExperts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Top 3 Recommended Experts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedIssue.topExperts.map((expert, idx) => (
                      <div
                        key={expert.email}
                        className="border border-gray-200 rounded-lg p-3 bg-slate-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            <p className="font-semibold text-gray-900 text-sm">{expert.name}</p>
                          </div>
                          <span className="text-xs font-medium text-blue-600">
                            #{(idx + 1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{expert.email}</p>
                        <div className="text-xs space-y-1 mb-2">
                          <p>Expertise: {(expert.expertiseScore * 100).toFixed(0)}%</p>
                          <p>Jira Issues: {expert.jiraIssuesSolved}</p>
                          <p>Commits: {expert.githubCommits}</p>
                        </div>
                        {selectedIssue.status === 'pending' && (
                          <div className="space-y-2">
                            <button
                              onClick={() => setSelectedDeveloper(expert.email)}
                              className="w-full text-xs text-blue-600 font-medium hover:text-blue-700"
                            >
                              View Profile →
                            </button>
                            <button
                              onClick={() => handleAssignIssue(selectedIssue, expert.email, expert.name)}
                              disabled={assigning[selectedIssue.id]}
                              className="w-full inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              {assigning[selectedIssue.id] ? 'Assigning...' : 'Assign Issue'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedIssue.assignedTo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Assigned To</h3>
                  <p className="text-blue-800">{selectedIssue.assignedToName} ({selectedIssue.assignedTo})</p>
                  {selectedIssue.assignedAt && (
                    <p className="text-xs text-blue-600 mt-1">
                      Assigned: {new Date(selectedIssue.assignedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
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
    </div>
  );
};

export default ProjectManagerDashboard;

