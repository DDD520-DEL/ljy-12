import { useState } from 'react';
import {
  UserCheck,
  Users,
  Plus,
  X,
  Mail,
  Phone,
  Building,
  Award,
  CheckCircle,
  XCircle,
  Send,
  Settings,
  UserPlus,
  Trash2,
  Edit2,
  Shield,
  Bell,
  ThumbsUp,
  FolderOpen,
  Clock,
  Info,
  Link2,
  Unlink,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  formatDate,
  EXECUTOR_STATUS_LABELS,
  EXECUTOR_STATUS_COLORS,
  EXECUTOR_PERMISSION_LABELS,
  EXECUTOR_PERMISSION_DESCRIPTIONS,
} from '@/constants';
import type { Executor, VerificationStatus, ExecutorPermissions } from '@/types';

export default function Executors() {
  const executors = useAppStore((state) => state.executors);
  const addExecutor = useAppStore((state) => state.addExecutor);
  const updateExecutor = useAppStore((state) => state.updateExecutor);
  const deleteExecutor = useAppStore((state) => state.deleteExecutor);
  const verifyExecutor = useAppStore((state) => state.verifyExecutor);
  const updateExecutorPermissions = useAppStore((state) => state.updateExecutorPermissions);
  const assignExecutorToWill = useAppStore((state) => state.assignExecutorToWill);
  const removeExecutorFromWill = useAppStore((state) => state.removeExecutorFromWill);
  const addNotification = useAppStore((state) => state.addNotification);
  const will = useAppStore((state) => state.will);

  const [showModal, setShowModal] = useState(false);
  const [editingExecutor, setEditingExecutor] = useState<Executor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    isLawyer: false,
    barNumber: '',
    firmName: '',
    note: '',
    permissions: {
      sendNotification: false,
      approvalConfirmation: false,
      assetTransfer: false,
    },
  });

  const [expandedPermissionsId, setExpandedPermissionsId] = useState<string | null>(null);

  const handleOpenModal = (executor?: Executor) => {
    if (executor) {
      setEditingExecutor(executor);
      setFormData({
        name: executor.name,
        email: executor.email,
        phone: executor.phone || '',
        relationship: executor.relationship,
        isLawyer: executor.isLawyer,
        barNumber: executor.barNumber || '',
        firmName: executor.firmName || '',
        note: executor.note || '',
        permissions: executor.permissions,
      });
    } else {
      setEditingExecutor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        relationship: '',
        isLawyer: false,
        barNumber: '',
        firmName: '',
        note: '',
        permissions: {
          sendNotification: false,
          approvalConfirmation: false,
          assetTransfer: false,
        },
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExecutor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExecutor) {
      updateExecutor(editingExecutor.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        relationship: formData.relationship,
        isLawyer: formData.isLawyer,
        barNumber: formData.barNumber || undefined,
        firmName: formData.firmName || undefined,
        note: formData.note || undefined,
      });
      updateExecutorPermissions(editingExecutor.id, formData.permissions);
      addNotification({
        type: 'success',
        title: '执行人已更新',
        message: `执行人「${formData.name}」信息已更新`,
      });
    } else {
      addExecutor(formData);
    }
    handleCloseModal();
  };

  const handleVerify = (id: string) => {
    verifyExecutor(id);
  };

  const handleSendReminder = (name: string) => {
    addNotification({
      type: 'info',
      title: '提醒已发送',
      message: `已向 ${name} 发送验证提醒`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要移除遗嘱执行人 ${name} 吗？`)) {
      deleteExecutor(id);
      addNotification({
        type: 'info',
        title: '执行人已移除',
        message: `执行人「${name}」已从系统中移除`,
      });
    }
  };

  const handleTogglePermission = (executorId: string, permission: keyof ExecutorPermissions) => {
    const executor = executors.find((e) => e.id === executorId);
    if (executor) {
      updateExecutorPermissions(executorId, {
        [permission]: !executor.permissions[permission],
      });
      addNotification({
        type: 'info',
        title: '权限已更新',
        message: `执行人「${executor.name}」的${EXECUTOR_PERMISSION_LABELS[permission]}权限已${!executor.permissions[permission] ? '启用' : '禁用'}`,
      });
    }
  };

  const handleAssignToWill = (executorId: string) => {
    assignExecutorToWill(executorId);
    const executor = executors.find((e) => e.id === executorId);
    if (executor) {
      addNotification({
        type: 'success',
        title: '已分配',
        message: `执行人「${executor.name}」已分配到当前遗嘱`,
      });
    }
  };

  const handleRemoveFromWill = (executorId: string) => {
    removeExecutorFromWill(executorId);
    const executor = executors.find((e) => e.id === executorId);
    if (executor) {
      addNotification({
        type: 'info',
        title: '已移除',
        message: `执行人「${executor.name}」已从当前遗嘱移除`,
      });
    }
  };

  const statusColors: Record<VerificationStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const statusIcons: Record<VerificationStatus, typeof Clock> = {
    pending: Clock,
    verified: CheckCircle,
    rejected: XCircle,
  };

  const totalExecutors = executors.length;
  const activeExecutors = executors.filter((e) => e.status === 'active').length;
  const pendingExecutors = executors.filter((e) => e.status === 'pending').length;
  const lawyerExecutors = executors.filter((e) => e.isLawyer && e.status === 'active').length;
  const willExecutors = will ? will.executorIds.length : 0;

  const isAssignedToWill = (executorId: string) => {
    return will?.executorIds.includes(executorId) || false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">执行人管理</h1>
          <p className="text-gray-500 mt-1">指定独立于继承人的遗嘱执行人，监督和管理整个执行流程</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加执行人
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalExecutors}</p>
              <p className="text-sm text-gray-500">执行人总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeExecutors}</p>
              <p className="text-sm text-gray-500">已激活</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lawyerExecutors}</p>
              <p className="text-sm text-gray-500">律师执行人</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingExecutors}</p>
              <p className="text-sm text-gray-500">待激活</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Link2 className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{willExecutors}</p>
              <p className="text-sm text-gray-500">已分配遗嘱</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">执行人权限体系</h3>
            <p className="text-indigo-100 mt-1">
              独立于继承人的第三方执行人，负责监督遗嘱执行流程，确保资产分配公正透明
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{activeExecutors}</p>
            <p className="text-sm text-indigo-200">活跃执行人</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5" />
              <span className="font-medium">通知发送</span>
            </div>
            <p className="text-xs text-indigo-100">
              向继承人、见证人发送执行相关通知
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-5 h-5" />
              <span className="font-medium">审批确认</span>
            </div>
            <p className="text-xs text-indigo-100">
              确认审批流程、见证关键执行步骤
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="w-5 h-5" />
              <span className="font-medium">资产移交</span>
            </div>
            <p className="text-xs text-indigo-100">
              执行资产移交操作，包括账号密码移交
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          执行人列表
        </h3>

        {executors.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无遗嘱执行人</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              添加第一位执行人
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {executors.map((executor) => {
              const StatusIcon = statusIcons[executor.verificationStatus];
              const isExpanded = expandedPermissionsId === executor.id;
              const assigned = isAssignedToWill(executor.id);

              return (
                <div
                  key={executor.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <div className="p-5 bg-gray-50">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                          executor.isLawyer ? 'bg-purple-100' : 'bg-indigo-100'
                        )}>
                          {executor.isLawyer ? (
                            <Shield className="w-6 h-6 text-purple-600" />
                          ) : (
                            <UserCheck className="w-6 h-6 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900 text-lg">{executor.name}</h4>
                            {executor.isLawyer && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                律师
                              </span>
                            )}
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                EXECUTOR_STATUS_COLORS[executor.status]
                              )}
                            >
                              {EXECUTOR_STATUS_LABELS[executor.status]}
                            </span>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1',
                                statusColors[executor.verificationStatus]
                              )}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {executor.verificationStatus === 'pending'
                                ? '待验证'
                                : executor.verificationStatus === 'verified'
                                ? '已验证'
                                : '已拒绝'}
                            </span>
                            {assigned && (
                              <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full font-medium flex items-center gap-1">
                                <Link2 className="w-3 h-3" />
                                已分配遗嘱
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            关系：{executor.relationship}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="w-4 h-4" />
                              {executor.email}
                            </div>
                            {executor.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="w-4 h-4" />
                                {executor.phone}
                              </div>
                            )}
                          </div>
                          {executor.isLawyer && (
                            <div className="flex items-center gap-4 mt-2">
                              {executor.firmName && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Building className="w-4 h-4" />
                                  {executor.firmName}
                                </div>
                              )}
                              {executor.barNumber && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Award className="w-4 h-4" />
                                  执业证号：{executor.barNumber}
                                </div>
                              )}
                            </div>
                          )}
                          {executor.note && (
                            <p className="text-sm text-gray-500 mt-2 flex items-start gap-1">
                              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              {executor.note}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-xs text-gray-500">权限：</span>
                            {(Object.keys(executor.permissions) as Array<keyof ExecutorPermissions>).map((perm) => (
                              <span
                                key={perm}
                                className={cn(
                                  'px-2 py-0.5 text-xs rounded-full font-medium',
                                  executor.permissions[perm]
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-400'
                                )}
                              >
                                {EXECUTOR_PERMISSION_LABELS[perm]}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {executor.verificationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleSendReminder(executor.name)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              提醒
                            </button>
                            <button
                              onClick={() => handleVerify(executor.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              验证
                            </button>
                          </>
                        )}
                        {executor.status === 'active' && (
                          <>
                            {assigned ? (
                              <button
                                onClick={() => handleRemoveFromWill(executor.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                                title="从遗嘱中移除此执行人"
                              >
                                <Unlink className="w-4 h-4" />
                                移除分配
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAssignToWill(executor.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors"
                                title="分配此执行人到当前遗嘱"
                              >
                                <Link2 className="w-4 h-4" />
                                分配遗嘱
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => setExpandedPermissionsId(isExpanded ? null : executor.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          权限配置
                        </button>
                        <button
                          onClick={() => handleOpenModal(executor)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="编辑执行人"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(executor.id, executor.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除执行人"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t border-gray-100">
                      <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        权限配置
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(Object.keys(executor.permissions) as Array<keyof ExecutorPermissions>).map((perm) => (
                          <label
                            key={perm}
                            className={cn(
                              'flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors border-2',
                              executor.permissions[perm]
                                ? 'border-indigo-300 bg-indigo-50'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={executor.permissions[perm]}
                              onChange={() => handleTogglePermission(executor.id, perm)}
                              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {EXECUTOR_PERMISSION_LABELS[perm]}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {EXECUTOR_PERMISSION_DESCRIPTIONS[perm]}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          创建于 {formatDate(executor.createdAt)}
                          {executor.verifiedAt && ` · 验证于 ${formatDate(executor.verifiedAt)}`}
                          {executor.updatedAt !== executor.createdAt && ` · 更新于 ${formatDate(executor.updatedAt)}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">执行人职责说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-7 h-7 text-indigo-600" />
            </div>
            <h4 className="font-medium text-gray-900">1. 指定执行人</h4>
            <p className="text-sm text-gray-500 mt-2">
              选择可信赖的第三方人士或律师作为遗嘱执行人
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Settings className="w-7 h-7 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">2. 配置权限</h4>
            <p className="text-sm text-gray-500 mt-2">
              根据执行人的角色和职责，配置相应的操作权限
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-cyan-600" />
            </div>
            <h4 className="font-medium text-gray-900">3. 身份验证</h4>
            <p className="text-sm text-gray-500 mt-2">
              执行人需完成身份验证后方可参与执行流程
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">4. 监督执行</h4>
            <p className="text-sm text-gray-500 mt-2">
              执行人在遗嘱触发后按照权限监督和执行各项操作
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingExecutor ? '编辑执行人' : '添加执行人'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="执行人姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">关系 *</label>
                  <input
                    type="text"
                    required
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="如：律师、挚友、家人"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="138****1234"
                />
              </div>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isLawyer}
                  onChange={(e) => setFormData({ ...formData, isLawyer: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div>
                  <p className="font-medium text-gray-900">是执业律师</p>
                  <p className="text-xs text-gray-500">具有律师执业资格，可以提供法律见证服务</p>
                </div>
              </label>

              {formData.isLawyer && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">律师执业证号</label>
                    <input
                      type="text"
                      value={formData.barNumber}
                      onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="执业证号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">律所名称</label>
                    <input
                      type="text"
                      value={formData.firmName}
                      onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="律师事务所名称"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">权限配置</label>
                <div className="space-y-2">
                  {(Object.keys(formData.permissions) as Array<keyof ExecutorPermissions>).map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions[perm]}
                        onChange={(e) => setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            [perm]: e.target.checked,
                          },
                        })}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{EXECUTOR_PERMISSION_LABELS[perm]}</p>
                        <p className="text-xs text-gray-500">{EXECUTOR_PERMISSION_DESCRIPTIONS[perm]}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="执行人的特殊说明或职责描述"
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
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingExecutor ? '保存' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
