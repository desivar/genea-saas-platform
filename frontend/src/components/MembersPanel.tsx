import React, { useState, useEffect } from 'react';
import { HERITAGE_STICKERS } from '../constants/stickers';

interface IMember {
  _id?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  deathDate: string;
  deathPlace: string;
  gender: 'Male' | 'Female' | 'Unknown';
  heritage: string;
  generation: number;
  notes: string;
  fatherId?: string;
  motherId?: string;
  spouseIds?: string[];
}

const emptyMember: IMember = {
  firstName: '', lastName: '',
  birthDate: '', birthPlace: '',
  deathDate: '', deathPlace: '',
  gender: 'Unknown', heritage: '',
  generation: 1, notes: '',
  fatherId: '', motherId: '',
  spouseIds: []
};

interface MembersPanelProps {
  treeId?: string;
  token: string;
  palette: any;
  font: string;
}

export default function MembersPanel({ treeId, token, palette: p, font }: MembersPanelProps) {
  const [members, setMembers] = useState<IMember[]>([]);
  const [form, setForm] = useState<IMember>(emptyMember);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (treeId) fetchMembers();
  }, [treeId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`http://localhost:5500/api/trees/${treeId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch {
      setError('Could not load members.');
    }
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName) {
      setError('First and last name are required.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const url = editingId
        ? `http://localhost:5500/api/trees/${treeId}/members/${editingId}`
        : `http://localhost:5500/api/trees/${treeId}/members`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save member');
      setSuccess(editingId ? 'Member updated!' : 'Member added!');
      setForm(emptyMember);
      setIsAdding(false);
      setEditingId(null);
      fetchMembers();
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Could not save member.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await fetch(`http://localhost:5500/api/trees/${treeId}/members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMembers();
    } catch {
      setError('Could not delete member.');
    }
  };

  const handleEdit = (member: IMember) => {
    setForm(member);
    setEditingId(member._id || null);
    setIsAdding(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 10px', fontSize: '12px',
    border: '1px solid #e8e8e8', borderRadius: '6px',
    background: '#fafafa', color: '#333', fontFamily: font,
    outline: 'none', boxSizing: 'border-box'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', color: '#999',
    textTransform: 'uppercase', letterSpacing: '1px',
    display: 'block', marginBottom: '3px'
  };

  if (!treeId) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p style={{ color: '#999', fontSize: '12px' }}>
          Save your presentation first to add members.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {members.length} Members
        </span>
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); setForm(emptyMember); setEditingId(null); }}
            style={{ padding: '4px 12px', background: p.accent, border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontFamily: font }}
          >
            + Add Member
          </button>
        )}
      </div>

      {/* Success / Error */}
      {success && <div style={{ padding: '6px 10px', backgroundColor: '#d1fae5', borderRadius: '6px', fontSize: '12px', color: '#065f46' }}>{success}</div>}
      {error && <div style={{ padding: '6px 10px', backgroundColor: '#fee2e2', borderRadius: '6px', fontSize: '12px', color: '#991b1b' }}>{error}</div>}

      {/* Add / Edit Form */}
      {isAdding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '10px', border: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>
            {editingId ? 'Edit Member' : 'New Member'}
          </div>

          {/* Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={labelStyle}>First Name *</label>
              <input style={inputStyle} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="First name" />
            </div>
            <div>
              <label style={labelStyle}>Last Name *</label>
              <input style={inputStyle} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label style={labelStyle}>Gender</label>
            <select style={inputStyle} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as any })}>
              <option value="Unknown">Unknown</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Birth */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={labelStyle}>Birth Date</label>
              <input style={inputStyle} value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} placeholder="e.g. 1842" />
            </div>
            <div>
              <label style={labelStyle}>Birth Place</label>
              <input style={inputStyle} value={form.birthPlace} onChange={e => setForm({ ...form, birthPlace: e.target.value })} placeholder="City, Country" />
            </div>
          </div>

          {/* Death */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={labelStyle}>Death Date</label>
              <input style={inputStyle} value={form.deathDate} onChange={e => setForm({ ...form, deathDate: e.target.value })} placeholder="e.g. 1910" />
            </div>
            <div>
              <label style={labelStyle}>Death Place</label>
              <input style={inputStyle} value={form.deathPlace} onChange={e => setForm({ ...form, deathPlace: e.target.value })} placeholder="City, Country" />
            </div>
          </div>

          {/* Generation */}
          <div>
            <label style={labelStyle}>Generation</label>
            <input
              style={inputStyle}
              type="number" min="1" max="20"
              value={form.generation}
              onChange={e => setForm({ ...form, generation: parseInt(e.target.value) || 1 })}
              placeholder="1 = oldest ancestor"
            />
            <span style={{ fontSize: '10px', color: '#bbb', marginTop: '2px', display: 'block' }}>1 = oldest ancestor</span>
          </div>

          {/* Heritage */}
          <div>
            <label style={labelStyle}>Heritage</label>
            <select style={inputStyle} value={form.heritage} onChange={e => setForm({ ...form, heritage: e.target.value })}>
              <option value="">Select heritage...</option>
              {Object.entries(HERITAGE_STICKERS).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.label}</option>
              ))}
            </select>
          </div>

          {/* Relationships */}
          <div>
            <label style={labelStyle}>Father (select from list)</label>
            <select style={inputStyle} value={form.fatherId || ''} onChange={e => setForm({ ...form, fatherId: e.target.value })}>
              <option value="">None</option>
              {members.filter(m => m.gender === 'Male' && m._id !== editingId).map(m => (
                <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Mother (select from list)</label>
            <select style={inputStyle} value={form.motherId || ''} onChange={e => setForm({ ...form, motherId: e.target.value })}>
              <option value="">None</option>
              {members.filter(m => m.gender === 'Female' && m._id !== editingId).map(m => (
                <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes / Quick Fact</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Any notable facts..."
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{ flex: 1, padding: '8px', background: p.accent, border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: font, fontWeight: '600' }}
            >
              {isLoading ? 'Saving...' : editingId ? '✅ Update' : '✅ Save Member'}
            </button>
            <button
              onClick={() => { setIsAdding(false); setForm(emptyMember); setEditingId(null); setError(''); }}
              style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #e8e8e8', color: '#999', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: font }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Members List */}
      {!isAdding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {members.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#bbb', fontSize: '12px' }}>
              No members yet. Add your first ancestor!
            </div>
          )}
          {members
            .sort((a, b) => (a.generation || 1) - (b.generation || 1))
            .map(member => (
              <div
                key={member._id}
                style={{
                  padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid #e8e8e8', backgroundColor: '#fafafa',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {/* Heritage sticker */}
                <div style={{ fontSize: '18px', flexShrink: 0 }}>
                  {member.heritage && HERITAGE_STICKERS[member.heritage]
                    ? HERITAGE_STICKERS[member.heritage].icon
                    : '👤'
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.firstName} {member.lastName}
                  </div>
                  <div style={{ fontSize: '10px', color: '#999', marginTop: '1px' }}>
                    Gen {member.generation} · {member.birthDate || '?'} — {member.deathDate || 'Present'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleEdit(member)}
                    style={{ padding: '3px 7px', background: 'transparent', border: '1px solid #e8e8e8', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', color: '#666' }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(member._id!)}
                    style={{ padding: '3px 7px', background: 'transparent', border: '1px solid #fee2e2', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', color: '#e53' }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}