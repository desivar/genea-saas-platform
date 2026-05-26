import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAuth } from '../context/AuthContext';
import ArtisticNode from '../components/ArtisticNode';
import FluidEdge from '../components/FluidEdge';
import FourGenTree from '../components/FourGenTree';

const nodeTypes = { artisticNode: ArtisticNode };
const edgeTypes = { fluidEdge: FluidEdge };

interface IFamilyMember {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'Male' | 'Female' | 'Unknown';
  photoUrl?: string;
  heritage?: string;
  generation?: number;
  fatherId?: string;
  motherId?: string;
  spouseIds?: string[];
  childrenIds?: string[];
}

interface ITree {
  _id: string;
  title: string;
  description?: string;
}

type ViewMode = 'flow' | 'fourgen';
type PaletteKey = 'pastel' | 'sepia' | 'sage' | 'rose';

const PALETTES: Record<PaletteKey, { bg: string; label: string }> = {
  pastel: { bg: 'bg-stone-50', label: '🌸 Pastel' },
  sepia: { bg: 'bg-amber-50/40', label: '📜 Sepia' },
  sage: { bg: 'bg-green-50/40', label: '🌿 Sage' },
  rose: { bg: 'bg-rose-50/30', label: '🌹 Rose' },
};

export default function TreeEditorPage() {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tree, setTree] = useState<ITree | null>(null);
  const [members, setMembers] = useState<IFamilyMember[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [viewMode, setViewMode] = useState<ViewMode>('flow');
  const [palette, setPalette] = useState<PaletteKey>('pastel');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMember, setSelectedMember] = useState<IFamilyMember | null>(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('genea_token');

  useEffect(() => {
    fetchTree();
    fetchMembers();
  }, [treeId]);

  useEffect(() => {
    const newNodes: Node[] = members.map((member, index) => ({
      id: member._id,
      type: 'artisticNode',
      position: { x: (member.generation ?? 1) * 250, y: index * 150 },
      data: {
        name: `${member.firstName} ${member.lastName}`,
        lifespan: member.birthDate
          ? `${member.birthDate} — ${member.deathDate || 'Present'}`
          : '',
        photoUrl: member.photoUrl,
        heritage: member.heritage,
        gender: member.gender,
        onClick: () => setSelectedMember(member),
      },
    }));

    const newEdges: Edge[] = [];
    members.forEach(member => {
      if (member.fatherId) {
        newEdges.push({
          id: `${member.fatherId}-${member._id}`,
          source: member.fatherId,
          target: member._id,
          type: 'fluidEdge',
          data: { relationshipType: 'parent' }
        });
      }
      if (member.motherId) {
        newEdges.push({
          id: `${member.motherId}-${member._id}`,
          source: member.motherId,
          target: member._id,
          type: 'fluidEdge',
          data: { relationshipType: 'parent' }
        });
      }
      member.spouseIds?.forEach(spouseId => {
        newEdges.push({
          id: `spouse-${member._id}-${spouseId}`,
          source: member._id,
          target: spouseId,
          type: 'fluidEdge',
          data: { relationshipType: 'spouse' }
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [members]);

  const fetchTree = async () => {
    try {
      const res = await fetch(`http://localhost:5500/api/trees/${treeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTree(data);
    } catch {
      setError('Could not load tree.');
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`http://localhost:5500/api/trees/${treeId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMembers(data);
    } catch {
      setError('Could not load members.');
    } finally {
      setIsLoading(false);
    }
  };

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({ ...connection, type: 'fluidEdge' }, eds));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`http://localhost:5500/api/trees/${treeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nodePositions: nodes.map(n => ({ id: n.id, position: n.position }))
        })
      });
    } catch {
      setError('Could not save.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-spin">🌳</div>
          <p className="text-stone-400 text-sm font-light">Loading tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${PALETTES[palette].bg} flex flex-col`}>

      {/* Toolbar */}
      <div className="bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between gap-4 flex-wrap">

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-stone-400 hover:text-stone-600 text-sm transition-colors"
          >
            ← Back
          </button>
          <span className="text-stone-200">|</span>
          <h1 className="font-serif text-lg text-stone-800">{tree?.title ?? 'Family Tree'}</h1>
        </div>

        <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('flow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'flow'
                ? 'bg-white shadow-sm text-stone-800'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            🌐 Flow Tree
          </button>
          <button
            onClick={() => setViewMode('fourgen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'fourgen'
                ? 'bg-white shadow-sm text-stone-800'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            📊 4 Generation
          </button>
        </div>

        <div className="flex items-center gap-2">
          {(Object.keys(PALETTES) as PaletteKey[]).map(key => (
            <button
              key={key}
              onClick={() => setPalette(key)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all border ${
                palette === key
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-stone-50 border-stone-200 text-stone-400'
              }`}
            >
              {PALETTES[key].label}
            </button>
          ))}
          <span className="text-stone-200">|</span>
          <button
            onClick={() => navigate(`/presentation/${treeId}`)}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-medium transition-colors"
          >
            🎬 Present
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          {error}
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1">
        {viewMode === 'flow' ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background color="#d6d3d1" gap={24} size={1} />
            <Controls />
            <MiniMap
              nodeColor={n => n.data.gender === 'Female' ? '#fecdd3' : '#bfdbfe'}
              className="rounded-xl border border-stone-200"
            />
          </ReactFlow>
        ) : (
          <div className="p-8">
            <FourGenTree
              familyData={members.map(m => ({
                id: m._id,
                name: `${m.firstName} ${m.lastName}`,
                birthYear: m.birthDate,
                deathYear: m.deathDate,
                generation: m.generation ?? 1,
                heritage: m.heritage,
                gender: m.gender,
                photoUrl: m.photoUrl,
              }))}
              title={tree?.title}
            />
          </div>
        )}
      </div>

      {/* Member Detail Panel */}
      {selectedMember && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-stone-200 shadow-xl p-6 overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg text-stone-800">Member Details</h3>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-stone-400 hover:text-stone-600 text-xl"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-24 h-24 rounded-full bg-stone-100 border border-stone-200 mx-auto overflow-hidden flex items-center justify-center text-stone-300 text-3xl">
              {selectedMember.photoUrl
                ? <img src={selectedMember.photoUrl} className="w-full h-full object-cover" alt={selectedMember.firstName} />
                : '📷'
              }
            </div>
            <div className="text-center">
              <h4 className="font-serif text-xl text-stone-800">
                {selectedMember.firstName} {selectedMember.lastName}
              </h4>
              <p className="text-stone-400 text-xs mt-1">
                {selectedMember.birthDate} — {selectedMember.deathDate || 'Present'}
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              {[
                { label: 'Gender', value: selectedMember.gender },
                { label: 'Heritage', value: selectedMember.heritage },
                { label: 'Generation', value: selectedMember.generation },
              ].map(({ label, value }) => value && (
                <div key={label} className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-400 text-xs uppercase tracking-wider">{label}</span>
                  <span className="text-stone-700 text-xs font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <button className="w-full py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-medium transition-colors">
                ✏️ Edit Member
              </button>
              <button className="w-full py-2 bg-stone-50 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-stone-500 hover:text-rose-600 rounded-xl text-xs font-medium transition-colors">
                🗑️ Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}