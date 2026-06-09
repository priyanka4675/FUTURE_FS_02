import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { leadsAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import LeadModal from '../components/LeadModal';
import './Leads.css';

const STATUSES = ['All', 'New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const SOURCES = ['All', 'Website', 'LinkedIn', 'Referral', 'Email', 'Cold Call', 'Other'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'All', source: 'All', priority: 'All' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, search };
      if (filters.status !== 'All') params.status = filters.status;
      if (filters.source !== 'All') params.source = filters.source;
      if (filters.priority !== 'All') params.priority = filters.priority;
      const res = await leadsAPI.getAll(params);
      setLeads(res.data.leads);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') setShowModal(true);
  }, [searchParams]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this lead?')) return;
    try {
      await leadsAPI.delete(id);
      toast.success('Lead deleted');
      fetchLeads();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (id, status, e) => {
    e.stopPropagation();
    try {
      await leadsAPI.update(id, { status });
      toast.success(`Status → ${status}`);
      fetchLeads();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditLead(null);
    fetchLeads();
  };

  return (
    <div className="leads-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-sub">{total} total leads in your pipeline</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditLead(null); setShowModal(true); }}>
          + Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="search-input"
          />
          {search && <button className="clear-search" onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className="filter-selects">
          {[
            { key: 'status', options: STATUSES, label: 'Status' },
            { key: 'source', options: SOURCES, label: 'Source' },
            { key: 'priority', options: PRIORITIES, label: 'Priority' },
          ].map(f => (
            <select
              key={f.key}
              value={filters[f.key]}
              onChange={e => { setFilters(prev => ({ ...prev, [f.key]: e.target.value })); setPage(1); }}
              className="filter-select"
            >
              {f.options.map(o => <option key={o} value={o}>{o === 'All' ? `All ${f.label}` : o}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="page-loading"><div className="spinner"></div><span>Loading leads...</span></div>
      ) : leads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No leads found</h3>
          <p>Try adjusting your filters or add a new lead</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add First Lead</button>
        </div>
      ) : (
        <>
          <div className="leads-table">
            <div className="leads-thead">
              <span>Name</span>
              <span>Contact</span>
              <span>Source</span>
              <span>Priority</span>
              <span>Status</span>
              <span>Date</span>
              <span>Actions</span>
            </div>
            {leads.map(lead => (
              <div className="leads-row" key={lead._id} onClick={() => navigate(`/leads/${lead._id}`)}>
                <div className="lead-name-col">
                  <div className="lead-avatar">{lead.name[0].toUpperCase()}</div>
                  <div>
                    <div className="lead-fullname">{lead.name}</div>
                    {lead.company && <div className="lead-company">{lead.company}</div>}
                  </div>
                </div>
                <div className="lead-contact-col">
                  <div className="lead-email">{lead.email}</div>
                  {lead.phone && <div className="lead-phone">{lead.phone}</div>}
                </div>
                <span><span className="source-tag">{lead.source}</span></span>
                <span>
                  <span className={`priority-dot priority-${lead.priority.toLowerCase()}`}></span>
                  <span className="priority-text">{lead.priority}</span>
                </span>
                <span onClick={e => e.stopPropagation()}>
                  <select
                    className={`status-select status-${lead.status.toLowerCase()}`}
                    value={lead.status}
                    onChange={e => handleStatusChange(lead._id, e.target.value, e)}
                  >
                    {['New','Contacted','Qualified','Converted','Lost'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </span>
                <span className="date-col">{format(new Date(lead.createdAt), 'dd MMM yy')}</span>
                <div className="action-btns" onClick={e => e.stopPropagation()}>
                  <button className="icon-btn edit" title="Edit" onClick={() => { setEditLead(lead); setShowModal(true); }}>✏️</button>
                  <button className="icon-btn delete" title="Delete" onClick={e => handleDelete(lead._id, e)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="page-btn">← Prev</button>
              <span className="page-info">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="page-btn">Next →</button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <LeadModal
          lead={editLead}
          onClose={() => { setShowModal(false); setEditLead(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
