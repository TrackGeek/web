import {
  Background,
  type Edge,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";

interface NodeData {
  id: string;
  image: string;
  name: string;
  link: string;
  relationShip: string;
  x?: number;
  y?: number;
}

interface EdgesData {
  id: string;
  source: string;
  target: string;
}

export function Card({ data }: { data: NodeData }) {
  return (
    <Link to={data.link} className="w-full h-fit cursor-pointer pointer-events-auto">
      <div className="relative rounded-xl border border-border overflow-hidden aspect-3/4 shadow-lg bg-background w-32">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${data.image}")`,
          }}
        />
        <div className="relative bg-linear-to-t from-background/95 via-background/60 to-transparent p-3 h-full flex flex-col justify-end">
          <p className="font-bold text-card-foreground text-sm line-clamp-2">{data.name}</p>
          <p
            className={`font-bold text-xs mt-1 px-2 py-0.5 rounded-full inline-block self-start ${
              data.relationShip === "Now" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {data.relationShip}
          </p>
        </div>
        <Handle
          type={"target"}
          position={Position.Left}
          className="w-3! h-3! bg-primary! border-2 border-background opacity-0"
        />
        <Handle
          type={"source"}
          position={Position.Right}
          className="w-3! h-3! bg-primary! border-2 border-background opacity-0"
        />
        <Handle
          type={"source"}
          position={Position.Bottom}
          className="w-3! h-3! bg-primary! border-2 border-background opacity-0"
        />
        <Handle
          type={"source"}
          position={Position.Top}
          className="w-3! h-3! bg-primary! border-2 border-background opacity-0"
        />
      </div>
    </Link>
  );
}

interface FlowProps {
  nodes: NodeData[];
  edges: EdgesData[];
}

const LAYOUT = { H_SPACING: 220, V_SPACING: 210, MAX_ROWS: 5 };

function autoLayout(nodes: NodeData[], edges: EdgesData[]): NodeData[] {
  if (nodes.length === 0 || nodes.every((node) => node.x !== undefined && node.y !== undefined)) return nodes;

  const ids = new Set(nodes.map((node) => node.id));
  const neighbors = new Map<string, { id: string; side: number }[]>();
  const degree = new Map<string, number>();

  for (const edge of edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) continue;
    neighbors.set(edge.source, [...(neighbors.get(edge.source) ?? []), { id: edge.target, side: 1 }]);
    neighbors.set(edge.target, [...(neighbors.get(edge.target) ?? []), { id: edge.source, side: -1 }]);
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }

  const root = nodes.reduce((best, node) => ((degree.get(node.id) ?? 0) > (degree.get(best.id) ?? 0) ? node : best));

  const placement = new Map<string, { side: number; depth: number }>();
  const visited = new Set([root.id]);
  let frontier = [root.id];

  while (frontier.length > 0) {
    const next: string[] = [];
    for (const current of frontier) {
      for (const { id, side } of neighbors.get(current) ?? []) {
        if (visited.has(id)) continue;
        visited.add(id);
        const parent = placement.get(current);
        placement.set(id, { side: parent?.side ?? side, depth: (parent?.depth ?? 0) + 1 });
        next.push(id);
      }
    }
    frontier = next;
  }

  const positions = new Map<string, { x: number; y: number }>([[root.id, { x: 0, y: 0 }]]);

  for (const side of [-1, 1]) {
    const byDepth = new Map<number, string[]>();
    for (const [id, place] of placement) {
      if (place.side !== side) continue;
      byDepth.set(place.depth, [...(byDepth.get(place.depth) ?? []), id]);
    }

    let xCursor = 0;
    for (const depth of [...byDepth.keys()].sort((a, b) => a - b)) {
      const bucket = byDepth.get(depth) ?? [];
      const columns = Math.ceil(bucket.length / LAYOUT.MAX_ROWS);
      const rows = Math.ceil(bucket.length / columns);

      bucket.forEach((id, index) => {
        const column = Math.floor(index / rows);
        const row = index % rows;
        const rowsInColumn = Math.min(rows, bucket.length - column * rows);
        positions.set(id, {
          x: side * (xCursor + (column + 1) * LAYOUT.H_SPACING),
          y: (row - (rowsInColumn - 1) / 2) * LAYOUT.V_SPACING,
        });
      });

      xCursor += columns * LAYOUT.H_SPACING;
    }
  }

  const orphans = nodes.filter((node) => !positions.has(node.id));
  orphans.forEach((node, index) => {
    positions.set(node.id, {
      x: (index - (orphans.length - 1) / 2) * LAYOUT.H_SPACING,
      y: LAYOUT.V_SPACING * 2,
    });
  });

  return nodes.map((node) => ({ ...node, ...positions.get(node.id) }));
}

function Flow({ nodes: rawNodes, edges: rawEdges }: FlowProps) {
  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const hasOrganized = useRef(false);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  const initialNodes = useMemo(() => autoLayout(rawNodes, rawEdges), [rawNodes, rawEdges]);
  const initialEdges = useMemo(() => {
    const ids = new Set(rawNodes.map((node) => node.id));
    return rawEdges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
  }, [rawNodes, rawEdges]);

  useEffect(() => {
    const formatted = initialNodes.map((node) => ({
      id: node.id,
      type: "custom",
      position: { x: node.x ?? 0, y: node.y ?? 0 },
      data: {
        image: node.image,
        name: node.name,
        link: node.link,
        relationShip: node.relationShip,
      },
    }));
    setNodes(formatted as never[]);

    setEdges(
      initialEdges.map((edge) => ({
        ...edge,
        type: "smoothstep",
        style: { stroke: "#64748b", strokeWidth: 2 },
        animated: true,
        markerEnd: { type: "arrowclosed", color: "#64748b" },
      })),
    );
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  useEffect(() => {
    if (nodesInitialized && !hasOrganized.current) {
      hasOrganized.current = true;
      setTimeout(() => fitView({ padding: 0.3, duration: 800 }), 100);
    }
  }, [nodesInitialized, fitView]);

  return (
    <div className="w-full aspect-video relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={() => {}}
        onEdgesChange={() => {}}
        nodeTypes={{ custom: Card }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        edgesFocusable={false}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "#64748b", strokeWidth: 2 },
          animated: true,
          markerEnd: { type: "arrowclosed", color: "#64748b" },
        }}
      >
        <Background gap={16} size={1} color="#e2e8f0" className="bg-background" />
      </ReactFlow>
    </div>
  );
}

export function Relations({ nodes, edges }: FlowProps) {
  return (
    <ReactFlowProvider>
      <Flow nodes={nodes} edges={edges} />
    </ReactFlowProvider>
  );
}
