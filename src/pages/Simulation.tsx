import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  Bell,
  FolderKanban,
  Key,
  Trash2,
  Users,
  ShieldAlert,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  ChevronRight,
  User,
  Sparkles,
  Gauge,
  GitBranch,
  Zap,
  Target,
  MessageSquare,
  Star,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  EXECUTION_ACTION_LABELS,
  EXECUTION_ACTION_COLORS,
  SIMULATION_ROLE_LABELS,
  SIMULATION_NOTIFY_METHOD_LABELS,
  ASSET_TYPE_LABELS,
  formatDate,
  formatReadinessScore,
  TRIGGER_TYPE_LABELS,
  CONDITION_FIELD_LABELS,
  CONDITION_FIELD_COLORS,
  BRANCH_COLORS,
  BRANCH_COLORS_BORDER,
  ASSET_NOTE_CATEGORY_LABELS,
  ASSET_NOTE_CATEGORY_COLORS,
  ASSET_NOTE_CATEGORY_ICONS,
} from '@/constants';
import { cn } from '@/lib/utils';
import type { SimulationStepDetail, ExecutionStep } from '@/types';

const actionIcons: Record<ExecutionStep['actionType'], typeof Bell> = {
  notify: Bell,
  transfer: FolderKanban,
  reveal_credentials: Key,
  delete_data: Trash2,
};

