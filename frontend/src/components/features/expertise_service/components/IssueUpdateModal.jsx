import React from 'react';
import { Edit2, X, Save } from 'lucide-react';

const IssueUpdateModal = ({ editingIssue, setEditingIssue, handleUpdateIssue, isUpdating }) => {
  if (!editingIssue) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <Edit2 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Update Issue</h2>
              <p className="text-xs text-slate-500 font-medium">Updating details for {editingIssue.id}</p>
            </div>
          </div>
          <button
            onClick={() => setEditingIssue(null)}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleUpdateIssue} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Issue Title</label>
              <input
                type="text"
                required
                value={editingIssue.title}
                onChange={(e) => setEditingIssue({ ...editingIssue, title: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Issue Description</label>
              <textarea
                required
                rows={4}
                value={editingIssue.description}
                onChange={(e) => setEditingIssue({ ...editingIssue, description: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Priority Level</label>
                <select
                  value={editingIssue.priority}
                  onChange={(e) => setEditingIssue({ ...editingIssue, priority: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                >
                  <option value="low">LOW</option>
                  <option value="medium">MEDIUM</option>
                  <option value="high">HIGH</option>
                  <option value="critical">CRITICAL</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Status Code</label>
                <select
                  value={editingIssue.status}
                  onChange={(e) => setEditingIssue({ ...editingIssue, status: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                >
                  <option value="pending">PENDING</option>
                  <option value="assigned">ASSIGNED</option>
                  <option value="in_progress">IN_PROGRESS</option>
                  <option value="done">SYSTEM_DONE</option>
                  <option value="resolved">RESOLVED</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setEditingIssue(null)}
              className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdating ? 'SAVING...' : (
                <>
                  <Save className="w-4 h-4" />
                  SAVE_CHANGES
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueUpdateModal;
