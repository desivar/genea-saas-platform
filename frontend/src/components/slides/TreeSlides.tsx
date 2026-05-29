import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ArtisticNode from '../ArtisticNode';
import FluidEdge from '../FluidEdge';
import { HERITAGE_STICKERS } from '../../constants/stickers';

const nodeTypes = { artisticNode: ArtisticNode };
const edgeTypes = { fluidEdge: FluidEdge };

interface IFamilyMember {
  _id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: string;
  heritage?: string;
  generation?: number;
  photoUrl?: string;
  fatherId?: string;
  motherId?: string;
  spouseIds?: string[];
  branch?: string;
}

// ─── Full Pedigree Tree ───────────────────────────────────────────────────────

export function FullPedigreeTree({ members, palette, font }: {
  members: IFamilyMember[];
  palette: any;
  font: string;
}) {
  const { nodes, edges } = useMemo(() => {
    if (members.length === 0) return { nodes: [], edges: [] };

    const maxGen = Math.max(...members.map(m => m.generation || 1));
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Group by generation
    const genGroups: Record<number, IFamilyMember[]> = {};
    members.forEach(m => {
      const g = m.generation || 1;
      if (!genGroups[g]) genGroups[g] = [];
      genGroups[g].push(m);
    });

    // Position nodes
 // Replace the positioning logic in FullPedigreeTree:
// Replace the entire nodes/edges useMemo in FullPedigreeTree:
const { nodes, edges } = useMemo(() => {
  if (members.length === 0) return { nodes: [], edges: [] };

  const HORIZONTAL_GAP = 200;
  const VERTICAL_GAP = 200;

  // Group by generation
  const genGroups: Record<number, IFamilyMember[]> = {};
  members.forEach(m => {
    const g = m.generation || 1;
    if (!genGroups[g]) genGroups[g] = [];
    genGroups[g].push(m);
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Find max members in any generation for centering
  const maxCount = Math.max(...Object.values(genGroups).map(g => g.length));

  Object.entries(genGroups).forEach(([gen, genMembers]) => {
    const g = parseInt(gen);
    const count = genMembers.length;
    // Center each generation relative to the widest generation
    const totalWidth = maxCount * HORIZONTAL_GAP;
    const genWidth = count * HORIZONTAL_GAP;
    const startX = (totalWidth - genWidth) / 2;

    genMembers.forEach((member, i) => {
      nodes.push({
        id: member._id,
        type: 'artisticNode',
        position: {
          x: startX + i * HORIZONTAL_GAP,
          y: (g - 1) * VERTICAL_GAP
        },
        data: {
          name: `${member.firstName} ${member.lastName}`,
          lifespan: `${member.birthDate || '?'} — ${member.deathDate || '†?'}`,
          photoUrl: member.photoUrl,
          heritage: member.heritage,
          gender: member.gender,
        }
      });
    });
  });

  // Edges
  members.forEach(member => {
    if (member.fatherId && nodes.find(n => n.id === member.fatherId)) {
      edges.push({
        id: `f-${member.fatherId}-${member._id}`,
        source: member.fatherId,
        target: member._id,
        type: 'fluidEdge',
        data: { relationshipType: 'parent' }
      });
    }
    if (member.motherId && nodes.find(n => n.id === member.motherId)) {
      edges.push({
        id: `m-${member.motherId}-${member._id}`,
        source: member.motherId,
        target: member._id,
        type: 'fluidEdge',
        data: { relationshipType: 'parent' }
      });
    }
    member.spouseIds?.forEach(spouseId => {
      if (!nodes.find(n => n.id === spouseId)) return;
      const edgeId = [member._id, spouseId].sort().join('-spouse-');
      if (!edges.find(e => e.id === edgeId)) {
        edges.push({
          id: edgeId,
          source: member._id,
          target: spouseId,
          type: 'fluidEdge',
          data: { relationshipType: 'spouse' }
        });
      }
    });
  });

  return { nodes, edges };
}, [members]);

    // Parent-child edges
    members.forEach(member => {
      if (member.fatherId) {
        edges.push({
          id: `f-${member.fatherId}-${member._id}`,
          source: member.fatherId,
          target: member._id,
          type: 'fluidEdge',
          data: { relationshipType: 'parent' }
        });
      }
      if (member.motherId) {
        edges.push({
          id: `m-${member.motherId}-${member._id}`,
          source: member.motherId,
          target: member._id,
          type: 'fluidEdge',
          data: { relationshipType: 'parent' }
        });
      }
      // Spouse edges
      member.spouseIds?.forEach(spouseId => {
        const edgeId = [member._id, spouseId].sort().join('-spouse-');
        if (!edges.find(e => e.id === edgeId)) {
          edges.push({
            id: edgeId,
            source: member._id,
            target: spouseId,
            type: 'fluidEdge',
            data: { relationshipType: 'spouse' }
          });
        }
      });
    });

    return { nodes, edges };
  }, [members]);

  if (members.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', backgroundColor: palette.bg, fontFamily: font }}>
        <div style={{ fontSize: '48px' }}>🌳</div>
        <p style={{ color: palette.muted, fontSize: '14px' }}>Add family members in the People section</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: palette.bg }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag={true}
      >
        <Background color={palette.border} gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}

// ─── Four Generation Tree ─────────────────────────────────────────────────────

export function FourGenTree({ members, palette, font }: {
  members: IFamilyMember[];
  palette: any;
  font: string;
}) {
  const { nodes, edges } = useMemo(() => {
    // Only use first 4 generations
    const gen1 = members.filter(m => (m.generation || 1) === 1);
    const gen2 = members.filter(m => (m.generation || 1) === 2);
    const gen3 = members.filter(m => (m.generation || 1) === 3);
    const gen4 = members.filter(m => (m.generation || 1) === 4);

    const allGens = [gen1, gen2, gen3, gen4];
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const HORIZONTAL_GAP = 180;
    const VERTICAL_GAP = 150;

    allGens.forEach((gen, gi) => {
      const totalWidth = gen.length * HORIZONTAL_GAP;
      const startX = -totalWidth / 2;

      gen.forEach((member, i) => {
        nodes.push({
          id: member._id,
          type: 'artisticNode',
          position: {
            x: startX + i * HORIZONTAL_GAP,
            y: gi * VERTICAL_GAP
          },
          data: {
            name: `${member.firstName} ${member.lastName}`,
            lifespan: `${member.birthDate || '?'} — ${member.deathDate || '†?'}`,
            photoUrl: member.photoUrl,
            heritage: member.heritage,
            gender: member.gender,
          }
        });
      });
    });

    // Parent-child edges
    members.forEach(member => {
      if (member.fatherId) {
        edges.push({
          id: `f-${member.fatherId}-${member._id}`,
          source: member.fatherId,
          target: member._id,
          type: 'fluidEdge',
          data: { relationshipType: 'parent' }
        });
      }
      if (member.motherId) {
        edges.push({
          id: `m-${member.motherId}-${member._id}`,
          source: member.motherId,
          target: member._id,
          type: 'fluidEdge',
          data: { relationshipType: 'parent' }
        });
      }
      member.spouseIds?.forEach(spouseId => {
        const edgeId = [member._id, spouseId].sort().join('-spouse-');
        if (!edges.find(e => e.id === edgeId)) {
          edges.push({
            id: edgeId,
            source: member._id,
            target: spouseId,
            type: 'fluidEdge',
            data: { relationshipType: 'spouse' }
          });
        }
      });
    });

    return { nodes, edges };
  }, [members]);

  if (members.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', backgroundColor: palette.bg, fontFamily: font }}>
        <div style={{ fontSize: '48px' }}>🌳</div>
        <p style={{ color: palette.muted, fontSize: '14px' }}>Add family members to display the 4 generation tree</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: palette.bg }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag={true}
      >
        <Background color={palette.border} gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}