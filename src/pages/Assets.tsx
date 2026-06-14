import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Share2,
  Cloud,
  Wallet,
  Repeat,
  Mail,
  Folder,
  ExternalLink,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  AlertCircle,
  Settings,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  MinusCircle,
  CheckSquare,
  Square,
  Users,
  Tag,
  Download,
  Layers,
  Check,
  XCircle,
  Timer,
  Lock,
  Unlock,
  Hourglass,
  KeyRound,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  ASSET_TYPE_LABELS,
  RELATIONSHIP_LABELS,
  getHealthCheckStatus,
  getDaysSinceLastVerification,
  getNextVerificationDate,
  getHealthCheckPeriodDays,
  HEALTH_CHECK_STATUS_LABELS,
  HEALTH_CHECK_STATUS_COLORS,
  HEALTH_CHECK_PERIOD_LABELS,
  DEFAULT_REMINDER_DAYS,
  formatDate,
  TIME_CAPSULE_STATUS_LABELS,
  TIME_CAPSULE_STATUS_COLORS,
  getTimeCapsuleStatus,
  getDaysUntilUnlock,
  CREDENTIAL_CATEGORY_LABELS,
} from '@/constants';
import { cn } from '@/lib/utils';
import type { DigitalAsset, AssetType, HealthCheckPeriod, ReminderRule, TimeCapsuleStatus } from '@/types';

const typeIcons: Record<AssetType, typeof Share2> = {
  social_media: Share2,
  cloud_storage: Cloud,
  crypto_wallet: Wallet,
  subscription: Repeat,
  email: Mail,
  other: Folder,
};

const typeColors: Record<AssetType, string> = {
  social_media: 'bg-blue-100 text-blue-600',
  cloud_storage: 'bg-cyan-100 text-cyan-600',
  crypto_wallet: 'bg-amber-100 text-amber-600',
  subscription: 'bg-purple-100 text-purple-600',
  email: 'bg-green-100 text-green-600',
  other: 'bg-gray-100 text-gray-600',
};

