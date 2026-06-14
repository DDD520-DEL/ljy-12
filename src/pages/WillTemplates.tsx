import { useState } from 'react';
import {
  FileText,
  Heart,
  PieChart,
  Zap,
  Clock,
  CheckCircle,
  X,
  ChevronRight,
  Star,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Settings,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  Scale,
  Bell,
  Smartphone,
  Cloud,
  GraduationCap,
  ShieldCheck,
  GitBranch,
  Wallet,
  User,
  HardDrive,
  Trash2,
  FileCheck,
  Send,
  Package,
  Key,
  Info,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import {
  WILL_TEMPLATES,
  WILL_TEMPLATE_DIFFICULTY_LABELS,
  WILL_TEMPLATE_DIFFICULTY_COLORS,
  TRIGGER_TYPE_LABELS,
  formatDate,
  generateId,
} from '@/constants';
import { cn } from '@/lib/utils';
import type { WillTemplate, ExecutionStep } from '@/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  PieChart,
  Zap,
  Bell,
  Smartphone,
  Cloud,
  Shield,
  GraduationCap,
  CheckCircle,
  ShieldCheck,
  GitBranch,
  Wallet,
  User,
  HardDrive,
  Trash2,
  FileCheck,
  Clock,
  Send,
  Package,
  Key,
};

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

const paramTypeLabels: Record<string, string> = {
  trigger: '触发条件',
  step: '执行步骤',
  witness: '见证人',
  lawyer: '律师',
};

const paramTypeColors: Record<string, string> = {
  trigger: 'bg-amber-100 text-amber-700',
  step: 'bg-blue-100 text-blue-700',
  witness: 'bg-purple-100 text-purple-700',
  lawyer: 'bg-indigo-100 text-indigo-700',
};

