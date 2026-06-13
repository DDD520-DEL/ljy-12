import { useState } from 'react';
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
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  ASSET_TYPE_LABELS,
  getHealthCheckStatus,
  getDaysSinceLastVerification,
  getNextVerificationDate,
  HEALTH_CHECK_STATUS_LABELS,
  HEALTH_CHECK_STATUS_COLORS,
  HEALTH_CHECK_PERIOD_LABELS,
  DEFAULT_REMINDER_DAYS,
} from '@/constants';
import { cn } from '@/lib/utils';
import type { DigitalAsset, AssetType, HealthCheckPeriod, ReminderRule } from '@/types';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DigitalAsset | null>(null);
  const [healthCheckAsset, setHealthCheckAsset] = useState<DigitalAsset | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'social_media' as AssetType,
    username: '',
    url: '',
    description: '',
    value: '',
    currency: 'CNY',
    heirId: '',
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
    return matchesSearch && matchesType;
  });

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

  const handleHealthCheckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthCheckAsset) return;

    const reminderRule: ReminderRule = {
      enabled: healthCheckForm.reminderEnabled,
      daysBefore: parseInt(healthCheckForm.reminderDays) || DEFAULT_REMINDER_DAYS,
      repeat: healthCheckForm.repeatReminder,
    };

    updateAssetHealthCheck(
      healthCheckAsset.id,
      healthCheckForm.period,
      healthCheckForm.period === 'custom' ? parseInt(healthCheckForm.customDays) : undefined,
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
    if (editingAsset) {
      updateAsset(editingAsset.id, {
        ...formData,
        value: formData.value ? Number(formData.value) : undefined,
      });
    } else {
      addAsset({
        ...formData,
        value: formData.value ? Number(formData.value) : undefined,
      });
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个数字资产吗？')) {
      deleteAsset(id);
    }
  };

  const getHeirName = (heirId?: string) => {
    if (!heirId) return '未分配';
    const heir = heirs.find((h) => h.id === heirId);
    return heir?.name || '未分配';
  };

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
                  'bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow',
                  healthStatus === 'overdue' ? 'border-red-200' :
                  healthStatus === 'warning' ? 'border-amber-200' :
                  'border-gray-100'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', typeColors[asset.type])}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                      <span className="text-xs text-gray-500">{ASSET_TYPE_LABELS[asset.type]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenHealthCheckModal(asset)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="健康检查设置"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleVerifyAsset(asset.id)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="标记已验证"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(asset)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{getHeirName(asset.heirId)}</span>
                    </div>
                    {asset.value !== undefined && asset.value > 0 && (
                      <span className="text-sm font-medium text-emerald-600">
                        ¥{asset.value.toLocaleString()}
                      </span>
                    )}
                  </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">继承人</label>
                <select
                  value={formData.heirId}
                  onChange={(e) => setFormData({ ...formData, heirId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">暂不分配</option>
                  {heirs.map((heir) => (
                    <option key={heir.id} value={heir.id}>
                      {heir.name}
                    </option>
                  ))}
                </select>
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
    </div>
  );
}
