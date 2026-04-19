import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Clock, UserCheck, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
import DeveloperProfileView from '../components/DeveloperProfileView';
import { getAuthToken } from '../utils/userContext';

// Import new sub-components
import AnalyticsView from './../components/AnalyticsView';
import IssueDetailModal from './../components/IssueDetailModal';
import IssueUpdateModal from './../components/IssueUpdateModal';
import IssueTable from './../components/IssueTable';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const ProjectManagerDashboard = ({ refreshTrigger }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigning, setAssigning] = useState({});

  // Pagination & Management State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalIssues, setTotalIssues] = useState(0);
  const [isDeleting, setIsDeleting] = useState(null);
  const [editingIssue, setEditingIssue] = useState(null);
  const [activeTab, setActiveTab] = useState('issues');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const authHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsError(null);
      const response = await axios.get(`${API_BASE_URL}/api/expertise/analytics`, {
        headers: authHeaders()
      });
      setAnalytics(response.data);
    } catch (err) {
      setAnalyticsError(err.response?.data?.detail || 'Failed to sync expertise matrix');
    }
  };



  useEffect(() => {
    fetchIssues();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchIssues();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [statusFilter, page, refreshTrigger]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('DEBUG: Fetching issues from', `${API_BASE_URL}/api/expertise/issues`, { page, limit, statusFilter });

      const params = {
        page,
        limit,
        ...(statusFilter !== 'all' && { status: statusFilter })
      };

      const response = await axios.get(`${API_BASE_URL}/api/expertise/issues`, {
        params,
        headers: authHeaders()
      });

      console.log('DEBUG: Issues received', response.data);
      setIssues(response.data.issues || []);
      setTotalIssues(response.data.total || 0);
    } catch (err) {
      console.error('DEBUG: Fetch issues ERROR', err);
      setError(err.response?.data?.detail || 'Failed to load issues. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this issue? This cannot be undone.')) return;
    try {
      setIsDeleting(issueId);
      await axios.delete(`${API_BASE_URL}/api/expertise/issues/${issueId}`, { headers: authHeaders() });
      await fetchIssues();
      alert('Issue deleted successfully');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete issue');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await axios.put(`${API_BASE_URL}/api/expertise/issues/${editingIssue.id}`, editingIssue, { headers: authHeaders() });
      await fetchIssues();
      setEditingIssue(null);
      alert('Issue updated successfully');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update issue');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignIssue = async (issue, developerEmail, developerName) => {
    try {
      setAssigning({ ...assigning, [issue.id]: true });
      await axios.post(`${API_BASE_URL}/api/expertise/issues/assign`, {
        issueId: issue.id,
        developerEmail,
        developerName,
      }, { headers: authHeaders() });

      await fetchIssues();
      setSelectedIssue(null);
      alert(`Issue assigned to ${developerName} successfully!`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to Assign Issue');
    } finally {
      setAssigning({ ...assigning, [issue.id]: false });
    }
  };

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    assigned: issues.filter(i => i.status === 'assigned' || i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'done').length,
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center text-white">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Manager Dashboard</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Operational Oversight & Expert Deployment</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Issues</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.total}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
              <Clock size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Awaiting Analysis</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Tasks</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.assigned}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resolved</p>
          </div>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.resolved}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'issues'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <LayoutDashboard size={14} />
          Issues
        </button>
        <button
          onClick={() => {
            setActiveTab('analytics');
            fetchAnalytics();
          }}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'analytics'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          <TrendingUp size={14} />
          Analytics
        </button>
      </div>

      {activeTab === 'issues' ? (
        <IssueTable 
          loading={loading}
          error={error}
          issues={issues}
          page={page}
          setPage={setPage}
          limit={limit}
          totalIssues={totalIssues}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setSelectedIssue={setSelectedIssue}
          setEditingIssue={setEditingIssue}
          handleDeleteIssue={handleDeleteIssue}
          setSelectedDeveloper={setSelectedDeveloper}
        />
      ) : (
        <AnalyticsView 
          analytics={analytics} 
          analyticsError={analyticsError} 
        />
      )}

      {/* Modals */}
      <IssueDetailModal 
        selectedIssue={selectedIssue}
        setSelectedIssue={setSelectedIssue}
        setSelectedDeveloper={setSelectedDeveloper}
        handleAssignIssue={handleAssignIssue}
        assigning={assigning}
      />

      <IssueUpdateModal 
        editingIssue={editingIssue}
        setEditingIssue={setEditingIssue}
        handleUpdateIssue={handleUpdateIssue}
        isUpdating={isUpdating}
      />

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
