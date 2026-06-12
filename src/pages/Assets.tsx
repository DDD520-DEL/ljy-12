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
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ASSET_TYPE_LABELS, formatDate } from '@/constants';
import { cn } from '@/lib/utils';
import type { DigitalAsset, AssetType } from '@/types';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DigitalAsset | null>(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数字资产清单</h1>
          <p className="text-gray-500 mt-1">管理您的所有数字资产和账户</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加资产
        </button>
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
            const heir = heirs.find((h) => h.id === asset.heirId);
            return (
              <div
                key={asset.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
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
                  <p className="text-xs text-gray-400 mt-2">
                    更新于 {formatDate(asset.updatedAt)}
                  </p>
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
    </div>
  );
}
