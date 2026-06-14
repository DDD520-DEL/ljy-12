import { AssetType, HeirRelationship, TriggerType, WillStatus, UserRole, AuditActionType, HealthCheckPeriod, HealthCheckStatus, ApprovalGroupStatus, WitnessApprovalDecision, ConditionField, ConditionOperator, TimeCapsuleStatus, CredentialCategory, CredentialAccessLevel, CharityCategory, DonationItemType, DonationStatus, Charity } from '@/types';

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
