import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  User,
  Heart,
  UserCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Mail,
  Phone,
  Crown,
  Shield,
  FileText,
  Calendar,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { RELATIONSHIP_LABELS, formatDate } from '@/constants';
import { cn } from '@/lib/utils';
import type { Heir, HeirRelationship, User as UserType } from '@/types';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'owner' | 'heir';
  relationship?: HeirRelationship;
  data: Heir | UserType;
  radius: number;
  fixed?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
  relationship: HeirRelationship;
}

const relationshipColors: Record<HeirRelationship, string> = {
  spouse: '#ec4899',
  child: '#3b82f6',
  parent: '#f59e0b',
  sibling: '#8b5cf6',
  friend: '#10b981',
  lawyer: '#6b7280',
  other: '#6b7280',
};

const relationshipNodeColors: Record<HeirRelationship, { bg: string; border: string; text: string }> = {
  spouse: { bg: '#fce7f3', border: '#ec4899', text: '#be185d' },
  child: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8' },
  parent: { bg: '#fef3c7', border: '#f59e0b', text: '#b45309' },
  sibling: { bg: '#ede9fe', border: '#8b5cf6', text: '#6d28d9' },
  friend: { bg: '#d1fae5', border: '#10b981', text: '#047857' },
  lawyer: { bg: '#f3f4f6', border: '#6b7280', text: '#374151' },
  other: { bg: '#f3f4f6', border: '#6b7280', text: '#374151' },
};

