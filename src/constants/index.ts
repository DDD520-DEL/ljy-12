import { AssetType, HeirRelationship, TriggerType, WillStatus, UserRole, AuditActionType, HealthCheckPeriod, HealthCheckStatus, ApprovalGroupStatus, WitnessApprovalDecision, ConditionField, ConditionOperator, TimeCapsuleStatus, CredentialCategory, CredentialAccessLevel, CharityCategory, DonationItemType, DonationStatus, Charity, WillTemplate, WillTemplateCategory, HeirVerificationStatus, VerificationMaterialType, AssetNoteCategory } from '@/types';

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
  approval_group_created: '创建审批组',
  approval_group_updated: '更新审批组',
  approval_group_deleted: '删除审批组',
  witness_assigned_to_group: '分配见证人到组',
  witness_removed_from_group: '从组移除见证人',
  witness_approval_submitted: '提交审批意见',
  approval_group_completed: '审批组完成',
  will_execution_advanced: '遗嘱执行推进',
  branch_condition_evaluated: '条件分支评估',
  branch_path_triggered: '条件分支触发',
  bulk_heir_assigned: '批量分配继承人',
  bulk_type_updated: '批量修改分类',
  bulk_export_csv: '批量导出资产清单',
  emergency_contact_added: '添加紧急联系人',
  emergency_contact_updated: '更新紧急联系人',
  emergency_contact_removed: '移除紧急联系人',
  emergency_contact_verified: '紧急联系人已验证',
  emergency_contact_notified: '通知紧急联系人',
  emergency_contact_confirmed_alive: '紧急联系人确认健在',
  emergency_contact_confirmed_deceased: '紧急联系人确认身故',
  emergency_contact_triggered_will: '紧急联系人触发遗嘱',
  emergency_contact_extended_period: '紧急联系人延长观察期',
  emergency_settings_updated: '紧急联系人设置更新',
  time_capsule_created: '创建时间胶囊',
  time_capsule_updated: '更新时间胶囊',
  time_capsule_unlocked: '手动解锁时间胶囊',
  time_capsule_auto_decrypted: '时间胶囊自动解密',
  credential_created: '创建凭据',
  credential_updated: '更新凭据',
  credential_deleted: '删除凭据',
  credential_viewed: '查看凭据元数据',
  credential_revealed: '揭露凭据明文',
  credential_decrypted_for_heir: '向继承人解密凭据',
  master_password_set: '设置主密码',
  master_password_changed: '修改主密码',
  vault_locked: '锁定保险箱',
  vault_unlocked: '解锁保险箱',
  heir_verification_reminder_sent: '发送验证提醒',
  heir_verification_reset: '重置验证流程',
  heir_verification_completed: '完成继承人验证',
  heir_verification_rejected: '拒绝继承人验证',
  heir_verification_material_submitted: '提交验证材料',
  heir_verification_material_approved: '通过验证材料',
  heir_verification_material_rejected: '驳回验证材料',
  donation_plan_created: '创建捐赠规划',
  donation_plan_updated: '更新捐赠规划',
  donation_plan_deleted: '删除捐赠规划',
  donation_item_added: '添加捐赠项目',
  donation_item_removed: '移除捐赠项目',
  donation_allocation_updated: '更新分配规则',
  donation_execution_started: '开始执行捐赠',
  donation_execution_completed: '完成执行捐赠',
  donation_step_completed: '捐赠步骤完成',
};

export const APPROVAL_GROUP_STATUS_LABELS: Record<ApprovalGroupStatus, string> = {
  pending: '待审批',
  partial: '部分通过',
  approved: '已通过',
  rejected: '已拒绝',
};

export const APPROVAL_GROUP_STATUS_COLORS: Record<ApprovalGroupStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  partial: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export const WITNESS_APPROVAL_DECISION_LABELS: Record<WitnessApprovalDecision, string> = {
  pending: '待决定',
  approved: '同意',
  rejected: '拒绝',
};

export const WITNESS_APPROVAL_DECISION_COLORS: Record<WitnessApprovalDecision, string> = {
  pending: 'bg-gray-100 text-gray-600',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export const HEIR_VERIFICATION_STATUS_LABELS: Record<HeirVerificationStatus, string> = {
  not_started: '未开始',
  in_progress: '进行中',
  verified: '已验证',
  rejected: '已拒绝',
  expired: '已过期',
};

export const HEIR_VERIFICATION_STATUS_COLORS: Record<HeirVerificationStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
};

