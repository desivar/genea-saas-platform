import React, { useState, useEffect } from 'react';
import { HERITAGE_STICKERS } from '../constants/stickers';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface IFamilyMember {
  _id?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  deathDate: string;
  deathPlace: string;
  gender: 'Male' | 'Female' | 'Unknown';
  heritage: string;
  branch: string;
  generation: number;
  notes: string;
  photoUrl: string;
  fatherId?: string;
  motherId?: string;
  spouseIds?: string[];
}

interface MembersPanelProps {
  treeId?: string;
  token: string;
  palette: any;
  font: string;
  onInitialize?: () => void;
}

// ─── Empty form default ───────────────────────────────────────────────────────

const emptyMember: IFamilyMember = {
  firstName: '', lastName: '',
  birthDate: '', birthPlace: '',
  deathDate: '', deathPlace: '',
  gender: 'Unknown', heritage: '',
  branch: '', generation: 1,
  notes: '', photoUrl: '',
  fatherId: '', motherId: '',
  spouseIds: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MembersPanel({ treeId, token, palette: p, font, onInitialize }: MembersPanelProps) {
  const [members, setMembers]       = useState<IFamilyMember[]>([]);
  const [form, setForm]             = useState<IFamilyMember>(emptyMember);
  const [isAdding, setIsAdding]     = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [editingId, setEditingId]   = useState<string | null>(null);

  useEffect(() => {
    if (treeId) fetchMembers();
  }, [treeId]);

  // ── Fetch all members ──────────────────────────────────────────────────────

  const fetchMembers = async () => {
    try {
      const res = await fetch(`http://localhost:5500/api/trees/${treeId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch {
      setError('Could not load members.');
    }
  };

  // ── Submit (add or update) ─────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName) {
      setError('First and last name are required.');
      return;
    }
    setIsLoading(true);
    setError('');

    // Clean up empty relational fields so MongoDB doesn't get empty strings
    const payload = {
      ...form,
      fatherId:  form.fatherId  || undefined,
      motherId:  form.motherId  || undefined,
      spouseIds: form.spouseIds?.filter(Boolean) ?? [],
      branch:    form.branch    || undefined,
      heritage:  form.heritage  || undefined,
      photoUrl:  form.photoUrl  || undefined,
    };

    try {
      const url    = editingId
        ? `http://localhost:5500/api/trees/${treeId}/members/${editingId}`
        : `http://localhost:5500/api/trees/${treeId}/members`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save member');
      }

      setSuccess(editingId ? 'Member updated!' : 'Member added!');
      setForm(emptyMember);
      setIsAdding(false);
      setEditingId(null);
      fetchMembers();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err: any) {
      setError(err.message || 'Could not save member.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await fetch(`http://localhost:5500/api/trees/${treeId}/members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMembers();
    } catch {
      setError('Could not delete member.');
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────

  const handleEdit = (member: IFamilyMember) => {
    setForm({ ...emptyMember, ...member });
    setEditingId(member._id || null);
    setIsAdding(true);
  };

  // ── Styles ─────────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 10px', fontSize: '12px',
    border: '1px solid #e8e8e8', borderRadius: '6px',
    background: '#fafafa', color: '#333', fontFamily: font,
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', color: '#999',
    textTransform: 'uppercase', letterSpacing: '1px',
    display: 'block', marginBottom: '3px',
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '3px',
  };

  // ── No tree yet ────────────────────────────────────────────────────────────

  if (!treeId) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '32px' }}>🌳</div>
        <p style={{ color: '#999', fontSize: '12px' }}>
          Initialize your family tree to start adding members.
        </p>
        {onInitialize && (
          <button
            onClick={onInitialize}
            style={{ padding: '8px 16px', background: '#8b5e3c', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
          >
            Initialize Tree
          </button>
        )}
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#555', fontFamily: font }}>
          👥 People ({members.length})
        </span>
        {!isAdding && (
          <button
            onClick={() => { setIsAdding(true); setForm(emptyMember); setEditingId(null); }}
            style={{ padding: '4px 10px', background: p.accent || '#8b5e3c', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontFamily: font }}
          >
            + Add Person
          </button>
        )}
      </div>

      {/* Feedback */}
      {error   && <div style={{ fontSize: '11px', color: '#e53e3e', background: '#fff5f5', padding: '8px', borderRadius: '6px', border: '1px solid #fed7d7' }}>{error}</div>}
      {success && <div style={{ fontSize: '11px', color: '#276749', background: '#f0fff4', padding: '8px', borderRadius: '6px', border: '1px solid #c6f6d5' }}>{success}</div>}

      {/* ── Add / Edit Form ── */}
      {isAdding && (
        <div style={{ background: '#f9f9f9', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          <div style={{ fontSize: '11px', fontWeight: '600', color: '#333', fontFamily: font }}>
            {editingId ? '✏️ Edit Member' : '➕ Add Family Member'}
          </div>

          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>First Name *</label>
              <input style={inputStyle} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="José María" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Last Name *</label>
              <input style={inputStyle} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Oliva" />
            </div>
          </div>

          {/* Gender */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Gender</label>
            <select style={inputStyle} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as any })}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          {/* Birth */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Birth Date</label>
              <input style={inputStyle} value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} placeholder="ca. 1808" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Birth Place</label>
              <input style={inputStyle} value={form.birthPlace} onChange={e => setForm({ ...form, birthPlace: e.target.value })} placeholder="Spain" />
            </div>
          </div>

          {/* Death */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Death Date</label>
              <input style={inputStyle} value={form.deathDate} onChange={e => setForm({ ...form, deathDate: e.target.value })} placeholder="unknow" />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Death Place</label>
              <input style={inputStyle} value={form.deathPlace} onChange={e => setForm({ ...form, deathPlace: e.target.value })} placeholder="Spain" />
            </div>
          </div>

          {/* Heritage */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Heritage</label>
            <select style={inputStyle} value={form.heritage} onChange={e => setForm({ ...form, heritage: e.target.value })}>
              <option value="">Select heritage...</option>
              {Object.entries(HERITAGE_STICKERS).map(([k, v]: [string, any]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>

          {/* Family Branch */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Family Branch / Line</label>
            <input
              style={inputStyle}
              value={form.branch}
              onChange={e => setForm({ ...form, branch: e.target.value })}
              placeholder="e.g. Olivas, Paternal, Maternal"
            />
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
              Identifies which family line this person belongs to
            </div>
          </div>

          {/* Generation */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Generation *</label>
            <input
              style={inputStyle}
              type="number"
              min={1}
              value={form.generation}
              onChange={e => setForm({ ...form, generation: parseInt(e.target.value) || 1 })}
            />
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>1 = earliest known ancestor</div>
          </div>

          {/* Photo URL */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Photo URL</label>
            <input
              style={inputStyle}
              value={form.photoUrl}
              onChange={e => setForm({ ...form, photoUrl: e.target.value })}
              placeholder="https://... (Cloudinary or any image URL)"
            />
          </div>

          {/* Father */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Father</label>
            <select style={inputStyle} value={form.fatherId || ''} onChange={e => setForm({ ...form, fatherId: e.target.value || undefined })}>
              <option value="">None / Unknown</option>
              {members
                .filter(m => m._id !== editingId && m.gender !== 'Female')
                .map(m => (
                  <option key={m._id} value={m._id}>{m.firstName} {m.lastName} (Gen {m.generation})</option>
                ))}
            </select>
          </div>

          {/* Mother */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Mother</label>
            <select style={inputStyle} value={form.motherId || ''} onChange={e => setForm({ ...form, motherId: e.target.value || undefined })}>
              <option value="">None / Unknown</option>
              {members
                .filter(m => m._id !== editingId && m.gender !== 'Male')
                .map(m => (
                  <option key={m._id} value={m._id}>{m.firstName} {m.lastName} (Gen {m.generation})</option>
                ))}
            </select>
          </div>

          {/* Spouse */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Spouse</label>
            <select
              style={inputStyle}
              value={form.spouseIds?.[0] || ''}
              onChange={e => setForm({ ...form, spouseIds: e.target.value ? [e.target.value] : [] })}
            >
              <option value="">None / Unknown</option>
              {members
                .filter(m => m._id !== editingId)
                .map(m => (
                  <option key={m._id} value={m._id}>{m.firstName} {m.lastName} (Gen {m.generation})</option>
                ))}
            </select>
          </div>

          {/* Notes */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Notes / Quick Fact</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '60px' }}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="He came to Honduras along with his family in 1832"
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{ flex: 1, padding: '8px', background: p.accent || '#8b5e3c', border: 'none', color: '#fff', borderRadius: '6px', cursor: isLoading ? 'wait' : 'pointer', fontSize: '12px', fontFamily: font }}
            >
              {isLoading ? 'Saving...' : editingId ? '✅ Update Member' : '✅ Add to Family Tree'}
            </button>
            <button
              onClick={() => { setIsAdding(false); setForm(emptyMember); setEditingId(null); setError(''); }}
              style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #e8e8e8', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: font, color: '#666' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Member List ── */}
      {members.length > 0 && !isAdding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {members.map(member => (
            <div
              key={member._id}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '8px' }}
            >
              {/* Icon */}
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                {member.heritage && (HERITAGE_STICKERS as any)[member.heritage]
                  ? (HERITAGE_STICKERS as any)[member.heritage].icon
                  : '👤'}
              </div>

              {/* Info */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: font }}>
                  {member.firstName} {member.lastName}
                </div>
                <div style={{ fontSize: '10px', color: '#999', marginTop: '1px' }}>
                  Gen {member.generation} · {member.birthDate || '?'} — {member.deathDate || 'Present'}
                </div>
                {member.branch && (
                  <span style={{ fontSize: '10px', padding: '1px 6px', backgroundColor: '#f0e6ff', borderRadius: '10px', color: '#7c3aed', border: '1px solid #d8b4fe' }}>
                    🌿 {member.branch}
                  </span>
                )}
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

      {/* Empty state */}
      {members.length === 0 && !isAdding && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#999', fontSize: '12px', fontFamily: font }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌳</div>
          No members yet. Start with your earliest known ancestor.
        </div>
      )}

    </div>
  );
}