export default function WillTemplates() {
  const navigate = useNavigate();
  const will = useAppStore((state) => state.will);
  const heirs = useAppStore((state) => state.heirs);
  const assets = useAppStore((state) => state.assets);
  const witnesses = useAppStore((state) => state.witnesses);
  const updateWill = useAppStore((state) => state.updateWill);
  const addNotification = useAppStore((state) => state.addNotification);
  const addAuditLog = useAppStore((state) => state.addAuditLog);

  const [selectedTemplate, setSelectedTemplate] = useState<WillTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'flow' | 'steps' | 'params'>('overview');
  const [applying, setApplying] = useState(false);

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || FileText;
    return Icon;
  };

  const handleApplyTemplate = async (template: WillTemplate) => {
    setApplying(true);

    const newSteps = template.willConfig.executionSteps.map((step) => {
      const newBranches = step.branches?.map((branch) => ({
        ...branch,
        id: generateId(),
        conditions: branch.conditions.map((cond) => ({
          ...cond,
          id: generateId(),
        })),
      }));

      return {
        ...step,
        id: generateId(),
        branches: newBranches,
      };
    });

    updateWill({
      title: template.willConfig.title,
      description: template.willConfig.description,
      triggerCondition: template.willConfig.triggerCondition,
      executionSteps: newSteps,
      witnessIds: template.willConfig.witnessIds,
      lawyerIds: template.willConfig.lawyerIds,
      status: 'draft',
    });

    setTimeout(() => {
      setApplying(false);
      setShowConfirmModal(false);
      setSelectedTemplate(null);

      addAuditLog({
        action: 'will_updated',
        description: `应用遗嘱模板「${template.name}」`,
        resourceType: 'will',
        resourceId: will?.id,
      });

      addNotification({
        type: 'success',
        title: '模板应用成功',
        message: `「${template.name}」已应用到您的遗嘱配置，所有参数均可在遗嘱页面进行二次编辑。`,
      });

      navigate('/will');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">遗嘱模板库</h1>
          <p className="text-gray-500 mt-1">选择适合您的遗嘱模板，一键应用后可自由调整参数</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/will"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FileText className="w-5 h-5" />
            我的遗嘱
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WILL_TEMPLATES.map((template) => {
          const Icon = getIcon(template.icon);
          return (
            <div
              key={template.id}
              className={cn(
                'bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer',
                template.borderColor,
                selectedTemplate?.id === template.id ? 'ring-2 ring-offset-2 ring-emerald-500' : ''
              )}
              onClick={() => {
                setSelectedTemplate(template);
                setShowPreview(true);
                setActiveTab('overview');
              }}
            >
              <div className={cn('p-6', template.bgColor)}>
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', template.bgColor, 'border', template.borderColor)}>
                    <Icon className={cn('w-7 h-7', template.color)} />
                  </div>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    WILL_TEMPLATE_DIFFICULTY_COLORS[template.difficulty]
                  )}>
                    {WILL_TEMPLATE_DIFFICULTY_LABELS[template.difficulty]}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {template.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white/80 rounded text-xs text-gray-600 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {template.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {template.willConfig.executionSteps.length} 步
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100">
                <button
                  className={cn(
                    'w-full py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                    'bg-emerald-600 text-white hover:bg-emerald-700'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTemplate(template);
                    setShowConfirmModal(true);
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  一键应用
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className={cn('p-6 border-b', selectedTemplate.bgColor, selectedTemplate.borderColor)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn('w-16 h-16 rounded-xl flex items-center justify-center', selectedTemplate.bgColor, 'border-2', selectedTemplate.borderColor)}>
                    {(() => {
                      const Icon = getIcon(selectedTemplate.icon);
                      return <Icon className={cn('w-8 h-8', selectedTemplate.color)} />;
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        WILL_TEMPLATE_DIFFICULTY_COLORS[selectedTemplate.difficulty]
                      )}>
                        {WILL_TEMPLATE_DIFFICULTY_LABELS[selectedTemplate.difficulty]}
                      </span>
                    </div>
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setSelectedTemplate(null);
                  }}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex gap-2 mt-4">
                {(['overview', 'flow', 'steps', 'params'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      activeTab === tab
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:bg-white/30'
                    )}
                  >
                    {tab === 'overview' && '概览'}
                    {tab === 'flow' && '执行流程'}
                    {tab === 'steps' && '执行步骤'}
                    {tab === 'params' && '可调参数'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      模板介绍
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{selectedTemplate.longDescription}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ThumbsUp className="w-5 h-5 text-emerald-600" />
                        适用场景
                      </h4>
                      <ul className="space-y-2">
                        {selectedTemplate.suitableFor.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ThumbsDown className="w-5 h-5 text-rose-600" />
                        不适用场景
                      </h4>
                      <ul className="space-y-2">
                        {selectedTemplate.notSuitableFor.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" />
                      核心特性
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTemplate.keyFeatures.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-gray-700">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-500" />
                      触发条件
                    </h3>
                    <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <p className="text-xs text-purple-600 font-medium mb-1">触发方式</p>
                          <p className="font-semibold text-gray-900">
                            {TRIGGER_TYPE_LABELS[selectedTemplate.willConfig.triggerCondition.type]}
                          </p>
                        </div>
                        {selectedTemplate.willConfig.triggerCondition.inactivityDays && (
                          <div>
                            <p className="text-xs text-purple-600 font-medium mb-1">未登录天数</p>
                            <p className="font-semibold text-gray-900">
                              {selectedTemplate.willConfig.triggerCondition.inactivityDays} 天
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-purple-600 font-medium mb-1">见证人确认</p>
                          <p className="font-semibold text-gray-900">
                            {selectedTemplate.willConfig.triggerCondition.requiresWitnessConfirmation ? '需要' : '不需要'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-purple-600 font-medium mb-1">律师审批</p>
                          <p className="font-semibold text-gray-900">
                            {selectedTemplate.willConfig.triggerCondition.lawyerApprovalRequired ? '需要' : '不需要'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'flow' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-violet-500" />
                    执行流程预览
                  </h3>
                  <div className="relative">
                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200" />
                    <div className="space-y-4">
                      {selectedTemplate.executionFlow.map((flow, idx) => {
                        const FlowIcon = getIcon(flow.icon);
                        return (
                          <div key={idx} className="relative pl-16">
                            <div className="absolute left-0 top-0 w-12 h-12 bg-white border-2 border-emerald-500 rounded-full flex items-center justify-center z-10">
                              <FlowIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{flow.title}</h4>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                  {flow.duration}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{flow.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'steps' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    详细执行步骤
                  </h3>
                  <div className="space-y-3">
                    {selectedTemplate.willConfig.executionSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {step.order}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{step.title}</h4>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                actionTypeColors[step.actionType]
                              )}>
                                {actionTypeLabels[step.actionType]}
                              </span>
                              {step.branches && step.branches.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 flex items-center gap-1">
                                  <GitBranch className="w-3 h-3" />
                                  条件分支 ({step.branches.length})
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                触发后 {step.delayDays} 天执行
                              </div>
                              {step.targetHeirIds && step.targetHeirIds.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5" />
                                  {step.targetHeirIds.length} 位继承人
                                </div>
                              )}
                              {step.targetAssetIds && step.targetAssetIds.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Package className="w-3.5 h-3.5" />
                                  {step.targetAssetIds.length} 项资产
                                </div>
                              )}
                            </div>
                            {step.branches && step.branches.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-700 mb-2">条件分支：</p>
                                <div className="space-y-2">
                                  {step.branches.map((branch, bIdx) => (
                                    <div
                                      key={bIdx}
                                      className="bg-violet-50 rounded-lg p-3 border border-violet-100"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                                        <span className="text-sm font-medium text-gray-900">{branch.label}</span>
                                        <span className="text-xs text-gray-500">
                                          {branch.conditionLogic === 'and' ? '全部满足' : '任一满足'}
                                        </span>
                                      </div>
                                      {branch.conditions.map((cond, cIdx) => (
                                        <span
                                          key={cIdx}
                                          className="inline-block mr-2 mb-1 px-2 py-0.5 bg-white rounded text-xs text-gray-600"
                                        >
                                          {cond.label}
                                        </span>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'params' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-500" />
                    可调参数说明
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    应用模板后，以下所有参数均可在「我的遗嘱」页面进行二次编辑，根据您的实际情况灵活调整。
                  </p>
                  <div className="space-y-3">
                    {selectedTemplate.customizableParams.map((param, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                      >
                        <div className="flex items-start gap-3">
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium flex-shrink-0',
                            paramTypeColors[param.type]
                          )}>
                            {paramTypeLabels[param.type]}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">{param.name}</h4>
                            <p className="text-sm text-gray-600">{param.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                共 {selectedTemplate.willConfig.executionSteps.length} 个执行步骤 · {selectedTemplate.estimatedTime} 完成配置
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  应用此模板
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className={cn('p-6', selectedTemplate.bgColor)}>
              <div className="flex items-center gap-4">
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center border-2', selectedTemplate.borderColor, selectedTemplate.bgColor)}>
                  {(() => {
                    const Icon = getIcon(selectedTemplate.icon);
                    return <Icon className={cn('w-7 h-7', selectedTemplate.color)} />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">确认应用模板</h3>
                  <p className="text-sm text-gray-600">「{selectedTemplate.name}」</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">注意事项</p>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>• 应用此模板将覆盖您当前的遗嘱配置</li>
                      <li>• 当前遗嘱状态将重置为草稿</li>
                      <li>• 所有执行步骤、触发条件将被替换</li>
                      <li>• 应用后您可以随时在遗嘱页面调整参数</li>
                    </ul>
                  </div>
                </div>
              </div>

              {will && will.status !== 'draft' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">当前遗嘱已生效</p>
                      <p className="text-xs text-red-700">应用新模板将重置为草稿状态，需要重新生效</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700">
                  应用后将配置以下内容：
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">执行步骤</span>
                    <span className="font-medium text-gray-900">{selectedTemplate.willConfig.executionSteps.length} 步</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">触发方式</span>
                    <span className="font-medium text-gray-900">{TRIGGER_TYPE_LABELS[selectedTemplate.willConfig.triggerCondition.type]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">见证人要求</span>
                    <span className="font-medium text-gray-900">{selectedTemplate.willConfig.witnessIds.length} 位</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">律师审批</span>
                    <span className="font-medium text-gray-900">{selectedTemplate.willConfig.lawyerIds.length > 0 ? '需要' : '不需要'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    if (!showPreview) setSelectedTemplate(null);
                  }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={() => handleApplyTemplate(selectedTemplate)}
                  disabled={applying}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                    applying
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  )}
                >
                  {applying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      应用中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      确认应用
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