export const VERIFICATION_MATERIAL_TYPE_LABELS: Record<VerificationMaterialType, string> = {
  id_card: '身份证',
  household_register: '户口本',
  birth_certificate: '出生证明',
  marriage_certificate: '结婚证',
  death_certificate: '死亡证明',
  power_of_attorney: '授权委托书',
  other: '其他材料',
};

export const VERIFICATION_HISTORY_ACTION_LABELS: Record<string, string> = {
  invited: '邀请验证',
  material_submitted: '提交材料',
  material_approved: '材料通过',
  material_rejected: '材料驳回',
  verified: '验证通过',
  rejected: '验证拒绝',
  reset: '重置验证',
  reminder_sent: '发送提醒',
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

export const DEFAULT_EMERGENCY_THRESHOLD_DAYS = 90;

export const DEFAULT_EMERGENCY_CONFIRMATION_WINDOW = 7;

export const EMERGENCY_CONTACT_STATUS_LABELS: Record<string, string> = {
  pending: '待配置',
  notified: '已通知',
  confirmed_alive: '确认健在',
  confirmed_deceased: '确认身故',
  triggered_will: '已触发遗嘱',
  extended_period: '已延长观察期',
};

export const EMERGENCY_CONTACT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  notified: 'bg-amber-100 text-amber-700',
  confirmed_alive: 'bg-green-100 text-green-700',
  confirmed_deceased: 'bg-red-100 text-red-700',
  triggered_will: 'bg-purple-100 text-purple-700',
  extended_period: 'bg-blue-100 text-blue-700',
};

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

export const EXECUTION_ACTION_LABELS: Record<string, string> = {
  notify: '发送通知',
  transfer: '移交资产',
  reveal_credentials: '披露凭证',
  delete_data: '删除数据',
};

export const EXECUTION_ACTION_COLORS: Record<string, string> = {
  notify: 'bg-blue-100 text-blue-700 border-blue-200',
  transfer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  reveal_credentials: 'bg-amber-100 text-amber-700 border-amber-200',
  delete_data: 'bg-red-100 text-red-700 border-red-200',
};

export const EXECUTION_ACTION_ICONS: Record<string, string> = {
  notify: 'bell',
  transfer: 'folder-kanban',
  reveal_credentials: 'key',
  delete_data: 'trash',
};

export const SIMULATION_ROLE_LABELS: Record<string, string> = {
  heir: '继承人',
  witness: '见证人',
  lawyer: '律师',
};

export const SIMULATION_NOTIFY_METHOD_LABELS: Record<string, string> = {
  email: '邮件',
  sms: '短信',
  both: '邮件+短信',
};

export const addDaysToDate = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const formatReadinessScore = (score: number): { label: string; color: string } => {
  if (score >= 90) return { label: '准备充分', color: 'text-emerald-600 bg-emerald-100' };
  if (score >= 70) return { label: '基本就绪', color: 'text-blue-600 bg-blue-100' };
  if (score >= 50) return { label: '部分就绪', color: 'text-amber-600 bg-amber-100' };
  return { label: '需要完善', color: 'text-red-600 bg-red-100' };
};

export const CONDITION_FIELD_LABELS: Record<ConditionField, string> = {
  asset_value: '资产价值',
  heir_verified: '继承人验证状态',
  asset_status: '资产状态',
  witness_count: '见证人数量',
  approval_progress: '审批进度',
  custom: '自定义条件',
};

export const CONDITION_FIELD_COLORS: Record<ConditionField, string> = {
  asset_value: 'bg-emerald-100 text-emerald-700',
  heir_verified: 'bg-blue-100 text-blue-700',
  asset_status: 'bg-amber-100 text-amber-700',
  witness_count: 'bg-purple-100 text-purple-700',
  approval_progress: 'bg-cyan-100 text-cyan-700',
  custom: 'bg-gray-100 text-gray-700',
};

export const CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  gt: '大于',
  gte: '大于等于',
  lt: '小于',
  lte: '小于等于',
  eq: '等于',
  neq: '不等于',
  contains: '包含',
  verified: '已验证',
  not_verified: '未验证',
  status_is: '状态为',
};

export const BRANCH_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
];

