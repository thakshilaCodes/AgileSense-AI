import React from 'react';
import { 
  Filter, AlertTriangle, LayoutDashboard, Clock, 
  UserCheck, CheckCircle, AlertCircle, Eye, Edit2, 
  Trash2, ChevronLeft, ChevronRight 
} from 'lucide-react';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'done': return 'bg-green-100 text-green-800 border-green-300';
    case 'resolved': return 'bg-gray-100 text-gray-800 border-gray-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'assigned':
    case 'in_progress': return <UserCheck className="w-4 h-4" />;
    case 'done':
    case 'resolved': return <CheckCircle className="w-4 h-4" />;
    default: return <AlertCircle className="w-4 h-4" />;
  }
};

const IssueTable = ({
  loading,
  error,
  issues,
  page,
  setPage,
  limit,
  totalIssues,
  statusFilter,
  setStatusFilter,
  setSelectedIssue,
  setEditingIssue,
  handleDeleteIssue,
  setSelectedDeveloper
}) => {
  return (
    <>
      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-400 px-2 border-r border-slate-100 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Pipeline Filter</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="bg-transparent text-slate-600 text-[11px] font-bold rounded-lg px-4 py-1.5 outline-none transition-all cursor-pointer uppercase tracking-tight"
        >
          <option value="all">ALL ACTIVE ISSUES</option>
          <option value="pending">PENDING</option>
          <option value="assigned">IN PROGRESS</option>
          <option value="resolved">RESOLVED</option>
        </select>
      </div>

      {/* Issues Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Syncing Expertise Data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-16 text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300">
            <LayoutDashboard className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Zero Active Issues</h3>
            <p className="text-sm font-medium text-slate-500 mt-2">The operational pipeline is currently clear.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Detail</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitted By</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expert</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">#{issue.id.split('-').pop()}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-xs">
                        <p className="font-semibold text-slate-900 text-sm truncate">{issue.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">{issue.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-tight border border-blue-100">
                        {issue.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{issue.submittedByName || 'User'}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{issue.submittedBy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border ${getStatusColor(issue.status)}`}>
                          {getStatusIcon(issue.status)}
                          {issue.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {issue.assignedToName ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedDeveloper(issue.assignedTo)}
                              className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left"
                            >
                              {issue.assignedToName}
                            </button>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter border ${issue.assignedToCapacity < 30
                              ? 'bg-rose-50 text-rose-600 border-rose-100'
                              : issue.assignedToCapacity < 60
                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}>
                              {issue.assignedToCapacity < 30 ? 'Overloaded' : 'Optimal'}
                            </span>
                          </div>
                          <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-700 ${issue.assignedToCapacity < 30 ? 'bg-rose-500' : issue.assignedToCapacity < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${issue.assignedToCapacity}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Awaiting Assignment</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setEditingIssue(issue)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteIssue(issue.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="bg-slate-50/50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Showing <span className="text-blue-600">{(page - 1) * limit + 1}</span> to <span className="text-blue-600">{Math.min(page * limit, totalIssues)}</span> of <span className="text-blue-600">{totalIssues}</span> issues
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.max(1, Math.ceil(totalIssues / limit)))].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${page === i + 1
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600'
                      }`}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, page - 3), Math.min(Math.ceil(totalIssues / limit), page + 2))}
              </div>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(totalIssues / limit)}
                className="p-2 border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-blue-600 hover:border-blue-200 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IssueTable;
