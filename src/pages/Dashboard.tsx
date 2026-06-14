import {
  FolderKanban,
  Users,
  FileText,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Zap,
  AlertCircle,
  ShieldCheck,
  Calendar,
  User,
  ArrowRight,
  Bell,
  Settings,
  Play,
  CalendarClock,
  Timer,
  Lock,
  Unlock,
  Hourglass,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import {
  ASSET_TYPE_LABELS,
  WILL_STATUS_LABELS,
  WILL_STATUS_COLORS,
  daysSince,
  formatDate,
  getHealthCheckStatus,
  getDaysSinceLastVerification,
  HEALTH_CHECK_STATUS_LABELS,
  HEALTH_CHECK_STATUS_COLORS,
  HEALTH_CHECK_PERIOD_LABELS,
  EMERGENCY_CONTACT_STATUS_LABELS,
  EMERGENCY_CONTACT_STATUS_COLORS,
  TIME_CAPSULE_STATUS_LABELS,
  TIME_CAPSULE_STATUS_COLORS,
  getTimeCapsuleStatus,
  getDaysUntilUnlock,
} from '@/constants';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const assets = useAppStore((state) => state.assets);
  const heirs = useAppStore((state) => state.heirs);
  const will = useAppStore((state) => state.will);
  const witnesses = useAppStore((state) => state.witnesses);
  const currentUser = useAppStore((state) => state.currentUser);
  const auditLogs = useAppStore((state) => state.auditLogs);
  const emergencyContact = useAppStore((state) => state.emergencyContact);
  const emergencySettings = useAppStore((state) => state.emergencySettings);
  const getOverdueAssets = useAppStore((state) => state.getOverdueAssets);
  const getWarningAssets = useAppStore((state) => state.getWarningAssets);
  const verifyAsset = useAppStore((state) => state.verifyAsset);
  const generateHealthCheckReminders = useAppStore((state) => state.generateHealthCheckReminders);
  const getEmergencyContactStatus = useAppStore((state) => state.getEmergencyContactStatus);
  const notifyEmergencyContact = useAppStore((state) => state.notifyEmergencyContact);
  const emergencyContactConfirmAlive = useAppStore((state) => state.emergencyContactConfirmAlive);
  const emergencyContactConfirmDeceased = useAppStore((state) => state.emergencyContactConfirmDeceased);
  const emergencyContactTriggerWill = useAppStore((state) => state.emergencyContactTriggerWill);
  const emergencyContactExtendPeriod = useAppStore((state) => state.emergencyContactExtendPeriod);
  const checkEmergencyThreshold = useAppStore((state) => state.checkEmergencyThreshold);
  const getCapsuleAssets = useAppStore((state) => state.getCapsuleAssets);
  const getLockedCapsuleAssets = useAppStore((state) => state.getLockedCapsuleAssets);
  const getUnlockedCapsuleAssets = useAppStore((state) => state.getUnlockedCapsuleAssets);

  const totalAssetValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
  const assignedAssets = assets.filter((a) => a.heirId).length;
  const assetsWithFallback = assets.filter((a) => a.heirChain.length > 1).length;
  const verifiedWitnessesCount = witnesses.filter((w) => w.verificationStatus === 'verified').length;
  const daysInactive = will ? daysSince(will.lastActiveAt) : 0;
  const inactivityThreshold = will?.triggerCondition.inactivityDays || 180;
  const inactivityPercent = Math.min((daysInactive / inactivityThreshold) * 100, 100);

  const assetTypeStats = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentLogs = auditLogs.slice(0, 5);

  const capsuleAssets = getCapsuleAssets();
  const lockedCapsuleAssets = getLockedCapsuleAssets();
  const unlockedCapsuleAssets = getUnlockedCapsuleAssets();
  const capsuleAssetValue = capsuleAssets.reduce((sum, a) => sum + (a.value || 0), 0);

  const overdueAssets = getOverdueAssets();
  const warningAssets = getWarningAssets();
  const assetsNeedingAttention = [...overdueAssets, ...warningAssets];

  const handleVerifyAsset = (assetId: string) => {
    if (confirm('确认已完成该资产的健康检查验证吗？')) {
      verifyAsset(assetId);
    }
  };

  const handleGenerateReminders = () => {
    if (confirm('是否生成所有待验证资产的健康检查提醒？')) {
      generateHealthCheckReminders();
    }
  };

  const emergencyStatus = getEmergencyContactStatus();

  const handleEmergencyNotify = () => {
    if (confirm('确认立即通知紧急联系人吗？')) {
      notifyEmergencyContact();
    }
  };

  const handleEmergencyConfirmAlive = () => {
    const note = prompt('请输入备注信息（可选）：');
    if (note !== null) {
      emergencyContactConfirmAlive(note || undefined);
    }
  };

  const handleEmergencyConfirmDeceased = () => {
    if (confirm('⚠️ 确认用户已身故？此操作将触发后续流程。')) {
      const note = prompt('请输入备注信息（可选）：');
      if (note !== null) {
        emergencyContactConfirmDeceased(note || undefined);
      }
    }
  };

  const handleEmergencyTriggerWill = () => {
    if (confirm('⚠️ 确定要触发遗嘱执行吗？此操作不可撤销！')) {
      const note = prompt('请输入备注信息（可选）：');
      if (note !== null) {
        emergencyContactTriggerWill(note || undefined);
      }
    }
  };

  const handleEmergencyExtendPeriod = () => {
    const daysStr = prompt('请输入延长的天数（1-365）：', '30');
    if (daysStr) {
      const days = parseInt(daysStr, 10);
      if (days >= 1 && days <= 365) {
        const note = prompt('请输入备注信息（可选）：');
        if (note !== null) {
          emergencyContactExtendPeriod(days, note || undefined);
        }
      } else {
        alert('请输入1-365之间的天数');
      }
    }
  };

  const handleCheckThreshold = () => {
    checkEmergencyThreshold();
  };

  const statCards = [
    {
      title: '数字资产总数',
      value: assets.length,
      icon: FolderKanban,
      color: 'from-blue-500 to-blue-600',
      subtitle: `已分配 ${assignedAssets} 项，${assetsWithFallback} 项设兜底`,
      link: '/assets',
    },
    {
      title: '待验证资产',
      value: assetsNeedingAttention.length,
      icon: AlertTriangle,
      color: overdueAssets.length > 0 ? 'from-red-500 to-red-600' : 'from-amber-500 to-amber-600',
      subtitle: `逾期 ${overdueAssets.length} 项，预警 ${warningAssets.length} 项`,
      link: '/assets',
    },
    {
      title: '遗产继承人',
      value: heirs.length,
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      subtitle: `${heirs.filter((h) => h.isVerified).length} 人已验证`,
      link: '/heirs',
    },
    {
      title: '资产估值',
      value: `¥${totalAssetValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      subtitle: '估算总价值',
      link: '/assets',
    },
    {
      title: '时间胶囊',
      value: capsuleAssets.length,
      icon: Timer,
      color: 'from-violet-500 to-violet-600',
      subtitle: `${lockedCapsuleAssets.length} 项锁定中，${unlockedCapsuleAssets.length} 项已解锁`,
      link: '/assets',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来，{currentUser?.name}</h1>
          <p className="text-gray-500 mt-1">管理您的数字遗产，确保资产安全传承</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            'px-4 py-2 rounded-full text-sm font-medium',
            WILL_STATUS_COLORS[will?.status || 'draft']
          )}>
            遗嘱状态：{WILL_STATUS_LABELS[will?.status || 'draft']}
          </div>
          <div className="text-sm text-gray-500">
            见证人：{verifiedWitnessesCount}/{witnesses.length} 已验证
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                <p className="text-sm text-gray-500 mt-1">{card.title}</p>
                <p className="text-xs text-gray-400 mt-2">{card.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">活跃度监控</h2>
              <span className="text-sm text-gray-500">上次活动：{will ? formatDate(will.lastActiveAt) : '-'}</span>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">距离触发阈值</span>
                <span className="text-sm font-medium text-gray-900">
                  {daysInactive} / {inactivityThreshold} 天
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    inactivityPercent > 80 ? 'bg-red-500' : inactivityPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                  style={{ width: `${inactivityPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {inactivityPercent < 50 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500 inline mr-1" />
                    账号活跃度正常
                  </>
                ) : inactivityPercent < 80 ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-500 inline mr-1" />
                    请注意保持登录
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-500 inline mr-1" />
                    即将触发遗嘱执行
                  </>
                )}
              </p>
            </div>

            {emergencySettings.enabled && emergencyContact && (
              <div className={cn(
                'rounded-xl p-4 mb-6 border',
                emergencyStatus.isOverThreshold
                  ? 'bg-rose-50 border-rose-200'
                  : emergencyContact.status === 'notified'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className={cn(
                      'w-5 h-5',
                      emergencyStatus.isOverThreshold ? 'text-rose-500' : 'text-blue-500'
                    )} />
                    <h3 className="font-semibold text-gray-900">紧急联系人状态</h3>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      EMERGENCY_CONTACT_STATUS_COLORS[emergencyContact.status]
                    )}>
                      {EMERGENCY_CONTACT_STATUS_LABELS[emergencyContact.status]}
                    </span>
                  </div>
                  <Link
                    to="/mfa"
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    设置
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="bg-white/80 rounded-lg p-2.5">
                    <p className="text-xs text-gray-500">紧急联系人</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{emergencyContact.name}</p>
                    <p className="text-xs text-gray-400">{emergencyContact.relationship}</p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2.5">
                    <p className="text-xs text-gray-500">通知阈值</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{emergencyStatus.thresholdDays} 天</p>
                    <p className="text-xs text-gray-400">
                      {emergencyStatus.isOverThreshold ? '已超过' : `还剩 ${emergencyStatus.thresholdDays - emergencyStatus.daysInactive} 天`}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2.5">
                    <p className="text-xs text-gray-500">确认窗口期</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{emergencyStatus.confirmationWindowDays} 天</p>
                    <p className="text-xs text-gray-400">
                      {emergencyContact.notifiedAt
                        ? emergencyStatus.isInConfirmationWindow
                          ? `剩余 ${emergencyStatus.confirmationWindowDays - (emergencyStatus.daysSinceNotification || 0)} 天`
                          : '已逾期'
                        : '未触发'}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2.5">
                    <p className="text-xs text-gray-500">联系邮箱</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{emergencyContact.email}</p>
                    {emergencyContact.phone && (
                      <p className="text-xs text-gray-400">{emergencyContact.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {emergencyContact.status === 'pending' && (
                    <button
                      onClick={handleEmergencyNotify}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                      立即通知
                    </button>
                  )}
                  {emergencyContact.status === 'notified' && (
                    <>
                      <button
                        onClick={handleEmergencyConfirmAlive}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        确认健在
                      </button>
                      <button
                        onClick={handleEmergencyConfirmDeceased}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        确认身故
                      </button>
                      <button
                        onClick={handleEmergencyExtendPeriod}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <CalendarClock className="w-4 h-4" />
                        延长观察期
                      </button>
                    </>
                  )}
                  {emergencyContact.status === 'confirmed_deceased' && (
                    <button
                      onClick={handleEmergencyTriggerWill}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      触发遗嘱执行
                    </button>
                  )}
                  {emergencyContact.status !== 'notified' && (
                    <button
                      onClick={handleCheckThreshold}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      检查阈值
                    </button>
                  )}
                </div>
              </div>
            )}

            {!emergencySettings.enabled && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">紧急联系人机制未启用</p>
                      <p className="text-xs text-gray-500">
                        设置紧急联系人后，系统将在您长期未登录时先通知其确认状态，为您的数字遗产提供双重保障
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/mfa"
                    className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    去设置
                  </Link>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(assetTypeStats).map(([type, count]) => (
                <div key={type} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">{ASSET_TYPE_LABELS[type as keyof typeof ASSET_TYPE_LABELS]}</p>
                </div>
              ))}
            </div>

            {capsuleAssets.length > 0 && (
              <div className="mt-6 rounded-xl border border-violet-200 bg-violet-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-violet-600" />
                    <h3 className="font-semibold text-violet-900">时间胶囊资产</h3>
                    <span className="text-xs text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                      {capsuleAssets.length} 项
                    </span>
                  </div>
                  <Link
                    to="/assets"
                    className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                  >
                    查看详情 <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-xs text-violet-600 mb-3">
                  时间胶囊资产在解锁日期前对继承人和见证人完全隐藏，到期后自动解密进入分配环节
                </p>
                <div className="space-y-2">
                  {capsuleAssets.map((asset) => {
                    const capsuleStatus = getTimeCapsuleStatus(asset.timeCapsule!);
                    const daysLeft = getDaysUntilUnlock(asset.timeCapsule!.unlockDate);
                    return (
                      <div key={asset.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-violet-100">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center',
                            capsuleStatus === 'locked' ? 'bg-violet-100' : 'bg-emerald-100'
                          )}>
                            {capsuleStatus === 'locked' ? (
                              <Lock className="w-4 h-4 text-violet-600" />
                            ) : (
                              <Unlock className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-medium',
                                TIME_CAPSULE_STATUS_COLORS[capsuleStatus]
                              )}>
                                {TIME_CAPSULE_STATUS_LABELS[capsuleStatus]}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {capsuleStatus === 'locked'
                                  ? `${daysLeft} 天后解锁`
                                  : capsuleStatus === 'expired'
                                  ? '已到期，待解密'
                                  : '已解锁'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {asset.value !== undefined && asset.value > 0 && (
                          <span className="text-sm font-medium text-violet-600">
                            ¥{asset.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-violet-600">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    锁定中 {lockedCapsuleAssets.length} 项
                  </span>
                  <span className="flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    已解锁 {unlockedCapsuleAssets.length} 项
                  </span>
                  <span>
                    胶囊资产估值：¥{capsuleAssetValue.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {assetsNeedingAttention.length > 0 && (
            <div className={cn(
              'rounded-2xl p-6 shadow-sm border',
              overdueAssets.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    overdueAssets.length > 0 ? 'bg-red-500' : 'bg-amber-500'
                  )}>
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">资产健康检查提醒</h2>
                    <p className="text-sm text-gray-600">
                      有 {assetsNeedingAttention.length} 项资产需要验证
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateReminders}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium border border-gray-200"
                >
                  生成通知
                </button>
              </div>

              <div className="space-y-3">
                {assetsNeedingAttention.map((asset) => {
                  const isOverdue = overdueAssets.some(a => a.id === asset.id);
                  const status = getHealthCheckStatus(
                    asset.lastVerifiedAt,
                    asset.healthCheckPeriod,
                    asset.customPeriodDays,
                    asset.reminderRule.daysBefore
                  );
                  const daysSinceVerification = getDaysSinceLastVerification(asset.lastVerifiedAt);

                  return (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          isOverdue ? 'bg-red-100' : 'bg-amber-100'
                        )}>
                          {isOverdue ? (
                            <AlertCircle className={cn('w-5 h-5', isOverdue ? 'text-red-600' : 'text-amber-600')} />
                          ) : (
                            <Calendar className={cn('w-5 h-5', isOverdue ? 'text-red-600' : 'text-amber-600')} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{asset.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                              HEALTH_CHECK_STATUS_COLORS[status]
                            )}>
                              {HEALTH_CHECK_STATUS_LABELS[status]}
                            </span>
                            {daysSinceVerification !== null && (
                              <span className="text-xs text-gray-500">
                                上次验证：{daysSinceVerification} 天前
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              周期：{HEALTH_CHECK_PERIOD_LABELS[asset.healthCheckPeriod]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleVerifyAsset(asset.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        验证
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/assets"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                >
                  查看全部资产 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
          <div className="space-y-3">
            <Link
              to="/assets"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">添加数字资产</p>
                <p className="text-xs text-gray-500">登记您的数字资产清单</p>
              </div>
            </Link>

            <Link
              to="/heirs"
              className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">管理继承人</p>
                <p className="text-xs text-gray-500">设置遗产受益人</p>
              </div>
            </Link>

            <Link
              to="/will"
              className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">设置遗嘱</p>
                <p className="text-xs text-gray-500">配置触发条件和执行流程</p>
              </div>
            </Link>

            <Link
              to="/mfa"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">安全设置</p>
                <p className="text-xs text-gray-500">多因素身份验证</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">资产概览</h2>
          <Link to="/assets" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {assets.slice(0, 5).map((asset) => (
            <div key={asset.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{asset.name}</span>
                  <span className="text-xs text-gray-500">{ASSET_TYPE_LABELS[asset.type]}</span>
                  {asset.value !== undefined && asset.value > 0 && (
                    <span className="text-xs font-medium text-emerald-600 ml-auto">
                      ¥{asset.value.toLocaleString()}
                    </span>
                  )}
                </div>
                {asset.heirChain.length > 0 ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    {asset.heirChain.map((chainHeirId, idx) => {
                      const chainHeir = heirs.find((h) => h.id === chainHeirId);
                      if (!chainHeir) return null;
                      return (
                        <span key={chainHeirId} className="inline-flex items-center gap-0.5">
                          {idx > 0 && <ArrowRight className="w-3 h-3 text-gray-300" />}
                          <span
                            className={cn(
                              'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs',
                              idx === 0
                                ? 'bg-emerald-100 text-emerald-700 font-medium'
                                : 'bg-gray-100 text-gray-500'
                            )}
                          >
                            <User className="w-3 h-3" />
                            {chainHeir.name}
                          </span>
                        </span>
                      );
                    })}
                    {asset.heirChain.length > 1 && (
                      <span className="text-[10px] text-gray-400">
                        ({asset.heirChain.length}级继承链)
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-amber-600">未分配继承人</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">最近操作记录</h2>
          <Link to="/audit" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{log.description}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(log.timestamp)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-gray-400 font-mono">
                  {log.transactionHash.slice(0, 8)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
