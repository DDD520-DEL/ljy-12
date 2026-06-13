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
} from 'lucide-react';
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
} from '@/constants';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const assets = useAppStore((state) => state.assets);
  const heirs = useAppStore((state) => state.heirs);
  const will = useAppStore((state) => state.will);
  const witnesses = useAppStore((state) => state.witnesses);
  const currentUser = useAppStore((state) => state.currentUser);
  const auditLogs = useAppStore((state) => state.auditLogs);
  const getOverdueAssets = useAppStore((state) => state.getOverdueAssets);
  const getWarningAssets = useAppStore((state) => state.getWarningAssets);
  const verifyAsset = useAppStore((state) => state.verifyAsset);
  const generateHealthCheckReminders = useAppStore((state) => state.generateHealthCheckReminders);

  const totalAssetValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
  const assignedAssets = assets.filter((a) => a.heirId).length;
  const verifiedWitnessesCount = witnesses.filter((w) => w.verificationStatus === 'verified').length;
  const daysInactive = will ? daysSince(will.lastActiveAt) : 0;
  const inactivityThreshold = will?.triggerCondition.inactivityDays || 180;
  const inactivityPercent = Math.min((daysInactive / inactivityThreshold) * 100, 100);

  const assetTypeStats = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentLogs = auditLogs.slice(0, 5);

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

  const statCards = [
    {
      title: '数字资产总数',
      value: assets.length,
      icon: FolderKanban,
      color: 'from-blue-500 to-blue-600',
      subtitle: `已分配 ${assignedAssets} 项`,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(assetTypeStats).map(([type, count]) => (
                <div key={type} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500 mt-1">{ASSET_TYPE_LABELS[type as keyof typeof ASSET_TYPE_LABELS]}</p>
                </div>
              ))}
            </div>
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