export default function Simulation() {
  const simulation = useAppStore((state) => state.simulation);
  const startSimulation = useAppStore((state) => state.startSimulation);
  const resetSimulation = useAppStore((state) => state.resetSimulation);
  const advanceSimulationStep = useAppStore((state) => state.advanceSimulationStep);
  const toggleSimulationPlay = useAppStore((state) => state.toggleSimulationPlay);
  const setSimulationPlaySpeed = useAppStore((state) => state.setSimulationPlaySpeed);
  const will = useAppStore((state) => state.will);
  const getAssetNotesByAsset = useAppStore((state) => state.getAssetNotesByAsset);

  const [activeTab, setActiveTab] = useState<'timeline' | 'report'>('timeline');

  useEffect(() => {
    if (simulation.isPlaying && simulation.mode === 'running') {
      const interval = setInterval(() => {
        advanceSimulationStep();
      }, 2000 / simulation.playSpeed);
      return () => clearInterval(interval);
    }
  }, [simulation.isPlaying, simulation.mode, simulation.playSpeed, advanceSimulationStep]);

  const handleExportReport = () => {
    if (!simulation.report) return;
    const report = simulation.report;
    const text = [
      '数字遗嘱执行模拟预报表',
      '='.repeat(50),
      '',
      `模拟时间: ${formatDate(report.simulationTime)}`,
      `触发方式: ${TRIGGER_TYPE_LABELS[report.triggerCondition.type]}`,
      `触发日期: ${formatDate(report.triggerDate)}`,
      '',
      '执行摘要:',
      `- 总步骤数: ${report.summary.totalSteps} 步`,
      `- 总执行周期: ${report.summary.totalDurationDays} 天`,
      `- 通知人数: ${report.summary.totalNotifiedPeople} 人`,
      `- 移交资产: ${report.summary.totalTransferredAssets} 项`,
      `- 资产总估值: ¥${report.summary.totalAssetValue.toLocaleString()}`,
      `- 就绪度评分: ${report.summary.readinessScore}/100`,
      '',
      '各继承人分配明细:',
      ...report.summary.heirBreakdown.map(h =>
        `  - ${h.heirName}: ${h.assetCount} 项资产，估值 ¥${h.assetValue.toLocaleString()}`
      ),
      '',
      '注意事项:',
      ...report.summary.warnings.map(w => `  ⚠️  ${w}`),
      '',
      '执行步骤明细:',
      ...report.steps.map((s, i) => [
        '',
        `第${s.stepOrder}步: ${s.stepTitle} [${EXECUTION_ACTION_LABELS[s.actionType]}]`,
        `  延迟: ${s.delayDays} 天 (累计 ${s.cumulativeDelayDays} 天)`,
        `  预计执行: ${formatDate(s.estimatedExecutionDate)}`,
        `  描述: ${s.stepDescription}`,
        s.notifyTargets.length > 0 && `  通知对象 (${s.notifyTargets.length}人):`,
        ...s.notifyTargets.map(t => `    - ${t.name} (${SIMULATION_ROLE_LABELS[t.role]}) - ${SIMULATION_NOTIFY_METHOD_LABELS[t.notificationMethod]}: ${t.email}${t.phone ? ` / ${t.phone}` : ''}`),
        s.transferItems.length > 0 && `  移交资产 (${s.transferItems.length}项):`,
        ...s.transferItems.map(a => {
          const assetLines = [`    - ${a.assetName} [${ASSET_TYPE_LABELS[a.assetType]}] → ${a.heirName}${a.assetValue ? ` (¥${a.assetValue.toLocaleString()})` : ''}`];
          if (a.transferInstructions) assetLines.push(`      移交指引: ${a.transferInstructions}`);
          const notes = getAssetNotesByAsset(a.assetId);
          if (notes.length > 0) {
            assetLines.push(`      【资产备注与寄语 (${notes.length} 条) — 展示给 ${a.heirName}】`);
            notes
              .sort((x, y) => {
                if (x.isImportant !== y.isImportant) return y.isImportant ? 1 : -1;
                return new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime();
              })
              .forEach((note, idx) => {
                const imp = note.isImportant ? ' ★重要' : '';
                assetLines.push(`      ${idx + 1}. [${ASSET_NOTE_CATEGORY_ICONS[note.category]} ${ASSET_NOTE_CATEGORY_LABELS[note.category]}]${imp} ${note.title ? '《' + note.title + '》' : ''} (${new Date(note.createdAt).toLocaleDateString('zh-CN')})`);
                const contentLines = note.content.split('\n').filter(Boolean);
                contentLines.forEach(line => assetLines.push(`         ${line}`));
                if (note.tags.length > 0) assetLines.push(`         标签: ${note.tags.map(t => '#' + t).join(' ')}`);
              });
          }
          return assetLines;
        }).flat(),
        s.warnings.length > 0 && `  风险提示:`,
        ...s.warnings.map(w => `    ⚠️  ${w}`),
      ].filter(Boolean)).flat(),
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `遗嘱执行模拟报表_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStepCard = (step: SimulationStepDetail, index: number) => {
    const isActive = index === simulation.currentStepIndex;
    const isPast = index < simulation.currentStepIndex || simulation.mode === 'completed';
    const Icon = actionIcons[step.actionType];

    return (
      <div
        key={step.stepId}
        className={cn(
          'relative pl-12 pb-8 last:pb-0 transition-all duration-300',
          isActive && 'scale-[1.01]'
        )}
      >
        {index < (simulation.report?.steps.length || 0) - 1 && (
          <div
            className={cn(
              'absolute left-[22px] top-12 bottom-0 w-0.5 transition-colors duration-300',
              isPast ? 'bg-emerald-400' : 'bg-gray-200'
            )}
          />
        )}
        <div
          className={cn(
            'absolute left-0 top-1 w-11 h-11 rounded-full flex items-center justify-center z-10 border-4 transition-all duration-300',
            isPast
              ? 'bg-emerald-500 border-emerald-100'
              : isActive
              ? 'bg-blue-500 border-blue-100 ring-4 ring-blue-100 animate-pulse'
              : 'bg-white border-gray-200'
          )}
        >
          {isPast ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <span
              className={cn(
                'text-sm font-bold',
                isActive ? 'text-white' : 'text-gray-400'
              )}
            >
              {step.stepOrder}
            </span>
          )}
        </div>

        <div
          className={cn(
            'rounded-2xl border-2 bg-white shadow-sm overflow-hidden transition-all duration-300',
            isActive
              ? 'border-blue-300 shadow-md'
              : isPast
              ? 'border-emerald-200'
              : 'border-gray-100 opacity-75'
          )}
        >
          <div className="p-5 border-b border-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border',
                    EXECUTION_ACTION_COLORS[step.actionType]
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{step.stepTitle}</h3>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium border',
                        EXECUTION_ACTION_COLORS[step.actionType]
                      )}
                    >
                      {EXECUTION_ACTION_LABELS[step.actionType]}
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        执行中
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{step.stepDescription}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {step.delayDays > 0 ? `触发后 ${step.delayDays} 天` : '立即执行'}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(step.estimatedExecutionDate)}
                </div>
              </div>
            </div>
          </div>

          {(step.notifyTargets.length > 0 || step.transferItems.length > 0 || step.warnings.length > 0) && (
            <div className="p-5 space-y-4 bg-gray-50/50">
              {(() => {
                const stepData = will?.executionSteps.find(s => s.id === step.stepId);
                const hasBranches = stepData?.branches && stepData.branches.length > 0;
                if (!hasBranches) return null;
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="w-4 h-4 text-violet-500" />
                      <span className="text-sm font-medium text-gray-700">
                        条件分支 ({stepData!.branches!.length} 条路径)
                      </span>
                      {stepData?.triggeredBranchId && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <Zap className="w-3 h-3" />
                          已触发
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {stepData!.branches!.map((branch, bIdx) => {
                        const colorIdx = bIdx % BRANCH_COLORS.length;
                        const isTriggered = stepData?.triggeredBranchId === branch.id;
                        return (
                          <div
                            key={branch.id}
                            className={cn(
                              'rounded-lg border-l-4 p-3',
                              BRANCH_COLORS_BORDER[colorIdx],
                              isTriggered ? 'ring-2 ring-emerald-300 bg-emerald-50' : 'bg-white'
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className={cn('w-2 h-2 rounded-full', BRANCH_COLORS[colorIdx])} />
                                <span className="text-sm font-medium text-gray-900">{branch.label}</span>
                                <span className="text-xs text-gray-400">
                                  {branch.conditionLogic === 'and' ? '全部满足' : '任一满足'}
                                </span>
                              </div>
                              {isTriggered && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                  <Zap className="w-3 h-3" />
                                  当前路径
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {branch.conditions.map((cond) => (
                                <span
                                  key={cond.id}
                                  className={cn(
                                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border',
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
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <ChevronRight className="w-3 h-3" />
                                <span>跳转：{branch.targetStepIds.map(sid => {
                                  const targetStep = will?.executionSteps.find(s => s.id === sid);
                                  return targetStep ? `第${targetStep.order}步` : sid;
                                }).join('、')}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {step.notifyTargets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">
                      通知对象 ({step.notifyTargets.length} 人)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {step.notifyTargets.map((target, idx) => (
                      <div
                        key={`${target.email}-${idx}`}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
                      >
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{target.name}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                              {SIMULATION_ROLE_LABELS[target.role]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-0.5">
                              <Mail className="w-3 h-3" />
                              {SIMULATION_NOTIFY_METHOD_LABELS[target.notificationMethod]}
                            </span>
                            <ChevronRight className="w-3 h-3 text-gray-300" />
                            <span className="truncate">{target.email}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step.transferItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FolderKanban className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-gray-700">
                      移交资产 ({step.transferItems.length} 项)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {step.transferItems.map((item) => {
                      const notes = getAssetNotesByAsset(item.assetId).sort((a, b) => {
                        if (a.isImportant !== b.isImportant) return b.isImportant ? 1 : -1;
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      });
                      return (
                        <div key={item.assetId}>
                          <div
                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <FolderKanban className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">{item.assetName}</p>
                                <p className="text-xs text-gray-500">
                                  {ASSET_TYPE_LABELS[item.assetType]}
                                  {item.transferInstructions && ` · ${item.transferInstructions.slice(0, 30)}${item.transferInstructions.length > 30 ? '...' : ''}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                              {item.assetValue !== undefined && item.assetValue > 0 && (
                                <span className="text-sm font-semibold text-emerald-600">
                                  ¥{item.assetValue.toLocaleString()}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-gray-300" />
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg">
                                <User className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-medium text-blue-700">{item.heirName}</span>
                              </div>
                            </div>
                          </div>
                          {notes.length > 0 && (
                            <div className="mt-2 ml-4 space-y-1.5">
                              <div className="flex items-center gap-1.5 px-3 pt-2">
                                <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
                                <span className="text-xs font-medium text-gray-600">
                                  资产备注与寄语 ({notes.length} 条) — 展示给 {item.heirName}
                                </span>
                              </div>
                              {notes.map((note) => (
                                <div
                                  key={note.id}
                                  className="p-3 rounded-xl border border-gray-100 bg-gradient-to-r from-violet-50/60 to-white ml-3"
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={cn(
                                          'text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1',
                                          ASSET_NOTE_CATEGORY_COLORS[note.category]
                                        )}
                                      >
                                        <span>{ASSET_NOTE_CATEGORY_ICONS[note.category]}</span>
                                        {ASSET_NOTE_CATEGORY_LABELS[note.category]}
                                      </span>
                                      {note.isImportant && (
                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                          重要
                                        </span>
                                      )}
                                      {note.title && (
                                        <span className="text-xs font-semibold text-gray-800">
                                          {note.title}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                      {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                                    </span>
                                  </div>
                                  {note.contentHtml ? (
                                    <div
                                      className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-a:text-blue-600 prose-strong:text-gray-900 prose-em:text-gray-700 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-blockquote:my-1 prose-blockquote:pl-2 prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:text-gray-600 prose-blockquote:not-italic"
                                      dangerouslySetInnerHTML={{ __html: note.contentHtml }}
                                    />
                                  ) : (
                                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {note.content}
                                    </p>
                                  )}
                                  {note.tags.length > 0 && (
                                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                                      {note.tags.map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step.warnings.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">风险提示</p>
                    <ul className="mt-1 space-y-0.5">
                      {step.warnings.map((w, idx) => (
                        <li key={idx} className="text-xs text-amber-700">• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-purple-500" />
            执行沙箱模拟
          </h1>
          <p className="text-gray-500 mt-1">
            在遗嘱生效前完整模拟触发后的执行流程，不会影响实际数据
          </p>
        </div>
        {simulation.mode !== 'idle' && (
          <div className="flex items-center gap-2">
            <button
              onClick={resetSimulation}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重置模拟
            </button>
            {simulation.report && (
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                导出报表
              </button>
            )}
          </div>
        )}
      </div>

      {simulation.mode === 'idle' && (
        <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-3xl p-8 md:p-12 text-white">
          <div className="max-w-2xl">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-3">遗嘱执行沙箱模拟</h2>
            <p className="text-white/80 text-lg mb-6">
              在安全的沙箱环境中完整预览遗嘱触发后的全部执行过程。
              每一步将展示会通知谁、移交哪些资产、延迟多久执行。
              所有操作仅为模拟，不会影响实际的遗嘱数据状态。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Bell className="w-5 h-5" />
                <span className="text-sm">通知对象预览</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <FolderKanban className="w-5 h-5" />
                <span className="text-sm">资产移交明细</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <FileText className="w-5 h-5" />
                <span className="text-sm">执行预报表</span>
              </div>
            </div>
            {will && will.executionSteps.length === 0 ? (
              <div className="p-4 bg-white/10 rounded-xl">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">请先配置执行步骤</p>
                    <p className="text-sm text-white/70 mt-1">
                      前往数字遗嘱页面添加至少一个执行步骤后再进行模拟
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={startSimulation}
                className="flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-2xl font-semibold text-lg hover:bg-white/90 transition-colors shadow-lg"
              >
                <Play className="w-6 h-6 fill-purple-600" />
                开始模拟执行
              </button>
            )}
          </div>
        </div>
      )}

      {simulation.mode !== 'idle' && simulation.report && (
        <>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">模拟就绪度评分</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-3xl font-bold text-gray-900">
                      {simulation.report.summary.readinessScore}
                      <span className="text-lg text-gray-400 font-normal">/100</span>
                    </p>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        formatReadinessScore(simulation.report.summary.readinessScore).color
                      )}
                    >
                      {formatReadinessScore(simulation.report.summary.readinessScore).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  {[0.5, 1, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSimulationPlaySpeed(speed)}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
                        simulation.playSpeed === speed
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      )}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
                <button
                  onClick={toggleSimulationPlay}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {simulation.isPlaying ? (
                    <><Pause className="w-4 h-4" /> 暂停</>
                  ) : (
                    <><Play className="w-4 h-4 fill-white" /> 播放</>
                  )}
                </button>
                <button
                  onClick={advanceSimulationStep}
                  disabled={simulation.mode === 'completed'}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipForward className="w-4 h-4" />
                  下一步
                </button>
              </div>
            </div>

            <div className="mt-5 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{
                  width: `${
                    simulation.mode === 'completed'
                      ? 100
                      : ((Math.max(0, simulation.currentStepIndex + 1) / simulation.report.steps.length) * 100)
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>
                进度: {simulation.mode === 'completed'
                  ? simulation.report.steps.length
                  : Math.max(0, simulation.currentStepIndex + 1)}
                /{simulation.report.steps.length} 步
              </span>
              <span>模拟触发时间: {formatDate(simulation.report.triggerDate)}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex">
            <button
              onClick={() => setActiveTab('timeline')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                activeTab === 'timeline'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <Clock className="w-4 h-4" />
              执行时间轴
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                activeTab === 'report'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              <BarChart3 className="w-4 h-4" />
              执行预报表
            </button>
          </div>

          {activeTab === 'timeline' && (
            <div className="space-y-0">
              {simulation.report.steps.map((step, index) =>
                renderStepCard(step, index)
              )}
              {simulation.mode === 'completed' && (
                <div className="flex items-center justify-center gap-3 p-8 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl border-2 border-emerald-200">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">模拟执行已完成</p>
                    <p className="text-sm text-gray-600">
                      所有 {simulation.report.steps.length} 个步骤均已预览完毕，可导出完整执行报表
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'report' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{simulation.report.summary.totalDurationDays}</p>
                  <p className="text-sm text-gray-500">总执行周期 (天)</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{simulation.report.summary.totalNotifiedPeople}</p>
                  <p className="text-sm text-gray-500">通知人数</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                    <FolderKanban className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{simulation.report.summary.totalTransferredAssets}</p>
                  <p className="text-sm text-gray-500">移交资产数</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ¥{simulation.report.summary.totalAssetValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">资产总估值</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  继承人分配明细
                </h3>
                {simulation.report.summary.heirBreakdown.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center">暂无资产分配数据</p>
                ) : (
                  <div className="space-y-3">
                    {simulation.report.summary.heirBreakdown.map((heir) => {
                      const percent = simulation.report.summary.totalAssetValue > 0
                        ? (heir.assetValue / simulation.report.summary.totalAssetValue) * 100
                        : 0;
                      return (
                        <div key={heir.heirId} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{heir.heirName}</p>
                                <p className="text-xs text-gray-500">{heir.assetCount} 项资产</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                ¥{heir.assetValue.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">{percent.toFixed(1)}% 占比</p>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {simulation.report.summary.warnings.length > 0 && (
                <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-amber-900">注意事项与风险提示</h3>
                      <p className="text-sm text-amber-700 mt-1">
                        在实际执行前，请确保解决以下问题
                      </p>
                      <ul className="mt-3 space-y-2">
                        {simulation.report.summary.warnings.map((w, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-amber-800"
                          >
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  完整执行时间线
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">步骤</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">延迟</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">预计执行</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">通知</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">资产</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulation.report.steps.map((step) => (
                        <tr key={step.stepId} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{step.stepOrder}. {step.stepTitle}</td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium border',
                                EXECUTION_ACTION_COLORS[step.actionType]
                              )}
                            >
                              {EXECUTION_ACTION_LABELS[step.actionType]}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {step.delayDays > 0 ? `+${step.delayDays} 天` : '立即'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{formatDate(step.estimatedExecutionDate)}</td>
                          <td className="py-3 px-4 text-gray-600">{step.notifyTargets.length} 人</td>
                          <td className="py-3 px-4 text-gray-600">{step.transferItems.length} 项</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
