import { useState } from 'react';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Loader,
  Mail,
  Phone,
  User,
  RefreshCw,
  FileText,
  History,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  RotateCcw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  X,
  Filter,
  Search,
  FolderCheck,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  HEIR_VERIFICATION_STATUS_LABELS,
  HEIR_VERIFICATION_STATUS_COLORS,
  VERIFICATION_MATERIAL_TYPE_LABELS,
  VERIFICATION_HISTORY_ACTION_LABELS,
  formatDate,
  RELATIONSHIP_LABELS,
} from '@/constants';
import { cn } from '@/lib/utils';
import type { HeirVerificationStatus, VerificationMaterial, VerificationHistoryRecord } from '@/types';

export default function HeirVerificationCenter() {
  const heirs = useAppStore((state) => state.heirs);
  const sendHeirVerificationReminder = useAppStore((state) => state.sendHeirVerificationReminder);
  const resetHeirVerification = useAppStore((state) => state.resetHeirVerification);
  const verifyHeir = useAppStore((state) => state.verifyHeir);
  const rejectHeirVerification = useAppStore((state) => state.rejectHeirVerification);
  const approveHeirMaterial = useAppStore((state) => state.approveHeirMaterial);
  const rejectHeirMaterial = useAppStore((state) => state.rejectHeirMaterial);
  const getHeirVerificationOverview = useAppStore((state) => state.getHeirVerificationOverview);
  const currentUser = useAppStore((state) => state.currentUser);

  const [expandedHeirId, setExpandedHeirId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'materials' | 'history'>('materials');
  const [statusFilter, setStatusFilter] = useState<HeirVerificationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectType, setRejectType] = useState<'heir' | 'material'>('heir');
  const [rejectTargetId, setRejectTargetId] = useState<string>('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonContent, setReasonContent] = useState('');

  const overview = getHeirVerificationOverview();

  const filteredHeirs = heirs.filter((heir) => {
    const status = heir.verification?.status || 'not_started';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesSearch = heir.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      heir.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSendReminder = (heirId: string) => {
    sendHeirVerificationReminder(heirId);
  };

  const handleResetVerification = (heirId: string, heirName: string) => {
    if (confirm(`确定要重置 ${heirName} 的验证流程吗？所有已提交的材料将被清空。`)) {
      resetHeirVerification(heirId);
    }
  };

  const handleVerifyHeir = (heirId: string, heirName: string) => {
    if (confirm(`确定要手动通过 ${heirName} 的身份验证吗？`)) {
      verifyHeir(heirId);
    }
  };

  const handleOpenRejectModal = (type: 'heir' | 'material', targetId: string) => {
    setRejectType(type);
    setRejectTargetId(targetId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      alert('请填写拒绝原因');
      return;
    }
    if (rejectType === 'heir') {
      rejectHeirVerification(rejectTargetId, rejectReason);
    } else {
      rejectHeirMaterial(expandedHeirId || '', rejectTargetId, rejectReason);
    }
    setShowRejectModal(false);
    setRejectReason('');
  };

  const handleApproveMaterial = (materialId: string) => {
    approveHeirMaterial(expandedHeirId || '', materialId);
  };

  const handleViewReason = (reason: string) => {
    setReasonContent(reason);
    setShowReasonModal(true);
  };

  const getStatusColor = (status: HeirVerificationStatus) => {
    return HEIR_VERIFICATION_STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
  };

  const getMaterialStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMaterialStatusLabel = (status: string, hasUploaded: boolean) => {
    if (!hasUploaded) return '未提交';
    switch (status) {
      case 'verified': return '已通过';
      case 'rejected': return '已驳回';
      case 'pending': return '待审核';
      default: return '待提交';
    }
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">继承人身份验证中心</h1>
          <p className="text-gray-500 mt-1">集中管理所有继承人的身份验证进度和材料审核</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview.total}</p>
              <p className="text-sm text-gray-500">继承人总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BadgeCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview.verified}</p>
              <p className="text-sm text-gray-500">已验证</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Loader className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview.inProgress}</p>
              <p className="text-sm text-gray-500">进行中</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview.rejected}</p>
              <p className="text-sm text-gray-500">已拒绝</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overview.pending}</p>
              <p className="text-sm text-gray-500">未开始</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">身份验证机制</h3>
            <p className="text-emerald-100 mt-1">
              每位继承人需提交身份证明材料，经管理员审核通过后方可参与遗嘱执行。验证状态将实时同步到遗嘱执行页面。
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">
              {overview.total > 0 ? Math.round((overview.verified / overview.total) * 100) : 0}%
            </p>
            <p className="text-sm text-emerald-200">整体验证完成率</p>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${overview.total > 0 ? (overview.verified / overview.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-emerald-500" />
            继承人验证列表
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索继承人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-56"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as HeirVerificationStatus | 'all')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="not_started">未开始</option>
                <option value="in_progress">进行中</option>
                <option value="verified">已验证</option>
                <option value="rejected">已拒绝</option>
                <option value="expired">已过期</option>
              </select>
            </div>
          </div>
        </div>

        {filteredHeirs.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无匹配的继承人</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHeirs.map((heir) => {
              const verification = heir.verification;
              const status = verification?.status || 'not_started';
              const isExpanded = expandedHeirId === heir.id;
              const badge = getPriorityBadge(heir.priority);

              return (
                <div
                  key={heir.id}
                  className={cn(
                    'border rounded-xl overflow-hidden transition-all',
                    isExpanded ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedHeirId(isExpanded ? null : heir.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <span
                            className={cn(
                              'absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                              badge.color
                            )}
                          >
                            {heir.priority}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900">{heir.name}</h4>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                getStatusColor(status)
                              )}
                            >
                              {HEIR_VERIFICATION_STATUS_LABELS[status]}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {RELATIONSHIP_LABELS[heir.relationship]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {heir.email}
                            </span>
                            {heir.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" />
                                {heir.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">验证进度</span>
                            <span className="text-lg font-bold text-emerald-600">
                              {verification?.progress || 0}%
                            </span>
                          </div>
                          <div className="w-40 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-300',
                                status === 'verified' ? 'bg-green-500' :
                                status === 'rejected' ? 'bg-red-500' : 'bg-emerald-500'
                              )}
                              style={{ width: `${verification?.progress || 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {verification?.verifiedMaterials || 0}/{verification?.totalMaterialsRequired || 0} 项材料已通过
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isExpanded && verification && (
                    <div className="border-t border-gray-100 p-5 bg-white">
                      <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                        <button
                          onClick={() => setActiveTab('materials')}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            activeTab === 'materials'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          <FileText className="w-4 h-4" />
                          材料清单
                        </button>
                        <button
                          onClick={() => setActiveTab('history')}
                          className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                            activeTab === 'history'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          <History className="w-4 h-4" />
                          验证历史
                        </button>

                        <div className="flex-1" />

                        <div className="flex items-center gap-2">
                          {status !== 'verified' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendReminder(heir.id);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                              发送提醒
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetVerification(heir.id, heir.name);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                            重置验证
                          </button>
                          {status !== 'verified' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVerifyHeir(heir.id, heir.name);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              手动通过
                            </button>
                          )}
                          {status !== 'rejected' && status !== 'verified' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRejectModal('heir', heir.id);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              拒绝验证
                            </button>
                          )}
                        </div>
                      </div>

                      {activeTab === 'materials' && (
                        <div className="space-y-3">
                          {verification.materials.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p>暂无验证材料要求</p>
                            </div>
                          ) : (
                            verification.materials.map((material) => {
                              const hasUploaded = !!material.uploadedAt;
                              return (
                                <div
                                  key={material.id}
                                  className={cn(
                                    'p-4 rounded-xl border transition-all',
                                    material.status === 'verified' ? 'border-green-200 bg-green-50/50' :
                                    material.status === 'rejected' ? 'border-red-200 bg-red-50/50' :
                                    hasUploaded ? 'border-amber-200 bg-amber-50/50' :
                                    'border-gray-200 bg-gray-50/50'
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        'w-10 h-10 rounded-lg flex items-center justify-center',
                                        material.status === 'verified' ? 'bg-green-100' :
                                        material.status === 'rejected' ? 'bg-red-100' :
                                        hasUploaded ? 'bg-amber-100' : 'bg-gray-100'
                                      )}>
                                        <FileText className={cn(
                                          'w-5 h-5',
                                          material.status === 'verified' ? 'text-green-600' :
                                          material.status === 'rejected' ? 'text-red-600' :
                                          hasUploaded ? 'text-amber-600' : 'text-gray-500'
                                        )} />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-medium text-gray-900">{material.name}</h5>
                                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                            {VERIFICATION_MATERIAL_TYPE_LABELS[material.type]}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                          <span className="flex items-center gap-1">
                                            {getMaterialStatusIcon(material.status)}
                                            {getMaterialStatusLabel(material.status, hasUploaded)}
                                          </span>
                                          {material.uploadedAt && (
                                            <span>提交于 {formatDate(material.uploadedAt)}</span>
                                          )}
                                          {material.verifiedAt && (
                                            <span>审核于 {formatDate(material.verifiedAt)}</span>
                                          )}
                                        </div>
                                        {material.note && (
                                          <div className="mt-2 text-xs text-gray-600 bg-white/80 rounded-lg px-3 py-2 inline-flex items-start gap-2">
                                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                            <span>{material.note}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {hasUploaded && material.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleApproveMaterial(material.id);
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                          >
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                            通过
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenRejectModal('material', material.id);
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                          >
                                            <ThumbsDown className="w-3.5 h-3.5" />
                                            驳回
                                          </button>
                                        </>
                                      )}
                                      {material.status === 'rejected' && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewReason(material.note || '');
                                          }}
                                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          查看驳回原因
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}

                      {activeTab === 'history' && (
                        <div className="relative">
                          {verification.history.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p>暂无验证历史记录</p>
                            </div>
                          ) : (
                            <div className="space-y-0">
                              {verification.history.map((record, index) => (
                                <HistoryItem key={record.id} record={record} isLast={index === verification.history.length - 1} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {status === 'rejected' && verification.rejectionReason && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <h5 className="font-medium text-red-800">验证被拒绝原因</h5>
                              <p className="text-sm text-red-700 mt-1">{verification.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">邀请时间</p>
                          <p className="font-medium text-gray-900 mt-1">{formatDate(verification.invitedAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">提醒次数</p>
                          <p className="font-medium text-gray-900 mt-1">{verification.reminderCount} 次</p>
                        </div>
                        <div>
                          <p className="text-gray-500">最后提醒</p>
                          <p className="font-medium text-gray-900 mt-1">
                            {verification.lastReminderAt ? formatDate(verification.lastReminderAt) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">完成验证</p>
                          <p className="font-medium text-gray-900 mt-1">
                            {verification.verifiedAt ? formatDate(verification.verifiedAt) : '-'}
                          </p>
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

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {rejectType === 'heir' ? '拒绝验证' : '驳回材料'}
              </h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  {rejectType === 'heir'
                    ? '拒绝该继承人的身份验证后，将无法参与遗嘱执行流程。请填写详细的拒绝原因。'
                    : '驳回该材料后，继承人需要重新提交。请填写详细的驳回原因。'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {rejectType === 'heir' ? '拒绝原因' : '驳回原因'} *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  placeholder={rejectType === 'heir'
                    ? '请填写拒绝该继承人人身份验证的原因...'
                    : '请填写驳回该材料的原因，如材料不清晰、信息不符等...'
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认{rejectType === 'heir' ? '拒绝' : '驳回'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">查看原因</h2>
              <button
                onClick={() => setShowReasonModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700 whitespace-pre-wrap">{reasonContent || '暂无说明'}</p>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-100">
              <button
                onClick={() => setShowReasonModal(false)}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryItem({ record, isLast }: { record: VerificationHistoryRecord; isLast: boolean }) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'invited':
        return <Mail className="w-4 h-4" />;
      case 'material_submitted':
        return <FileText className="w-4 h-4" />;
      case 'material_approved':
        return <ThumbsUp className="w-4 h-4" />;
      case 'material_rejected':
        return <ThumbsDown className="w-4 h-4" />;
      case 'verified':
        return <BadgeCheck className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'reset':
        return <RefreshCw className="w-4 h-4" />;
      case 'reminder_sent':
        return <Send className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'invited':
        return 'bg-blue-100 text-blue-600';
      case 'material_submitted':
        return 'bg-amber-100 text-amber-600';
      case 'material_approved':
      case 'verified':
        return 'bg-green-100 text-green-600';
      case 'material_rejected':
      case 'rejected':
        return 'bg-red-100 text-red-600';
      case 'reset':
        return 'bg-gray-100 text-gray-600';
      case 'reminder_sent':
        return 'bg-cyan-100 text-cyan-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="relative pl-10 pb-6 last:pb-0">
      {!isLast && (
        <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-gray-200" />
      )}
      <div className={cn(
        'absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center',
        getActionColor(record.action)
      )}>
        {getActionIcon(record.action)}
      </div>
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 text-sm">
              {VERIFICATION_HISTORY_ACTION_LABELS[record.action] || record.action}
            </span>
            {record.materialName && (
              <span className="text-xs px-2 py-0.5 bg-white text-gray-600 rounded border border-gray-200">
                {record.materialName}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{formatDate(record.timestamp)}</span>
        </div>
        {record.operatorName && (
          <p className="text-xs text-gray-500 mt-1">
            操作人：{record.operatorName}
            {record.operatorRole && ` (${record.operatorRole === 'admin' ? '管理员' : record.operatorRole === 'owner' ? '资产所有人' : record.operatorRole === 'heir' ? '继承人' : record.operatorRole})`}
          </p>
        )}
        {record.note && (
          <p className="text-sm text-gray-600 mt-2 bg-white/80 rounded-lg px-3 py-2">{record.note}</p>
        )}
      </div>
    </div>
  );
}