export const BRANCH_COLORS_LIGHT = [
  'bg-blue-50 border-blue-200 text-blue-800',
  'bg-emerald-50 border-emerald-200 text-emerald-800',
  'bg-amber-50 border-amber-200 text-amber-800',
  'bg-purple-50 border-purple-200 text-purple-800',
  'bg-rose-50 border-rose-200 text-rose-800',
  'bg-cyan-50 border-cyan-200 text-cyan-800',
];

export const BRANCH_COLORS_BORDER = [
  'border-l-blue-500',
  'border-l-emerald-500',
  'border-l-amber-500',
  'border-l-purple-500',
  'border-l-rose-500',
  'border-l-cyan-500',
];

export const TIME_CAPSULE_STATUS_LABELS: Record<TimeCapsuleStatus, string> = {
  locked: '已锁定',
  unlocked: '已解锁',
  expired: '已过期',
};

export const TIME_CAPSULE_STATUS_COLORS: Record<TimeCapsuleStatus, string> = {
  locked: 'bg-violet-100 text-violet-700',
  unlocked: 'bg-emerald-100 text-emerald-700',
  expired: 'bg-gray-100 text-gray-600',
};

export const getTimeCapsuleStatus = (capsule: { enabled: boolean; unlockDate: string; status: TimeCapsuleStatus }): TimeCapsuleStatus => {
  if (!capsule.enabled) return 'unlocked';
  if (capsule.status === 'unlocked') return 'unlocked';
  const now = new Date();
  const unlockDate = new Date(capsule.unlockDate);
  if (now >= unlockDate) return 'expired';
  return 'locked';
};

export const getDaysUntilUnlock = (unlockDate: string): number => {
  const now = new Date();
  const target = new Date(unlockDate);
  const diffTime = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  asset: '数字资产',
  heir: '继承人',
  will: '数字遗嘱',
  witness: '见证人',
  approval_group: '审批组',
  user: '用户账户',
  notification: '通知',
  emergency_contact: '紧急联系人',
  settings: '系统设置',
  time_capsule: '时间胶囊',
  credential: '凭据',
  vault: '密码保险箱',
  charity: '公益机构',
  donation_plan: '捐赠规划',
  donation_item: '捐赠清单',
  donation_allocation: '分配规则',
};

export const getResourceTypeLabel = (type?: string): string => {
  if (!type) return '未分类';
  return RESOURCE_TYPE_LABELS[type] || type;
};

export const CREDENTIAL_CATEGORY_LABELS: Record<CredentialCategory, string> = {
  password: '账号密码',
  recovery_key: '恢复密钥',
  api_key: 'API 密钥',
  seed_phrase: '助记词',
  pin_code: 'PIN 码',
  security_question: '安全问题',
  certificate: '数字证书',
  other: '其他凭据',
};

export const CREDENTIAL_CATEGORY_COLORS: Record<CredentialCategory, string> = {
  password: 'bg-blue-100 text-blue-700',
  recovery_key: 'bg-amber-100 text-amber-700',
  api_key: 'bg-purple-100 text-purple-700',
  seed_phrase: 'bg-emerald-100 text-emerald-700',
  pin_code: 'bg-rose-100 text-rose-700',
  security_question: 'bg-cyan-100 text-cyan-700',
  certificate: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-700',
};

export const CREDENTIAL_ACCESS_LEVEL_LABELS: Record<CredentialAccessLevel, string> = {
  owner_only: '仅所有者可见',
  heir_step_1: '继承人第1步解锁',
  heir_step_2: '继承人第2步解锁',
  heir_step_3: '继承人第3步解锁',
  witness_only: '仅见证人可见',
  lawyer_only: '仅律师可见',
};

export const CREDENTIAL_ACCESS_LEVEL_COLORS: Record<CredentialAccessLevel, string> = {
  owner_only: 'bg-slate-100 text-slate-700',
  heir_step_1: 'bg-green-100 text-green-700',
  heir_step_2: 'bg-yellow-100 text-yellow-700',
  heir_step_3: 'bg-orange-100 text-orange-700',
  witness_only: 'bg-blue-100 text-blue-700',
  lawyer_only: 'bg-purple-100 text-purple-700',
};

export const DEFAULT_AUTO_LOCK_MINUTES = 5;
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 30;

export const CHARITY_CATEGORY_LABELS: Record<CharityCategory, string> = {
  education: '教育公益',
  medical: '医疗救助',
  environment: '环境保护',
  poverty: '扶贫济困',
  elderly: '养老服务',
  children: '儿童福利',
  animal: '动物保护',
  disaster: '灾难救援',
  culture: '文化传承',
  other: '其他公益',
};

