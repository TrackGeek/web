import {
  Background,
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
import { useEffect, useRef } from "react";

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

export function Card({ data }: any) {
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

function Flow({ nodes: initialNodes, edges: initialEdges }: FlowProps) {
  const { fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();
  const hasOrganized = useRef(false);

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

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
      })) as never[],
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
