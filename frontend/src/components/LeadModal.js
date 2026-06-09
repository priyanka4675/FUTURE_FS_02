import React, { useState, useEffect } from 'react';
import { leadsAPI } from '../services/api';
import toast from 'react-hot-toast';
import './LeadModal.css';

const EMPTY = {
  name: '', email: '', phone: '', company: '',
  source: 'Website', status: 'New', priority: 'Medium',
  message: '', value: '', nextFollowUp: ''
};

export default function LeadModal({ lead, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        source: lead.source || 'Website',
        status: lead.status || 'New',
        priority: lead.priority || 'Medium',
        message: lead.message || '',
        value: lead.value || '',
        nextFollowUp: lead.nextFollowUp ? lead.nextFollowUp.slice(0, 10) : ''
      });
    }
  }, [lead]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, value: form.value ? Number(form.value) : 0 };
      if (!payload.nextFollowUp) delete payload.nextFollowUp;
      if (lead) {
        await leadsAPI.update(lead._id, payload);
        toast.success('Lead updated!');
      } else {
        await leadsAPI.create(payload);
        toast.success('Lead added!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            <div className="form-row-2">
              <div className="form-group">
                <label>Full Name <span className="req">*</span></label>
                <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email <span className="req">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input name="company" type="text" value={form.company} onChange={handleChange} placeholder="Acme Corp" />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label>Source</label>
                <select name="source" value={form.source} onChange={handleChange}>
                  {['Website','LinkedIn','Referral','Email','Cold Call','Other'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  {['New','Contacted','Qualified','Converted','Lost'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  {['High','Medium','Low'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Deal Value (₹)</label>
                <input name="value" type="number" value={form.value} onChange={handleChange} placeholder="50000" min="0" />
              </div>
              <div className="form-group">
                <label>Next Follow-up</label>
                <input name="nextFollowUp" type="date" value={form.nextFollowUp} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Message / Notes</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Initial message or context from the lead..." />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : lead ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