export const CHARITY_CATEGORY_COLORS: Record<CharityCategory, string> = {
  education: 'bg-blue-100 text-blue-700 border-blue-200',
  medical: 'bg-rose-100 text-rose-700 border-rose-200',
  environment: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  poverty: 'bg-amber-100 text-amber-700 border-amber-200',
  elderly: 'bg-orange-100 text-orange-700 border-orange-200',
  children: 'bg-pink-100 text-pink-700 border-pink-200',
  animal: 'bg-teal-100 text-teal-700 border-teal-200',
  disaster: 'bg-red-100 text-red-700 border-red-200',
  culture: 'bg-violet-100 text-violet-700 border-violet-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const DONATION_ITEM_TYPE_LABELS: Record<DonationItemType, string> = {
  specific_asset: '指定资产',
  value_percentage: '资产估值比例',
  fixed_amount: '固定金额',
};

export const DONATION_ITEM_TYPE_COLORS: Record<DonationItemType, string> = {
  specific_asset: 'bg-cyan-100 text-cyan-700',
  value_percentage: 'bg-indigo-100 text-indigo-700',
  fixed_amount: 'bg-emerald-100 text-emerald-700',
};

export const DONATION_STATUS_LABELS: Record<DonationStatus, string> = {
  draft: '草稿',
  active: '已生效',
  executing: '执行中',
  completed: '已完成',
  cancelled: '已取消',
};

export const DONATION_STATUS_COLORS: Record<DonationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  executing: 'bg-blue-100 text-blue-700',
  completed: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const ASSET_NOTE_CATEGORY_LABELS: Record<AssetNoteCategory, string> = {
  inheritance_tips: '继承注意事项',
  emotional_message: '情感寄语',
  operation_guide: '操作指引',
  other: '其他备注',
};

export const ASSET_NOTE_CATEGORY_COLORS: Record<AssetNoteCategory, string> = {
  inheritance_tips: 'bg-amber-50 text-amber-700 border-amber-200',
  emotional_message: 'bg-rose-50 text-rose-700 border-rose-200',
  operation_guide: 'bg-blue-50 text-blue-700 border-blue-200',
  other: 'bg-gray-50 text-gray-700 border-gray-200',
};

export const ASSET_NOTE_CATEGORY_BADGE_COLORS: Record<AssetNoteCategory, string> = {
  inheritance_tips: 'bg-amber-500',
  emotional_message: 'bg-rose-500',
  operation_guide: 'bg-blue-500',
  other: 'bg-gray-500',
};

export const ASSET_NOTE_CATEGORY_ICONS: Record<AssetNoteCategory, string> = {
  inheritance_tips: '⚠️',
  emotional_message: '💝',
  operation_guide: '📖',
  other: '📝',
};

export const ASSET_NOTE_CATEGORY_DESCRIPTIONS: Record<AssetNoteCategory, string> = {
  inheritance_tips: '记录资产继承过程中的重要注意事项、法律提示或特殊要求',
  emotional_message: '写下给继承人的情感寄语、嘱托或珍贵的家庭记忆',
  operation_guide: '详细说明资产的使用方法、操作步骤或管理指引',
  other: '其他类型的备注内容，如附加信息或补充说明',
};

