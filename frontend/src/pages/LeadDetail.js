import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import LeadModal from '../components/LeadModal';
import './LeadDetail.css';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const fetchLead = async () => {
    try {
      const res = await leadsAPI.getOne(id);
      setLead(res.data);
    } catch {
      toast.error('Lead not found');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await leadsAPI.addNote(id, noteText.trim());
      setLead(res.data);
      setNoteText('');
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      const res = await leadsAPI.deleteNote(id, noteId);
      setLead(res.data);
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await leadsAPI.update(id, { status });
      setLead(res.data);
      toast.success(`Status → ${status}`);
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div><span>Loading lead...</span></div>;
  if (!lead) return null;

  return (
    <div className="lead-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/leads')}>← Back to Leads</button>
        <div className="detail-actions">
          <button className="btn-secondary" onClick={() => setShowEdit(true)}>✏️ Edit</button>
          <button className="btn-danger" onClick={async () => {
            if (!window.confirm('Delete this lead permanently?')) return;
            await leadsAPI.delete(id);
            toast.success('Lead deleted');
            navigate('/leads');
          }}>🗑️ Delete</button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left: Main Info */}
        <div className="detail-main">
          <div className="detail-card">
            <div className="lead-hero">
              <div className="lead-hero-avatar">{lead.name[0].toUpperCase()}</div>
              <div>
                <h2 className="lead-hero-name">{lead.name}</h2>
                {lead.company && <div className="lead-hero-company">{lead.company}</div>}
                <div className="lead-hero-tags">
                  <span className="source-tag">{lead.source}</span>
                  <span className={`status-badge status-${lead.status.toLowerCase()}`}>{lead.status}</span>
                  <span className={`priority-badge priority-${lead.priority.toLowerCase()}`}>{lead.priority} Priority</span>
                </div>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">📧 Email</div>
                <a href={`mailto:${lead.email}`} className="info-value link">{lead.email}</a>
              </div>
              {lead.phone && (
                <div className="info-item">
                  <div className="info-label">📞 Phone</div>
                  <a href={`tel:${lead.phone}`} className="info-value link">{lead.phone}</a>
                </div>
              )}
              <div className="info-item">
                <div className="info-label">📅 Added</div>
                <div className="info-value">{format(new Date(lead.createdAt), 'dd MMMM yyyy, hh:mm a')}</div>
              </div>
              <div className="info-item">
                <div className="info-label">🔄 Updated</div>
                <div className="info-value">{format(new Date(lead.updatedAt), 'dd MMMM yyyy, hh:mm a')}</div>
              </div>
              {lead.nextFollowUp && (
                <div className="info-item">
                  <div className="info-label">⏰ Follow-up</div>
                  <div className="info-value">{format(new Date(lead.nextFollowUp), 'dd MMM yyyy')}</div>
                </div>
              )}
              {lead.value > 0 && (
                <div className="info-item">
                  <div className="info-label">💰 Deal Value</div>
                  <div className="info-value green">₹{lead.value.toLocaleString()}</div>
                </div>
              )}
            </div>

            {lead.message && (
              <div className="message-block">
                <div className="info-label">💬 Original Message</div>
                <p className="message-text">{lead.message}</p>
              </div>
            )}

            {lead.tags?.length > 0 && (
              <div className="tags-row">
                {lead.tags.map(tag => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Status Update */}
          <div className="detail-card">
            <h3 className="card-title">Update Status</h3>
            <div className="status-buttons">
              {['New','Contacted','Qualified','Converted','Lost'].map(s => (
                <button
                  key={s}
                  className={`status-btn status-btn-${s.toLowerCase()} ${lead.status === s ? 'active' : ''}`}
                  onClick={() => handleStatusChange(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Notes */}
        <div className="detail-notes">
          <div className="detail-card notes-card">
            <h3 className="card-title">Follow-up Notes <span className="notes-count">{lead.notes?.length || 0}</span></h3>

            <form onSubmit={handleAddNote} className="note-form">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add a follow-up note, call summary, or next step..."
                rows={3}
                className="note-textarea"
              />
              <button type="submit" className="btn-primary note-submit" disabled={addingNote || !noteText.trim()}>
                {addingNote ? 'Adding...' : '+ Add Note'}
              </button>
            </form>

            <div className="notes-list">
              {lead.notes?.length === 0 ? (
                <div className="no-notes">No notes yet. Add your first follow-up note above.</div>
              ) : (
                lead.notes.map(note => (
                  <div className="note-item" key={note._id}>
                    <div className="note-header">
                      <span className="note-author">{note.createdBy}</span>
                      <span className="note-date">{format(new Date(note.createdAt), 'dd MMM yy, hh:mm a')}</span>
                      <button className="note-delete" onClick={() => handleDeleteNote(note._id)} title="Delete note">✕</button>
                    </div>
                    <p className="note-text">{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <LeadModal
          lead={lead}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchLead(); }}
        />
      )}
    </div>
  );
}
