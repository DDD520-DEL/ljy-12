import { useState } from 'react';
import {
  Scale,
  Users,
  UserCheck,
  Clock,
  Plus,
  X,
  Mail,
  Phone,
  Building,
  Award,
  CheckCircle,
  XCircle,
  Send,
  FolderKanban,
  Settings,
  UserPlus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import {
  formatDate,
  APPROVAL_GROUP_STATUS_LABELS,
  APPROVAL_GROUP_STATUS_COLORS,
  WITNESS_APPROVAL_DECISION_LABELS,
  WITNESS_APPROVAL_DECISION_COLORS,
} from '@/constants';
import type { VerificationStatus, WitnessApprovalDecision } from '@/types';

export default function Witnesses() {
  const witnesses = useAppStore((state) => state.witnesses);
  const addWitness = useAppStore((state) => state.addWitness);
  const deleteWitness = useAppStore((state) => state.deleteWitness);
  const verifyWitness = useAppStore((state) => state.verifyWitness);
  const addNotification = useAppStore((state) => state.addNotification);
  const approvalGroups = useAppStore((state) => state.approvalGroups);
  const createApprovalGroup = useAppStore((state) => state.createApprovalGroup);
  const updateApprovalGroup = useAppStore((state) => state.updateApprovalGroup);
  const deleteApprovalGroup = useAppStore((state) => state.deleteApprovalGroup);
  const assignWitnessToGroup = useAppStore((state) => state.assignWitnessToGroup);
  const removeWitnessFromGroup = useAppStore((state) => state.removeWitnessFromGroup);
  const submitWitnessApproval = useAppStore((state) => state.submitWitnessApproval);
  const getApprovalGroupProgress = useAppStore((state) => state.getApprovalGroupProgress);
  const getWillExecutionState = useAppStore((state) => state.getWillExecutionState);
  const will = useAppStore((state) => state.will);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isLawyer: false,
    barNumber: '',
    firmName: '',
  });

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
    requiredApprovals: 1,
    witnessIds: [] as string[],
  });

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [assignGroupId, setAssignGroupId] = useState<string | null>(null);

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      isLawyer: false,
      barNumber: '',
      firmName: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWitness(formData);
    addNotification({
      type: 'info',
      title: '见证人已添加',
      message: `已向 ${formData.name} 发送验证邀请`,
    });
    handleCloseModal();
  };

  const handleVerify = (id: string) => {
    verifyWitness(id);
    addNotification({
      type: 'success',
      title: '验证通过',
      message: '见证人身份已验证',
    });
  };

  const handleSendReminder = (name: string) => {
    addNotification({
      type: 'info',
      title: '提醒已发送',
      message: `已向 ${name} 发送验证提醒`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要移除见证人 ${name} 吗？`)) {
      deleteWitness(id);
    }
  };

  const handleOpenGroupModal = (groupId?: string) => {
    if (groupId) {
      const group = approvalGroups.find((g) => g.id === groupId);
      if (group) {
        setEditingGroupId(groupId);
        setGroupFormData({
          name: group.name,
          description: group.description || '',
          requiredApprovals: group.requiredApprovals,
          witnessIds: group.witnessIds,
        });
      }
    } else {
      setEditingGroupId(null);
      setGroupFormData({
        name: '',
        description: '',
        requiredApprovals: 1,
        witnessIds: [],
      });
    }
    setShowGroupModal(true);
  };

  const handleCloseGroupModal = () => {
    setShowGroupModal(false);
    setEditingGroupId(null);
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroupId) {
      updateApprovalGroup(editingGroupId, {
        name: groupFormData.name,
        description: groupFormData.description,
        requiredApprovals: groupFormData.requiredApprovals,
      });
      addNotification({
        type: 'success',
        title: '审批组已更新',
        message: `审批组「${groupFormData.name}」已更新`,
      });
    } else {
      createApprovalGroup(groupFormData);
      addNotification({
        type: 'success',
        title: '审批组已创建',
        message: `审批组「${groupFormData.name}」已创建`,
      });
    }
    handleCloseGroupModal();
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    if (confirm(`确定要删除审批组「${groupName}」吗？`)) {
      deleteApprovalGroup(groupId);
      addNotification({
        type: 'info',
        title: '审批组已删除',
        message: `审批组「${groupName}」已删除`,
      });
    }
  };

  const handleAssignWitness = (groupId: string, witnessId: string) => {
    assignWitnessToGroup(groupId, witnessId);
    setAssignGroupId(null);
    const witness = witnesses.find((w) => w.id === witnessId);
    if (witness) {
      addNotification({
        type: 'success',
        title: '已分配',
        message: `见证人「${witness.name}」已加入审批组`,
      });
    }
  };

  const handleRemoveFromGroup = (groupId: string, witnessId: string) => {
    const witness = witnesses.find((w) => w.id === witnessId);
    removeWitnessFromGroup(groupId, witnessId);
    if (witness) {
      addNotification({
        type: 'info',
        title: '已移除',
        message: `见证人「${witness.name}」已从审批组移除`,
      });
    }
  };

  const handleSubmitApproval = (groupId: string, witnessId: string, decision: WitnessApprovalDecision) => {
    submitWitnessApproval(groupId, witnessId, decision);
    const witness = witnesses.find((w) => w.id === witnessId);
    addNotification({
      type: decision === 'approved' ? 'success' : decision === 'rejected' ? 'error' : 'info',
      title: '审批已提交',
      message: witness
        ? `「${witness.name}」已提交${decision === 'approved' ? '同意' : decision === 'rejected' ? '拒绝' : '待定'}意见`
        : '审批意见已提交',
    });
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

  const totalWitnesses = witnesses.length;
  const verifiedWitnesses = witnesses.filter((w) => w.verificationStatus === 'verified').length;
  const pendingWitnesses = witnesses.filter((w) => w.verificationStatus === 'pending').length;
  const lawyers = witnesses.filter((w) => w.isLawyer);
  const verifiedLawyers = lawyers.filter((w) => w.verificationStatus === 'verified').length;
  const execState = getWillExecutionState();

  const isWillTriggered = will?.status === 'triggered' || will?.status === 'executing';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">见证与授权</h1>
          <p className="text-gray-500 mt-1">管理遗嘱执行的见证人和律师授权</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => handleOpenGroupModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FolderKanban className="w-5 h-5" />
            创建审批组
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加见证人
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalWitnesses}</p>
              <p className="text-sm text-gray-500">见证人总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{verifiedWitnesses}</p>
              <p className="text-sm text-gray-500">已验证</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lawyers.length}</p>
              <p className="text-sm text-gray-500">律师</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingWitnesses}</p>
              <p className="text-sm text-gray-500">待验证</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvalGroups.length}</p>
              <p className="text-sm text-gray-500">审批组</p>
            </div>
          </div>
        </div>
      </div>

      {approvalGroups.length > 0 && (
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">加权审批进度</h3>
              <p className="text-cyan-100 mt-1">
                所有审批组独立完成审批后，遗嘱方可进入执行阶段
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{execState.overallProgress}%</p>
              <p className="text-sm text-cyan-200">总体进度</p>
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${execState.overallProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Scale className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">律师见证机制</h3>
            <p className="text-purple-100 mt-1">
              专业律师参与遗嘱执行过程，确保数字遗产移交合法合规，具有法律效力
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{verifiedLawyers}</p>
            <p className="text-sm text-purple-200">认证律师</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyan-500" />
            审批组管理
          </h3>
        </div>

        {approvalGroups.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无审批组</p>
            <button
              onClick={() => handleOpenGroupModal()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建第一个审批组
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {approvalGroups.map((group) => {
              const progress = getApprovalGroupProgress(group.id);
              const isExpanded = expandedGroupId === group.id;
              const witnessesInGroup = witnesses.filter((w) => group.witnessIds.includes(w.id));
              const witnessesNotInGroup = witnesses.filter((w) => !group.witnessIds.includes(w.id) && w.verificationStatus === 'verified');
              const showAssign = assignGroupId === group.id;

              return (
                <div key={group.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="p-5 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-semibold text-gray-900 text-lg">{group.name}</h4>
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                              APPROVAL_GROUP_STATUS_COLORS[group.status]
                            )}
                          >
                            {APPROVAL_GROUP_STATUS_LABELS[group.status]}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                        )}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">
                              审批进度：{progress.approved}/{progress.required} 通过（共 {progress.total} 人）
                            </span>
                            <span className="font-medium text-gray-700">{progress.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-500',
                                group.status === 'approved' ? 'bg-green-500' :
                                group.status === 'rejected' ? 'bg-red-500' : 'bg-cyan-500'
                              )}
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleOpenGroupModal(group.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑审批组"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除审批组"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t border-gray-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-700 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          组内见证人（{witnessesInGroup.length}）
                        </h5>
                        {witnessesNotInGroup.length > 0 && (
                          <button
                            onClick={() => setAssignGroupId(showAssign ? null : group.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                            添加见证人
                          </button>
                        )}
                      </div>

                      {showAssign && witnessesNotInGroup.length > 0 && (
                        <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-200">
                          <p className="text-sm text-cyan-700 mb-2 font-medium">选择要添加的已验证见证人：</p>
                          <div className="flex flex-wrap gap-2">
                            {witnessesNotInGroup.map((w) => (
                              <button
                                key={w.id}
                                onClick={() => handleAssignWitness(group.id, w.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white text-cyan-700 rounded-lg border border-cyan-300 hover:bg-cyan-100 transition-colors"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                {w.name}
                                {w.isLawyer && (
                                  <span className="text-purple-600 text-xs">（律师）</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {witnessesInGroup.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">暂无见证人，请添加</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {witnessesInGroup.map((witness) => {
                            const approval = group.approvals.find((a) => a.witnessId === witness.id);
                            const decision = approval?.decision || 'pending';

                            return (
                              <div key={witness.id} className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      'w-10 h-10 rounded-full flex items-center justify-center',
                                      witness.isLawyer ? 'bg-purple-100' : 'bg-blue-100'
                                    )}>
                                      {witness.isLawyer ? (
                                        <Scale className="w-5 h-5 text-purple-600" />
                                      ) : (
                                        <Users className="w-5 h-5 text-blue-600" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{witness.name}</span>
                                        {witness.isLawyer && (
                                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                                            律师
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                                        <Mail className="w-3.5 h-3.5" />
                                        {witness.email}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 flex-wrap">
                                    <span
                                      className={cn(
                                        'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1',
                                        WITNESS_APPROVAL_DECISION_COLORS[decision]
                                      )}
                                    >
                                      {decision === 'approved' ? (
                                        <ThumbsUp className="w-3 h-3" />
                                      ) : decision === 'rejected' ? (
                                        <ThumbsDown className="w-3 h-3" />
                                      ) : (
                                        <Clock className="w-3 h-3" />
                                      )}
                                      {WITNESS_APPROVAL_DECISION_LABELS[decision]}
                                      {approval?.decidedAt && (
                                        <span className="opacity-70 ml-1">
                                          · {formatDate(approval.decidedAt)}
                                        </span>
                                      )}
                                    </span>

                                    {isWillTriggered && witness.verificationStatus === 'verified' && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleSubmitApproval(group.id, witness.id, 'approved')}
                                          disabled={decision === 'approved'}
                                          className={cn(
                                            'flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg transition-colors',
                                            decision === 'approved'
                                              ? 'bg-green-100 text-green-700 cursor-default'
                                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                                          )}
                                        >
                                          <ThumbsUp className="w-3.5 h-3.5" />
                                          同意
                                        </button>
                                        <button
                                          onClick={() => handleSubmitApproval(group.id, witness.id, 'rejected')}
                                          disabled={decision === 'rejected'}
                                          className={cn(
                                            'flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg transition-colors',
                                            decision === 'rejected'
                                              ? 'bg-red-100 text-red-700 cursor-default'
                                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                                          )}
                                        >
                                          <ThumbsDown className="w-3.5 h-3.5" />
                                          拒绝
                                        </button>
                                      </div>
                                    )}

                                    <button
                                      onClick={() => handleRemoveFromGroup(group.id, witness.id)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="移出审批组"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                {approval?.comment && (
                                  <div className="mt-3 ml-13 pl-13 flex items-start gap-2 text-sm text-gray-600 bg-white rounded-lg p-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span>{approval.comment}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          创建于 {formatDate(group.createdAt)}
                          {group.updatedAt !== group.createdAt && ` · 更新于 ${formatDate(group.updatedAt)}`}
                          {group.completedAt && ` · 完成于 ${formatDate(group.completedAt)}`}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">见证人列表</h3>

        {witnesses.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无见证人</p>
            <button
              onClick={handleOpenModal}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              添加第一位见证人
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {witnesses.map((witness) => {
              const StatusIcon = statusIcons[witness.verificationStatus];
              const groups = approvalGroups.filter((g) => g.witnessIds.includes(witness.id));
              return (
                <div
                  key={witness.id}
                  className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center',
                        witness.isLawyer ? 'bg-purple-100' : 'bg-blue-100'
                      )}>
                        {witness.isLawyer ? (
                          <Scale className="w-6 h-6 text-purple-600" />
                        ) : (
                          <Users className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">{witness.name}</h4>
                          {witness.isLawyer && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              律师
                            </span>
                          )}
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1',
                              statusColors[witness.verificationStatus]
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {witness.verificationStatus === 'pending'
                              ? '待验证'
                              : witness.verificationStatus === 'verified'
                              ? '已验证'
                              : '已拒绝'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="w-4 h-4" />
                            {witness.email}
                          </div>
                          {witness.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Phone className="w-4 h-4" />
                              {witness.phone}
                            </div>
                          )}
                        </div>
                        {witness.isLawyer && (
                          <div className="flex items-center gap-4 mt-2">
                            {witness.firmName && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Building className="w-4 h-4" />
                                {witness.firmName}
                              </div>
                            )}
                            {witness.barNumber && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Award className="w-4 h-4" />
                                执业证号：{witness.barNumber}
                              </div>
                            )}
                          </div>
                        )}
                        {groups.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <FolderKanban className="w-3.5 h-3.5 text-cyan-500" />
                            <span className="text-xs text-gray-500">所属审批组：</span>
                            {groups.map((g) => (
                              <span
                                key={g.id}
                                className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs rounded-full font-medium"
                              >
                                {g.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {witness.verificationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleSendReminder(witness.name)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            提醒
                          </button>
                          <button
                            onClick={() => handleVerify(witness.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            验证
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(witness.id, witness.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    添加于 {formatDate(witness.createdAt)}
                    {witness.verifiedAt && ` · 验证于 ${formatDate(witness.verifiedAt)}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">授权流程说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">1. 邀请见证人</h4>
            <p className="text-sm text-gray-500 mt-2">
              添加见证人并发送验证邀请，见证人需确认身份
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FolderKanban className="w-7 h-7 text-cyan-600" />
            </div>
            <h4 className="font-medium text-gray-900">2. 创建审批组</h4>
            <p className="text-sm text-gray-500 mt-2">
              将见证人分组并设置每组所需通过人数
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Scale className="w-7 h-7 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">3. 律师认证</h4>
            <p className="text-sm text-gray-500 mt-2">
              律师需提供执业证号进行资格核验，确保法律效力
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">4. 加权审批</h4>
            <p className="text-sm text-gray-500 mt-2">
              各组独立完成审批后，共同见证遗嘱执行
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">添加见证人</h2>
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
                  placeholder="见证人姓名"
                />
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

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isLawyer}
                  onChange={(e) => setFormData({ ...formData, isLawyer: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div>
                  <p className="font-medium text-gray-900">是律师</p>
                  <p className="text-xs text-gray-500">具有律师执业资格，可以见证遗嘱执行</p>
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
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="执业证号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">律所名称</label>
                    <input
                      type="text"
                      value={formData.firmName}
                      onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="律师事务所名称"
                    />
                  </div>
                </>
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
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingGroupId ? '编辑审批组' : '创建审批组'}
              </h2>
              <button
                onClick={handleCloseGroupModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGroupSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">组名称 *</label>
                <input
                  type="text"
                  required
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：律师审批组、亲友见证组"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="描述此审批组的职责..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所需通过人数（加权阈值）
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max={Math.max(groupFormData.witnessIds.length, 1)}
                    value={groupFormData.requiredApprovals}
                    onChange={(e) => setGroupFormData({ ...groupFormData, requiredApprovals: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-blue-600 w-16 text-right">
                    {groupFormData.requiredApprovals} 人
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  至少需要 {groupFormData.requiredApprovals} 位组成员同意，本组才能通过审批。
                  当前组内共 {groupFormData.witnessIds.length} 人。
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseGroupModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingGroupId ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
