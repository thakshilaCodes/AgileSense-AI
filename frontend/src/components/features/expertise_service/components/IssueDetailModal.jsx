import React from 'react';
import { LayoutDashboard, X, UserCheck, User, Eye } from 'lucide-react';

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

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critical': return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'low': return 'bg-slate-100 text-slate-800 border-slate-300';
    default: return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

const IssueDetailModal = ({ 
  selectedIssue, 
  setSelectedIssue, 
  setSelectedDeveloper, 
  handleAssignIssue, 
  assigning 
}) => {
  if (!selectedIssue) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
      <div className="bg-slate-50 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] max-w-5xl w-full max-h-[92vh] overflow-hidden border border-white/40 flex flex-col relative">

        {/* Header / Command Center */}
        <div className="relative px-10 pt-10 pb-12 shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />

          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/20 border border-white/30 rounded-full text-[10px] font-black uppercase text-white tracking-widest">
                    Issue Analysis
                  </span>
                  <span className="text-white/50 text-[10px] font-mono">ID: {selectedIssue.id.split('-').pop()}</span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
                  {selectedIssue.title}
                </h2>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedIssue(null);
              }}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white transition-all duration-300 backdrop-blur-md"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-10 -mt-6 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Main Details */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-200 relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />

                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-0.5 bg-blue-600/30" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Description</h4>
                  </div>
                  <p className="text-slate-800 text-lg leading-relaxed font-semibold">
                    {selectedIssue.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Core Category</h4>
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 font-bold text-xs">
                      {selectedIssue.category}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Workflow State</h4>
                    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border font-bold text-xs uppercase ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Severity / Priority</h4>
                    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border font-bold text-xs uppercase ${getPriorityColor(selectedIssue.priority)}`}>
                      {selectedIssue.priority || 'medium'}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Submitted By</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px]">
                        {selectedIssue.submittedByName?.charAt(0) || 'U'}
                      </div>
                      <p className="text-xs font-bold text-slate-900">{selectedIssue.submittedByName}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Timestamp</h4>
                    <p className="text-xs font-bold text-slate-900">
                      {selectedIssue.createdAt && !isNaN(new Date(selectedIssue.createdAt)) ? new Date(selectedIssue.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignment Case */}
              {selectedIssue.assignedTo && (
                <div className={`rounded-[2rem] p-10 border-2 shadow-sm relative overflow-hidden transition-all duration-700 ${selectedIssue.status === 'resolved'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-950'
                  : 'bg-white border-blue-100/50 text-slate-900'
                  }`}>

                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className={`p-5 rounded-3xl ${selectedIssue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                        <UserCheck className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 leading-none ${selectedIssue.status === 'resolved' ? 'text-emerald-600/60' : 'text-blue-600/60'}`}>
                          {selectedIssue.status === 'resolved' ? 'Operational success' : 'Active individual'}
                        </h3>
                        <p className="text-3xl font-black tracking-tighter mt-3">
                          {selectedIssue.assignedToName}
                        </p>
                      </div>
                    </div>
                    {selectedIssue.status === 'resolved' && (
                      <div className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                        Resolved
                      </div>
                    )}
                  </div>

                  {selectedIssue.status === 'resolved' && selectedIssue.resolutionNote && (
                    <div className="bg-white/40 border border-emerald-200/50 rounded-2xl p-6 mt-6 relative">
                      <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-2">Resolution Note</div>
                      <p className="text-base font-medium leading-relaxed italic text-emerald-900/80">
                        "{selectedIssue.resolutionNote}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recommendations Column */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="bg-white rounded-[2rem] p-8 h-full border border-slate-200 shadow-sm relative overflow-hidden flex flex-col min-h-[600px]">

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                    <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Expert Recommendations</h3>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
                    {selectedIssue.topExperts?.map((expert, idx) => (
                      <div
                        key={expert.email}
                        className="bg-slate-50 border border-slate-100 rounded-[1.8rem] p-6 hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all group/expert relative active:scale-[0.98]"
                      >
                        <div className="flex items-start justify-between mb-6 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 text-blue-600 font-black relative transition-all group-hover:border-blue-400 group-hover:shadow-lg">
                              <User className="w-7 h-7" />
                              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white text-[10px] font-black flex items-center justify-center rounded-xl shadow-lg border-2 border-white">
                                {idx + 1}
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-lg tracking-tight mb-0.5">{expert.name}</p>
                              <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">{expert.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-center text-center">
                            <p className="text-[7px] font-black uppercase text-slate-400 mb-1">Score</p>
                            <p className="text-lg font-black text-blue-600 tracking-tighter">{(expert.expertiseScore * 100).toFixed(0)}%</p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-center text-center">
                            <p className="text-[7px] font-black uppercase text-slate-400 mb-1">Cap</p>
                            <p className={`text-lg font-black tracking-tighter ${(expert.capacity_percentage ?? 100) < 30 ? 'text-rose-500' : (expert.capacity_percentage ?? 100) < 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {expert.capacity_percentage ?? '100'}%
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-center text-center">
                            <p className="text-[7px] font-black uppercase text-slate-400 mb-1">Load</p>
                            <p className="text-lg font-black text-slate-900 tracking-tighter">
                              {expert.workload_score?.toFixed(1) || '0.0'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${expert.recommendation_reason === 'preference'
                              ? 'bg-purple-50 text-purple-600 border border-purple-100'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                              {expert.recommendation_reason === 'preference' ? 'Intent Match' : 'Expert Track'}
                            </span>
                            <button
                              onClick={() => setSelectedDeveloper(expert.email)}
                              className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-700 transition-colors"
                            >
                              Profile <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {selectedIssue.status === 'pending' && (
                            <button
                              onClick={() => handleAssignIssue(selectedIssue, expert.email, expert.name)}
                              disabled={assigning[selectedIssue.id] || (expert.capacity_percentage ?? 100) < 30}
                              className={`w-full py-4 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 shadow-lg ${
                                (expert.capacity_percentage ?? 100) < 30
                                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                              }`}
                            >
                              {(expert.capacity_percentage ?? 100) < 30 
                                ? 'Overloaded - Blocked' 
                                : assigning[selectedIssue.id] ? 'Assigning...' : 'Assign Individual'
                              }
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
