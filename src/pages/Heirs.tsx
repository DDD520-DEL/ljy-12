import { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Mail, Phone, User, CheckCircle, Clock, FolderKanban, GripVertical, ArrowUp, ArrowDown, Info } from 'lucide-react';
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
  const reorderHeirs = useAppStore((state) => state.reorderHeirs);

  const [showModal, setShowModal] = useState(false);
  const [editingHeir, setEditingHeir] = useState<Heir | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);

  const sortedHeirs = [...heirs].sort((a, b) => a.priority - b.priority);

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

  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItemRef.current !== null && dragOverIndex !== null && dragItemRef.current !== dragOverIndex) {
      const reordered = [...sortedHeirs];
      const [moved] = reordered.splice(dragItemRef.current, 1);
      reordered.splice(dragOverIndex, 0, moved);
      reorderHeirs(reordered.map((h) => h.id));
    }
    dragItemRef.current = null;
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const reordered = [...sortedHeirs];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    reorderHeirs(reordered.map((h) => h.id));
  };

  const handleMoveDown = (index: number) => {
    if (index >= sortedHeirs.length - 1) return;
    const reordered = [...sortedHeirs];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    reorderHeirs(reordered.map((h) => h.id));
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

  const priorityBadgeColors = [
    'bg-emerald-500 text-white',
    'bg-blue-500 text-white',
    'bg-purple-500 text-white',
    'bg-amber-500 text-white',
    'bg-gray-500 text-white',
  ];

  const getPriorityBadge = (priority: number) => {
    const color = priorityBadgeColors[Math.min(priority - 1, priorityBadgeColors.length - 1)];
    const labels = ['第一顺位', '第二顺位', '第三顺位', '第四顺位', '第五顺位'];
    const label = labels[Math.min(priority - 1, labels.length - 1)] || `第${priority}顺位`;
    return { color, label };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">继承人管理</h1>
          <p className="text-gray-500 mt-1">管理继承顺位和受益人信息，拖拽可调整优先级</p>
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
        <>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Info className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">继承顺位规则</h3>
                <p className="text-blue-100 text-sm mt-1">
                  顺位越靠前，继承优先级越高。当第一顺位继承人无法继承时（如放弃、失联等），资产将自动流转至下一顺位继承人。拖拽卡片或使用箭头可调整顺位。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {sortedHeirs.map((heir, index) => {
              const heirAssets = getHeirAssets(heir.id);
              const badge = getPriorityBadge(heir.priority);
              const isDragging = dragIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={heir.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragLeave={() => setDragOverIndex(null)}
                  className={cn(
                    'bg-white rounded-2xl p-6 shadow-sm border-2 hover:shadow-md transition-all cursor-grab active:cursor-grabbing',
                    isDragging ? 'opacity-50 border-gray-300 scale-[0.98]' : '',
                    isDragOver ? 'border-emerald-400 bg-emerald-50/30' : 'border-gray-100',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 pt-2">
                      <GripVertical className="w-5 h-5 text-gray-300" />
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className={cn(
                            'p-0.5 rounded transition-colors',
                            index === 0
                              ? 'text-gray-200 cursor-not-allowed'
                              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                          )}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === sortedHeirs.length - 1}
                          className={cn(
                            'p-0.5 rounded transition-colors',
                            index === sortedHeirs.length - 1
                              ? 'text-gray-200 cursor-not-allowed'
                              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                          )}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                              <User className="w-7 h-7 text-white" />
                            </div>
                            <span
                              className={cn(
                                'absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                                badge.color
                              )}
                            >
                              {heir.priority}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{heir.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-xs font-medium',
                                  badge.color
                                )}
                              >
                                {badge.label}
                              </span>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
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

                        <div className="pt-0 md:pt-0">
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
                            <div className="mt-2 flex flex-wrap gap-2">
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
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

              {!editingHeir && (
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700">
                    新继承人将自动排在第 {heirs.length + 1} 顺位，添加后可拖拽调整顺位。
                  </p>
                </div>
              )}

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
