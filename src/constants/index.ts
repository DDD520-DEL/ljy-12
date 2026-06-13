import { AssetType, HeirRelationship, TriggerType, WillStatus, UserRole, AuditActionType, HealthCheckPeriod, HealthCheckStatus } from '@/types';

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  social_media: '社交媒体',
  cloud_storage: '云存储',
  crypto_wallet: '加密货币钱包',
  subscription: '订阅服务',
  email: '电子邮箱',
  other: '其他',
};

export const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  social_media: 'share2',
  cloud_storage: 'cloud',
  crypto_wallet: 'wallet',
  subscription: 'repeat',
  email: 'mail',
  other: 'folder',
};

export const RELATIONSHIP_LABELS: Record<HeirRelationship, string> = {
  spouse: '配偶',
  child: '子女',
  parent: '父母',
  sibling: '兄弟姐妹',
  friend: '朋友',
  lawyer: '律师',
  other: '其他',
};

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  inactivity_days: '连续未登录',
  date_based: '指定日期',
  manual: '手动触发',
  death_certificate: '死亡证明',
};

export const WILL_STATUS_LABELS: Record<WillStatus, string> = {
  draft: '草稿',
  active: '已生效',
  triggered: '已触发',
  executing: '执行中',
  completed: '已完成',
};

export const WILL_STATUS_COLORS: Record<WillStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  triggered: 'bg-yellow-100 text-yellow-800',
  executing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  owner: '资产所有人',
  heir: '继承人',
  witness: '见证人',
  lawyer: '律师',
  admin: '管理员',
};

export const AUDIT_ACTION_LABELS: Record<AuditActionType, string> = {
  asset_created: '创建资产',
  asset_updated: '更新资产',
  asset_deleted: '删除资产',
  heir_added: '添加继承人',
  heir_removed: '移除继承人',
  will_updated: '更新遗嘱',
  will_triggered: '触发遗嘱',
  mfa_enabled: '启用MFA',
  mfa_disabled: '禁用MFA',
  login: '登录',
  logout: '登出',
  asset_transferred: '资产转移',
  witness_approved: '见证人批准',
  lawyer_approved: '律师批准',
  notification_sent: '发送通知',
  asset_verified: '资产验证',
  healthcheck_reminder: '健康检查提醒',
  healthcheck_settings_updated: '健康检查设置更新',
};

export const HEALTH_CHECK_PERIOD_LABELS: Record<HealthCheckPeriod, string> = {
  '7_days': '每周',
  '30_days': '每月',
  '90_days': '每季度',
  '180_days': '每半年',
  '365_days': '每年',
  'custom': '自定义',
};

export const HEALTH_CHECK_PERIOD_DAYS: Record<HealthCheckPeriod, number> = {
  '7_days': 7,
  '30_days': 30,
  '90_days': 90,
  '180_days': 180,
  '365_days': 365,
  'custom': 0,
};

export const HEALTH_CHECK_STATUS_LABELS: Record<HealthCheckStatus, string> = {
  'normal': '正常',
  'warning': '即将到期',
  'overdue': '已逾期',
  'never': '未验证',
};

export const HEALTH_CHECK_STATUS_COLORS: Record<HealthCheckStatus, string> = {
  'normal': 'bg-green-100 text-green-700',
  'warning': 'bg-amber-100 text-amber-700',
  'overdue': 'bg-red-100 text-red-700',
  'never': 'bg-gray-100 text-gray-700',
};

export const DEFAULT_HEALTH_CHECK_PERIOD: HealthCheckPeriod = '90_days';
export const DEFAULT_REMINDER_DAYS = 7;

export const DEFAULT_INACTIVITY_DAYS = 180;

export const DEFAULT_WITNESS_COUNT = 2;

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const daysSince = (dateString: string): number => {
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getHealthCheckPeriodDays = (period: HealthCheckPeriod, customDays?: number): number => {
  if (period === 'custom') {
    if (customDays && customDays > 0) {
      return customDays;
    }
    return HEALTH_CHECK_PERIOD_DAYS[DEFAULT_HEALTH_CHECK_PERIOD];
  }
  return HEALTH_CHECK_PERIOD_DAYS[period];
};

export const getDaysSinceLastVerification = (lastVerifiedAt?: string): number | null => {
  if (!lastVerifiedAt) return null;
  return daysSince(lastVerifiedAt);
};

export const getHealthCheckStatus = (
  lastVerifiedAt: string | undefined,
  period: HealthCheckPeriod,
  customDays?: number,
  reminderDays?: number
): HealthCheckStatus => {
  if (!lastVerifiedAt) return 'never';

  const daysSinceVerification = daysSince(lastVerifiedAt);
  const periodDays = getHealthCheckPeriodDays(period, customDays);
  const reminderOffset = Math.min(reminderDays || DEFAULT_REMINDER_DAYS, Math.max(periodDays - 1, 1));
  const reminderThreshold = periodDays - reminderOffset;

  if (daysSinceVerification >= periodDays) return 'overdue';
  if (daysSinceVerification >= reminderThreshold && reminderThreshold > 0) return 'warning';
  return 'normal';
};

export const getNextVerificationDate = (
  lastVerifiedAt: string | undefined,
  period: HealthCheckPeriod,
  customDays?: number
): string => {
  if (!lastVerifiedAt) {
    return '未设置';
  }
  const lastDate = new Date(lastVerifiedAt);
  const periodDays = getHealthCheckPeriodDays(period, customDays);
  lastDate.setDate(lastDate.getDate() + periodDays);
  return formatDate(lastDate.toISOString());
};
