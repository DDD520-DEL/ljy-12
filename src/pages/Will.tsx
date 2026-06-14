import { useState } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Play,
  Shield,
  Users,
  Scale,
  ArrowRight,
  Lock,
  Unlock,
  FolderKanban,
  User,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  GitBranch,
  Zap,
  ChevronDown,
  ChevronUp,
  Target,
  Timer,
  Hourglass,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import {
  TRIGGER_TYPE_LABELS,
  WILL_STATUS_LABELS,
  WILL_STATUS_COLORS,
  ASSET_TYPE_LABELS,
  DEFAULT_INACTIVITY_DAYS,
  formatDate,
  daysSince,
  APPROVAL_GROUP_STATUS_LABELS,
  APPROVAL_GROUP_STATUS_COLORS,
  WITNESS_APPROVAL_DECISION_LABELS,
  WITNESS_APPROVAL_DECISION_COLORS,
  CONDITION_FIELD_LABELS,
  CONDITION_FIELD_COLORS,
  CONDITION_OPERATOR_LABELS,
  BRANCH_COLORS,
  BRANCH_COLORS_LIGHT,
  BRANCH_COLORS_BORDER,
  TIME_CAPSULE_STATUS_LABELS,
  TIME_CAPSULE_STATUS_COLORS,
  getTimeCapsuleStatus,
  getDaysUntilUnlock,
} from '@/constants';
import { cn } from '@/lib/utils';
import type { TriggerType, ExecutionStep, WitnessApprovalDecision, Branch, BranchCondition, ConditionField, ConditionOperator } from '@/types';

