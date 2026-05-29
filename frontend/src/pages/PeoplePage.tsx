import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HERITAGE_STICKERS } from '../constants/stickers';

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
  generation: number;
  notes: string;
  photoUrl: string;
  fatherId?: string;
  motherId?: string;
  spouseIds?: string[];
}

const empty: IFamilyMember = {
  firstName: '', lastName: '',
  birthDate: '', birthPlace: '',
  deathDate: '', deathPlace: '',
  gender: 'Unknown', heritage: '',
  generation: 1, notes: '', photoUrl: '',
  fatherId: '', motherId: '', spouseIds: []
};

export default function PeoplePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const token = localStorage.getItem('genea_token');
  const treeId = localStorage.getItem('genea_tree_id');

  const [members, setMembers] = useState<IFamilyMember[]>([]);
  const [form, setForm] = useState<IFamilyMember>(empty);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterGen, setFilterGen] = useState<number | null>(null);

  useEffect(() => {
    if (treeId) fetchMembers();
    else setIsLoading(false);
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`http://localhost:5500/api/trees/${treeId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch { setError('Could not load family members.'); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName) { setError('First and last name are required.'); return; }
    if (!treeId) { setError('No tree found. Go back to the builder first.'); return; }
    setIsSaving(true); setError('');
    try {
      const url = editingId
        ? `http://localhost:5500/api/trees/${treeId}/members/${editingId}`
        : `http://localhost:5500/api/trees/${treeId}/members`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed');
      setSuccess(editingId ? 'Member updated!' : 'Member added!');
      setForm(empty); setIsAdding(false); setEditingId(null);
      fetchMembers();
      setTimeout(() => setSuccess(''), 2000);
    } catch { setError('Could not save member.'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this family member?')) return;
    try {
      await fetch(`http://localhost:5500/api/trees/${treeId}/members/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      fetchMembers();
    } catch { setError('Could not delete member.'); }
  };

  const handleEdit = (m: IFamilyMember) => {
    setForm(m); setEditingId(m._id || null); setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const maxGen = Math.max(...members.map(m => m.generation || 1), 1);

  const filtered = members
    .filter(m => {
      const q = search.toLowerCase();
      const matchSearch = !q || `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) || m.birthPlace?.toLowerCase().includes(q);
      const matchGen = filterGen === null || m.generation === filterGen;
      return matchSearch && matchGen;
    })
    .sort((a, b) => (a.generation || 1) - (b.generation || 1) || a.lastName.localeCompare(b.lastName));

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', fontSize: '13px',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    background: '#fff', color: '#1e1a2e', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.8px',
    display: 'block', marginBottom: '4px', fontWeight: '600'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f7f4', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>

      {/* Top Bar */}
      <div style={{ backgroundColor: '#1c1c28', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/builder')} style={{ color: '#9b7fd4', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
            ← Back to Builder
          </button>
          <span style={{ color: '#333' }}>›</span>
          <span style={{ color: '#d0ccc5', fontSize: '14px', fontWeight: '600' }}>👨‍👩‍👧 Family Members</span>
          {members.length > 0 && (
            <span style={{ backgroundColor: '#c9a84c22', border: '1px solid #c9a84c60', borderRadius: '10px', padding: '1px 8px', fontSize: '11px', color: '#c9a84c' }}>
              {members.length} people
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#555', fontSize: '11px' }}>{user?.name}</span>
          <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid #333', color: '#666', borderRadius: '5px', cursor: 'pointer', fontSize: '11px' }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#1e1a2e', marginBottom: '8px' }}>
            Your Family Members
          </h1>
          <p style={{ fontSize: '16px', color: '#94a3b8', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
            Add everyone from your earliest ancestor to the present. Tree slides will display this data automatically.
          </p>
        </div>

        {/* No tree warning */}
        {!treeId && (
          <div style={{ padding: '16px 20px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '10px', marginBottom: '24px', color: '#856404', fontSize: '13px' }}>
            ⚠️ No family tree found. Go back to the <button onClick={() => navigate('/builder')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#856404', textDecoration: 'underline', fontSize: '13px' }}>Builder</button> first to initialize your tree.
          </div>
        )}

        {/* Add / Edit Form */}
        {isAdding && (
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', marginBottom: '28px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e1a2e', margin: 0 }}>
                {editingId ? '✏️ Edit Member' : '➕ Add Family Member'}
              </h2>
              <button onClick={() => { setIsAdding(false); setForm(empty); setEditingId(null); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8' }}>✕</button>
            </div>

            {error && <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

              {/* Name */}
              <div>
                <label style={labelStyle}>First Name *</label>
                <input style={inputStyle} value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="First name" />
              </div>
              <div>
                <label style={labelStyle}>Last Name *</label>
                <input style={inputStyle} value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select style={inputStyle} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as any })}>
                  <option value="Unknown">Unknown</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Birth */}
              <div>
                <label style={labelStyle}>Birth Date</label>
                <input style={inputStyle} value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} placeholder="e.g. 1842 or Jan 12, 1842" />
              </div>
              <div>
                <label style={labelStyle}>Birth Place</label>
                <input style={inputStyle} value={form.birthPlace} onChange={e => setForm({ ...form, birthPlace: e.target.value })} placeholder="City, Country" />
              </div>
              <div>
                <label style={labelStyle}>Heritage</label>
                <select style={inputStyle} value={form.heritage} onChange={e => setForm({ ...form, heritage: e.target.value })}>
                  <option value="">Select heritage...</option>
                  {Object.entries(HERITAGE_STICKERS).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </div>

              {/* Death */}
              <div>
                <label style={labelStyle}>Death Date</label>
                <input style={inputStyle} value={form.deathDate} onChange={e => setForm({ ...form, deathDate: e.target.value })} placeholder="Leave blank if living" />
              </div>
              <div>
                <label style={labelStyle}>Death Place</label>
                <input style={inputStyle} value={form.deathPlace} onChange={e => setForm({ ...form, deathPlace: e.target.value })} placeholder="City, Country" />
              </div>
              <div>
                <label style={labelStyle}>Generation <span style={{ color: '#c9a84c' }}>*</span></label>
                <input style={inputStyle} type="number" min={1} max={30} value={form.generation} onChange={e => setForm({ ...form, generation: parseInt(e.target.value) || 1 })} />
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>1 = earliest known ancestor</div>
              </div>

              {/* Photo */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Photo URL</label>
                <input style={inputStyle} value={form.photoUrl} onChange={e => setForm({ ...form, photoUrl: e.target.value })} placeholder="https://... (Cloudinary or any image URL)" />
              </div>

              {/* Relationships */}
              <div>
                <label style={labelStyle}>Father</label>
                <select style={inputStyle} value={form.fatherId || ''} onChange={e => setForm({ ...form, fatherId: e.target.value })}>
                  <option value="">None / Unknown</option>
                  {members.filter(m => m.gender === 'Male' && m._id !== editingId).map(m => (
                    <option key={m._id} value={m._id}>{m.firstName} {m.lastName} (Gen {m.generation})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Mother</label>
                <select style={inputStyle} value={form.motherId || ''} onChange={e => setForm({ ...form, motherId: e.target.value })}>
                  <option value="">None / Unknown</option>
                  {members.filter(m => m.gender === 'Female' && m._id !== editingId).map(m => (
                    <option key={m._id} value={m._id}>{m.firstName} {m.lastName} (Gen {m.generation})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Spouse</label>
                <select style={inputStyle} value={form.spouseIds?.[0] || ''} onChange={e => setForm({ ...form, spouseIds: e.target.value ? [e.target.value] : [] })}>
                  <option value="">None / Unknown</option>
                  {members.filter(m => m._id !== editingId).map(m => (
                    <option key={m._id} value={m._id}>{m.firstName} {m.lastName} (Gen {m.generation})</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Notes / Quick Fact</label>
                <textarea style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notable facts, occupation, story..." />
              </div>
            </div>

            {/* Form actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                style={{ padding: '10px 28px', background: '#8b5e3c', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit' }}
              >
                {isSaving ? 'Saving...' : editingId ? '✅ Update Member' : '✅ Add to Family Tree'}
              </button>
              <button
                onClick={() => { setIsAdding(false); setForm(empty); setEditingId(null); setError(''); }}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #e2e8f0', color: '#94a3b8', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{ padding: '12px 16px', backgroundColor: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', color: '#065f46', fontSize: '13px', marginBottom: '20px' }}>
            ✅ {success}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {!isAdding && (
            <button
              onClick={() => { setIsAdding(true); setForm(empty); setEditingId(null); }}
              style={{ padding: '10px 20px', background: '#8b5e3c', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ＋ Add Family Member
            </button>
          )}
          <input
            type="text"
            placeholder="Search by name or place..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, width: '240px', fontSize: '13px' }}
          />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => setFilterGen(null)} style={{ padding: '6px 12px', borderRadius: '16px', border: `1px solid ${filterGen === null ? '#8b5e3c' : '#e2e8f0'}`, background: filterGen === null ? '#8b5e3c10' : '#fff', color: filterGen === null ? '#8b5e3c' : '#94a3b8', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}>
              All
            </button>
            {Array.from({ length: maxGen }, (_, i) => i + 1).map(g => (
              <button key={g} onClick={() => setFilterGen(filterGen === g ? null : g)} style={{ padding: '6px 12px', borderRadius: '16px', border: `1px solid ${filterGen === g ? '#8b5e3c' : '#e2e8f0'}`, background: filterGen === g ? '#8b5e3c10' : '#fff', color: filterGen === g ? '#8b5e3c' : '#94a3b8', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}>
                Gen {g}
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌳</div>
            <p>Loading family members...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍👩‍👧</div>
            <h3 style={{ fontSize: '22px', color: '#1e1a2e', marginBottom: '8px' }}>No family members yet</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', fontFamily: "'DM Sans', sans-serif" }}>
              Start by adding your earliest known ancestor — a name and generation number is enough to begin.
            </p>
            <button
              onClick={() => { setIsAdding(true); setForm(empty); }}
              style={{ padding: '12px 28px', background: '#8b5e3c', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
            >
              Add your first ancestor
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Stats bar */}
            <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '8px', flexWrap: 'wrap' }}>
              {[
                { label: 'Total Members', value: members.length },
                { label: 'Generations', value: maxGen },
                { label: 'With Photos', value: members.filter(m => m.photoUrl).length },
                { label: 'Living', value: members.filter(m => !m.deathDate).length },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#8b5e3c' }}>{stat.value}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Member cards */}
            {filtered.map(member => (
              <div
                key={member._id}
                style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
              >
                {/* Photo */}
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '2px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {member.photoUrl
                    ? <img src={member.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <span style={{ fontSize: '22px' }}>{member.gender === 'Female' ? '👩' : member.gender === 'Male' ? '👨' : '👤'}</span>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#1e1a2e' }}>{member.firstName} {member.lastName}</span>
                    {member.heritage && HERITAGE_STICKERS[member.heritage] && (
                      <span style={{ fontSize: '16px' }} title={HERITAGE_STICKERS[member.heritage].label}>{HERITAGE_STICKERS[member.heritage].icon}</span>
                    )}
                    <span style={{ fontSize: '10px', padding: '1px 8px', backgroundColor: '#f1f5f9', borderRadius: '10px', color: '#64748b', border: '1px solid #e2e8f0' }}>
                      Gen {member.generation}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>
                      📅 {member.birthDate || '?'} — {member.deathDate || 'Living'}
                    </span>
                    {member.birthPlace && (
                      <span style={{ fontSize: '12px', color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>
                        📍 {member.birthPlace}
                      </span>
                    )}
                    {member.notes && (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                        "{member.notes}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleEdit(member)}
                    style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#64748b' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member._id!)}
                    style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #fee2e2', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#ef4444' }}
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}