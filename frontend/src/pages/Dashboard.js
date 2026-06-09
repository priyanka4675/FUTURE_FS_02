import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './Dashboard.css';

const STATUS_COLORS = {
  New: '#06b6d4',
  Contacted: '#f59e0b',
  Qualified: '#8b5cf6',
  Converted: '#10b981',
  Lost: '#ef4444'
};

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981'
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    analyticsAPI.get()
      .then(res => setStats(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loading">
      <div className="spinner"></div>
      <span>Loading dashboard...</span>
    </div>
  );

  const statusData = stats ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value })) : [];
  const sourceData = stats ? Object.entries(stats.bySource).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Overview of your lead pipeline</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/leads?new=true')}>
          + Add Lead
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>👥</div>
          <div className="stat-info">
            <div className="stat-num">{stats?.total || 0}</div>
            <div className="stat-label">Total Leads</div>
          </div>
          <div className="stat-badge cyan">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>🆕</div>
          <div className="stat-info">
            <div className="stat-num">{stats?.newThisMonth || 0}</div>
            <div className="stat-label">New This Month</div>
          </div>
          <div className="stat-badge amber">Last 30 days</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✅</div>
          <div className="stat-info">
            <div className="stat-num">{stats?.converted || 0}</div>
            <div className="stat-label">Converted</div>
          </div>
          <div className="stat-badge green">Clients won</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>📈</div>
          <div className="stat-info">
            <div className="stat-num">{stats?.conversionRate || 0}%</div>
            <div className="stat-label">Conversion Rate</div>
          </div>
          <div className="stat-badge purple">Overall</div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Status Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Leads by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e2536', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="no-data">No data yet</div>}
        </div>

        {/* Source Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-title">Leads by Source</h3>
          {sourceData.length > 0 ? (
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {sourceData.map((entry, i) => (
                      <Cell key={entry.name} fill={['#06b6d4','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899'][i % 6]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e2536', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    itemStyle={{ color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {sourceData.map((entry, i) => (
                  <div key={entry.name} className="legend-item">
                    <div className="legend-dot" style={{ background: ['#06b6d4','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899'][i % 6] }}></div>
                    <span>{entry.name}</span>
                    <span className="legend-val">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="no-data">No data yet</div>}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="chart-card">
        <div className="recent-header">
          <h3 className="chart-title">Recent Leads</h3>
          <button className="view-all-btn" onClick={() => navigate('/leads')}>View All →</button>
        </div>
        {stats?.recentLeads?.length > 0 ? (
          <div className="recent-table">
            <div className="table-head">
              <span>Name</span>
              <span>Email</span>
              <span>Source</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {stats.recentLeads.map(lead => (
              <div className="table-row" key={lead._id} onClick={() => navigate(`/leads/${lead._id}`)}>
                <span className="lead-name-cell">{lead.name}</span>
                <span className="lead-email-cell">{lead.email}</span>
                <span><span className="source-tag">{lead.source}</span></span>
                <span><span className={`status-badge status-${lead.status.toLowerCase()}`}>{lead.status}</span></span>
                <span className="date-cell">{format(new Date(lead.createdAt), 'dd MMM yyyy')}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">No leads yet. <button className="link-btn" onClick={() => navigate('/leads?new=true')}>Add your first lead →</button></div>
        )}
      </div>
    </div>
  );
}