export default function Will() {
  const will = useAppStore((state) => state.will);
  const witnesses = useAppStore((state) => state.witnesses);
  const heirs = useAppStore((state) => state.heirs);
  const assets = useAppStore((state) => state.assets);
  const approvalGroups = useAppStore((state) => state.approvalGroups);
  const updateWill = useAppStore((state) => state.updateWill);
  const activateWill = useAppStore((state) => state.activateWill);
  const triggerWill = useAppStore((state) => state.triggerWill);
  const addExecutionStep = useAppStore((state) => state.addExecutionStep);
  const updateExecutionStep = useAppStore((state) => state.updateExecutionStep);
  const removeExecutionStep = useAppStore((state) => state.removeExecutionStep);
  const executeStepWithBranches = useAppStore((state) => state.executeStepWithBranches);
  const submitWitnessApproval = useAppStore((state) => state.submitWitnessApproval);
  const getApprovalGroupProgress = useAppStore((state) => state.getApprovalGroupProgress);
  const getWillExecutionState = useAppStore((state) => state.getWillExecutionState);
  const addNotification = useAppStore((state) => state.addNotification);
  const autoDecryptExpiredCapsules = useAppStore((state) => state.autoDecryptExpiredCapsules);
  const getCapsuleAssets = useAppStore((state) => state.getCapsuleAssets);
  const getLockedCapsuleAssets = useAppStore((state) => state.getLockedCapsuleAssets);
  const unlockTimeCapsule = useAppStore((state) => state.unlockTimeCapsule);

  const [editingStep, setEditingStep] = useState<ExecutionStep | null>(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [stepForm, setStepForm] = useState({
    order: 1,
    title: '',
    description: '',
    delayDays: 0,
    actionType: 'notify' as ExecutionStep['actionType'],
    targetAssetIds: [] as string[],
    targetHeirIds: [] as string[],
    branches: [] as Branch[],
  });
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);
  const [editingBranchIdx, setEditingBranchIdx] = useState<number | null>(null);
  const [branchForm, setBranchForm] = useState<{
    label: string;
    conditions: BranchCondition[];
    conditionLogic: 'and' | 'or';
    targetStepIds: string[];
    color: string;
  }>({
    label: '',
    conditions: [],
    conditionLogic: 'and',
    targetStepIds: [],
    color: BRANCH_COLORS[0],
  });
  const [editingConditionIdx, setEditingConditionIdx] = useState<number | null>(null);
  const [conditionForm, setConditionForm] = useState<{
    field: ConditionField;
    operator: ConditionOperator;
    value: string;
    label: string;
    resourceIds: string[];
  }>({
    field: 'asset_value',
    operator: 'gt',
    value: '',
    label: '',
    resourceIds: [],
  });

  const handleOpenStepModal = (step?: ExecutionStep) => {
    if (step) {
      setEditingStep(step);
      setStepForm({
        order: step.order,
        title: step.title,
        description: step.description,
        delayDays: step.delayDays,
        actionType: step.actionType,
        targetAssetIds: step.targetAssetIds || [],
        targetHeirIds: step.targetHeirIds || [],
        branches: step.branches || [],
      });
    } else {
      setEditingStep(null);
      setStepForm({
        order: (will?.executionSteps.length || 0) + 1,
        title: '',
        description: '',
        delayDays: 0,
        actionType: 'notify',
        targetAssetIds: [],
        targetHeirIds: [],
        branches: [],
      });
    }
    setExpandedBranchId(null);
    setEditingBranchIdx(null);
    setEditingConditionIdx(null);
    setShowStepModal(true);
  };

  const handleCloseStepModal = () => {
    setShowStepModal(false);
    setEditingStep(null);
  };

  const handleStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStep) {
      updateExecutionStep(editingStep.id, stepForm);
    } else {
      addExecutionStep(stepForm);
    }
    handleCloseStepModal();
  };

  const handleTriggerTypeChange = (type: TriggerType) => {
    updateWill({
      triggerCondition: {
        ...will?.triggerCondition,
        type,
      },
    });
  };

  const handleInactivityDaysChange = (days: number) => {
    updateWill({
      triggerCondition: {
        ...will?.triggerCondition,
        inactivityDays: days,
      },
    });
  };

  const handleToggleWitnessConfirmation = (required: boolean) => {
    updateWill({
      triggerCondition: {
        ...will?.triggerCondition,
        requiresWitnessConfirmation: required,
      },
    });
  };

  const handleToggleLawyerApproval = (required: boolean) => {
    updateWill({
      triggerCondition: {
        ...will?.triggerCondition,
        lawyerApprovalRequired: required,
      },
    });
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

  const daysInactive = will ? daysSince(will.lastActiveAt) : 0;
  const verifiedWitnesses = witnesses.filter((w) => w.verificationStatus === 'verified').length;
  const lawyers = witnesses.filter((w) => w.isLawyer);
  const verifiedLawyers = lawyers.filter((w) => w.verificationStatus === 'verified').length;

  const actionTypeLabels: Record<ExecutionStep['actionType'], string> = {
    notify: '发送通知',
    transfer: '移交资产',
    reveal_credentials: '披露凭证',
    delete_data: '删除数据',
  };

  const actionTypeColors: Record<ExecutionStep['actionType'], string> = {
    notify: 'bg-blue-100 text-blue-700',
    transfer: 'bg-emerald-100 text-emerald-700',
    reveal_credentials: 'bg-amber-100 text-amber-700',
    delete_data: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数字遗嘱</h1>
          <p className="text-gray-500 mt-1">设置触发条件和资产执行流程</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/simulation"
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors border border-purple-200"
          >
            <Sparkles className="w-5 h-5" />
            沙箱模拟
          </Link>
          {will?.status === 'draft' && (
            <button
              onClick={activateWill}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Shield className="w-5 h-5" />
              生效遗嘱
            </button>
          )}
          {will?.status === 'active' && (
            <button
              onClick={() => {
                if (confirm('确定要手动触发遗嘱执行吗？此操作不可撤销。')) {
                  triggerWill();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              手动触发
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{will?.title || '我的数字遗嘱'}</h2>
              <p className="text-sm text-gray-500 mt-1">{will?.description}</p>
            </div>
          </div>
          <span
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium',
              WILL_STATUS_COLORS[will?.status || 'draft']
            )}
          >
            {WILL_STATUS_LABELS[will?.status || 'draft']}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">创建时间</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {will ? formatDate(will.createdAt) : '-'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">最后活跃</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {daysInactive} 天前
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">执行步骤</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {will?.executionSteps.length || 0} 步
            </p>
          </div>
        </div>
      </div>

      {(will?.status === 'triggered' || will?.status === 'executing') && approvalGroups.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-500" />
              加权审批进度
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">总体进度</span>
              <span className="text-lg font-bold text-cyan-600">
                {getWillExecutionState().overallProgress}%
              </span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                getWillExecutionState().allGroupsApproved ? 'bg-green-500' : 'bg-cyan-500'
              )}
              style={{ width: `${getWillExecutionState().overallProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvalGroups.map((group) => {
              const progress = getApprovalGroupProgress(group.id);
              const groupWitnesses = witnesses.filter((w) => group.witnessIds.includes(w.id));
              return (
                <div key={group.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{group.name}</h4>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            APPROVAL_GROUP_STATUS_COLORS[group.status]
                          )}
                        >
                          {APPROVAL_GROUP_STATUS_LABELS[group.status]}
                        </span>
                      </div>
                      {group.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{group.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {progress.approved}/{progress.required}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        group.status === 'approved' ? 'bg-green-500' :
                        group.status === 'rejected' ? 'bg-red-500' : 'bg-cyan-500'
                      )}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    {groupWitnesses.map((witness) => {
                      const approval = group.approvals.find((a) => a.witnessId === witness.id);
                      const decision = approval?.decision || 'pending';
                      return (
                        <div key={witness.id} className="flex items-center justify-between bg-white rounded-lg p-2.5">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center',
                              witness.isLawyer ? 'bg-purple-100' : 'bg-blue-100'
                            )}>
                              {witness.isLawyer ? (
                                <Scale className="w-3.5 h-3.5 text-purple-600" />
                              ) : (
                                <Users className="w-3.5 h-3.5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-800">{witness.name}</span>
                              {witness.isLawyer && (
                                <span className="ml-1 text-xs text-purple-600">律师</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1',
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
                            </span>
                            {witness.verificationStatus === 'verified' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleSubmitApproval(group.id, witness.id, 'approved')}
                                  disabled={decision === 'approved'}
                                  className={cn(
                                    'p-1.5 rounded-md transition-colors',
                                    decision === 'approved'
                                      ? 'bg-green-100 text-green-600 cursor-default'
                                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                  )}
                                  title="同意"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSubmitApproval(group.id, witness.id, 'rejected')}
                                  disabled={decision === 'rejected'}
                                  className={cn(
                                    'p-1.5 rounded-md transition-colors',
                                    decision === 'rejected'
                                      ? 'bg-red-100 text-red-600 cursor-default'
                                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                  )}
                                  title="拒绝"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {getWillExecutionState().allGroupsApproved && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">所有审批组已通过</p>
                <p className="text-sm text-green-600">遗嘱执行流程已获得全部授权，可以开始资产移交</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            触发条件
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">触发方式</label>
              <div className="grid grid-cols-2 gap-2">
                {(['inactivity_days', 'date_based', 'manual', 'death_certificate'] as TriggerType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTriggerTypeChange(type)}
                    className={cn(
                      'p-3 rounded-xl border-2 text-left transition-all',
                      will?.triggerCondition.type === type
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p className="font-medium text-gray-900 text-sm">
                      {TRIGGER_TYPE_LABELS[type]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {will?.triggerCondition.type === 'inactivity_days' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  连续未登录天数
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="30"
                    max="365"
                    step="30"
                    value={will.triggerCondition.inactivityDays || DEFAULT_INACTIVITY_DAYS}
                    onChange={(e) => handleInactivityDaysChange(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold text-emerald-600 w-20 text-right">
                    {will.triggerCondition.inactivityDays || DEFAULT_INACTIVITY_DAYS} 天
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  当您连续 {will.triggerCondition.inactivityDays || DEFAULT_INACTIVITY_DAYS} 天未登录系统时，遗嘱将自动触发。
                </p>
              </div>
            )}

            {will?.triggerCondition.type === 'date_based' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  指定触发日期
                </label>
                <input
                  type="date"
                  value={will.triggerCondition.triggerDate?.split('T')[0] || ''}
                  onChange={(e) =>
                    updateWill({
                      triggerCondition: {
                        ...will.triggerCondition,
                        triggerDate: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-3">额外授权要求</p>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">见证人确认</p>
                    <p className="text-xs text-gray-500">需要 {verifiedWitnesses}/{witnesses.length} 位见证人确认</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={will?.triggerCondition.requiresWitnessConfirmation || false}
                  onChange={(e) => handleToggleWitnessConfirmation(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors mt-3">
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">律师审批</p>
                    <p className="text-xs text-gray-500">需要 {verifiedLawyers}/{lawyers.length} 位律师批准</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={will?.triggerCondition.lawyerApprovalRequired || false}
                  onChange={(e) => handleToggleLawyerApproval(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              执行流程
            </h3>
            <button
              onClick={() => handleOpenStepModal()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加步骤
            </button>
          </div>

          {will?.executionSteps.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无执行步骤</p>
              <button
                onClick={() => handleOpenStepModal()}
                className="mt-3 text-sm text-emerald-600 hover:text-emerald-700"
              >
                添加第一步
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {will?.executionSteps.map((step, index) => {
                const hasBranches = step.branches && step.branches.length > 0;
                const isBranchExpanded = expandedBranchId === step.id;
                return (
                  <div
                    key={step.id}
                    className="relative pl-8 pb-3 last:pb-0"
                  >
                    {index < (will?.executionSteps.length || 0) - 1 && (
                      <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="absolute left-0 top-1 w-7 h-7 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center z-10">
                      <span className="text-xs font-bold text-emerald-600">{step.order}</span>
                    </div>
                    <div className={cn(
                      'rounded-xl p-4',
                      hasBranches ? 'bg-gray-50 border border-gray-200' : 'bg-gray-50'
                    )}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{step.title}</h4>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                actionTypeColors[step.actionType]
                              )}
                            >
                              {actionTypeLabels[step.actionType]}
                            </span>
                            {hasBranches && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                条件分支 ({step.branches!.length})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            触发后 {step.delayDays} 天执行
                          </p>

                          {hasBranches && (
                            <div className="mt-3 space-y-2">
                              <button
                                onClick={() => setExpandedBranchId(isBranchExpanded ? null : step.id)}
                                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
                              >
                                {isBranchExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {isBranchExpanded ? '收起条件分支' : '查看条件分支'}
                              </button>

                              {isBranchExpanded && (
                                <div className="space-y-2">
                                  {step.branches!.map((branch, bIdx) => {
                                    const isTriggered = step.triggeredBranchId === branch.id;
                                    const colorIdx = bIdx % BRANCH_COLORS.length;
                                    return (
                                      <div
                                        key={branch.id}
                                        className={cn(
                                          'rounded-lg border-l-4 p-3',
                                          BRANCH_COLORS_BORDER[colorIdx],
                                          isTriggered ? 'ring-2 ring-emerald-300 bg-emerald-50/50' : 'bg-white'
                                        )}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <div className={cn('w-2.5 h-2.5 rounded-full', BRANCH_COLORS[colorIdx])} />
                                            <span className="text-sm font-medium text-gray-900">{branch.label}</span>
                                            <span className="text-xs text-gray-400">
                                              {branch.conditionLogic === 'and' ? '全部满足' : '任一满足'}
                                            </span>
                                          </div>
                                          {isTriggered && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                              <Zap className="w-3 h-3" />
                                              已触发
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                          {branch.conditions.map((cond) => (
                                            <span
                                              key={cond.id}
                                              className={cn(
                                                'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
                                                CONDITION_FIELD_COLORS[cond.field]
                                              )}
                                            >
                                              <Target className="w-3 h-3" />
                                              {cond.label}
                                            </span>
                                          ))}
                                          {branch.conditions.length === 0 && (
                                            <span className="text-xs text-gray-400 italic">无条件（始终触发）</span>
                                          )}
                                        </div>
                                        {branch.targetStepIds.length > 0 && (
                                          <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <ArrowRight className="w-3 h-3" />
                                            <span>跳转步骤：{branch.targetStepIds.map(sid => {
                                              const targetStep = will?.executionSteps.find(s => s.id === sid);
                                              return targetStep ? `第${targetStep.order}步` : sid;
                                            }).join('、')}</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {!step.triggeredBranchId && (will?.status === 'triggered' || will?.status === 'executing') && (
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                      <GitBranch className="w-4 h-4 text-gray-400" />
                                      <span className="text-xs text-gray-500">默认路径（无分支条件匹配时）</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {(will?.status === 'triggered' || will?.status === 'executing') && hasBranches && !step.triggeredBranchId && (
                            <button
                              onClick={() => {
                                executeStepWithBranches(step.id);
                                addNotification({
                                  type: 'info',
                                  title: '分支评估已执行',
                                  message: `步骤「${step.title}」的条件分支已评估`,
                                });
                              }}
                              className="p-1.5 text-violet-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
                              title="执行条件分支评估"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenStepModal(step)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeExecutionStep(step.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5 text-violet-500" />
          时间胶囊资产
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          带有时间胶囊的资产在解锁日期前对继承人和见证人完全隐藏，到期后在遗嘱执行流程中自动解密并进入分配环节
        </p>
        {getCapsuleAssets().length === 0 ? (
          <div className="text-center py-8">
            <Hourglass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无时间胶囊资产</p>
            <p className="text-xs text-gray-400 mt-1">在资产管理页为资产设置时间胶囊</p>
          </div>
        ) : (
          <div className="space-y-3">
            {getCapsuleAssets().map((asset) => {
              const capsuleStatus = getTimeCapsuleStatus(asset.timeCapsule!);
              const daysLeft = getDaysUntilUnlock(asset.timeCapsule!.unlockDate);
              const isWillTriggered = will?.status === 'triggered' || will?.status === 'executing';
              return (
                <div key={asset.id} className={cn(
                  'rounded-xl p-4 border-l-4',
                  capsuleStatus === 'locked' ? 'bg-violet-50 border-l-violet-500' :
                  capsuleStatus === 'expired' ? 'bg-amber-50 border-l-amber-500' :
                  'bg-emerald-50 border-l-emerald-500'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {capsuleStatus === 'locked' ? (
                        <Lock className="w-4 h-4 text-violet-500" />
                      ) : capsuleStatus === 'expired' ? (
                        <Hourglass className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Unlock className="w-4 h-4 text-emerald-500" />
                      )}
                      <span className="font-medium text-gray-900 text-sm">{asset.name}</span>
                      <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded">
                        {ASSET_TYPE_LABELS[asset.type]}
                      </span>
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-[10px] font-medium',
                        TIME_CAPSULE_STATUS_COLORS[capsuleStatus]
                      )}>
                        {TIME_CAPSULE_STATUS_LABELS[capsuleStatus]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {asset.value !== undefined && asset.value > 0 && (
                        <span className="text-sm font-medium text-violet-600">
                          ¥{asset.value.toLocaleString()}
                        </span>
                      )}
                      {isWillTriggered && capsuleStatus === 'expired' && (
                        <button
                          onClick={() => {
                            unlockTimeCapsule(asset.id);
                            addNotification({
                              type: 'success',
                              title: '时间胶囊已解密',
                              message: `资产「${asset.name}」已自动解密，进入分配环节`,
                            });
                          }}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          <Unlock className="w-3 h-3" />
                          解密并分配
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      解锁日期：{formatDate(asset.timeCapsule!.unlockDate)}
                    </span>
                    {capsuleStatus === 'locked' && (
                      <span className="flex items-center gap-1 text-violet-600">
                        <Hourglass className="w-3 h-3" />
                        倒计时：{daysLeft} 天
                      </span>
                    )}
                    {asset.timeCapsule!.note && (
                      <span className="text-gray-400">备注：{asset.timeCapsule!.note}</span>
                    )}
                  </div>
                  {capsuleStatus === 'locked' && (
                    <p className="text-[10px] text-violet-500 mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      此资产对继承人和见证人完全隐藏，到期后自动解密显示
                    </p>
                  )}
                  {capsuleStatus === 'expired' && !isWillTriggered && (
                    <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1">
                      <Hourglass className="w-3 h-3" />
                      已到期，将在遗嘱执行流程中自动解密
                    </p>
                  )}
                  {capsuleStatus === 'expired' && isWillTriggered && (
                    <p className="text-[10px] text-emerald-500 mt-2 flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      已到期且遗嘱已触发，可手动解密进入分配环节
                    </p>
                  )}
                </div>
              );
            })}
            {getLockedCapsuleAssets().length > 0 && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-500" />
                <p className="text-xs text-violet-700">
                  <strong>{getLockedCapsuleAssets().length}</strong> 项资产处于锁定状态，
                  在解锁日期前对继承人和见证人完全隐藏，无法参与资产分配
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-emerald-500" />
          资产分配预览
        </h3>
        <p className="text-sm text-gray-500 mb-4">以下为各项资产的继承顺位链，当第一顺位无法继承时将自动流转</p>
        {assets.length === 0 ? (
          <div className="text-center py-8">
            <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无数字资产</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => (
              <div key={asset.id} className={cn(
                'rounded-xl p-4',
                asset.timeCapsule?.enabled ? 'bg-violet-50 border border-violet-100' : 'bg-gray-50'
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 text-sm">{asset.name}</span>
                    <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded">
                      {ASSET_TYPE_LABELS[asset.type]}
                    </span>
                    {asset.timeCapsule?.enabled && (() => {
                      const capsuleStatus = getTimeCapsuleStatus(asset.timeCapsule);
                      return (
                        <span className={cn(
                          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
                          TIME_CAPSULE_STATUS_COLORS[capsuleStatus]
                        )}>
                          {capsuleStatus === 'locked' ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                          {TIME_CAPSULE_STATUS_LABELS[capsuleStatus]}
                        </span>
                      );
                    })()}
                  </div>
                  {asset.value !== undefined && asset.value > 0 && (
                    <span className="text-sm font-medium text-emerald-600">
                      ¥{asset.value.toLocaleString()}
                    </span>
                  )}
                </div>
                {asset.heirChain.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    {asset.heirChain.map((chainHeirId, idx) => {
                      const chainHeir = heirs.find((h) => h.id === chainHeirId);
                      if (!chainHeir) return null;
                      const isFirst = idx === 0;
                      return (
                        <span key={chainHeirId} className="inline-flex items-center gap-1">
                          {idx > 0 && <ArrowRight className="w-3 h-3 text-gray-300" />}
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                              isFirst
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            <User className="w-3 h-3" />
                            {chainHeir.name}
                            <span className={cn(
                              'ml-0.5 px-1 py-0.5 rounded text-[10px]',
                              isFirst
                                ? 'bg-emerald-200 text-emerald-800'
                                : 'bg-gray-200 text-gray-500'
                            )}>
                              第{idx + 1}顺位
                            </span>
                          </span>
                          {!isFirst && (
                            <span className="text-[10px] text-gray-400">兜底</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                    未分配继承人
                  </span>
                )}
                {asset.timeCapsule?.enabled && (() => {
                  const capsuleStatus = getTimeCapsuleStatus(asset.timeCapsule);
                  const daysLeft = getDaysUntilUnlock(asset.timeCapsule.unlockDate);
                  if (capsuleStatus === 'locked') {
                    return (
                      <p className="text-[10px] text-violet-500 mt-1 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        胶囊锁定中，{daysLeft} 天后解锁，期间对继承人和见证人隐藏
                      </p>
                    );
                  }
                  if (capsuleStatus === 'expired') {
                    return (
                      <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                        <Hourglass className="w-3 h-3" />
                        胶囊已到期，将在遗嘱执行时自动解密
                      </p>
                    );
                  }
                  return (
                    <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
                      <Unlock className="w-3 h-3" />
                      胶囊已解锁，可正常参与分配
                    </p>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">安全托管机制</h3>
            <p className="text-emerald-100 mt-1">
              您的敏感数据采用端到端加密存储，只有在触发条件满足并经过多重验证后才会逐步解密移交
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">多重验证</span>
          </div>
        </div>
      </div>

      {showStepModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                {editingStep ? '编辑步骤' : '添加执行步骤'}
              </h2>
              <button
                onClick={handleCloseStepModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStepSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">步骤顺序</label>
                  <input
                    type="number"
                    min="1"
                    value={stepForm.order}
                    onChange={(e) => setStepForm({ ...stepForm, order: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">延迟天数</label>
                  <input
                    type="number"
                    min="0"
                    value={stepForm.delayDays}
                    onChange={(e) => setStepForm({ ...stepForm, delayDays: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">步骤标题 *</label>
                <input
                  type="text"
                  required
                  value={stepForm.title}
                  onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="例如：通知继承人"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">操作类型</label>
                <select
                  value={stepForm.actionType}
                  onChange={(e) => setStepForm({ ...stepForm, actionType: e.target.value as ExecutionStep['actionType'] })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {(Object.keys(actionTypeLabels) as ExecutionStep['actionType'][]).map((type) => (
                    <option key={type} value={type}>
                      {actionTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={stepForm.description}
                  onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="详细描述此步骤的操作..."
                />
              </div>

              {(stepForm.actionType === 'transfer' || stepForm.actionType === 'reveal_credentials' || stepForm.actionType === 'delete_data') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">涉及资产</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {assets.map((asset) => (
                      <label
                        key={asset.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={stepForm.targetAssetIds.includes(asset.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStepForm({
                                ...stepForm,
                                targetAssetIds: [...stepForm.targetAssetIds, asset.id],
                              });
                            } else {
                              setStepForm({
                                ...stepForm,
                                targetAssetIds: stepForm.targetAssetIds.filter((id) => id !== asset.id),
                              });
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{asset.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(stepForm.actionType === 'notify' || stepForm.actionType === 'transfer' || stepForm.actionType === 'reveal_credentials') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">目标继承人</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {heirs.map((heir) => (
                      <label
                        key={heir.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={stepForm.targetHeirIds.includes(heir.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setStepForm({
                                ...stepForm,
                                targetHeirIds: [...stepForm.targetHeirIds, heir.id],
                              });
                            } else {
                              setStepForm({
                                ...stepForm,
                                targetHeirIds: stepForm.targetHeirIds.filter((id) => id !== heir.id),
                              });
                            }
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{heir.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-violet-500" />
                    条件分支
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const colorIdx = stepForm.branches.length % BRANCH_COLORS.length;
                      setBranchForm({
                        label: '',
                        conditions: [],
                        conditionLogic: 'and',
                        targetStepIds: [],
                        color: BRANCH_COLORS[colorIdx],
                      });
                      setEditingBranchIdx(stepForm.branches.length);
                      setEditingConditionIdx(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    添加分支
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">为步骤设置条件表达式，满足不同条件走不同分支路径</p>

                {stepForm.branches.length === 0 && editingBranchIdx === null && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                    <GitBranch className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">暂无条件分支</p>
                    <p className="text-xs text-gray-400 mt-1">点击上方按钮添加分支条件</p>
                  </div>
                )}

                {stepForm.branches.map((branch, bIdx) => {
                  const colorIdx = bIdx % BRANCH_COLORS.length;
                  const isEditingThis = editingBranchIdx === bIdx;
                  return (
                    <div
                      key={branch.id}
                      className={cn(
                        'mb-3 rounded-xl border-l-4 overflow-hidden',
                        BRANCH_COLORS_BORDER[colorIdx],
                        isEditingThis ? 'border border-gray-300 ring-2 ring-violet-100' : 'border border-gray-200'
                      )}
                    >
                      <div className="p-3 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn('w-3 h-3 rounded-full', BRANCH_COLORS[colorIdx])} />
                            <span className="text-sm font-medium text-gray-900">{branch.label || `分支 ${bIdx + 1}`}</span>
                            <span className="text-xs text-gray-400">
                              {branch.conditionLogic === 'and' ? '全部满足' : '任一满足'} · {branch.conditions.length} 个条件
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setBranchForm({
                                  label: branch.label,
                                  conditions: [...branch.conditions],
                                  conditionLogic: branch.conditionLogic,
                                  targetStepIds: [...branch.targetStepIds],
                                  color: branch.color,
                                });
                                setEditingBranchIdx(bIdx);
                                setEditingConditionIdx(null);
                              }}
                              className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newBranches = stepForm.branches.filter((_, i) => i !== bIdx);
                                setStepForm({ ...stepForm, branches: newBranches });
                                if (editingBranchIdx === bIdx) setEditingBranchIdx(null);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {branch.conditions.map((cond) => (
                            <span
                              key={cond.id}
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
                                CONDITION_FIELD_COLORS[cond.field]
                              )}
                            >
                              {cond.label}
                            </span>
                          ))}
                          {branch.conditions.length === 0 && (
                            <span className="text-xs text-gray-400 italic">无条件</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {editingBranchIdx !== null && editingBranchIdx >= stepForm.branches.length && (
                  <div className="border-2 border-violet-200 rounded-xl p-4 bg-violet-50/30 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">分支名称</label>
                      <input
                        type="text"
                        value={branchForm.label}
                        onChange={(e) => setBranchForm({ ...branchForm, label: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                        placeholder="例如：高价值资产路径"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="block text-xs font-medium text-gray-700">条件逻辑</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBranchForm({ ...branchForm, conditionLogic: 'and' })}
                          className={cn(
                            'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                            branchForm.conditionLogic === 'and'
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          全部满足 (AND)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBranchForm({ ...branchForm, conditionLogic: 'or' })}
                          className={cn(
                            'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                            branchForm.conditionLogic === 'or'
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          任一满足 (OR)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-700">条件列表</label>
                        <button
                          type="button"
                          onClick={() => {
                            setConditionForm({
                              field: 'asset_value',
                              operator: 'gt',
                              value: '',
                              label: '',
                              resourceIds: [],
                            });
                            setEditingConditionIdx(branchForm.conditions.length);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          添加条件
                        </button>
                      </div>

                      {branchForm.conditions.length === 0 && editingConditionIdx === null && (
                        <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                          <p className="text-xs text-gray-400">暂无条件，点击添加</p>
                        </div>
                      )}

                      {branchForm.conditions.map((cond, cIdx) => (
                        <div
                          key={cond.id}
                          className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 mb-2"
                        >
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium border',
                            CONDITION_FIELD_COLORS[cond.field]
                          )}>
                            {CONDITION_FIELD_LABELS[cond.field]}
                          </span>
                          <span className="text-xs text-gray-500">{CONDITION_OPERATOR_LABELS[cond.operator]}</span>
                          {cond.value !== undefined && cond.value !== '' && (
                            <span className="text-xs font-medium text-gray-700">{String(cond.value)}</span>
                          )}
                          <span className="text-xs text-gray-400 flex-1 truncate">{cond.label}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newConditions = branchForm.conditions.filter((_, i) => i !== cIdx);
                              setBranchForm({ ...branchForm, conditions: newConditions });
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {editingConditionIdx !== null && editingConditionIdx >= branchForm.conditions.length && (
                        <div className="p-3 bg-white rounded-lg border border-violet-200 space-y-3 mt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">条件字段</label>
                              <select
                                value={conditionForm.field}
                                onChange={(e) => {
                                  const field = e.target.value as ConditionField;
                                  const newForm: typeof conditionForm = { ...conditionForm, field };
                                  if (field === 'heir_verified') {
                                    newForm.operator = 'verified';
                                  } else if (field === 'asset_value') {
                                    newForm.operator = 'gt';
                                  } else if (field === 'asset_status') {
                                    newForm.operator = 'status_is';
                                  } else {
                                    newForm.operator = 'gte';
                                  }
                                  setConditionForm(newForm);
                                }}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                              >
                                {(Object.keys(CONDITION_FIELD_LABELS) as ConditionField[]).map((field) => (
                                  <option key={field} value={field}>
                                    {CONDITION_FIELD_LABELS[field]}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">运算符</label>
                              <select
                                value={conditionForm.operator}
                                onChange={(e) => setConditionForm({ ...conditionForm, operator: e.target.value as ConditionOperator })}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                              >
                                {(Object.keys(CONDITION_OPERATOR_LABELS) as ConditionOperator[])
                                  .filter((op) => {
                                    if (conditionForm.field === 'heir_verified') return op === 'verified' || op === 'not_verified';
                                    if (conditionForm.field === 'asset_status') return op === 'status_is' || op === 'eq' || op === 'neq';
                                    return !['verified', 'not_verified', 'status_is', 'contains'].includes(op) || op === 'contains' && conditionForm.field === 'custom';
                                  })
                                  .map((op) => (
                                    <option key={op} value={op}>
                                      {CONDITION_OPERATOR_LABELS[op]}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>

                          {!['verified', 'not_verified'].includes(conditionForm.operator) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">阈值</label>
                              <input
                                type={conditionForm.field === 'asset_value' || conditionForm.field === 'witness_count' || conditionForm.field === 'approval_progress' ? 'number' : 'text'}
                                value={conditionForm.value}
                                onChange={(e) => setConditionForm({ ...conditionForm, value: e.target.value })}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                                placeholder={
                                  conditionForm.field === 'asset_value' ? '资产价值阈值（元）' :
                                  conditionForm.field === 'witness_count' ? '见证人数量阈值' :
                                  conditionForm.field === 'approval_progress' ? '审批进度百分比' :
                                  conditionForm.field === 'asset_status' ? 'active / inactive / transferred' :
                                  '输入值'
                                }
                              />
                            </div>
                          )}

                          {(conditionForm.field === 'asset_value' || conditionForm.field === 'asset_status') && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">关联资产</label>
                              <div className="space-y-1 max-h-24 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                {assets.map((asset) => (
                                  <label
                                    key={asset.id}
                                    className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={conditionForm.resourceIds.includes(asset.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setConditionForm({ ...conditionForm, resourceIds: [...conditionForm.resourceIds, asset.id] });
                                        } else {
                                          setConditionForm({ ...conditionForm, resourceIds: conditionForm.resourceIds.filter(id => id !== asset.id) });
                                        }
                                      }}
                                      className="w-3.5 h-3.5 text-violet-600 rounded focus:ring-violet-500"
                                    />
                                    <span className="text-xs text-gray-700">{asset.name}</span>
                                    {asset.value !== undefined && asset.value > 0 && (
                                      <span className="text-xs text-gray-400">¥{asset.value.toLocaleString()}</span>
                                    )}
                                  </label>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">不选则关联全部资产</p>
                            </div>
                          )}

                          {conditionForm.field === 'heir_verified' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">关联继承人</label>
                              <div className="space-y-1 max-h-24 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                {heirs.map((heir) => (
                                  <label
                                    key={heir.id}
                                    className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={conditionForm.resourceIds.includes(heir.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setConditionForm({ ...conditionForm, resourceIds: [...conditionForm.resourceIds, heir.id] });
                                        } else {
                                          setConditionForm({ ...conditionForm, resourceIds: conditionForm.resourceIds.filter(id => id !== heir.id) });
                                        }
                                      }}
                                      className="w-3.5 h-3.5 text-violet-600 rounded focus:ring-violet-500"
                                    />
                                    <span className="text-xs text-gray-700">{heir.name}</span>
                                    <span className={cn(
                                      'text-xs px-1 py-0.5 rounded',
                                      heir.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    )}>
                                      {heir.isVerified ? '已验证' : '未验证'}
                                    </span>
                                  </label>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">不选则关联全部继承人</p>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">条件描述 *</label>
                            <input
                              type="text"
                              value={conditionForm.label}
                              onChange={(e) => setConditionForm({ ...conditionForm, label: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                              placeholder="例如：当资产价值超过10万元时"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!conditionForm.label.trim()) return;
                                const newCondition: BranchCondition = {
                                  id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                                  field: conditionForm.field,
                                  operator: conditionForm.operator,
                                  value: conditionForm.value ? (conditionForm.field === 'asset_value' || conditionForm.field === 'witness_count' || conditionForm.field === 'approval_progress' ? Number(conditionForm.value) : conditionForm.value) : undefined,
                                  label: conditionForm.label,
                                  resourceIds: conditionForm.resourceIds.length > 0 ? conditionForm.resourceIds : undefined,
                                };
                                setBranchForm({
                                  ...branchForm,
                                  conditions: [...branchForm.conditions, newCondition],
                                });
                                setEditingConditionIdx(null);
                                setConditionForm({
                                  field: 'asset_value',
                                  operator: 'gt',
                                  value: '',
                                  label: '',
                                  resourceIds: [],
                                });
                              }}
                              className="px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-xs font-medium"
                            >
                              确认条件
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingConditionIdx(null)}
                              className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {will && will.executionSteps.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">跳转目标步骤</label>
                        <div className="space-y-1 max-h-24 overflow-y-auto border border-gray-200 rounded-lg p-2">
                          {will.executionSteps
                            .filter((s) => s.id !== editingStep?.id)
                            .map((s) => (
                              <label
                                key={s.id}
                                className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={branchForm.targetStepIds.includes(s.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setBranchForm({ ...branchForm, targetStepIds: [...branchForm.targetStepIds, s.id] });
                                    } else {
                                      setBranchForm({ ...branchForm, targetStepIds: branchForm.targetStepIds.filter(id => id !== s.id) });
                                    }
                                  }}
                                  className="w-3.5 h-3.5 text-violet-600 rounded focus:ring-violet-500"
                                />
                                <span className="text-xs text-gray-700">第{s.order}步：{s.title}</span>
                              </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">条件满足时跳转到指定步骤，不选则继续按顺序执行</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!branchForm.label.trim()) return;
                          const colorIdx = editingBranchIdx % BRANCH_COLORS.length;
                          const newBranch: Branch = {
                            id: `branch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            label: branchForm.label,
                            conditions: branchForm.conditions,
                            conditionLogic: branchForm.conditionLogic,
                            targetStepIds: branchForm.targetStepIds,
                            color: BRANCH_COLORS[colorIdx],
                          };
                          const newBranches = [...stepForm.branches];
                          if (editingBranchIdx < newBranches.length) {
                            newBranches[editingBranchIdx] = newBranch;
                          } else {
                            newBranches.push(newBranch);
                          }
                          setStepForm({ ...stepForm, branches: newBranches });
                          setEditingBranchIdx(null);
                          setEditingConditionIdx(null);
                        }}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                      >
                        确认分支
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBranchIdx(null);
                          setEditingConditionIdx(null);
                        }}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}

                {editingBranchIdx !== null && editingBranchIdx < stepForm.branches.length && (
                  <div className="border-2 border-violet-200 rounded-xl p-4 bg-violet-50/30 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">分支名称</label>
                      <input
                        type="text"
                        value={branchForm.label}
                        onChange={(e) => setBranchForm({ ...branchForm, label: e.target.value })}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                        placeholder="例如：高价值资产路径"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="block text-xs font-medium text-gray-700">条件逻辑</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBranchForm({ ...branchForm, conditionLogic: 'and' })}
                          className={cn(
                            'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                            branchForm.conditionLogic === 'and'
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          全部满足 (AND)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBranchForm({ ...branchForm, conditionLogic: 'or' })}
                          className={cn(
                            'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                            branchForm.conditionLogic === 'or'
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          )}
                        >
                          任一满足 (OR)
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-700">条件列表</label>
                        <button
                          type="button"
                          onClick={() => {
                            setConditionForm({
                              field: 'asset_value',
                              operator: 'gt',
                              value: '',
                              label: '',
                              resourceIds: [],
                            });
                            setEditingConditionIdx(branchForm.conditions.length);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          添加条件
                        </button>
                      </div>

                      {branchForm.conditions.map((cond, cIdx) => (
                        <div
                          key={cond.id}
                          className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 mb-2"
                        >
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium border',
                            CONDITION_FIELD_COLORS[cond.field]
                          )}>
                            {CONDITION_FIELD_LABELS[cond.field]}
                          </span>
                          <span className="text-xs text-gray-500">{CONDITION_OPERATOR_LABELS[cond.operator]}</span>
                          {cond.value !== undefined && cond.value !== '' && (
                            <span className="text-xs font-medium text-gray-700">{String(cond.value)}</span>
                          )}
                          <span className="text-xs text-gray-400 flex-1 truncate">{cond.label}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newConditions = branchForm.conditions.filter((_, i) => i !== cIdx);
                              setBranchForm({ ...branchForm, conditions: newConditions });
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {editingConditionIdx !== null && editingConditionIdx >= branchForm.conditions.length && (
                        <div className="p-3 bg-white rounded-lg border border-violet-200 space-y-3 mt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">条件字段</label>
                              <select
                                value={conditionForm.field}
                                onChange={(e) => {
                                  const field = e.target.value as ConditionField;
                                  const newForm: typeof conditionForm = { ...conditionForm, field };
                                  if (field === 'heir_verified') newForm.operator = 'verified';
                                  else if (field === 'asset_value') newForm.operator = 'gt';
                                  else if (field === 'asset_status') newForm.operator = 'status_is';
                                  else newForm.operator = 'gte';
                                  setConditionForm(newForm);
                                }}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                              >
                                {(Object.keys(CONDITION_FIELD_LABELS) as ConditionField[]).map((field) => (
                                  <option key={field} value={field}>{CONDITION_FIELD_LABELS[field]}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">运算符</label>
                              <select
                                value={conditionForm.operator}
                                onChange={(e) => setConditionForm({ ...conditionForm, operator: e.target.value as ConditionOperator })}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                              >
                                {(Object.keys(CONDITION_OPERATOR_LABELS) as ConditionOperator[])
                                  .filter((op) => {
                                    if (conditionForm.field === 'heir_verified') return op === 'verified' || op === 'not_verified';
                                    if (conditionForm.field === 'asset_status') return op === 'status_is' || op === 'eq' || op === 'neq';
                                    return !['verified', 'not_verified', 'status_is'].includes(op);
                                  })
                                  .map((op) => (
                                    <option key={op} value={op}>{CONDITION_OPERATOR_LABELS[op]}</option>
                                  ))}
                              </select>
                            </div>
                          </div>
                          {!['verified', 'not_verified'].includes(conditionForm.operator) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">阈值</label>
                              <input
                                type={conditionForm.field === 'asset_value' || conditionForm.field === 'witness_count' || conditionForm.field === 'approval_progress' ? 'number' : 'text'}
                                value={conditionForm.value}
                                onChange={(e) => setConditionForm({ ...conditionForm, value: e.target.value })}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                                placeholder={
                                  conditionForm.field === 'asset_value' ? '资产价值阈值（元）' :
                                  conditionForm.field === 'witness_count' ? '见证人数量阈值' :
                                  conditionForm.field === 'approval_progress' ? '审批进度百分比' :
                                  conditionForm.field === 'asset_status' ? 'active / inactive / transferred' :
                                  '输入值'
                                }
                              />
                            </div>
                          )}
                          {(conditionForm.field === 'asset_value' || conditionForm.field === 'asset_status') && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">关联资产</label>
                              <div className="space-y-1 max-h-24 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                {assets.map((asset) => (
                                  <label key={asset.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={conditionForm.resourceIds.includes(asset.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) setConditionForm({ ...conditionForm, resourceIds: [...conditionForm.resourceIds, asset.id] });
                                        else setConditionForm({ ...conditionForm, resourceIds: conditionForm.resourceIds.filter(id => id !== asset.id) });
                                      }}
                                      className="w-3.5 h-3.5 text-violet-600 rounded focus:ring-violet-500"
                                    />
                                    <span className="text-xs text-gray-700">{asset.name}</span>
                                    {asset.value !== undefined && asset.value > 0 && <span className="text-xs text-gray-400">¥{asset.value.toLocaleString()}</span>}
                                  </label>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">不选则关联全部资产</p>
                            </div>
                          )}
                          {conditionForm.field === 'heir_verified' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">关联继承人</label>
                              <div className="space-y-1 max-h-24 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                {heirs.map((heir) => (
                                  <label key={heir.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={conditionForm.resourceIds.includes(heir.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) setConditionForm({ ...conditionForm, resourceIds: [...conditionForm.resourceIds, heir.id] });
                                        else setConditionForm({ ...conditionForm, resourceIds: conditionForm.resourceIds.filter(id => id !== heir.id) });
                                      }}
                                      className="w-3.5 h-3.5 text-violet-600 rounded focus:ring-violet-500"
                                    />
                                    <span className="text-xs text-gray-700">{heir.name}</span>
                                    <span className={cn('text-xs px-1 py-0.5 rounded', heir.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                                      {heir.isVerified ? '已验证' : '未验证'}
                                    </span>
                                  </label>
                                ))}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">不选则关联全部继承人</p>
                            </div>
                          )}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">条件描述 *</label>
                            <input
                              type="text"
                              value={conditionForm.label}
                              onChange={(e) => setConditionForm({ ...conditionForm, label: e.target.value })}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                              placeholder="例如：当资产价值超过10万元时"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!conditionForm.label.trim()) return;
                                const newCondition: BranchCondition = {
                                  id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                                  field: conditionForm.field,
                                  operator: conditionForm.operator,
                                  value: conditionForm.value ? (conditionForm.field === 'asset_value' || conditionForm.field === 'witness_count' || conditionForm.field === 'approval_progress' ? Number(conditionForm.value) : conditionForm.value) : undefined,
                                  label: conditionForm.label,
                                  resourceIds: conditionForm.resourceIds.length > 0 ? conditionForm.resourceIds : undefined,
                                };
                                setBranchForm({ ...branchForm, conditions: [...branchForm.conditions, newCondition] });
                                setEditingConditionIdx(null);
                                setConditionForm({ field: 'asset_value', operator: 'gt', value: '', label: '', resourceIds: [] });
                              }}
                              className="px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-xs font-medium"
                            >
                              确认条件
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingConditionIdx(null)}
                              className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {will && will.executionSteps.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">跳转目标步骤</label>
                        <div className="space-y-1 max-h-24 overflow-y-auto border border-gray-200 rounded-lg p-2">
                          {will.executionSteps
                            .filter((s) => s.id !== editingStep?.id)
                            .map((s) => (
                              <label key={s.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={branchForm.targetStepIds.includes(s.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) setBranchForm({ ...branchForm, targetStepIds: [...branchForm.targetStepIds, s.id] });
                                    else setBranchForm({ ...branchForm, targetStepIds: branchForm.targetStepIds.filter(id => id !== s.id) });
                                  }}
                                  className="w-3.5 h-3.5 text-violet-600 rounded focus:ring-violet-500"
                                />
                                <span className="text-xs text-gray-700">第{s.order}步：{s.title}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!branchForm.label.trim()) return;
                          const colorIdx = editingBranchIdx % BRANCH_COLORS.length;
                          const updatedBranch: Branch = {
                            id: stepForm.branches[editingBranchIdx].id,
                            label: branchForm.label,
                            conditions: branchForm.conditions,
                            conditionLogic: branchForm.conditionLogic,
                            targetStepIds: branchForm.targetStepIds,
                            color: BRANCH_COLORS[colorIdx],
                          };
                          const newBranches = [...stepForm.branches];
                          newBranches[editingBranchIdx] = updatedBranch;
                          setStepForm({ ...stepForm, branches: newBranches });
                          setEditingBranchIdx(null);
                          setEditingConditionIdx(null);
                        }}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
                      >
                        保存分支
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBranchIdx(null);
                          setEditingConditionIdx(null);
                        }}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseStepModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {editingStep ? '保存' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