export default function FamilyGraph() {
  const heirs = useAppStore((state) => state.heirs);
  const currentUser = useAppStore((state) => state.currentUser);
  const assets = useAppStore((state) => state.assets);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const getHeirAssets = useCallback(
    (heirId: string) => {
      return assets.filter((a) => a.heirId === heirId);
    },
    [assets]
  );

  const initialNodes = useMemo<GraphNode[]>(() => {
    const nodes: GraphNode[] = [];

    if (currentUser) {
      nodes.push({
        id: 'owner',
        label: currentUser.name,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        type: 'owner',
        data: currentUser,
        radius: 50,
        fixed: true,
      });
    }

    const count = heirs.length;
    heirs.forEach((heir, index) => {
      const angle = (2 * Math.PI * index) / Math.max(count, 1) - Math.PI / 2;
      const radius = 200;
      nodes.push({
        id: heir.id,
        label: heir.name,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        type: 'heir',
        relationship: heir.relationship,
        data: heir,
        radius: 40,
      });
    });

    return nodes;
  }, [currentUser, heirs]);

  const initialLinks = useMemo<GraphLink[]>(() => {
    if (!currentUser) return [];
    return heirs.map((heir) => ({
      source: 'owner',
      target: heir.id,
      label: RELATIONSHIP_LABELS[heir.relationship],
      relationship: heir.relationship,
    }));
  }, [currentUser, heirs]);

  useEffect(() => {
    nodesRef.current = JSON.parse(JSON.stringify(initialNodes));
    linksRef.current = JSON.parse(JSON.stringify(initialLinks));
    setTransform({ x: 0, y: 0, scale: 1 });
    setSelectedNode(null);
  }, [initialNodes, initialLinks]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const nodes = nodesRef.current;
    const links = linksRef.current;

    const getNode = (id: string) => nodes.find((n) => n.id === id);

    const simulate = () => {
      const width = dimensions.width;
      const height = dimensions.height;
      const centerX = width / 2;
      const centerY = height / 2;

      const repulsionStrength = 15000;
      const attractionStrength = 0.008;
      const centerStrength = 0.002;
      const damping = 0.85;
      const velocityLimit = 8;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist === 0) {
            dx = (Math.random() - 0.5) * 0.1;
            dy = (Math.random() - 0.5) * 0.1;
            dist = 0.1;
          }

          const force = repulsionStrength / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (!a.fixed) {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (!b.fixed) {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }

      for (const link of links) {
        const source = getNode(link.source);
        const target = getNode(link.target);
        if (!source || !target) continue;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) continue;

        const targetDist = 220;
        const force = (dist - targetDist) * attractionStrength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (!source.fixed) {
          source.vx += fx;
          source.vy += fy;
        }
        if (!target.fixed) {
          target.vx -= fx;
          target.vy -= fy;
        }
      }

      for (const node of nodes) {
        if (node.fixed) continue;

        node.vx += (centerX - node.x) * centerStrength;
        node.vy += (centerY - node.y) * centerStrength;

        node.vx *= damping;
        node.vy *= damping;

        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > velocityLimit) {
          node.vx = (node.vx / speed) * velocityLimit;
          node.vy = (node.vy / speed) * velocityLimit;
        }

        node.x += node.vx;
        node.y += node.vy;
      }

      animationRef.current = requestAnimationFrame(simulate);
    };

    animationRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, transform.scale * delta));

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const oldScale = transform.scale;
      const newX = mouseX - (mouseX - transform.x) * (newScale / oldScale);
      const newY = mouseY - (mouseY - transform.y) * (newScale / oldScale);

      setTransform({ x: newX, y: newY, scale: newScale });
    }
  }, [transform]);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (!node || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
    const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;

    draggingRef.current = {
      id: nodeId,
      offsetX: mouseX - node.x,
      offsetY: mouseY - node.y,
    };

    node.fixed = true;
    setSelectedNode(node);
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingRef.current || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
    const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;

    const node = nodesRef.current.find((n) => n.id === draggingRef.current!.id);
    if (node) {
      node.x = mouseX - draggingRef.current.offsetX;
      node.y = mouseY - draggingRef.current.offsetY;
      node.vx = 0;
      node.vy = 0;
    }
  }, [transform]);

  const handleMouseUp = useCallback(() => {
    if (draggingRef.current) {
      const node = nodesRef.current.find((n) => n.id === draggingRef.current!.id);
      if (node && node.type !== 'owner') {
        node.fixed = false;
      }
      draggingRef.current = null;
    }
  }, []);

  const handleSvgMouseDown = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const zoomIn = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(3, prev.scale * 1.2),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.3, prev.scale / 1.2),
    }));
  }, []);

  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
    nodesRef.current = JSON.parse(JSON.stringify(initialNodes));
  }, [initialNodes]);

  const closeDetail = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const nodes = nodesRef.current;
  const links = linksRef.current;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">家庭关系图谱</h1>
          <p className="text-gray-500 mt-1">可视化展示您与继承人的亲属关系网络</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-500 min-w-[60px] text-center">
            {Math.round(transform.scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="放大"
          >
            <ZoomIn className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="重置视图"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{heirs.length}</p>
              <p className="text-sm text-gray-500">继承人总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {heirs.filter((h) => h.relationship === 'spouse').length}
              </p>
              <p className="text-sm text-gray-500">配偶</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {heirs.filter((h) => h.relationship === 'child').length}
              </p>
              <p className="text-sm text-gray-500">子女</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {heirs.filter((h) => h.relationship === 'parent').length}
              </p>
              <p className="text-sm text-gray-500">父母</p>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative"
        style={{ height: '600px' }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseDown={handleSvgMouseDown}
          className="cursor-grab active:cursor-grabbing"
        >
          <defs>
            {links.map((link, i) => (
              <linearGradient
                key={`gradient-${i}`}
                id={`link-gradient-${i}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                <stop
                  offset="100%"
                  stopColor={relationshipColors[link.relationship]}
                  stopOpacity="0.6"
                />
              </linearGradient>
            ))}
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
            </filter>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
            {links.map((link, i) => {
              const source = nodes.find((n) => n.id === link.source);
              const target = nodes.find((n) => n.id === link.target);
              if (!source || !target) return null;

              const midX = (source.x + target.x) / 2;
              const midY = (source.y + target.y) / 2;

              return (
                <g key={`link-${i}`}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={`url(#link-gradient-${i})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-40"
                      y="-12"
                      width="80"
                      height="24"
                      rx="12"
                      fill="white"
                      stroke={relationshipColors[link.relationship]}
                      strokeWidth="1.5"
                      opacity="0.95"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="12"
                      fontWeight="500"
                      fill={relationshipColors[link.relationship]}
                    >
                      {link.label}
                    </text>
                  </g>
                </g>
              );
            })}

            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const colors =
                node.type === 'owner'
                  ? { bg: '#10b981', border: '#059669', text: '#ffffff' }
                  : relationshipNodeColors[node.relationship!];

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  className="cursor-pointer"
                  filter={isSelected ? 'url(#glow)' : 'url(#shadow)'}
                >
                  <circle
                    r={node.radius + 6}
                    fill={colors.bg}
                    opacity={isSelected ? 0.3 : 0}
                    className="transition-opacity duration-200"
                  />
                  <circle
                    r={node.radius}
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth="3"
                    className="transition-all duration-200 hover:stroke-4"
                  />

                  {node.type === 'owner' ? (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="24"
                      fill="white"
                    >
                      👑
                    </text>
                  ) : (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="20"
                      fill={colors.text}
                    >
                      {node.relationship === 'spouse' && '💑'}
                      {node.relationship === 'child' && '👶'}
                      {node.relationship === 'parent' && '👴'}
                      {node.relationship === 'sibling' && '👬'}
                      {node.relationship === 'friend' && '🤝'}
                      {node.relationship === 'lawyer' && '⚖️'}
                      {node.relationship === 'other' && '👤'}
                    </text>
                  )}

                  <text
                    y={node.radius + 20}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill="#374151"
                  >
                    {node.label}
                  </text>

                  {node.type === 'owner' && (
                    <text
                      y={node.radius + 38}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#10b981"
                      fontWeight="500"
                    >
                      资产所有人
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200">
          <Info className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">拖拽节点调整位置 · 滚轮缩放 · 点击查看详情</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">关系类型图例</h3>
        <div className="flex flex-wrap gap-4">
          {(Object.keys(RELATIONSHIP_LABELS) as HeirRelationship[]).map((rel) => (
            <div key={rel} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: relationshipColors[rel] }}
              />
              <span className="text-sm text-gray-600">{RELATIONSHIP_LABELS[rel]}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={closeDetail}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="p-6 text-white relative"
              style={{
                background:
                  selectedNode.type === 'owner'
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : `linear-gradient(135deg, ${relationshipColors[selectedNode.relationship!]}, ${relationshipNodeColors[selectedNode.relationship!].border})`,
              }}
            >
              <button
                onClick={closeDetail}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                  {selectedNode.type === 'owner' ? '👑' : '👤'}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedNode.label}</h2>
                  <p className="text-white/80 text-sm mt-1">
                    {selectedNode.type === 'owner'
                      ? '资产所有人'
                      : RELATIONSHIP_LABELS[selectedNode.relationship!]}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {selectedNode.type === 'owner' ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{(selectedNode.data as UserType).email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {(selectedNode.data as UserType).mfaEnabled ? '已启用二次验证' : '未启用二次验证'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        共管理 {assets.length} 项数字资产
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        创建于 {formatDate((selectedNode.data as UserType).createdAt)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {(() => {
                    const heir = selectedNode.data as Heir;
                    const heirAssets = getHeirAssets(heir.id);
                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-medium',
                              heir.isVerified
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            )}
                          >
                            {heir.isVerified ? '已验证' : '待验证'}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            第 {heir.priority} 顺位
                          </span>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{heir.email}</span>
                          </div>
                          {heir.phone && (
                            <div className="flex items-center gap-3 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{heir.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-sm">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              分配 {heirAssets.length} 项资产
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              添加于 {formatDate(heir.createdAt)}
                            </span>
                          </div>
                        </div>

                        {heirAssets.length > 0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700 mb-2">分配的资产</p>
                            <div className="flex flex-wrap gap-2">
                              {heirAssets.slice(0, 5).map((asset) => (
                                <span
                                  key={asset.id}
                                  className="px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-600"
                                >
                                  {asset.name}
                                </span>
                              ))}
                              {heirAssets.length > 5 && (
                                <span className="px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-400">
                                  +{heirAssets.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
