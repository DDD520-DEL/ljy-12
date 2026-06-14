import { useState, useMemo } from 'react';
import {
  KeyRound,
  Plus,
  Search,
  X,
  Users,
  Shield,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Send,
  Check,
  Play,
  Eye,
  Copy,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Fingerprint,
  Puzzle,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  RECOVERY_KEY_STATUS_LABELS,
  RECOVERY_KEY_STATUS_COLORS,
  RECOVERY_SHARD_STATUS_LABELS,
  RECOVERY_SHARD_STATUS_COLORS,
  RECIPIENT_TYPE_LABELS,
  RECIPIENT_TYPE_COLORS,
  formatDate,
  SHARDING_ALGORITHM_LABELS,
} from '@/constants';
import { cn } from '@/lib/utils';
import type {
  RecoveryKey,
  RecoveryKeyShard,
  ShardingAlgorithm,
  DigitalAsset,
} from '@/types';

export default function RecoveryKeySharding() {
  const recoveryKeys = useAppStore((state) => state.recoveryKeys);
  const assets = useAppStore((state) => state.assets);
  const createRecoveryKey = useAppStore((state) => state.createRecoveryKey);
  const activateRecoveryKey = useAppStore((state) => state.activateRecoveryKey);
  const revokeRecoveryKey = useAppStore((state) => state.revokeRecoveryKey);
  const deleteRecoveryKey = useAppStore((state) => state.deleteRecoveryKey);
  const assignShard = useAppStore((state) => state.assignShard);
  const distributeShard = useAppStore((state) => state.distributeShard);
  const verifyShard = useAppStore((state) => state.verifyShard);
  const startRecovery = useAppStore((state) => state.startRecovery);
  const collectShard = useAppStore((state) => state.collectShard);
  const getRecoveryProgress = useAppStore((state) => state.getRecoveryProgress);
  const getAvailableRecipients = useAppStore((state) => state.getAvailableRecipients);
  const addNotification = useAppStore((state) => state.addNotification);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<RecoveryKey | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedShard, setSelectedShard] = useState<RecoveryKeyShard | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);

  const [createForm, setCreateForm] = useState({
    assetId: '',
    totalShards: 5,
    requiredShards: 3,
    algorithm: 'shamir' as ShardingAlgorithm,
    description: '',
    autoRevokeDays: 365,
  });

  const [verifyCode, setVerifyCode] = useState('');
  const [collectShardData, setCollectShardData] = useState('');

  const availableRecipients = useMemo(() => getAvailableRecipients(), [getAvailableRecipients]);

  const assetsWithoutRecoveryKey = useMemo(() => {
    const keyAssetIds = new Set(recoveryKeys.map((k) => k.assetId));
    return assets.filter((a) => !keyAssetIds.has(a.id));
  }, [assets, recoveryKeys]);

  const filteredKeys = useMemo(() => {
    return recoveryKeys.filter((key) => {
      const matchesSearch =
        key.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || key.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [recoveryKeys, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = recoveryKeys.length;
    const active = recoveryKeys.filter((k) => k.status === 'active').length;
    const draft = recoveryKeys.filter((k) => k.status === 'draft').length;
    const recovering = recoveryKeys.filter((k) => k.status === 'recovering').length;
    const totalShards = recoveryKeys.reduce((sum, k) => sum + k.shards.length, 0);
    const verifiedShards = recoveryKeys.reduce(
      (sum, k) => sum + k.shards.filter((s) => s.status === 'verified').length,
      0
    );
    return { total, active, draft, recovering, totalShards, verifiedShards };
  }, [recoveryKeys]);

  const handleOpenCreateModal = () => {
    setCreateForm({
      assetId: assetsWithoutRecoveryKey[0]?.id || '',
      totalShards: 5,
      requiredShards: 3,
      algorithm: 'shamir',
      description: '',
      autoRevokeDays: 365,
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.assetId) {
      alert('请选择要保护的资产');
      return;
    }
    if (createForm.requiredShards > createForm.totalShards) {
      alert('恢复所需分片数不能大于总分片数');
      return;
    }
    const newKey = createRecoveryKey(createForm.assetId, {
      totalShards: createForm.totalShards,
      requiredShards: createForm.requiredShards,
      algorithm: createForm.algorithm,
      description: createForm.description,
      autoRevokeDays: createForm.autoRevokeDays,
    });
    if (newKey) {
      setShowCreateModal(false);
      addNotification({
        type: 'success',
        title: '恢复密钥创建成功',
        message: '请为分片分配信任人并激活密钥',
      });
    }
  };

  const handleOpenDetailModal = (key: RecoveryKey) => {
    setSelectedKey(key);
    setShowDetailModal(true);
  };

  const handleOpenAssignModal = (key: RecoveryKey, shard: RecoveryKeyShard) => {
    setSelectedKey(key);
    setSelectedShard(shard);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = (recipientId: string) => {
    if (!selectedKey || !selectedShard) return;
    const recipient = availableRecipients.find((r) => r.id === recipientId);
    if (!recipient) return;
    assignShard(selectedKey.id, selectedShard.id, {
      id: recipient.id,
      name: recipient.name,
      email: recipient.email,
      type: recipient.type,
    });
    setShowAssignModal(false);
    const updatedKey = recoveryKeys.find((k) => k.id === selectedKey.id);
    if (updatedKey) setSelectedKey(updatedKey);
  };

  const handleDistribute = (key: RecoveryKey, shard: RecoveryKeyShard) => {
    distributeShard(key.id, shard.id);
    const updatedKey = recoveryKeys.find((k) => k.id === key.id);
    if (updatedKey) setSelectedKey(updatedKey);
  };

  const handleOpenVerifyModal = (key: RecoveryKey, shard: RecoveryKeyShard) => {
    setSelectedKey(key);
    setSelectedShard(shard);
    setVerifyCode('');
    setShowVerifyModal(true);
  };

  const handleVerifySubmit = () => {
    if (!selectedKey || !selectedShard) return;
    const success = verifyShard(selectedKey.id, selectedShard.id, verifyCode);
    if (success) {
      setShowVerifyModal(false);
      addNotification({
        type: 'success',
        title: '验证成功',
        message: `分片 #${selectedShard.shardIndex} 持有人验证通过`,
      });
      const updatedKey = recoveryKeys.find((k) => k.id === selectedKey.id);
      if (updatedKey) setSelectedKey(updatedKey);
    } else {
      alert('验证码错误，请重试');
    }
  };

  const handleStartRecovery = (key: RecoveryKey) => {
    if (confirm('确定要启动资产恢复流程吗？此操作将通知所有分片持有人。')) {
      startRecovery(key.id);
      const updatedKey = recoveryKeys.find((k) => k.id === key.id);
      if (updatedKey) setSelectedKey(updatedKey);
    }
  };

  const handleOpenRecoverModal = (key: RecoveryKey) => {
    setSelectedKey(key);
    setCollectShardData('');
    setShowRecoverModal(true);
  };

  const handleCollectShard = () => {
    if (!selectedKey) return;
    const progress = getRecoveryProgress(selectedKey.id);
    if (!progress) return;

    const availableShards = selectedKey.shards.filter(
      (s) => !progress.collectedShardIds.includes(s.id)
    );

    for (const shard of availableShards) {
      if (shard.shardData === collectShardData) {
        const success = collectShard(selectedKey.id, shard.id, collectShardData);
        if (success) {
          setCollectShardData('');
          const updatedKey = recoveryKeys.find((k) => k.id === selectedKey.id);
          if (updatedKey) setSelectedKey(updatedKey);
          return;
        }
      }
    }
    alert('分片数据无效，请检查输入');
  };

  const handleActivate = (key: RecoveryKey) => {
    activateRecoveryKey(key.id);
    const updatedKey = recoveryKeys.find((k) => k.id === key.id);
    if (updatedKey) setSelectedKey(updatedKey);
  };

  const handleRevoke = (key: RecoveryKey) => {
    if (confirm('确定要吊销此恢复密钥吗？吊销后将无法用于恢复资产。')) {
      revokeRecoveryKey(key.id);
      const updatedKey = recoveryKeys.find((k) => k.id === key.id);
      if (updatedKey) setSelectedKey(updatedKey);
    }
  };

  const handleDelete = (keyId: string) => {
    if (confirm('确定要删除此恢复密钥吗？此操作不可撤销。')) {
      deleteRecoveryKey(keyId);
      setShowDetailModal(false);
      setSelectedKey(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification({
      type: 'success',
      title: '已复制',
      message: `${label} 已复制到剪贴板`,
    });
  };

  const ShardVisualization = ({ recoveryKey }: { recoveryKey: RecoveryKey }) => {
    const progress = recoveryKey.status === 'recovering' ? getRecoveryProgress(recoveryKey.id) : null;
    const collectedIds = progress?.collectedShardIds || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-gray-900">分片分配状态</span>
          </div>
          <div className="text-sm text-gray-500">
            {recoveryKey.shards.filter((s) => s.recipientId).length}/{recoveryKey.totalShards} 已分配
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {recoveryKey.shards.map((shard) => {
            const isCollected = collectedIds.includes(shard.id);
            const isAssigned = !!shard.recipientId;
            return (
              <div
                key={shard.id}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all cursor-pointer group',
                  isCollected
                    ? 'bg-emerald-50 border-emerald-400 shadow-emerald-100 shadow-md'
                    : isAssigned
                    ? shard.status === 'verified'
                      ? 'bg-blue-50 border-blue-400 shadow-blue-100 shadow-sm'
                      : 'bg-amber-50 border-amber-300 shadow-amber-50 shadow-sm'
                    : 'bg-gray-50 border-gray-200 border-dashed hover:border-indigo-300 hover:bg-indigo-50'
                )}
                onClick={() => {
                  if (!isAssigned && recoveryKey.status === 'draft') {
                    handleOpenAssignModal(recoveryKey, shard);
                  } else {
                    handleOpenDetailModal(recoveryKey);
                  }
                }}
              >
                <div className="text-center">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold',
                      isCollected
                        ? 'bg-emerald-200 text-emerald-800'
                        : isAssigned
                        ? shard.status === 'verified'
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-amber-200 text-amber-800'
                        : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {isCollected ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      shard.shardIndex
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-800 mb-1">
                    分片 #{shard.shardIndex}
                  </p>
                  {isAssigned ? (
                    <>
                      <p className="text-[10px] text-gray-600 truncate">
                        {shard.recipientName}
                      </p>
                      <span
                        className={cn(
                          'inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium',
                          RECIPIENT_TYPE_COLORS[shard.recipientType]
                        )}
                      >
                        {RECIPIENT_TYPE_LABELS[shard.recipientType]}
                      </span>
                      <span
                        className={cn(
                          'block mt-1 px-1.5 py-0.5 rounded text-[9px] font-medium',
                          RECOVERY_SHARD_STATUS_COLORS[shard.status]
                        )}
                      >
                        {RECOVERY_SHARD_STATUS_LABELS[shard.status]}
                      </span>
                    </>
                  ) : (
                    <p className="text-[10px] text-gray-400">待分配</p>
                  )}
                </div>

                {isCollected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span className="text-sm text-indigo-800 font-medium">
            需要 <span className="text-xl font-bold text-indigo-600 mx-1">{recoveryKey.requiredShards}</span> /{' '}
            {recoveryKey.totalShards} 片分片即可恢复
          </span>
        </div>
      </div>
    );
  };

  const RecoveryProgressBar = ({ recoveryKey }: { recoveryKey: RecoveryKey }) => {
    const progress = getRecoveryProgress(recoveryKey.id);
    if (!progress) return null;

    const percentage = progress.progressPercentage;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-gray-900">恢复进度</span>
          </div>
          <span className="text-sm font-bold text-amber-600">
            {progress.collectedCount}/{progress.requiredCount} 片已收集
          </span>
        </div>

        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              progress.canRecover
                ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                : 'bg-gradient-to-r from-amber-400 to-amber-600'
            )}
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow">
              {percentage}%
            </span>
          </div>
        </div>

        {progress.canRecover && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">
                已收集足够分片，可以恢复资产访问权限！
              </span>
            </div>
          </div>
        )}

        {progress.recoveredKey && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">恢复的主密钥</span>
              </div>
              <button
                onClick={() => copyToClipboard(progress.recoveredKey!, '主密钥')}
                className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-blue-600" />
              </button>
            </div>
            <code className="block p-3 bg-white rounded-lg font-mono text-sm text-gray-800 break-all border border-blue-100">
              {progress.recoveredKey}
            </code>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">资产恢复密钥分片管理</h1>
          <p className="text-gray-500 mt-1">
            为加密资产生成恢复密钥并拆分为多个分片，由信任人共同保管
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          创建恢复密钥
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">总密钥数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">已激活</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              <p className="text-xs text-gray-500">草稿</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.recovering}</p>
              <p className="text-xs text-gray-500">恢复中</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalShards}</p>
              <p className="text-xs text-gray-500">总分片数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.verifiedShards}</p>
              <p className="text-xs text-gray-500">已验证</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索资产名称、描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'draft', 'active', 'recovering', 'recovered', 'revoked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  filterStatus === status
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {status === 'all' ? '全部' : RECOVERY_KEY_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredKeys.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无恢复密钥</h3>
          <p className="text-gray-500 mb-6">
            为您的加密数字资产生成恢复密钥，通过分片技术确保资产安全
          </p>
          <button
            onClick={handleOpenCreateModal}
            disabled={assetsWithoutRecoveryKey.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            创建第一个恢复密钥
          </button>
          {assetsWithoutRecoveryKey.length === 0 && (
            <p className="text-sm text-amber-600 mt-3">
              所有资产都已配置恢复密钥
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredKeys.map((recoveryKey) => {
            const asset = assets.find((a) => a.id === recoveryKey.assetId);
            const progress = recoveryKey.status === 'recovering' ? getRecoveryProgress(recoveryKey.id) : null;
            const assignedCount = recoveryKey.shards.filter((s) => s.recipientId).length;
            const verifiedCount = recoveryKey.shards.filter((s) => s.status === 'verified').length;

            return (
              <div
                key={recoveryKey.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                        <KeyRound className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">{recoveryKey.assetName}</h3>
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-xs font-medium',
                              RECOVERY_KEY_STATUS_COLORS[recoveryKey.status]
                            )}
                          >
                            {RECOVERY_KEY_STATUS_LABELS[recoveryKey.status]}
                          </span>
                        </div>
                        {recoveryKey.description && (
                          <p className="text-sm text-gray-500 mt-1">{recoveryKey.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Puzzle className="w-3.5 h-3.5" />
                            {SHARDING_ALGORITHM_LABELS[recoveryKey.algorithm as ShardingAlgorithm]}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" />
                            {recoveryKey.requiredShards}/{recoveryKey.totalShards} 恢复阈值
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {assignedCount} 人已分配
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {verifiedCount} 人已验证
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            创建于 {formatDate(recoveryKey.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {recoveryKey.status === 'draft' && assignedCount === recoveryKey.totalShards && (
                        <button
                          onClick={() => handleActivate(recoveryKey)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                        >
                          <Unlock className="w-4 h-4" />
                          激活密钥
                        </button>
                      )}
                      {recoveryKey.status === 'active' && (
                        <button
                          onClick={() => handleStartRecovery(recoveryKey)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                        >
                          <Play className="w-4 h-4" />
                          启动恢复
                        </button>
                      )}
                      {recoveryKey.status === 'recovering' && (
                        <button
                          onClick={() => handleOpenRecoverModal(recoveryKey)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Fingerprint className="w-4 h-4" />
                          收集分片
                        </button>
                      )}
                      {(recoveryKey.status === 'active' || recoveryKey.status === 'draft') && (
                        <button
                          onClick={() => handleRevoke(recoveryKey)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          <Lock className="w-4 h-4" />
                          吊销
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenDetailModal(recoveryKey)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        详情
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                  <ShardVisualization recoveryKey={recoveryKey} />
                  {progress && <RecoveryProgressBar recoveryKey={recoveryKey} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">创建恢复密钥</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择要保护的资产 *
                </label>
                <select
                  value={createForm.assetId}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, assetId: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">请选择资产</option>
                  {assetsWithoutRecoveryKey.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
                {assetsWithoutRecoveryKey.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    所有资产都已配置恢复密钥
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    总分片数 *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={createForm.totalShards}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        totalShards: parseInt(e.target.value) || 2,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    恢复所需分片数 *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max={createForm.totalShards}
                    value={createForm.requiredShards}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        requiredShards: Math.min(
                          parseInt(e.target.value) || 2,
                          createForm.totalShards
                        ),
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分片算法 *
                </label>
                <select
                  value={createForm.algorithm}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      algorithm: e.target.value as ShardingAlgorithm,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {(Object.keys(SHARDING_ALGORITHM_LABELS) as ShardingAlgorithm[]).map(
                    (algo) => (
                      <option key={algo} value={algo}>
                        {SHARDING_ALGORITHM_LABELS[algo]}
                      </option>
                    )
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Shamir 秘密共享：最安全的分片算法，任意 N 片即可恢复
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述说明
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="可选：描述此恢复密钥的用途和注意事项"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自动吊销天数
                </label>
                <input
                  type="number"
                  min="30"
                  value={createForm.autoRevokeDays}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      autoRevokeDays: parseInt(e.target.value) || 365,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  遗嘱触发后多少天自动吊销此密钥（0 表示永不吊销）
                </p>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-indigo-800">
                    <p className="font-medium mb-1">安全提示</p>
                    <ul className="text-xs text-indigo-600 space-y-1">
                      <li>• 建议总分片数大于恢复所需分片数，提高容错性</li>
                      <li>• 将分片分配给不同类型的信任人（家人、律师、朋友等）</li>
                      <li>• 恢复阈值建议设置为总片数的 50%-70%</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={assetsWithoutRecoveryKey.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建恢复密钥
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                恢复密钥详情 - {selectedKey.assetName}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedKey.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">状态</p>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-sm font-medium',
                      RECOVERY_KEY_STATUS_COLORS[selectedKey.status]
                    )}
                  >
                    {RECOVERY_KEY_STATUS_LABELS[selectedKey.status]}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">算法</p>
                  <p className="text-sm font-medium text-gray-900">
                    {SHARDING_ALGORITHM_LABELS[selectedKey.algorithm as ShardingAlgorithm]}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">分片配置</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedKey.requiredShards}/{selectedKey.totalShards} 片可恢复
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">主密钥哈希</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-gray-600 truncate flex-1">
                      {selectedKey.masterKeyHash.slice(0, 16)}...
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(selectedKey.masterKeyHash, '主密钥哈希')
                      }
                      className="p-1 hover:bg-gray-200 rounded transition-colors shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {selectedKey.description && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-xs text-indigo-600 mb-1">描述说明</p>
                  <p className="text-sm text-indigo-900">{selectedKey.description}</p>
                </div>
              )}

              <ShardVisualization recoveryKey={selectedKey} />

              {selectedKey.status === 'recovering' && (
                <RecoveryProgressBar recoveryKey={selectedKey} />
              )}

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  分片详细列表
                </h4>
                <div className="space-y-2">
                  {selectedKey.shards.map((shard) => (
                    <div
                      key={shard.id}
                      className="p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm',
                              shard.status === 'verified'
                                ? 'bg-emerald-100 text-emerald-700'
                                : shard.recipientId
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            #{shard.shardIndex}
                          </div>
                          <div>
                            {shard.recipientId ? (
                              <>
                                <p className="font-medium text-gray-900">
                                  {shard.recipientName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={cn(
                                      'px-1.5 py-0.5 rounded text-[10px] font-medium',
                                      RECIPIENT_TYPE_COLORS[shard.recipientType]
                                    )}
                                  >
                                    {RECIPIENT_TYPE_LABELS[shard.recipientType]}
                                  </span>
                                  <span
                                    className={cn(
                                      'px-1.5 py-0.5 rounded text-[10px] font-medium',
                                      RECOVERY_SHARD_STATUS_COLORS[shard.status]
                                    )}
                                  >
                                    {RECOVERY_SHARD_STATUS_LABELS[shard.status]}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <p className="text-gray-500 text-sm">待分配接收人</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!shard.recipientId && selectedKey.status === 'draft' && (
                            <button
                              onClick={() =>
                                handleOpenAssignModal(selectedKey, shard)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium"
                            >
                              <Users className="w-3.5 h-3.5" />
                              分配
                            </button>
                          )}
                          {shard.recipientId &&
                            shard.status === 'pending' &&
                            selectedKey.status !== 'revoked' && (
                              <button
                                onClick={() =>
                                  handleDistribute(selectedKey, shard)
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                              >
                                <Send className="w-3.5 h-3.5" />
                                分发
                              </button>
                            )}
                          {shard.status === 'distributed' &&
                            selectedKey.status !== 'revoked' && (
                              <button
                                onClick={() =>
                                  handleOpenVerifyModal(selectedKey, shard)
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-medium"
                              >
                                <Check className="w-3.5 h-3.5" />
                                验证
                              </button>
                            )}
                          {shard.shardData && (
                            <button
                              onClick={() =>
                                copyToClipboard(shard.shardData, `分片 #${shard.shardIndex}`)
                              }
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="复制分片数据"
                            >
                              <Copy className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                        </div>
                      </div>
                      {shard.distributedAt && (
                        <p className="text-xs text-gray-400 mt-2 ml-13 pl-13">
                          分发于 {formatDate(shard.distributedAt)}
                          {shard.verifiedAt &&
                            ` · 验证于 ${formatDate(shard.verifiedAt)}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedKey && selectedShard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                分配分片 #{selectedShard.shardIndex}
              </h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                选择接收此分片的信任人：
              </p>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {availableRecipients.map((recipient) => (
                  <button
                    key={recipient.id}
                    onClick={() => handleAssignSubmit(recipient.id)}
                    className="w-full p-4 flex items-center justify-between border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm',
                          recipient.type === 'heir'
                            ? 'bg-indigo-500'
                            : recipient.type === 'lawyer'
                            ? 'bg-amber-500'
                            : recipient.type === 'executor'
                            ? 'bg-teal-500'
                            : 'bg-cyan-500'
                        )}
                      >
                        {recipient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{recipient.name}</p>
                        <p className="text-xs text-gray-500">{recipient.email}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-medium',
                        RECIPIENT_TYPE_COLORS[recipient.type]
                      )}
                    >
                      {RECIPIENT_TYPE_LABELS[recipient.type]}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAssignModal(false)}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerifyModal && selectedKey && selectedShard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                验证分片 #{selectedShard.shardIndex}
              </h2>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">持有人验证</p>
                    <p className="text-xs text-amber-600">
                      请向 <strong>{selectedShard.recipientName}</strong> 确认其接收到的6位验证码
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  6位验证码
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) =>
                    setVerifyCode(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="请输入6位数字验证码"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleVerifySubmit}
                  disabled={verifyCode.length !== 6}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认验证
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRecoverModal && selectedKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                收集分片进行恢复 - {selectedKey.assetName}
              </h2>
              <button
                onClick={() => setShowRecoverModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <RecoveryProgressBar recoveryKey={selectedKey} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  输入分片数据
                </label>
                <textarea
                  value={collectShardData}
                  onChange={(e) => setCollectShardData(e.target.value)}
                  rows={3}
                  placeholder="请粘贴分片持有人提供的分片数据..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-none"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">待收集的分片</p>
                    <p className="text-xs text-blue-600">
                      以下分片尚未收集，请联系持有人获取分片数据：
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(() => {
                        const progress = getRecoveryProgress(selectedKey.id);
                        const collected = progress?.collectedShardIds || [];
                        return selectedKey.shards
                          .filter((s) => !collected.includes(s.id))
                          .map((s) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded-full text-xs"
                            >
                              <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-[10px]">
                                {s.shardIndex}
                              </span>
                              {s.recipientName}
                            </span>
                          ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowRecoverModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  关闭
                </button>
                <button
                  onClick={handleCollectShard}
                  disabled={!collectShardData.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Puzzle className="w-4 h-4" />
                    提交分片
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