export const PRESET_CHARITIES: Charity[] = [
  {
    id: 'charity-001',
    name: '中国青少年发展基金会',
    category: 'education',
    description: '致力于改善贫困地区办学条件，资助家庭困难学生完成学业的全国性公募基金会。希望工程发起单位。',
    website: 'https://www.cydf.org.cn',
    taxId: '531000005000074012',
    rating: 5,
    isPreset: true,
  },
  {
    id: 'charity-002',
    name: '中国红十字基金会',
    category: 'medical',
    description: '专注于救助白血病、先心病等重大疾病儿童，援建博爱卫生院和健康卫生项目的公益基金会。',
    website: 'https://www.crcf.org.cn',
    taxId: '531000005000076350',
    rating: 5,
    isPreset: true,
  },
  {
    id: 'charity-003',
    name: '中华环境保护基金会',
    category: 'environment',
    description: '从事环境保护公益事业的全国性公募基金会，支持环境教育、生态保护、污染防治等项目。',
    website: 'https://www.cepf.org.cn',
    taxId: '531000005000062832',
    rating: 4,
    isPreset: true,
  },
  {
    id: 'charity-004',
    name: '中国扶贫基金会',
    category: 'poverty',
    description: '致力于帮助贫困地区和贫困人口改善生产生活条件的全国性专业扶贫公益机构。',
    website: 'https://www.cfpa.org.cn',
    taxId: '5310000050000683XY',
    rating: 5,
    isPreset: true,
  },
  {
    id: 'charity-005',
    name: '全国老龄事业发展基金会',
    category: 'elderly',
    description: '致力于老龄事业发展，开展助老、养老服务、老年维权等公益项目的全国性公募基金会。',
    website: 'https://www.cnaging.org',
    taxId: '53100000500007651C',
    rating: 4,
    isPreset: true,
  },
  {
    id: 'charity-006',
    name: '中国儿童少年基金会',
    category: 'children',
    description: '新中国第一家以募集资金形式救助失学儿童、扶助贫困地区教育事业的公益基金会。',
    website: 'https://www.cctf.org.cn',
    taxId: '53100000500006477L',
    rating: 5,
    isPreset: true,
  },
  {
    id: 'charity-007',
    name: '北京爱它动物保护公益基金会',
    category: 'animal',
    description: '专注于动物保护事业，救助流浪动物，推动动物福利立法的非公募公益基金会。',
    website: 'https://www.aita.org.cn',
    taxId: '531100005000210000',
    rating: 4,
    isPreset: true,
  },
  {
    id: 'charity-008',
    name: '中国乡村发展基金会',
    category: 'poverty',
    description: '致力于乡村振兴、灾害救援、儿童发展等领域，推动乡村可持续发展的公益机构。',
    website: 'https://www.foundationcenter.org.cn',
    taxId: '53100000500006330J',
    rating: 5,
    isPreset: true,
  },
  {
    id: 'charity-009',
    name: '壹基金',
    category: 'disaster',
    description: '专注于灾害救助、儿童关怀与公益支持三大领域的国内首家民间公募基金会。',
    website: 'https://www.onefoundation.cn',
    taxId: '534403005026799012',
    rating: 5,
    isPreset: true,
  },
  {
    id: 'charity-010',
    name: '中国文化遗产保护基金会',
    category: 'culture',
    description: '致力于文物保护、非物质文化遗产传承、历史文化名城名镇保护的全国性基金会。',
    website: 'https://www.cchpf.org.cn',
    taxId: '531000005000200000',
    rating: 4,
    isPreset: true,
  },
];

