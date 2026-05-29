import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ArtisticNode from '../ArtisticNode';
import FluidEdge from '../FluidEdge';

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

    const HORIZONTAL_GAP = 220;
    const VERTICAL_GAP = 200;
    const SPOUSE_GAP = 160;

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const genGroups: Record<number, IFamilyMember[]> = {};
    members.forEach(m => {
      const g = m.generation || 1;
      if (!genGroups[g]) genGroups[g] = [];
      genGroups[g].push(m);
    });

    Object.entries(genGroups).forEach(([gen, genMembers]) => {
      const g = parseInt(gen);
      const placed = new Set<string>();
      const positions: { member: IFamilyMember; x: number }[] = [];
      let currentX = 0;

      genMembers.forEach(member => {
        if (placed.has(member._id)) return;
        positions.push({ member, x: currentX });
        placed.add(member._id);

        const spouse = member.spouseIds
          ?.map(id => genMembers.find(m => m._id === id))
          .find(s => s && !placed.has(s._id));

        if (spouse) {
          positions.push({ member: spouse, x: currentX + SPOUSE_GAP });
          placed.add(spouse._id);
          currentX += HORIZONTAL_GAP + SPOUSE_GAP;
        } else {
          currentX += HORIZONTAL_GAP;
        }
      });

      const totalWidth = currentX - HORIZONTAL_GAP;
      const offsetX = -totalWidth / 2;

      positions.forEach(({ member, x }) => {
        nodes.push({
          id: member._id,
          type: 'artisticNode',
          position: { x: offsetX + x, y: (g - 1) * VERTICAL_GAP },
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

    members.forEach(member => {
      if (member.fatherId && nodes.find(n => n.id === member.fatherId)) {
        edges.push({ id: `f-${member.fatherId}-${member._id}`, source: member.fatherId, target: member._id, type: 'fluidEdge', data: { relationshipType: 'parent' } });
      }
      if (member.motherId && nodes.find(n => n.id === member.motherId)) {
        edges.push({ id: `m-${member.motherId}-${member._id}`, source: member.motherId, target: member._id, type: 'fluidEdge', data: { relationshipType: 'parent' } });
      }
      member.spouseIds?.forEach(spouseId => {
        if (!nodes.find(n => n.id === spouseId)) return;
        const edgeId = [member._id, spouseId].sort().join('-spouse-');
        if (!edges.find(e => e.id === edgeId)) {
          edges.push({ id: edgeId, source: member._id, target: spouseId, type: 'fluidEdge', data: { relationshipType: 'spouse' } });
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
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{ padding: 0.2 }} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} zoomOnScroll={false} panOnDrag={true}>
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
    const HORIZONTAL_GAP = 200;
    const VERTICAL_GAP = 180;
    const SPOUSE_GAP = 150;

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const first4Gens = members.filter(m => (m.generation || 1) <= 4);

    const genGroups: Record<number, IFamilyMember[]> = {};
    first4Gens.forEach(m => {
      const g = m.generation || 1;
      if (!genGroups[g]) genGroups[g] = [];
      genGroups[g].push(m);
    });

    Object.entries(genGroups).forEach(([gen, genMembers]) => {
      const g = parseInt(gen);
      const placed = new Set<string>();
      const positions: { member: IFamilyMember; x: number }[] = [];
      let currentX = 0;

      genMembers.forEach(member => {
        if (placed.has(member._id)) return;
        positions.push({ member, x: currentX });
        placed.add(member._id);

        const spouse = member.spouseIds
          ?.map(id => genMembers.find(m => m._id === id))
          .find(s => s && !placed.has(s._id));

        if (spouse) {
          positions.push({ member: spouse, x: currentX + SPOUSE_GAP });
          placed.add(spouse._id);
          currentX += HORIZONTAL_GAP + SPOUSE_GAP;
        } else {
          currentX += HORIZONTAL_GAP;
        }
      });

      const totalWidth = currentX - HORIZONTAL_GAP;
      const offsetX = -totalWidth / 2;

      positions.forEach(({ member, x }) => {
        nodes.push({
          id: member._id,
          type: 'artisticNode',
          position: { x: offsetX + x, y: (g - 1) * VERTICAL_GAP },
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

    first4Gens.forEach(member => {
      if (member.fatherId && nodes.find(n => n.id === member.fatherId)) {
        edges.push({ id: `f-${member.fatherId}-${member._id}`, source: member.fatherId, target: member._id, type: 'fluidEdge', data: { relationshipType: 'parent' } });
      }
      if (member.motherId && nodes.find(n => n.id === member.motherId)) {
        edges.push({ id: `m-${member.motherId}-${member._id}`, source: member.motherId, target: member._id, type: 'fluidEdge', data: { relationshipType: 'parent' } });
      }
      member.spouseIds?.forEach(spouseId => {
        if (!nodes.find(n => n.id === spouseId)) return;
        const edgeId = [member._id, spouseId].sort().join('-spouse-');
        if (!edges.find(e => e.id === edgeId)) {
          edges.push({ id: edgeId, source: member._id, target: spouseId, type: 'fluidEdge', data: { relationshipType: 'spouse' } });
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
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{ padding: 0.15 }} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} zoomOnScroll={false} panOnDrag={true}>
        <Background color={palette.border} gap={24} size={1} />
      </ReactFlow>
    </div>
  );
}