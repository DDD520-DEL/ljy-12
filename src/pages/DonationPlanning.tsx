import React, { useState, useMemo } from 'react';
import {
  Heart,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Building2,
  Shield,
  Settings,
  FileText,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Save,
  Play,
  StopCircle,
  Clock,
  Award,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  DONATION_STATUS_LABELS,
  DONATION_STATUS_COLORS,
  DONATION_ITEM_TYPE_LABELS,
  DONATION_ITEM_TYPE_COLORS,
  CHARITY_CATEGORY_LABELS,
  CHARITY_CATEGORY_COLORS,
} from '@/constants';
import type { DonationItemType, CharityCategory } from '@/types';

const DonationPlanning: React.FC = () => {
  const {
    donationPlan,
    createDonationPlan,
    updateDonationPlan,
    deleteDonationPlan,
    activateDonationPlan,
    addDonationItem,
    updateDonationItem,
    removeDonationItem,
    setDonationAllocation,
    getAllCharities,
    getDonationExecutionState,
    getDonationItemValue,
    getDonationTotalValue,
    startDonationExecution,
    completeDonationExecution,
    cancelDonationExecution,
    assets,
  } = useAppStore();

  const allCharities = getAllCharities();
  const executionState = getDonationExecutionState();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [allocatingItemId, setAllocatingItemId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [planTitle, setPlanTitle] = useState('我的公益捐赠计划');
  const [planDescription, setPlanDescription] = useState('将我的数字资产以公益方式回馈社会');
  const [planDelayDays, setPlanDelayDays] = useState(0);
  const [planLawyerReview, setPlanLawyerReview] = useState(true);
  const [planWitnessConfirm, setPlanWitnessConfirm] = useState(false);

  const [itemType, setItemType] = useState<DonationItemType>('value_percentage');
  const [itemAssetId, setItemAssetId] = useState<string | undefined>();
  const [itemPercentage, setItemPercentage] = useState(5);
  const [itemFixedAmount, setItemFixedAmount] = useState<number>(10000);
  const [itemNote, setItemNote] = useState('');

  const totalAssetValue = useMemo(
    () => assets.reduce((sum, a) => sum + (a.value || 0), 0),
    [assets]
  );

  const resetItemForm = () => {
    setItemType('value_percentage');
    setItemAssetId(undefined);
    setItemPercentage(5);
    setItemFixedAmount(10000);
    setItemNote('');
  };

  const handleCreatePlan = () => {
    if (!planTitle.trim()) return;
    createDonationPlan({
      title: planTitle,
      description: planDescription,
      delayDays: planDelayDays,
      lawyerReviewRequired: planLawyerReview,
      witnessConfirmRequired: planWitnessConfirm,
    });
    setShowCreateModal(false);
  };

  const openEditItem = (itemId: string) => {
    const item = donationPlan?.items.find((i) => i.id === itemId);
    if (!item) return;
    setEditingItemId(itemId);
    setItemType(item.type);
    setItemAssetId(item.assetId);
    setItemPercentage(item.percentageOfTotal || 5);
    setItemFixedAmount(item.fixedAmount || 10000);
    setItemNote(item.note || '');
    setShowItemModal(true);
  };

  const handleSaveItem = () => {
    if (editingItemId) {
      updateDonationItem(editingItemId, {
        type: itemType,
        assetId: itemType === 'specific_asset' ? itemAssetId : undefined,
        percentageOfTotal: itemType === 'value_percentage' ? itemPercentage : undefined,
        fixedAmount: itemType === 'fixed_amount' ? itemFixedAmount : undefined,
        note: itemNote,
      });
      setEditingItemId(null);
    } else {
      addDonationItem({
        type: itemType,
        assetId: itemType === 'specific_asset' ? itemAssetId : undefined,
        percentageOfTotal: itemType === 'value_percentage' ? itemPercentage : undefined,
        fixedAmount: itemType === 'fixed_amount' ? itemFixedAmount : undefined,
        note: itemNote,
      });
    }
    setShowItemModal(false);
    resetItemForm();
  };

  const toggleItemExpand = (id: string) => {
    const next = new Set(expandedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedItems(next);
  };

  const getItemAllocations = (itemId: string) => {
    return donationPlan?.allocations.filter((a) => a.donationItemId === itemId) || [];
  };

  const getAllocationTotal = (itemId: string) => {
    return getItemAllocations(itemId).reduce((sum, a) => sum + a.percentage, 0);
  };

  const renderStatusBadge = (status: string) => {
    const colors: Record<string, string> = DONATION_STATUS_COLORS;
    const labels: Record<string, string> = DONATION_STATUS_LABELS;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (!donationPlan) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-9 h-9 text-rose-500" />
            公益捐赠规划
          </h1>
          <p className="mt-3 text-gray-600 text-lg">
            规划数字资产的公益捐赠方向，让您的数字遗产延续社会价值
          </p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 rounded-2xl p-12 text-center border-2 border-dashed border-rose-200">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
            <Heart className="w-12 h-12 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">开始创建您的公益捐赠计划</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            通过捐赠规划，您可以将指定资产、资产比例或固定金额捐赠给公益机构。
            这些捐赠将作为遗嘱执行的独立步骤，在满足条件时按分配规则执行。
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            创建捐赠规划
          </button>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Building2, title: '预设公益机构', desc: '涵盖教育、医疗、环保等10+权威公益机构', color: 'text-blue-500' },
              { icon: Settings, title: '灵活分配规则', desc: '支持按比例分配给多个公益机构', color: 'text-emerald-500' },
              { icon: Shield, title: '审计可追溯', desc: '每笔捐赠记录都在区块链式日志中留痕', color: 'text-amber-500' },
            ].map((feat, i) => (
              <div key={i} className="bg-white/70 backdrop-blur rounded-xl p-6 text-left shadow-sm">
                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm mb-4 ${feat.color}`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feat.title}</h3>
                <p className="text-sm text-gray-600">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {showCreateModal && (
          <CreatePlanModal
            title={planTitle} setTitle={setPlanTitle}
            description={planDescription} setDescription={setPlanDescription}
            delayDays={planDelayDays} setDelayDays={setPlanDelayDays}
            lawyerReview={planLawyerReview} setLawyerReview={setPlanLawyerReview}
            witnessConfirm={planWitnessConfirm} setWitnessConfirm={setPlanWitnessConfirm}
            onConfirm={handleCreatePlan}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="w-9 h-9 text-rose-500" />
              {donationPlan.title}
            </h1>
            {renderStatusBadge(donationPlan.status)}
          </div>
          {donationPlan.description && (
            <p className="text-gray-600 text-lg">{donationPlan.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {donationPlan.status === 'draft' && (
            <>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <Edit2 className="w-4 h-4" />
                编辑规划
              </button>
              <button
                onClick={activateDonationPlan}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                生效规划
              </button>
              <button
                onClick={() => {
                  if (window.confirm('确定要删除该捐赠规划吗？此操作不可撤销。')) {
                    deleteDonationPlan();
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </>
          )}
          {donationPlan.status === 'active' && (
            <button
              onClick={startDonationExecution}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
            >
              <Play className="w-4 h-4" />
              开始执行
            </button>
          )}
          {donationPlan.status === 'executing' && (
            <>
              <button
                onClick={() => {
                  donationPlan.items.forEach((item) => {
                    useAppStore.getState().completeDonationStep(item.id);
                  });
                  completeDonationExecution();
                }}
                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                完成所有捐赠
              </button>
              <button
                onClick={cancelDonationExecution}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <StopCircle className="w-4 h-4" />
                取消执行
              </button>
            </>
          )}
          {donationPlan.status === 'completed' && (
            <div className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-semibold inline-flex items-center gap-2">
              <Award className="w-5 h-5" />
              捐赠圆满完成
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="资产总估值"
          value={`¥${totalAssetValue.toLocaleString()}`}
          color="bg-blue-50 text-blue-600 border-blue-100"
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={<Heart className="w-6 h-6" />}
          label="预计捐赠总额"
          value={`¥${getDonationTotalValue().toLocaleString()}`}
          valueAccent={totalAssetValue > 0 ? `占资产 ${Math.round(getDonationTotalValue() / totalAssetValue * 100)}%` : ''}
          color="bg-rose-50 text-rose-600 border-rose-100"
          iconBg="bg-rose-100 text-rose-600"
        />
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          label="捐赠项目数"
          value={`${donationPlan.items.length} 项`}
          valueAccent={donationPlan.allocations.length > 0 ? `${donationPlan.allocations.length} 条分配规则` : '未设置分配'}
          color="bg-purple-50 text-purple-600 border-purple-100"
          iconBg="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={<Shield className="w-6 h-6" />}
          label="执行进度"
          value={`${executionState.overallProgress}%`}
          valueAccent={`${executionState.completedItems}/${executionState.totalItems} 项完成`}
          progress={executionState.overallProgress}
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
          iconBg="bg-emerald-100 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-500" />
                捐赠清单
              </h2>
              {['draft', 'active'].includes(donationPlan.status) && (
                <button
                  onClick={() => { resetItemForm(); setEditingItemId(null); setShowItemModal(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition text-sm font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  添加项目
                </button>
              )}
            </div>

            {donationPlan.items.length === 0 ? (
              <div className="p-16 text-center text-gray-500">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg mb-2">暂无捐赠项目</p>
                <p className="text-sm text-gray-400">点击右上角「添加项目」创建第一条捐赠</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {donationPlan.items.map((item, idx) => {
                  const itemValue = getDonationItemValue(item);
                  const allocations = getItemAllocations(item.id);
                  const allocTotal = getAllocationTotal(item.id);
                  const isExpanded = expandedItems.has(item.id);
                  const allocationValid = allocTotal === 100;

                  return (
                    <div key={item.id}>
                      <div className="px-6 py-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <button
                              onClick={() => toggleItemExpand(item.id)}
                              className="mt-1 w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition flex-shrink-0"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <span className="text-xs text-gray-400 font-mono">#{idx + 1}</span>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${DONATION_ITEM_TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-700'}`}>
                                  {DONATION_ITEM_TYPE_LABELS[item.type] || item.type}
                                </span>
                                {allocationValid ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    分配已设置
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {allocations.length > 0 ? `分配不完整 (${allocTotal}%)` : '需设置分配'}
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-900 font-medium">
                                {item.type === 'specific_asset' && (
                                  <>
                                    捐赠指定资产：{assets.find((a) => a.id === item.assetId)?.name || '(资产已删除)'}
                                  </>
                                )}
                                {item.type === 'value_percentage' && (
                                  <>捐赠总资产估值的 <span className="text-rose-600">{item.percentageOfTotal}%</span></>
                                )}
                                {item.type === 'fixed_amount' && (
                                  <>固定金额捐赠 <span className="text-rose-600">¥{item.fixedAmount?.toLocaleString()}</span></>
                                )}
                              </div>
                              {item.note && (
                                <p className="text-sm text-gray-500 mt-1">{item.note}</p>
                              )}
                              {allocations.length > 0 && !isExpanded && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {allocations.slice(0, 4).map((a) => {
                                    const charity = allCharities.find((c) => c.id === a.charityId);
                                    const category = charity?.category as CharityCategory;
                                    return (
                                      <span key={a.id} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${CHARITY_CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
                                        <Building2 className="w-3 h-3" />
                                        {charity?.name || a.charityId}：{a.percentage}%
                                      </span>
                                    );
                                  })}
                                  {allocations.length > 4 && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                      +{allocations.length - 4} 个机构
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">¥{itemValue.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">
                                预计 {Math.round(itemValue / totalAssetValue * 1000) / 10}% 资产
                              </div>
                            </div>
                            {['draft', 'active'].includes(donationPlan.status) && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setAllocatingItemId(item.id)}
                                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                  title="设置分配规则"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openEditItem(item.id)}
                                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                                  title="编辑项目"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('确定要删除该捐赠项目吗？')) {
                                      removeDonationItem(item.id);
                                    }
                                  }}
                                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                                  title="删除项目"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && allocations.length > 0 && (
                        <div className="px-16 pb-5">
                          <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                分配规则详情
                              </h4>
                              {allocationValid ? (
                                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  分配比例完整
                                </span>
                              ) : (
                                <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  分配比例不完整（当前 {allocTotal}%）
                                </span>
                              )}
                            </div>
                            <div className="space-y-2.5">
                              {allocations.map((a) => {
                                const charity = allCharities.find((c) => c.id === a.charityId);
                                const category = charity?.category as CharityCategory;
                                const allocValue = Math.round(itemValue * a.percentage / 100);
                                return (
                                  <div key={a.id} className="flex items-center justify-between gap-3 bg-white rounded-lg px-4 py-3 border border-gray-100">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${CHARITY_CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
                                        <Building2 className="w-4 h-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{charity?.name || a.charityId}</div>
                                        <div className="text-xs text-gray-500">
                                          {charity && (CHARITY_CATEGORY_LABELS as Record<string, string>)[charity.category]}
                                          {charity?.website ? ` · ${charity.website}` : ''}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                      <div className="w-28">
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                                            style={{ width: `${a.percentage}%` }}
                                          />
                                        </div>
                                        <div className="text-xs text-right mt-1 text-gray-600 font-medium">{a.percentage}%</div>
                                      </div>
                                      <div className="text-right w-28">
                                        <div className="text-sm font-bold text-gray-900">¥{allocValue.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400">预计捐赠</div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-amber-500" />
                机构分配概览
              </h2>
            </div>
            <div className="p-6">
              {executionState.charityBreakdown.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm">请先为捐赠项目设置分配规则</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">机构总数</span>
                    <span className="font-semibold text-gray-900">{executionState.charityBreakdown.length} 家</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">已分配金额</span>
                    <span className="font-semibold text-emerald-600">¥{executionState.allocatedValue.toLocaleString()}</span>
                  </div>
                  {executionState.unallocatedValue > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />未分配金额
                      </span>
                      <span className="font-semibold text-amber-600">¥{executionState.unallocatedValue.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    {executionState.charityBreakdown
                      .sort((a, b) => b.allocatedValue - a.allocatedValue)
                      .slice(0, 5)
                      .map((bd) => (
                        <div key={bd.charityId}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="text-gray-700 truncate flex-1 mr-2">{bd.charityName}</span>
                            <span className="font-semibold text-gray-900 whitespace-nowrap">¥{bd.allocatedValue.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-400 to-rose-500 rounded-full"
                              style={{ width: `${Math.min(bd.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                执行设置
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <SettingRow label="执行顺序" value={`遗嘱执行第 ${donationPlan.executionStepOrder} 步`} />
              <SettingRow
                label="延迟执行"
                value={donationPlan.delayDays > 0 ? `${donationPlan.delayDays} 天后` : '立即执行'}
              />
              <SettingRow
                label="律师审核"
                value={donationPlan.lawyerReviewRequired ? '需要' : '不需要'}
                valueColor={donationPlan.lawyerReviewRequired ? 'text-emerald-600' : 'text-gray-500'}
              />
              <SettingRow
                label="见证人确认"
                value={donationPlan.witnessConfirmRequired ? '需要' : '不需要'}
                valueColor={donationPlan.witnessConfirmRequired ? 'text-emerald-600' : 'text-gray-500'}
              />
              <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>创建时间：{new Date(donationPlan.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  <span>更新时间：{new Date(donationPlan.updatedAt).toLocaleString('zh-CN')}</span>
                </div>
                {donationPlan.executedAt && (
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Play className="w-3.5 h-3.5" />
                    <span>启动时间：{new Date(donationPlan.executedAt).toLocaleString('zh-CN')}</span>
                  </div>
                )}
                {donationPlan.completedAt && (
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <Award className="w-3.5 h-3.5" />
                    <span>完成时间：{new Date(donationPlan.completedAt).toLocaleString('zh-CN')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100">
            <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              公益机构目录
            </h3>
            <p className="text-sm text-indigo-700/80 mb-4">
              支持 {allCharities.length} 家公益机构，覆盖 {Object.keys(CHARITY_CATEGORY_LABELS).length} 个公益领域
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allCharities.slice(0, 8).map((c) => (
                <span key={c.id} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${CHARITY_CATEGORY_COLORS[c.category] || 'bg-white text-gray-700 border border-gray-200'}`}>
                  {c.name}
                </span>
              ))}
              {allCharities.length > 8 && (
                <span className="text-xs text-indigo-600 px-2 py-1 font-medium">
                  +{allCharities.length - 8} 家
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreatePlanModal
          title={planTitle} setTitle={setPlanTitle}
          description={planDescription} setDescription={setPlanDescription}
          delayDays={planDelayDays} setDelayDays={setPlanDelayDays}
          lawyerReview={planLawyerReview} setLawyerReview={setPlanLawyerReview}
          witnessConfirm={planWitnessConfirm} setWitnessConfirm={setPlanWitnessConfirm}
          onConfirm={() => {
            updateDonationPlan({
              title: planTitle,
              description: planDescription,
              delayDays: planDelayDays,
              lawyerReviewRequired: planLawyerReview,
              witnessConfirmRequired: planWitnessConfirm,
            });
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
          isEdit
        />
      )}

      {showItemModal && (
        <ItemModal
          isEdit={!!editingItemId}
          type={itemType} setType={setItemType}
          assetId={itemAssetId} setAssetId={setItemAssetId}
          percentage={itemPercentage} setPercentage={setItemPercentage}
          fixedAmount={itemFixedAmount} setFixedAmount={setItemFixedAmount}
          note={itemNote} setNote={setItemNote}
          assets={assets}
          onConfirm={handleSaveItem}
          onClose={() => { setShowItemModal(false); resetItemForm(); setEditingItemId(null); }}
        />
      )}

      {allocatingItemId && (
        <AllocationModal
          itemId={allocatingItemId}
          charities={allCharities}
          existingAllocations={getItemAllocations(allocatingItemId)}
          itemValue={(() => {
            const item = donationPlan.items.find((i) => i.id === allocatingItemId);
            return item ? getDonationItemValue(item) : 0;
          })()}
          onSave={(allocations) => {
            setDonationAllocation(allocatingItemId, allocations);
            setAllocatingItemId(null);
          }}
          onClose={() => setAllocatingItemId(null)}
        />
      )}
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  valueAccent?: string;
  color: string;
  iconBg: string;
  progress?: number;
}> = ({ icon, label, value, valueAccent, color, iconBg, progress }) => (
  <div className={`rounded-2xl p-5 border ${color} bg-white/70 backdrop-blur`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm font-medium opacity-90">{label}</div>
    {valueAccent && <div className="text-xs opacity-75 mt-1">{valueAccent}</div>}
    {typeof progress === 'number' && (
      <div className="mt-3 h-2 bg-white/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all bg-current opacity-70"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);

const SettingRow: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className={`font-semibold ${valueColor || 'text-gray-900'}`}>{value}</span>
  </div>
);

const CreatePlanModal: React.FC<{
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  delayDays: number; setDelayDays: (v: number) => void;
  lawyerReview: boolean; setLawyerReview: (v: boolean) => void;
  witnessConfirm: boolean; setWitnessConfirm: (v: boolean) => void;
  onConfirm: () => void;
  onClose: () => void;
  isEdit?: boolean;
}> = (p) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-pink-50">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          {p.isEdit ? '编辑捐赠规划' : '创建捐赠规划'}
        </h3>
      </div>
      <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
        <Field label="规划名称">
          <input
            type="text" value={p.title} onChange={(e) => p.setTitle(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="如：我的公益捐赠计划"
          />
        </Field>
        <Field label="规划说明">
          <textarea
            value={p.description} onChange={(e) => p.setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            placeholder="说明捐赠的初衷和意图..."
          />
        </Field>
        <Field label="启动后延迟天数">
          <input
            type="number" min={0} value={p.delayDays} onChange={(e) => p.setDelayDays(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">遗嘱触发后，等待多少天再执行捐赠</p>
        </Field>
        <div className="space-y-3 pt-2">
          <ToggleRow
            label="律师审核"
            desc="执行捐赠前需律师审核资产情况"
            value={p.lawyerReview}
            onChange={p.setLawyerReview}
          />
          <ToggleRow
            label="见证人确认"
            desc="需要全体见证人签名确认后执行"
            value={p.witnessConfirm}
            onChange={p.setWitnessConfirm}
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <button onClick={p.onClose} className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
          取消
        </button>
        <button
          onClick={p.onConfirm}
          disabled={!p.title.trim()}
          className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {p.isEdit ? '保存修改' : '创建规划'}
        </button>
      </div>
    </div>
  </div>
);

const ItemModal: React.FC<any> = (p) => {
  const [isOn, setIsOn] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-rose-500" />
            {p.isEdit ? '编辑捐赠项目' : '添加捐赠项目'}
          </h3>
        </div>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <Field label="捐赠类型">
            <div className="grid grid-cols-3 gap-3">
              {(['value_percentage', 'specific_asset', 'fixed_amount'] as DonationItemType[]).map((t) => {
                const active = p.type === t;
                return (
                  <button
                    key={t} onClick={() => p.setType(t)}
                    className={`p-4 rounded-xl border-2 transition text-center ${active ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    <div className="text-sm font-semibold mb-1">{DONATION_ITEM_TYPE_LABELS[t]}</div>
                  </button>
                );
              })}
            </div>
          </Field>

          {p.type === 'specific_asset' && (
            <Field label="选择资产">
              <select
                value={p.assetId || ''} onChange={(e) => p.setAssetId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">请选择要捐赠的资产</option>
                {p.assets.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name}（¥{a.value?.toLocaleString() || 0}）
                  </option>
                ))}
              </select>
            </Field>
          )}

          {p.type === 'value_percentage' && (
            <Field label={`占资产总值比例：${p.percentage}%`}>
              <input
                type="range" min={1} max={50} value={p.percentage}
                onChange={(e) => p.setPercentage(parseInt(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </Field>
          )}

          {p.type === 'fixed_amount' && (
            <Field label="固定金额（元）">
              <input
                type="number" min={100} value={p.fixedAmount}
                onChange={(e) => p.setFixedAmount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="如：10000"
              />
            </Field>
          )}

          <Field label="备注（可选）">
            <textarea
              value={p.note} onChange={(e) => p.setNote(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              placeholder="对此项捐赠的补充说明..."
            />
          </Field>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={p.onClose} className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
            取消
          </button>
          <button
            onClick={p.onConfirm}
            disabled={(p.type === 'specific_asset' && !p.assetId) || (p.type === 'fixed_amount' && (!p.fixedAmount || p.fixedAmount < 100))}
            className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {p.isEdit ? '保存修改' : '添加项目'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AllocationModal: React.FC<any> = ({ itemId, charities, existingAllocations, itemValue, onSave, onClose }) => {
  const [allocList, setAllocList] = useState<Array<{ charityId: string; percentage: number }>>(
    existingAllocations.length > 0
      ? existingAllocations.map((a: any) => ({ charityId: a.charityId, percentage: a.percentage }))
      : []
  );

  const totalPct = allocList.reduce((sum, a) => sum + a.percentage, 0);
  const addRow = () => {
    if (charities.length === 0) return;
    const usedIds = new Set(allocList.map((a) => a.charityId));
    const firstAvailable = charities.find((c: any) => !usedIds.has(c.id));
    if (!firstAvailable) return;
    setAllocList([...allocList, { charityId: firstAvailable.id, percentage: 0 }]);
  };
  const updateRow = (idx: number, patch: any) => {
    setAllocList(allocList.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const removeRow = (idx: number) => setAllocList(allocList.filter((_, i) => i !== idx));

  const valid = totalPct === 100 && allocList.length > 0;

  const categories = Object.keys(CHARITY_CATEGORY_LABELS) as CharityCategory[];
  const [filterCat, setFilterCat] = useState<CharityCategory | 'all'>('all');
  const filteredCharities = filterCat === 'all' ? charities : charities.filter((c: any) => c.category === filterCat);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            设置分配规则
            <span className="text-base font-normal text-gray-500 ml-2">项目预计价值 ¥{itemValue.toLocaleString()}</span>
          </h3>
        </div>

        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2 bg-gray-50/50">
          <button
            onClick={() => setFilterCat('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterCat === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c} onClick={() => setFilterCat(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${filterCat === c ? 'bg-gray-900 text-white' : CHARITY_CATEGORY_COLORS[c] || 'bg-white border border-gray-200 text-gray-600'}`}
            >
              {(CHARITY_CATEGORY_LABELS as Record<string, string>)[c]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {allocList.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <div className="w-14 h-14 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Building2 className="w-7 h-7 text-gray-400" />
              </div>
              <p className="mb-1">尚未添加分配机构</p>
              <p className="text-sm text-gray-400">点击下方按钮添加公益机构并设置比例</p>
            </div>
          )}
          {allocList.map((row, idx) => {
            const allocValue = Math.round(itemValue * row.percentage / 100);
            return (
              <div key={idx} className="flex flex-wrap items-end gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50/30">
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">公益机构</label>
                  <select
                    value={row.charityId}
                    onChange={(e) => updateRow(idx, { charityId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {filteredCharities.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}（{(CHARITY_CATEGORY_LABELS as Record<string, string>)[c.category]}）
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-36">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">分配比例 %</label>
                  <input
                    type="number" min={0} max={100} value={row.percentage}
                    onChange={(e) => updateRow(idx, { percentage: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="w-36">
                  <div className="text-xs text-gray-500 mb-1.5">预计金额</div>
                  <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900">
                    ¥{allocValue.toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => removeRow(idx)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition border border-transparent hover:border-red-200"
                  title="移除"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            );
          })}

          <button
            onClick={addRow}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/30 transition font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加分配机构
          </button>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">合计分配比例：</span>
              <span className={`text-xl font-bold ${valid ? 'text-emerald-600' : 'text-amber-600'}`}>{totalPct}%</span>
              {valid ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  比例正确
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {totalPct < 100 ? `还差 ${100 - totalPct}%` : `超出 ${totalPct - 100}%`}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              共 {allocList.length} 家机构
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium">
              取消
            </button>
            <button
              onClick={() => valid && onSave(allocList)}
              disabled={!valid}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存分配规则
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

const ToggleRow: React.FC<{ label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
    <div className="flex-1">
      <div className="font-medium text-gray-900 text-sm">{label}</div>
      {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition relative ${value ? 'bg-rose-500' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  </div>
);

export default DonationPlanning;
