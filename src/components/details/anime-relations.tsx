import {
	Background,
	type Edge,
	Handle,
	Position,
	ReactFlow,
	ReactFlowProvider,
	useNodesInitialized,
	useReactFlow,
} from "@xyflow/react";
import { useTranslation } from "react-i18next";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const nodes = [
	{
		id: "manga",
		type: "custom",
		position: { x: 0, y: -200 },
		data: {
			image: "https://cdn.myanimelist.net/images/manga/3/232121l.jpg",
			name: "Sousou no Frieren",
			link: "/manga/sousou-no-frieren",
			relationShip: "Manga - Source",
		},
	},
	{
		id: "prequel",
		type: "custom",
		position: { x: -200, y: 0 },
		data: {
			image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
			name: "Sousou no Frieren",
			link: "/anime/sousou-no-frieren",
			relationShip: "Prequel",
		},
		default: true,
	},
	{
		id: "n1",
		type: "custom",
		position: { x: 0, y: 0 },
		data: {
			image: "https://cdn.myanimelist.net/images/anime/1921/154528l.jpg",
			name: "Sousou no Frieren 2nd Season",
			link: "/anime/sousou-no-frieren-2nd-season",
			relationShip: "Now",
		},
		default: true,
	},
	{
		id: "n2",
		type: "custom",
		position: { x: 200, y: 0 },
		data: {
			image:
				"https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b206425-WOwXsfDbHZwb.jpg",
			name: "Sousou no Frieren 3rd Season",
			link: "/anime/sousou-no-frieren-3rd-season",
			relationShip: "Sequel",
		},
	},
];

const edges = [
	{ id: "n1-n2", source: "n1", target: "n2", className: "edge-path" },
	{ id: "prequel-n2", source: "prequel", target: "n1", className: "edge-path" },
	{ id: "manga-n1", source: "manga", target: "n1", className: "edge-path" },
];

export function AnimeCard({ data }: any) {
	return (
		<Link
			to={data.link}
			className="w-full h-fit cursor-pointer pointer-events-auto"
		>
			<div className="relative rounded-xl border border-border overflow-hidden aspect-3/4 shadow-lg bg-background w-32">
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{
						backgroundImage: `url("${data.image}")`,
					}}
				/>
				<div className="relative bg-linear-to-t from-background/95 via-background/60 to-transparent p-3 h-full flex flex-col justify-end">
					<p className="font-bold text-card-foreground text-sm line-clamp-2">
						{data.name}
					</p>
					<p
						className={`font-bold text-xs mt-1 px-2 py-0.5 rounded-full inline-block self-start ${
							data.relationShip === "Now"
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground"
						}`}
					>
						{data.relationShip}
					</p>
				</div>
				<Handle
					type="target"
					position={Position.Left}
					className="w-3! h-3! bg-primary! border-2 border-background"
				/>
				<Handle
					type="source"
					position={Position.Right}
					className="w-3! h-3! bg-primary! border-2 border-background"
				/>
				<Handle
					type="source"
					position={Position.Bottom}
					className="w-3! h-3! bg-primary! border-2 border-background"
				/>
				<Handle
					type="source"
					position={Position.Top}
					className="w-3! h-3! bg-primary! border-2 border-background"
				/>
			</div>
		</Link>
	);
}

const organizeNodes = (nodes: any[], edges: any[], centerNodeId: string) => {
	const levels = new Map();
	const visited = new Set();

	const queue = [{ id: centerNodeId, level: 0 }];
	visited.add(centerNodeId);
	levels.set(centerNodeId, 0);

	while (queue.length > 0) {
		const { id, level } = queue.shift()!;

		const connectedEdges = edges.filter(
			(edge) => edge.source === id || edge.target === id,
		);

		for (const edge of connectedEdges) {
			const neighborId = edge.source === id ? edge.target : edge.source;
			if (!visited.has(neighborId)) {
				visited.add(neighborId);
				levels.set(neighborId, level + 1);
				queue.push({ id: neighborId, level: level + 1 });
			}
		}
	}

	const maxLevel = Math.max(...Array.from(levels.values()));
	const organizedNodes = [...nodes];

	organizedNodes.forEach((node) => {
		const level = levels.get(node.id) ?? 0;
		const isCenter = node.id === centerNodeId;

		if (isCenter) {
			node.position = { x: 0, y: 0 };
		} else {
			const levelNodes = organizedNodes.filter(
				(n) => levels.get(n.id) === level,
			);
			const index = levelNodes.findIndex((n) => n.id === node.id);
			const spacing = 350;
			const baseX = (level - maxLevel / 2) * 400;

			node.position = {
				x: baseX + (index - levelNodes.length / 2) * spacing,
				y: (level - maxLevel / 2) * 250,
			};
		}
	});

	return organizedNodes;
};

function AnimeFlow() {
	const { t } = useTranslation();
	const { fitView, setNodes, setEdges } = useReactFlow();
	const nodesInitialized = useNodesInitialized();
	const hasOrganized = useRef(false);

	const findCenterNode = useCallback(() => {
		return nodes.find((node) => node.data.relationShip === "Now")?.id || "n1";
	}, []);

	useEffect(() => {
		if (nodesInitialized && !hasOrganized.current) {
			const centerNodeId = findCenterNode();
			const organizedNodes = organizeNodes(nodes, edges, centerNodeId);

			setNodes(organizedNodes);

			const styledEdges = edges.map((edge) => ({
				...edge,
				type: "smoothstep",
				style: { stroke: "#64748b", strokeWidth: 2 },
				animated: true,
				className: "z-0",
				markerEnd: {
					type: "arrowclosed",
					color: "#64748b",
				},
			}));

			setEdges(styledEdges as Edge[]);

			setTimeout(() => {
				fitView({ padding: 0.3, duration: 800 });
			}, 100);

			hasOrganized.current = true;
		}
	}, [nodesInitialized, fitView, setNodes, setEdges, findCenterNode]);

	return (
		<div className="w-full aspect-video relative">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				nodeTypes={{ custom: AnimeCard }}
				nodesDraggable={false}
				nodesConnectable={false}
				elementsSelectable={false}
				edgesFocusable={false}
				fitView
				fitViewOptions={{ padding: 0.3 }}
				minZoom={0.1}
				maxZoom={1.5}
				defaultViewport={{ zoom: 1.3, x: 0, y: 0 }}
				defaultEdgeOptions={{
					type: "smoothstep",
					style: { stroke: "#64748b", strokeWidth: 2 },
					animated: true,
					className: "z-0",
					markerEnd: {
						type: "arrowclosed",
						color: "#64748b",
					},
				}}
				proOptions={{ hideAttribution: true }}
			>
				<Background
					gap={16}
					size={1}
					color="#e2e8f0"
					className="bg-background"
				/>
			</ReactFlow>

			{/* Overlay para garantir que edges fiquem atrás */}
			<style>{`
        .react-flow__edges {
          z-index: 0 !important;
        }
        .react-flow__nodes {
          z-index: 1 !important;
        }
        .react-flow__handle {
          z-index: 2 !important;
        }
        .edge-path {
          stroke-width: 2;
          stroke: #64748b;
        }
        .react-flow__edge-path {
          stroke-width: 2;
        }
        .react-flow__edge.animated path {
          stroke-dasharray: 5;
          animation: dashdraw 0.5s linear infinite;
        }
        @keyframes dashdraw {
          from { stroke-dashoffset: 10; }
        }
      `}</style>
		</div>
	);
}

export function AnimeRelations() {
	return (
		<ReactFlowProvider>
			<AnimeFlow />
		</ReactFlowProvider>
	);
}