export const WILL_TEMPLATES: WillTemplate[] = [
  {
    id: 'template-family',
    category: 'family',
    name: '家庭保障型',
    description: '适合有配偶和子女的家庭，重点保障家庭成员的生活稳定和子女成长教育。',
    longDescription: '家庭保障型遗嘱模板专为有配偶和未成年子女的家庭设计。该模板采用渐进式资产移交策略，确保配偶在过渡期内获得主要资产控制权，同时为子女设立教育基金和成长保障。通过分阶段执行机制，既保障了家庭生活的连续性，又确保子女在不同成长阶段获得相应的资源支持。',
    icon: 'Heart',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    tags: ['家庭优先', '子女教育', '配偶保障', '分阶段执行'],
    difficulty: 'medium',
    estimatedTime: '10-15分钟',
    suitableFor: [
      '已婚有子女的家庭',
      '希望保障配偶生活的用户',
      '重视子女教育规划的家长',
      '资产类型较为丰富的家庭',
    ],
    notSuitableFor: [
      '单身无子女用户',
      '希望立即分配所有资产的用户',
      '资产结构极其复杂的用户',
    ],
    willConfig: {
      title: '家庭保障遗嘱',
      description: '为配偶和子女提供全方位生活保障的数字遗嘱安排',
      triggerCondition: {
        type: 'inactivity_days',
        inactivityDays: 180,
        requiresWitnessConfirmation: true,
        witnessCount: 2,
        lawyerApprovalRequired: true,
      },
      executionSteps: [
        {
          id: 'step-1',
          order: 1,
          title: '紧急通知与安抚',
          description: '向配偶和紧急联系人发送遗嘱触发通知，告知后续安排',
          delayDays: 0,
          actionType: 'notify',
          targetHeirIds: ['heir-001'],
          completed: false,
        },
        {
          id: 'step-2',
          order: 2,
          title: '移交日常使用资产',
          description: '立即移交社交媒体、常用邮箱等日常使用账号给配偶，保障生活连续性',
          delayDays: 7,
          actionType: 'transfer',
          targetAssetIds: ['asset-001', 'asset-005'],
          targetHeirIds: ['heir-001'],
          completed: false,
        },
        {
          id: 'step-3',
          order: 3,
          title: '移交家庭云存储',
          description: '30天后移交家庭照片、文档等云存储资产给配偶',
          delayDays: 30,
          actionType: 'transfer',
          targetAssetIds: ['asset-002'],
          targetHeirIds: ['heir-001'],
          completed: false,
        },
        {
          id: 'step-4',
          order: 4,
          title: '披露核心财务资产',
          description: '90天后在律师见证下，向配偶披露加密货币钱包等核心财务资产',
          delayDays: 90,
          actionType: 'reveal_credentials',
          targetAssetIds: ['asset-003'],
          targetHeirIds: ['heir-001'],
          completed: false,
        },
        {
          id: 'step-5',
          order: 5,
          title: '子女教育资产移交',
          description: '180天后，为子女移交教育相关资产和账号，设立子女教育专项',
          delayDays: 180,
          actionType: 'transfer',
          targetAssetIds: ['asset-004', 'asset-006'],
          targetHeirIds: ['heir-002'],
          completed: false,
        },
        {
          id: 'step-6',
          order: 6,
          title: '通知所有继承人',
          description: '最终向所有继承人发送完整资产清单和分配说明',
          delayDays: 365,
          actionType: 'notify',
          targetHeirIds: ['heir-001', 'heir-002', 'heir-003'],
          completed: false,
        },
      ],
      witnessIds: ['witness-001', 'witness-002'],
      lawyerIds: ['witness-001'],
    },
    executionFlow: [
      { title: '触发通知', description: '系统自动向配偶发送通知', duration: '即时', icon: 'Bell' },
      { title: '日常资产移交', description: '移交常用账号保障生活', duration: '7天后', icon: 'Smartphone' },
      { title: '家庭资产移交', description: '移交云存储等家庭资产', duration: '30天后', icon: 'Cloud' },
      { title: '核心资产披露', description: '律师见证下披露财务资产', duration: '90天后', icon: 'Shield' },
      { title: '子女教育保障', description: '为子女设立专项资产', duration: '180天后', icon: 'GraduationCap' },
      { title: '最终告知', description: '向所有继承人完整披露', duration: '365天后', icon: 'CheckCircle' },
    ],
    keyFeatures: [
      '渐进式资产移交，避免一次性移交风险',
      '配偶优先保障，确保家庭生活稳定',
      '子女教育专项，长期规划成长支持',
      '律师见证机制，确保合法合规',
      '分阶段执行，降低误触发损失',
      '双重验证要求，提高安全性',
    ],
    customizableParams: [
      { name: '触发方式', type: 'trigger', description: '可调整连续未登录天数或改为其他触发方式' },
      { name: '执行延迟', type: 'step', description: '每个步骤的延迟执行天数可单独调整' },
      { name: '资产分配', type: 'step', description: '每个步骤涉及的具体资产可重新分配' },
      { name: '见证人要求', type: 'witness', description: '可调整需要的见证人数量和具体人选' },
      { name: '律师审批', type: 'lawyer', description: '可选择是否需要律师审批及指定律师' },
    ],
  },
  {
    id: 'template-diversified',
    category: 'diversified',
    name: '资产分散型',
    description: '适合资产类型多样、金额较大的用户，通过分散策略降低风险，最大化资产价值。',
    longDescription: '资产分散型遗嘱模板专为拥有多种类型数字资产、资产总价值较高的用户设计。该模板采用风险分散策略，将不同类型的资产在不同时间点、通过不同方式移交给不同的继承人，有效避免资产集中风险。同时引入条件分支机制，可根据资产价值、继承人状态等动态调整分配方案。',
    icon: 'PieChart',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    tags: ['资产分散', '风险控制', '条件分支', '动态调整', '大额资产'],
    difficulty: 'hard',
    estimatedTime: '20-30分钟',
    suitableFor: [
      '拥有多种类型数字资产的用户',
      '资产总价值较高的用户',
      '有多位继承人需要分配的用户',
      '希望进行税务筹划的用户',
      '重视风险分散的专业人士',
    ],
    notSuitableFor: [
      '资产类型单一的用户',
      '希望简化流程的用户',
      '继承人关系简单的用户',
    ],
    willConfig: {
      title: '资产分散遗嘱',
      description: '通过分散策略降低风险，最大化资产价值的专业型遗嘱安排',
      triggerCondition: {
        type: 'death_certificate',
        requiresDeathCertificate: true,
        requiresWitnessConfirmation: true,
        witnessCount: 3,
        lawyerApprovalRequired: true,
      },
      executionSteps: [
        {
          id: 'step-1',
          order: 1,
          title: '启动验证流程',
          description: '启动死亡证明验证和多见证人确认流程',
          delayDays: 0,
          actionType: 'notify',
          targetHeirIds: ['heir-001', 'heir-002', 'heir-003'],
          completed: false,
          branches: [
            {
              id: 'branch-1',
              label: '资产价值>100万',
              conditions: [
                {
                  id: 'cond-1',
                  field: 'asset_value',
                  operator: 'gt',
                  value: '1000000',
                  label: '总资产超过100万',
                  resourceIds: ['asset-003'],
                },
              ],
              conditionLogic: 'and',
              targetStepIds: ['step-2'],
              color: 'bg-violet-500',
            },
          ],
        },
        {
          id: 'step-2',
          order: 2,
          title: '金融资产分类处理',
          description: '根据资产类型和价值，按比例分配给不同继承人',
          delayDays: 30,
          actionType: 'reveal_credentials',
          targetAssetIds: ['asset-003'],
          targetHeirIds: ['heir-001', 'heir-002'],
          completed: false,
        },
        {
          id: 'step-3',
          order: 3,
          title: '数字资产移交',
          description: '移交社交媒体、邮箱等数字身份资产',
          delayDays: 60,
          actionType: 'transfer',
          targetAssetIds: ['asset-001', 'asset-005', 'asset-006'],
          targetHeirIds: ['heir-002'],
          completed: false,
        },
        {
          id: 'step-4',
          order: 4,
          title: '存储资产移交',
          description: '移交云存储、订阅服务等资产',
          delayDays: 90,
          actionType: 'transfer',
          targetAssetIds: ['asset-002', 'asset-004'],
          targetHeirIds: ['heir-001', 'heir-003'],
          completed: false,
        },
        {
          id: 'step-5',
          order: 5,
          title: '敏感数据清理',
          description: '按约定删除指定的敏感数据和隐私内容',
          delayDays: 120,
          actionType: 'delete_data',
          targetAssetIds: ['asset-001', 'asset-005'],
          completed: false,
        },
        {
          id: 'step-6',
          order: 6,
          title: '最终审计报告',
          description: '生成完整的资产执行报告，提交律师和所有继承人',
          delayDays: 150,
          actionType: 'notify',
          targetHeirIds: ['heir-001', 'heir-002', 'heir-003'],
          completed: false,
        },
      ],
      witnessIds: ['witness-001', 'witness-002'],
      lawyerIds: ['witness-001'],
    },
    executionFlow: [
      { title: '多重验证', description: '死亡证明+3位见证人确认', duration: '即时启动', icon: 'ShieldCheck' },
      { title: '条件评估', description: '智能评估资产价值和分配条件', duration: '验证通过后', icon: 'GitBranch' },
      { title: '金融资产分配', description: '按比例分配核心金融资产', duration: '30天后', icon: 'Wallet' },
      { title: '数字身份移交', description: '移交社交媒体等数字身份', duration: '60天后', icon: 'User' },
      { title: '存储资产分配', description: '分配云存储和服务订阅', duration: '90天后', icon: 'HardDrive' },
      { title: '隐私清理', description: '按约定删除敏感数据', duration: '120天后', icon: 'Trash2' },
      { title: '审计报告', description: '生成完整执行报告', duration: '150天后', icon: 'FileCheck' },
    ],
    keyFeatures: [
      '多重验证机制，防止恶意触发',
      '条件分支支持，动态调整分配方案',
      '资产分类处理，优化税务和风险',
      '敏感数据自动清理，保护隐私',
      '完整审计追踪，全程可追溯',
      '多位继承人分散继承，降低风险',
    ],
    customizableParams: [
      { name: '触发条件', type: 'trigger', description: '可选择死亡证明触发或其他触发方式' },
      { name: '条件分支', type: 'step', description: '可添加或修改条件分支逻辑' },
      { name: '资产分类', type: 'step', description: '可调整每类资产的分配策略和对象' },
      { name: '清理规则', type: 'step', description: '可指定需要删除的敏感数据类型' },
      { name: '见证人数', type: 'witness', description: '可调整需要的见证人数量' },
      { name: '律师角色', type: 'lawyer', description: '可指定律师的具体职责和权限' },
    ],
  },
  {
    id: 'template-simple',
    category: 'simple',
    name: '简约快速型',
    description: '适合资产结构简单、希望快速完成配置的用户，流程简洁，易于理解和执行。',
    longDescription: '简约快速型遗嘱模板专为资产类型简单、继承人关系清晰的用户设计。该模板摒弃复杂的条件分支和多阶段执行，采用直接明了的一次性通知+资产移交模式，让用户能够在最短时间内完成遗嘱配置。虽然流程简单，但仍保留核心的安全验证机制，确保遗嘱执行的安全性和可靠性。',
    icon: 'Zap',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    tags: ['简单快捷', '流程清晰', '易于配置', '适合新手'],
    difficulty: 'easy',
    estimatedTime: '3-5分钟',
    suitableFor: [
      '数字资产类型简单的用户',
      '首次使用的新手用户',
      '继承人关系清晰明确的用户',
      '希望快速完成配置的用户',
      '资产总额不高的用户',
    ],
    notSuitableFor: [
      '资产类型复杂的用户',
      '有特殊分配需求的用户',
      '需要条件分支的用户',
      '资产价值很高的用户',
    ],
    willConfig: {
      title: '简约遗嘱',
      description: '简单直接的数字资产分配安排，适合快速配置',
      triggerCondition: {
        type: 'inactivity_days',
        inactivityDays: 365,
        requiresWitnessConfirmation: false,
        lawyerApprovalRequired: false,
      },
      executionSteps: [
        {
          id: 'step-1',
          order: 1,
          title: '通知所有继承人',
          description: '一次性向所有指定继承人发送遗嘱触发通知和资产清单',
          delayDays: 0,
          actionType: 'notify',
          targetHeirIds: ['heir-001', 'heir-002', 'heir-003'],
          completed: false,
        },
        {
          id: 'step-2',
          order: 2,
          title: '移交全部资产',
          description: '30天后一次性移交所有数字资产给指定继承人',
          delayDays: 30,
          actionType: 'transfer',
          targetAssetIds: ['asset-001', 'asset-002', 'asset-003', 'asset-004', 'asset-005', 'asset-006'],
          targetHeirIds: ['heir-001', 'heir-002'],
          completed: false,
        },
        {
          id: 'step-3',
          order: 3,
          title: '披露凭证信息',
          description: '同时披露所有相关账号密码和访问凭证',
          delayDays: 30,
          actionType: 'reveal_credentials',
          targetAssetIds: ['asset-001', 'asset-002', 'asset-003', 'asset-004', 'asset-005', 'asset-006'],
          targetHeirIds: ['heir-001', 'heir-002'],
          completed: false,
        },
      ],
      witnessIds: [],
      lawyerIds: [],
    },
    executionFlow: [
      { title: '触发检测', description: '系统检测到连续365天未登录', duration: '自动检测', icon: 'Clock' },
      { title: '全员通知', description: '向所有继承人发送通知', duration: '即时', icon: 'Send' },
      { title: '资产移交', description: '一次性移交所有数字资产', duration: '30天后', icon: 'Package' },
      { title: '凭证披露', description: '提供所有账号访问凭证', duration: '同步进行', icon: 'Key' },
    ],
    keyFeatures: [
      '配置简单，3-5分钟即可完成',
      '流程清晰，易于理解和执行',
      '无需见证人，减少协调成本',
      '一次性移交，简化执行流程',
      '保留核心安全机制',
      '适合数字遗嘱新手用户',
    ],
    customizableParams: [
      { name: '触发阈值', type: 'trigger', description: '可调整连续未登录的天数阈值' },
      { name: '等待期', type: 'step', description: '可调整触发后的资产移交等待期' },
      { name: '资产分配', type: 'step', description: '可调整每项资产的具体继承人' },
      { name: '安全验证', type: 'witness', description: '后续可随时添加见证人验证' },
    ],
  },
];

export const WILL_TEMPLATE_CATEGORY_LABELS: Record<WillTemplateCategory, string> = {
  family: '家庭保障型',
  diversified: '资产分散型',
  simple: '简约快速型',
};

export const WILL_TEMPLATE_DIFFICULTY_LABELS: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '复杂',
};

export const WILL_TEMPLATE_DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
};