export default function Assets() {
  const assets = useAppStore((state) => state.assets);
  const heirs = useAppStore((state) => state.heirs);
  const addAsset = useAppStore((state) => state.addAsset);
  const updateAsset = useAppStore((state) => state.updateAsset);
  const deleteAsset = useAppStore((state) => state.deleteAsset);
  const verifyAsset = useAppStore((state) => state.verifyAsset);
  const updateAssetHealthCheck = useAppStore((state) => state.updateAssetHealthCheck);
  const generateHealthCheckReminders = useAppStore((state) => state.generateHealthCheckReminders);
  const bulkUpdateHeir = useAppStore((state) => state.bulkUpdateHeir);
  const bulkUpdateType = useAppStore((state) => state.bulkUpdateType);
  const addAuditLog = useAppStore((state) => state.addAuditLog);
  const addNotification = useAppStore((state) => state.addNotification);
  const setTimeCapsule = useAppStore((state) => state.setTimeCapsule);
  const removeTimeCapsule = useAppStore((state) => state.removeTimeCapsule);
  const unlockTimeCapsule = useAppStore((state) => state.unlockTimeCapsule);
  const credentials = useAppStore((state) => state.credentials);
  const getCredentialsByAsset = useAppStore((state) => state.getCredentialsByAsset);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AssetType | 'all' | 'capsule'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const [showBulkHeirModal, setShowBulkHeirModal] = useState(false);
  const [showBulkTypeModal, setShowBulkTypeModal] = useState(false);
  const [showCapsuleModal, setShowCapsuleModal] = useState(false);
  const [capsuleAsset, setCapsuleAsset] = useState<DigitalAsset | null>(null);
  const [capsuleForm, setCapsuleForm] = useState({
    enabled: true,
    unlockDate: '',
    note: '',
  });
  const [editingAsset, setEditingAsset] = useState<DigitalAsset | null>(null);
  const [healthCheckAsset, setHealthCheckAsset] = useState<DigitalAsset | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkHeirChain, setBulkHeirChain] = useState<string[]>([]);
  const [bulkType, setBulkType] = useState<AssetType>('social_media');
  const [formData, setFormData] = useState({
    name: '',
    type: 'social_media' as AssetType,
    username: '',
    url: '',
    description: '',
    value: '',
    currency: 'CNY',
    heirId: '',
    heirChain: [] as string[],
    transferInstructions: '',
  });
  const [healthCheckForm, setHealthCheckForm] = useState({
    period: '90_days' as HealthCheckPeriod,
    customDays: '',
    reminderEnabled: true,
    reminderDays: DEFAULT_REMINDER_DAYS.toString(),
    repeatReminder: true,
  });

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesCapsule = filterType !== 'capsule' || (asset.timeCapsule?.enabled === true);
    return matchesSearch && matchesType && matchesCapsule;
  });

  const selectedAssets = useMemo(
    () => assets.filter((a) => selectedIds.has(a.id)),
    [selectedIds, assets]
  );

  const allSelected = filteredAssets.length > 0 && filteredAssets.every((a) => selectedIds.has(a.id));
  const someSelected = filteredAssets.some((a) => selectedIds.has(a.id));

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleOpenModal = (asset?: DigitalAsset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        name: asset.name,
        type: asset.type,
        username: asset.username || '',
        url: asset.url || '',
        description: asset.description || '',
        value: asset.value?.toString() || '',
        currency: asset.currency || 'CNY',
        heirId: asset.heirId || '',
        heirChain: asset.heirChain || [],
        transferInstructions: asset.transferInstructions || '',
      });
    } else {
      setEditingAsset(null);
      setFormData({
        name: '',
        type: 'social_media',
        username: '',
        url: '',
        description: '',
        value: '',
        currency: 'CNY',
        heirId: '',
        heirChain: [],
        transferInstructions: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAsset(null);
  };

  const handleOpenHealthCheckModal = (asset: DigitalAsset) => {
    setHealthCheckAsset(asset);
    setHealthCheckForm({
      period: asset.healthCheckPeriod,
      customDays: asset.customPeriodDays?.toString() || '',
      reminderEnabled: asset.reminderRule.enabled,
      reminderDays: asset.reminderRule.daysBefore.toString(),
      repeatReminder: asset.reminderRule.repeat,
    });
    setShowHealthCheckModal(true);
  };

  const handleCloseHealthCheckModal = () => {
    setShowHealthCheckModal(false);
    setHealthCheckAsset(null);
  };

  const handleOpenBulkHeirModal = () => {
    setBulkHeirChain([]);
    setShowBulkHeirModal(true);
  };

  const handleCloseBulkHeirModal = () => {
    setShowBulkHeirModal(false);
    setBulkHeirChain([]);
  };

  const handleOpenBulkTypeModal = () => {
    setBulkType('social_media');
    setShowBulkTypeModal(true);
  };

  const handleCloseBulkTypeModal = () => {
    setShowBulkTypeModal(false);
  };

  const handleOpenCapsuleModal = (asset: DigitalAsset) => {
    setCapsuleAsset(asset);
    if (asset.timeCapsule?.enabled) {
      setCapsuleForm({
        enabled: asset.timeCapsule.enabled,
        unlockDate: asset.timeCapsule.unlockDate.split('T')[0],
        note: asset.timeCapsule.note || '',
      });
    } else {
      setCapsuleForm({
        enabled: true,
        unlockDate: '',
        note: '',
      });
    }
    setShowCapsuleModal(true);
  };

  const handleCloseCapsuleModal = () => {
    setShowCapsuleModal(false);
    setCapsuleAsset(null);
  };

  const handleCapsuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capsuleAsset || !capsuleForm.unlockDate) return;
    setTimeCapsule(capsuleAsset.id, {
      enabled: capsuleForm.enabled,
      unlockDate: new Date(capsuleForm.unlockDate).toISOString(),
      status: 'locked',
      note: capsuleForm.note || undefined,
    });
    handleCloseCapsuleModal();
  };

  const handleRemoveCapsule = (assetId: string) => {
    if (confirm('确定要移除此资产的时间胶囊设置吗？')) {
      removeTimeCapsule(assetId);
    }
  };

  const handleUnlockCapsule = (assetId: string) => {
    if (confirm('确定要手动解锁此时间胶囊吗？解锁后资产将对继承人和见证人可见。')) {
      unlockTimeCapsule(assetId);
    }
  };

  const handleBulkHeirSubmit = () => {
    if (selectedIds.size === 0) return;
    bulkUpdateHeir(Array.from(selectedIds), bulkHeirChain);
    handleClearSelection();
    handleCloseBulkHeirModal();
  };

  const handleBulkTypeSubmit = () => {
    if (selectedIds.size === 0) return;
    bulkUpdateType(Array.from(selectedIds), bulkType);
    handleClearSelection();
    handleCloseBulkTypeModal();
  };

  const handleExportCSV = () => {
    if (selectedIds.size === 0) return;

    const exportAssets = selectedAssets;
    const heirMap = new Map(heirs.map((h) => [h.id, h.name]));

    const headers = [
      '资产ID',
      '资产名称',
      '资产类型',
      '用户名/账号',
      '网址',
      '描述',
      '估值(元)',
      '货币',
      '第一顺位继承人',
      '继承链',
      '移交说明',
      '状态',
      '创建时间',
      '上次验证时间',
      '验证周期',
    ];

    const rows = exportAssets.map((asset) => {
      const heirName = asset.heirChain[0]
        ? heirMap.get(asset.heirChain[0]) || '未知'
        : '未分配';
      const chainNames = asset.heirChain
        .map((id) => heirMap.get(id) || '未知')
        .join(' > ');
      return [
        asset.id,
        asset.name,
        ASSET_TYPE_LABELS[asset.type],
        asset.username || '',
        asset.url || '',
        (asset.description || '').replace(/\n/g, ' '),
        asset.value?.toString() || '0',
        asset.currency || 'CNY',
        heirName,
        chainNames,
        (asset.transferInstructions || '').replace(/\n/g, ' '),
        asset.status,
        formatDate(asset.createdAt),
        asset.lastVerifiedAt ? formatDate(asset.lastVerifiedAt) : '未验证',
        HEALTH_CHECK_PERIOD_LABELS[asset.healthCheckPeriod],
      ];
    });

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.download = `资产清单_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const assetNames = exportAssets.map((a) => a.name).join('、');
    addAuditLog({
      action: 'bulk_export_csv',
      description: `批量导出 ${exportAssets.length} 项资产清单：${assetNames}`,
      resourceType: 'asset',
      resourceId: Array.from(selectedIds).join(','),
    });

    addNotification({
      type: 'success',
      title: '导出成功',
      message: `已成功导出 ${exportAssets.length} 项资产的清单`,
    });

    handleClearSelection();
  };

  const handleHealthCheckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthCheckAsset) return;

    let periodDays: number;
    if (healthCheckForm.period === 'custom') {
      const customDays = parseInt(healthCheckForm.customDays);
      if (!customDays || customDays < 1) {
        alert('请输入有效的自定义周期天数（至少1天）');
        return;
      }
      periodDays = customDays;
    } else {
      periodDays = getHealthCheckPeriodDays(healthCheckForm.period);
    }

    const reminderDays = Math.min(
      Math.max(parseInt(healthCheckForm.reminderDays) || DEFAULT_REMINDER_DAYS, 1),
      periodDays - 1
    );

    const reminderRule: ReminderRule = {
      enabled: healthCheckForm.reminderEnabled,
      daysBefore: reminderDays,
      repeat: healthCheckForm.repeatReminder,
    };

    updateAssetHealthCheck(
      healthCheckAsset.id,
      healthCheckForm.period,
      healthCheckForm.period === 'custom' ? periodDays : undefined,
      reminderRule
    );

    handleCloseHealthCheckModal();
  };

  const handleVerifyAsset = (assetId: string) => {
    if (confirm('确认已完成该资产的健康检查验证吗？')) {
      verifyAsset(assetId);
    }
  };

  const handleGenerateReminders = () => {
    if (confirm('是否生成所有待验证资产的健康检查提醒？')) {
      generateHealthCheckReminders();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const heirId = formData.heirChain.length > 0 ? formData.heirChain[0] : '';
    const submitData = {
      ...formData,
      heirId,
      value: formData.value ? Number(formData.value) : undefined,
    };
    if (editingAsset) {
      updateAsset(editingAsset.id, submitData);
    } else {
      addAsset(submitData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个数字资产吗？')) {
      deleteAsset(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const getHeirName = (heirId?: string) => {
    if (!heirId) return '未分配';
    const heir = heirs.find((h) => h.id === heirId);
    return heir?.name || '未分配';
  };

  const sortedHeirs = [...heirs].sort((a, b) => a.priority - b.priority);

  const selectedTypeBreakdown = useMemo(() => {
    const counts = new Map<AssetType, number>();
    selectedAssets.forEach((a) => {
      counts.set(a.type, (counts.get(a.type) || 0) + 1);
    });
    return Array.from(counts.entries());
  }, [selectedAssets]);

  const selectedHeirBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    selectedAssets.forEach((a) => {
      const heirId = a.heirChain[0] || 'none';
      counts.set(heirId, (counts.get(heirId) || 0) + 1);
    });
    return Array.from(counts.entries());
  }, [selectedAssets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数字资产清单</h1>
            <p className="text-gray-500 mt-1">管理您的所有数字资产和账户</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateReminders}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              生成提醒
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              添加资产
            </button>
          </div>
        </div>

      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <CheckSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-indigo-900">
                    已选择 <span className="text-2xl">{selectedIds.size}</span> 项资产
                  </h3>
                  <span className="text-sm text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                    批量操作模式
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTypeBreakdown.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <Layers className="w-3.5 h-3.5" />
                      {selectedTypeBreakdown.map(([type, count], idx) => (
                      <span key={type}>
                        {idx > 0 && '、'}
                        {ASSET_TYPE_LABELS[type]} {count}项
                      </span>
                    ))}
                    </span>
                  )}
                  {selectedHeirBreakdown.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <Users className="w-3.5 h-3.5" />
                      {selectedHeirBreakdown.map(([heirId, count], idx) => {
                        const name = heirId === 'none' ? '未分配' : getHeirName(heirId);
                        return (
                          <span key={heirId}>
                            {idx > 0 && '、'}
                            {name} {count}项
                          </span>
                        );
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenBulkHeirModal}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Users className="w-4 h-4" />
                分配继承人
              </button>
              <button
                onClick={handleOpenBulkTypeModal}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
              >
                <Tag className="w-4 h-4" />
                修改分类
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                导出CSV
              </button>
              <button
                onClick={handleClearSelection}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                取消选择
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索资产名称、用户名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          {filteredAssets.length > 0 && (
            <button
              onClick={handleToggleSelectAll}
              className={cn(
                'flex items-center gap-2 px-3 px-4 py-2 rounded-lg border transition-colors shrink-0',
                allSelected
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200'
                  : someSelected
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              )}
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4" />
              ) : someSelected ? (
                <Square className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {allSelected ? '取消全选' : someSelected ? '部分选中' : '全选'}
              </span>
              <span className="text-xs text-gray-500">({selectedIds.size}/{filteredAssets.length})
              </span>
            </button>
          )}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                filterType === 'all'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              全部
            </button>
            <button
              onClick={() => setFilterType('capsule')}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                filterType === 'capsule'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Timer className="w-3.5 h-3.5" />
              时间胶囊
            </button>
            {(Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  filterType === type
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {ASSET_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无数字资产</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            添加第一个资产
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => {
            const Icon = typeIcons[asset.type];
            const healthStatus = getHealthCheckStatus(
              asset.lastVerifiedAt,
              asset.healthCheckPeriod,
              asset.customPeriodDays,
              asset.reminderRule.daysBefore
            );
            const daysSinceVerification = getDaysSinceLastVerification(asset.lastVerifiedAt);
            const nextVerificationDate = getNextVerificationDate(
              asset.lastVerifiedAt,
              asset.healthCheckPeriod,
              asset.customPeriodDays
            );
            const isSelected = selectedIds.has(asset.id);

            const getStatusIcon = () => {
              switch (healthStatus) {
                case 'normal':
                  return <CheckCircle2 className="w-3 h-3" />;
                case 'warning':
                  return <AlertTriangle className="w-3 h-3" />;
                case 'overdue':
                  return <AlertCircle className="w-3 h-3" />;
                default:
                  return <Clock className="w-3 h-3" />;
              }
            };

            return (
              <div
                key={asset.id}
                className={cn(
                  'bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all relative',
                  isSelected
                    ? 'border-indigo-400 ring-2 ring-indigo-200 shadow-indigo-100'
                    : healthStatus === 'overdue' ? 'border-red-200' :
                    healthStatus === 'warning' ? 'border-amber-200' :
                    'border-gray-100'
                )}
              >
                <button
                  onClick={() => handleToggleSelect(asset.id)}
                  className={cn(
                    'absolute top-3 left-3 p-1.5 rounded-lg transition-all z-10',
                    isSelected
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white/80 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200'
                  )}
                  title={isSelected ? '取消选中' : '选中'}
                >
                  {isSelected ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                <div className="flex items-start justify-between mb-4 pl-10">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', typeColors[asset.type])}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                        {(() => {
                          const assetCredentials = getCredentialsByAsset(asset.id);
                          if (assetCredentials.length === 0) return null;
                          const sensitiveCount = assetCredentials.filter(c => c.fields.some(f => f.isSensitive)).length;
                          return (
                            <div
                              className="group relative"
                              title={`已保存 ${assetCredentials.length} 项凭据${sensitiveCount > 0 ? `（含 ${sensitiveCount} 项敏感信息）` : ''}`}
                            >
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-[10px] font-semibold border border-indigo-200">
                                <KeyRound className="w-3 h-3" />
                                {assetCredentials.length}
                              </span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                <div className="font-semibold mb-1">🔐 凭据加密存储</div>
                                <div className="text-gray-300">共 {assetCredentials.length} 项凭据</div>
                                {sensitiveCount > 0 && (
                                  <div className="text-amber-300">含 {sensitiveCount} 项敏感信息</div>
                                )}
                                <div className="text-gray-400 mt-1">前往密码保险箱查看</div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <span className="text-xs text-gray-500">{ASSET_TYPE_LABELS[asset.type]}</span>
                      {asset.timeCapsule?.enabled && (() => {
                        const capsuleStatus = getTimeCapsuleStatus(asset.timeCapsule);
                        return (
                          <span className={cn(
                            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ml-1',
                            TIME_CAPSULE_STATUS_COLORS[capsuleStatus]
                          )}>
                            {capsuleStatus === 'locked' ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                            {TIME_CAPSULE_STATUS_LABELS[capsuleStatus]}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCapsuleModal(asset);
                      }}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        asset.timeCapsule?.enabled
                          ? 'text-violet-500 hover:text-violet-700 hover:bg-violet-50'
                          : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'
                      )}
                      title="时间胶囊设置"
                    >
                      <Timer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenHealthCheckModal(asset);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="健康检查设置"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerifyAsset(asset.id);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="标记已验证"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(asset);
                      }}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    HEALTH_CHECK_STATUS_COLORS[healthStatus]
                  )}>
                    {getStatusIcon()}
                    {HEALTH_CHECK_STATUS_LABELS[healthStatus]}
                  </span>
                  {daysSinceVerification !== null && (
                    <span className="text-xs text-gray-500">
                      上次验证：{daysSinceVerification} 天前
                    </span>
                  )}
                  {daysSinceVerification === null && (
                    <span className="text-xs text-gray-500">
                      尚未验证
                    </span>
                  )}
                </div>

                {asset.timeCapsule?.enabled && (() => {
                  const capsuleStatus = getTimeCapsuleStatus(asset.timeCapsule);
                  const daysLeft = getDaysUntilUnlock(asset.timeCapsule.unlockDate);
                  return (
                    <div className={cn(
                      'flex items-center gap-2 mb-4 p-2 rounded-lg border',
                      capsuleStatus === 'locked' ? 'bg-violet-50 border-violet-200' : 'bg-emerald-50 border-emerald-200'
                    )}>
                      <Hourglass className={cn('w-4 h-4', capsuleStatus === 'locked' ? 'text-violet-500' : 'text-emerald-500')} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-medium', capsuleStatus === 'locked' ? 'text-violet-700' : 'text-emerald-700')}>
                          时间胶囊
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {capsuleStatus === 'locked'
                            ? `解锁倒计时：${daysLeft} 天（${formatDate(asset.timeCapsule.unlockDate)}）`
                            : capsuleStatus === 'expired'
                            ? '已到期，等待解密'
                            : '已解锁'}
                        </p>
                      </div>
                      {asset.timeCapsule.note && (
                        <p className="text-[10px] text-gray-400 truncate max-w-[100px]" title={asset.timeCapsule.note}>
                          {asset.timeCapsule.note}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {(() => {
                  const assetCredentials = getCredentialsByAsset(asset.id);
                  if (assetCredentials.length === 0) return null;
                  const categories = new Map<string, number>();
                  assetCredentials.forEach(c => {
                    categories.set(c.category, (categories.get(c.category) || 0) + 1);
                  });
                  const totalFields = assetCredentials.reduce((sum, c) => sum + c.fields.length, 0);
                  const sensitiveFields = assetCredentials.reduce((sum, c) => sum + c.fields.filter(f => f.isSensitive).length, 0);
                  return (
                    <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-violet-50/70 border border-indigo-100">
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
                          <KeyRound className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-semibold text-indigo-900">
                              🔐 凭据加密存储 ({assetCredentials.length} 项)
                            </p>
                            <span className="text-[10px] text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full font-medium">
                              {totalFields} 个字段 · {sensitiveFields} 敏感
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {Array.from(categories.entries()).slice(0, 4).map(([cat, count]) => (
                              <span key={cat} className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-white/80 text-gray-600 border border-gray-100">
                                {CREDENTIAL_CATEGORY_LABELS[cat as keyof typeof CREDENTIAL_CATEGORY_LABELS] || cat}
                                <span className="text-indigo-500 font-medium">{count}</span>
                              </span>
                            ))}
                            {categories.size > 4 && (
                              <span className="text-[10px] text-gray-400">+{categories.size - 4}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            已通过主密码 AES-256 加密 · 前往【密码保险箱】查看
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {asset.username && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">用户名：</span>
                    <span className="text-sm text-gray-700">{asset.username}</span>
                  </div>
                )}

                {asset.url && (
                  <div className="mb-2">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      访问链接 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {asset.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{asset.description}</p>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        {asset.heirChain.length > 0 ? getHeirName(asset.heirChain[0]) : '未分配'}
                      </span>
                      {asset.heirChain.length > 0 && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          第一顺位
                        </span>
                      )}
                    </div>
                    {asset.value !== undefined && asset.value > 0 && (
                      <span className="text-sm font-medium text-emerald-600">
                        ¥{asset.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {asset.heirChain.length > 1 && (
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      <span className="text-xs text-gray-400">兜底：</span>
                      {asset.heirChain.slice(1).map((chainHeirId, idx) => {
                        const chainHeir = heirs.find((h) => h.id === chainHeirId);
                        return (
                          <span key={chainHeirId} className="inline-flex items-center gap-0.5">
                            {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                            <span className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                              {chainHeir?.name || '未知'}
                            </span>
                            <span className="text-xs text-gray-400">
                              第{idx + 2}顺位
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      下次验证：{nextVerificationDate}
                    </p>
                    <p className="text-xs text-gray-400">
                      验证周期：{HEALTH_CHECK_PERIOD_LABELS[asset.healthCheckPeriod]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAsset ? '编辑资产' : '添加数字资产'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">资产名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="例如：微信账号"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">资产类型 *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as AssetType })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {(Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map((type) => (
                    <option key={type} value={type}>
                      {ASSET_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名/账号</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="账号或用户名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">估值 (元)</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">网址链接</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">继承顺位链</label>
                <p className="text-xs text-gray-500 mb-3">
                  按顺位指定继承人，第一顺位无法继承时自动流转至下一顺位
                </p>
                {formData.heirChain.map((chainHeirId, idx) => {
                  const chainHeir = heirs.find((h) => h.id === chainHeirId);
                  const priorityLabel = idx === 0 ? '第一顺位' : `第${idx + 1}顺位（兜底）`;
                  const priorityColor = idx === 0 ? 'text-emerald-600' : 'text-gray-500';
                  return (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <span className={cn('text-xs font-medium w-20 shrink-0', priorityColor)}>
                        {priorityLabel}
                      </span>
                      <select
                        value={chainHeirId}
                        onChange={(e) => {
                          const newChain = [...formData.heirChain];
                          newChain[idx] = e.target.value;
                          setFormData({ ...formData, heirChain: newChain });
                        }}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      >
                        <option value="">选择继承人</option>
                        {sortedHeirs
                          .filter((h) => h.id !== chainHeirId && !formData.heirChain.includes(h.id))
                          .map((heir) => (
                            <option key={heir.id} value={heir.id}>
                              {heir.name}（{RELATIONSHIP_LABELS[heir.relationship]}）
                            </option>
                          ))}
                      </select>
                      {formData.heirChain.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newChain = formData.heirChain.filter((_, i) => i !== idx);
                            setFormData({ ...formData, heirChain: newChain });
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {formData.heirChain.length < heirs.length && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, heirChain: [...formData.heirChain, ''] });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    添加兜底继承人
                  </button>
                )}
                {heirs.length === 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                    暂无继承人，请先在继承人管理中添加
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="资产描述..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">移交说明</label>
                <textarea
                  value={formData.transferInstructions}
                  onChange={(e) => setFormData({ ...formData, transferInstructions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="说明如何移交该资产的访问权限..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingAsset ? '保存修改' : '添加资产'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showHealthCheckModal && healthCheckAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                健康检查设置 - {healthCheckAsset.name}
              </h2>
              <button
                onClick={handleCloseHealthCheckModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHealthCheckSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">验证周期</label>
                <select
                  value={healthCheckForm.period}
                  onChange={(e) => setHealthCheckForm({ ...healthCheckForm, period: e.target.value as HealthCheckPeriod })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {(Object.keys(HEALTH_CHECK_PERIOD_LABELS) as HealthCheckPeriod[]).map((period) => (
                    <option key={period} value={period}>
                      {HEALTH_CHECK_PERIOD_LABELS[period]}
                    </option>
                  ))}
                </select>
              </div>

              {healthCheckForm.period === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">自定义周期 (天)</label>
                  <input
                    type="number"
                    min="1"
                    value={healthCheckForm.customDays}
                    onChange={(e) => setHealthCheckForm({ ...healthCheckForm, customDays: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="请输入天数"
                    required
                  />
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">提醒规则</h3>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">启用提醒</span>
                  <button
                    type="button"
                    onClick={() => setHealthCheckForm({ ...healthCheckForm, reminderEnabled: !healthCheckForm.reminderEnabled })}
                    className={cn(
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                      healthCheckForm.reminderEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        healthCheckForm.reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {healthCheckForm.reminderEnabled && (
                  <>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">提前提醒天数</label>
                      <input
                        type="number"
                        min="1"
                        value={healthCheckForm.reminderDays}
                        onChange={(e) => setHealthCheckForm({ ...healthCheckForm, reminderDays: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="7"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">重复提醒</span>
                      <button
                        type="button"
                        onClick={() => setHealthCheckForm({ ...healthCheckForm, repeatReminder: !healthCheckForm.repeatReminder })}
                        className={cn(
                          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                          healthCheckForm.repeatReminder ? 'bg-emerald-600' : 'bg-gray-200'
                        )}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                            healthCheckForm.repeatReminder ? 'translate-x-5' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseHealthCheckModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  保存设置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkHeirModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">批量分配继承人</h2>
                <p className="text-sm text-gray-500 mt-1">为选中的 {selectedIds.size} 项资产设置继承顺位链</p>
              </div>
              <button
                onClick={handleCloseBulkHeirModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-indigo-900">
                      将影响 {selectedIds.size} 项资产的继承人设置</p>
                    <p className="text-sm text-indigo-600">
                      所有选中资产的继承链将被统一覆盖</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">继承顺位链</label>
                <p className="text-xs text-gray-500 mb-3">
                  按顺位指定继承人，第一顺位无法继承时自动流转至下一顺位
                </p>
                {bulkHeirChain.length === 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg mb-3">
                    未选择继承人时，所有选中资产将被设置为「未分配」状态
                  </p>
                )}
                {bulkHeirChain.map((chainHeirId, idx) => {
                  const priorityLabel = idx === 0 ? '第一顺位' : `第${idx + 1}顺位（兜底）`;
                  const priorityColor = idx === 0 ? 'text-emerald-600' : 'text-gray-500';
                  return (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                      <span className={cn('text-xs font-medium w-20 shrink-0', priorityColor)}>
                        {priorityLabel}
                      </span>
                      <select
                        value={chainHeirId}
                        onChange={(e) => {
                          const newChain = [...bulkHeirChain];
                          newChain[idx] = e.target.value;
                          setBulkHeirChain(newChain);
                        }}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      >
                        <option value="">选择继承人</option>
                        {sortedHeirs
                          .filter((h) => h.id !== chainHeirId && !bulkHeirChain.includes(h.id))
                          .map((heir) => (
                            <option key={heir.id} value={heir.id}>
                              {heir.name}（{RELATIONSHIP_LABELS[heir.relationship]}）
                            </option>
                          ))}
                      </select>
                      {bulkHeirChain.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newChain = bulkHeirChain.filter((_, i) => i !== idx);
                            setBulkHeirChain(newChain);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {bulkHeirChain.length < heirs.length && (
                  <button
                    type="button"
                    onClick={() => {
                      setBulkHeirChain([...bulkHeirChain, '']);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    添加顺位继承人
                  </button>
                )}
                {heirs.length === 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                    暂无继承人，请先在继承人管理中添加
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseBulkHeirModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleBulkHeirSubmit}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  确认分配 ({selectedIds.size} 项)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkTypeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">批量修改分类</h2>
                <p className="text-sm text-gray-500 mt-1">为选中的 {selectedIds.size} 项资产统一设置资产类型</p>
              </div>
              <button
                onClick={handleCloseBulkTypeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">将修改 {selectedIds.size} 项资产的分类</p>
                    <p className="text-sm text-purple-600">所有选中资产的类型将被统一覆盖</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择新的资产分类</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map((type) => {
                    const Icon = typeIcons[type];
                    const isSelected = bulkType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBulkType(type)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                          isSelected
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          isSelected ? typeColors[type] : 'bg-gray-100 text-gray-500'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{ASSET_TYPE_LABELS[type]}</p>
                          <p className="text-xs text-gray-500">选择此分类</p>
                        </div>
                        {isSelected && (
                          <div className="ml-auto">
                            <Check className="w-5 h-5 text-purple-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseBulkTypeModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleBulkTypeSubmit}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  确认修改 ({selectedIds.size} 项)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCapsuleModal && capsuleAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Timer className="w-5 h-5 text-violet-500" />
                时间胶囊设置 - {capsuleAsset.name}
              </h2>
              <button
                onClick={handleCloseCapsuleModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCapsuleSubmit} className="p-6 space-y-4">
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Hourglass className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-violet-900">什么是时间胶囊？</p>
                    <p className="text-xs text-violet-600 mt-0.5">
                      为资产设置解锁日期，到期前该资产对继承人和见证人完全隐藏，到期后在遗嘱执行流程中自动解密显示
                    </p>
                  </div>
                </div>
              </div>

              {capsuleAsset.timeCapsule?.enabled && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">当前状态</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        解锁日期：{formatDate(capsuleAsset.timeCapsule.unlockDate)}
                        {capsuleAsset.timeCapsule.note && ` | 备注：${capsuleAsset.timeCapsule.note}`}
                      </p>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      TIME_CAPSULE_STATUS_COLORS[getTimeCapsuleStatus(capsuleAsset.timeCapsule)]
                    )}>
                      {TIME_CAPSULE_STATUS_LABELS[getTimeCapsuleStatus(capsuleAsset.timeCapsule)]}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {getTimeCapsuleStatus(capsuleAsset.timeCapsule) === 'locked' && (
                      <button
                        type="button"
                        onClick={() => {
                          handleUnlockCapsule(capsuleAsset.id);
                          handleCloseCapsuleModal();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        手动解锁
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveCapsule(capsuleAsset.id);
                        handleCloseCapsuleModal();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      移除胶囊
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">解锁日期 *</label>
                <input
                  type="date"
                  required
                  value={capsuleForm.unlockDate}
                  onChange={(e) => setCapsuleForm({ ...capsuleForm, unlockDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  此日期之前，资产信息对继承人和见证人完全隐藏
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注（可选）</label>
                <input
                  type="text"
                  value={capsuleForm.note}
                  onChange={(e) => setCapsuleForm({ ...capsuleForm, note: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="例如：子女18岁生日时解锁"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseCapsuleModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  {capsuleAsset.timeCapsule?.enabled ? '更新胶囊' : '创建胶囊'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
