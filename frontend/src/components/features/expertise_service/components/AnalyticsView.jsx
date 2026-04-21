import React from 'react';
import { Radar as RadarIcon, PieChart as PieChartIcon, BarChart as BarChartIcon, AlertTriangle } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#475569'];

const AnalyticsView = ({ analytics, analyticsError }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Team Expertise Radar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col min-h-[450px]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <RadarIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Team Expertise Matrix</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Cross-functional knowledge distribution</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {analyticsError ? (
              <div className="text-center p-4">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-30" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{analyticsError}</p>
              </div>
            ) : analytics?.teamExpertiseMatrix ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analytics.teamExpertiseMatrix}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: '#cbd5e1', fontSize: 8 }} />
                  <Radar
                    name="Average Expertise"
                    dataKey="A"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-xs font-bold animate-pulse">Syncing data...</p>
            )}
          </div>
        </div>

        {/* Category Distribution Pie */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col min-h-[450px]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Issue Breakdown</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Volume by category over time</p>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {analytics?.categoryDistribution ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Legend
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-xs font-bold animate-pulse">Calculating Density...</p>
            )}
          </div>
        </div>

        {/* Resolution Velocity Bar */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col lg:col-span-2 min-h-[450px]">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <BarChartIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase">Resolution Velocity</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Deployment Throughput (7-Day Trace)</p>
            </div>
          </div>
          <div className="flex-1">
            {analytics?.resolutionVelocity ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.resolutionVelocity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400 text-xs font-bold animate-pulse">Syncing Velocity...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
