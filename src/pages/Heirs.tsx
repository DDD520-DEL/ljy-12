import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Mail, Phone, User, CheckCircle, Clock, FolderKanban } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { RELATIONSHIP_LABELS, formatDate } from '@/constants';
import { cn } from '@/lib/utils';
import type { Heir, HeirRelationship } from '@/types';

export default function Heirs() {
  const heirs = useAppStore((state) => state.heirs);
  const assets = useAppStore((state) => state.assets);
  const addHeir = useAppStore((state) => state.addHeir);
  const updateHeir = useAppStore((state) => state.updateHeir);
  const deleteHeir = useAppStore((state) => state.deleteHeir);

  const [showModal, setShowModal] = useState(false);
  const [editingHeir, setEditingHeir] = useState<Heir | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'spouse' as HeirRelationship,
    email: '',
    phone: '',
    notificationPreference: 'email' as 'email' | 'sms' | 'both',
  });

  const handleOpenModal = (heir?: Heir) => {
    if (heir) {
      setEditingHeir(heir);
      setFormData({
        name: heir.name,
        relationship: heir.relationship,
        email: heir.email,
        phone: heir.phone || '',
        notificationPreference: heir.notificationPreference,
      });
    } else {
      setEditingHeir(null);
      setFormData({
        name: '',
        relationship: 'spouse',
        email: '',
        phone: '',
        notificationPreference: 'email',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHeir(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHeir) {
      updateHeir(editingHeir.id, formData);
    } else {
      addHeir(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要移除这位继承人吗？')) {
      deleteHeir(id);
    }
  };

  const getHeirAssets = (heirId: string) => {
    return assets.filter((a) => a.heirId === heirId);
  };

  const relationshipColors: Record<HeirRelationship, string> = {
    spouse: 'bg-pink-100 text-pink-700',
    child: 'bg-blue-100 text-blue-700',
    parent: 'bg-amber-100 text-amber-700',
    sibling: 'bg-purple-100 text-purple-700',
    friend: 'bg-green-100 text-green-700',
    lawyer: 'bg-gray-100 text-gray-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">继承人管理</h1>
          <p className="text-gray-500 mt-1">管理您的数字遗产继承人和受益人</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加继承人
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{heirs.length}</p>
              <p className="text-sm text-gray-500">继承人总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {heirs.filter((h) => h.isVerified).length}
              </p>
              <p className="text-sm text-gray-500">已验证</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {heirs.filter((h) => !h.isVerified).length}
              </p>
              <p className="text-sm text-gray-500">待验证</p>
            </div>
          </div>
        </div>
      </div>

      {heirs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无继承人</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            添加第一位继承人
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {heirs.map((heir) => {
            const heirAssets = getHeirAssets(heir.id);
            return (
              <div
                key={heir.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{heir.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            relationshipColors[heir.relationship]
                          )}
                        >
                          {RELATIONSHIP_LABELS[heir.relationship]}
                        </span>
                        {heir.isVerified ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            已验证
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Clock className="w-3 h-3" />
                            待验证
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(heir)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(heir.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{heir.email}</span>
                  </div>
                  {heir.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{heir.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {heirAssets.length} 项资产
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      添加于 {formatDate(heir.createdAt)}
                    </span>
                  </div>

                  {heirAssets.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {heirAssets.slice(0, 3).map((asset) => (
                        <span
                          key={asset.id}
                          className="px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-600"
                        >
                          {asset.name}
                        </span>
                      ))}
                      {heirAssets.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 rounded-md text-xs text-gray-500">
                          +{heirAssets.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingHeir ? '编辑继承人' : '添加继承人'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="继承人姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关系 *</label>
                <select
                  required
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value as HeirRelationship })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {(Object.keys(RELATIONSHIP_LABELS) as HeirRelationship[]).map((rel) => (
                    <option key={rel} value={rel}>
                      {RELATIONSHIP_LABELS[rel]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="138****1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">通知方式</label>
                <div className="flex gap-3">
                  {(['email', 'sms', 'both'] as const).map((pref) => (
                    <label
                      key={pref}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors',
                        formData.notificationPreference === pref
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="notification"
                        value={pref}
                        checked={formData.notificationPreference === pref}
                        onChange={(e) => setFormData({ ...formData, notificationPreference: e.target.value as 'email' | 'sms' | 'both' })}
                        className="sr-only"
                      />
                      <span className="text-sm">
                        {pref === 'email' ? '邮件' : pref === 'sms' ? '短信' : '全部'}
                      </span>
                    </label>
                  ))}
                </div>
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
                  {editingHeir ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
