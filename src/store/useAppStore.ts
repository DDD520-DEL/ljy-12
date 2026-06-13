import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  DigitalAsset,
  Heir,
  DigitalWill,
  Witness,
  AuditLogEntry,
  Notification,
  AssetType,
  VerificationStatus,
  AuditActionType,
  ExecutionStep,
  HealthCheckPeriod,
  ReminderRule,
  SimulationState,
  SimulationReport,
  SimulationStepDetail,
  SimulationNotifyTarget,
  SimulationTransferItem,
  SimulationSummary,
} from '@/types';
import {
  generateId,
  generateHash,
  DEFAULT_INACTIVITY_DAYS,
  DEFAULT_WITNESS_COUNT,
  DEFAULT_HEALTH_CHECK_PERIOD,
  DEFAULT_REMINDER_DAYS,
  getHealthCheckStatus,
  getHealthCheckPeriodDays,
  addDaysToDate,
  formatDate,
} from '@/constants';

interface AppState {
  currentUser: User | null;
  assets: DigitalAsset[];
  heirs: Heir[];
  will: DigitalWill | null;
  witnesses: Witness[];
  auditLogs: AuditLogEntry[];
  notifications: Notification[];

  setCurrentUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;

  addAsset: (asset: Omit<DigitalAsset, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'healthCheckPeriod' | 'reminderRule'> & { healthCheckPeriod?: HealthCheckPeriod; reminderRule?: ReminderRule }) => void;
  updateAsset: (id: string, updates: Partial<DigitalAsset>) => void;
  deleteAsset: (id: string) => void;
  getAssetsByType: (type: AssetType) => DigitalAsset[];
  getAssetsByHeir: (heirId: string) => DigitalAsset[];
  verifyAsset: (id: string) => void;
  updateAssetHealthCheck: (id: string, period: HealthCheckPeriod, customDays?: number, reminderRule?: ReminderRule) => void;
  generateHealthCheckReminders: () => void;
  getOverdueAssets: () => DigitalAsset[];
  getWarningAssets: () => DigitalAsset[];

  addHeir: (heir: Omit<Heir, 'id' | 'createdAt' | 'isVerified' | 'assignedAssets' | 'priority'>) => void;
  updateHeir: (id: string, updates: Partial<Heir>) => void;
  deleteHeir: (id: string) => void;
  reorderHeirs: (heirIds: string[]) => void;

  createWill: (will: Partial<DigitalWill>) => void;
  updateWill: (updates: Partial<DigitalWill>) => void;
  addExecutionStep: (step: Omit<ExecutionStep, 'id' | 'completed'>) => void;
  updateExecutionStep: (stepId: string, updates: Partial<ExecutionStep>) => void;
  removeExecutionStep: (stepId: string) => void;
  triggerWill: () => void;
  activateWill: () => void;

  addWitness: (witness: Omit<Witness, 'id' | 'createdAt' | 'verificationStatus'>) => void;
  updateWitness: (id: string, updates: Partial<Witness>) => void;
  deleteWitness: (id: string) => void;
  verifyWitness: (id: string) => void;

  addAuditLog: (entry: {
    action: AuditActionType;
    description: string;
    resourceType?: string;
    resourceId?: string;
    previousValue?: string;
    newValue?: string;
  }) => void;

  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  recordActivity: () => void;

  simulation: SimulationState;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  advanceSimulationStep: () => void;
  setSimulationPlaySpeed: (speed: number) => void;
  toggleSimulationPlay: () => void;
}

const initialUser: User = {
  id: 'user-001',
  name: '张明',
  email: 'zhangming@example.com',
  role: 'owner',
  mfaEnabled: false,
  createdAt: new Date('2024-01-01').toISOString(),
};

const createInitialAssets = (): DigitalAsset[] => [
  {
    id: 'asset-001',
    name: '微信账号',
    type: 'social_media',
    username: 'zhangming_wx',
    url: 'https://weixin.qq.com',
    description: '个人微信账号，包含联系人、聊天记录等',
    value: 0,
    currency: 'CNY',
    heirId: 'heir-001',
    heirChain: ['heir-001', 'heir-002'],
    transferInstructions: '将账号密码告知配偶，由其继续使用或处理',
    status: 'active',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    lastVerifiedAt: new Date('2024-06-01').toISOString(),
    healthCheckPeriod: '30_days',
    reminderRule: { enabled: true, daysBefore: DEFAULT_REMINDER_DAYS, repeat: true },
  },
  {
    id: 'asset-002',
    name: '百度网盘',
    type: 'cloud_storage',
    username: 'zhangming@example.com',
    url: 'https://pan.baidu.com',
    description: '家庭照片和重要文档备份，约2TB数据',
    value: 500,
    currency: 'CNY',
    heirId: 'heir-002',
    heirChain: ['heir-002', 'heir-003'],
    transferInstructions: '将账号移交子女，保留家庭记忆',
    status: 'active',
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString(),
    lastVerifiedAt: new Date('2024-05-20').toISOString(),
    healthCheckPeriod: '90_days',
    reminderRule: { enabled: true, daysBefore: DEFAULT_REMINDER_DAYS, repeat: true },
  },
  {
    id: 'asset-003',
    name: '比特币钱包',
    type: 'crypto_wallet',
    username: '',
    url: '',
    description: '冷存储比特币钱包，约0.5 BTC',
    value: 150000,
    currency: 'CNY',
    heirId: 'heir-001',
    heirChain: ['heir-001', 'heir-002', 'heir-003'],
    transferInstructions: '私钥存储在银行保险柜中，需律师见证下取出',
    status: 'active',
    createdAt: new Date('2024-03-05').toISOString(),
    updatedAt: new Date('2024-03-05').toISOString(),
    lastVerifiedAt: new Date('2024-04-15').toISOString(),
    healthCheckPeriod: '7_days',
    reminderRule: { enabled: true, daysBefore: 3, repeat: true },
  },
  {
    id: 'asset-004',
    name: 'Netflix 订阅',
    type: 'subscription',
    username: 'zhangming@example.com',
    url: 'https://netflix.com',
    description: '高级会员，年付',
    value: 200,
    currency: 'CNY',
    heirId: 'heir-002',
    heirChain: ['heir-002'],
    transferInstructions: '可继续使用或取消订阅',
    status: 'active',
    createdAt: new Date('2024-03-20').toISOString(),
    updatedAt: new Date('2024-03-20').toISOString(),
    healthCheckPeriod: '365_days',
    reminderRule: { enabled: true, daysBefore: 30, repeat: true },
  },
  {
    id: 'asset-005',
    name: 'Gmail 邮箱',
    type: 'email',
    username: 'zhangming@gmail.com',
    url: 'https://gmail.com',
    description: '主要工作邮箱，包含重要工作邮件和账户注册信息',
    value: 0,
    currency: 'CNY',
    heirId: 'heir-001',
    heirChain: ['heir-001', 'heir-003'],
    transferInstructions: '由配偶处理所有邮件，通知重要联系人',
    status: 'active',
    createdAt: new Date('2024-04-01').toISOString(),
    updatedAt: new Date('2024-04-01').toISOString(),
    lastVerifiedAt: new Date('2024-06-10').toISOString(),
    healthCheckPeriod: '30_days',
    reminderRule: { enabled: true, daysBefore: DEFAULT_REMINDER_DAYS, repeat: true },
  },
  {
    id: 'asset-006',
    name: 'GitHub 账号',
    type: 'other',
    username: 'zhangming',
    url: 'https://github.com',
    description: '开源项目和代码仓库',
    value: 0,
    currency: 'CNY',
    heirId: 'heir-002',
    heirChain: ['heir-002', 'heir-001'],
    transferInstructions: '开源项目可由感兴趣的子女继续维护',
    status: 'active',
    createdAt: new Date('2024-05-10').toISOString(),
    updatedAt: new Date('2024-05-10').toISOString(),
    healthCheckPeriod: '180_days',
    reminderRule: { enabled: false, daysBefore: DEFAULT_REMINDER_DAYS, repeat: false },
  },
];

const createInitialHeirs = (): Heir[] => [
  {
    id: 'heir-001',
    name: '李芳',
    relationship: 'spouse',
    email: 'lifang@example.com',
    phone: '138****5678',
    notificationPreference: 'email',
    isVerified: true,
    createdAt: new Date('2024-01-10').toISOString(),
    assignedAssets: ['asset-001', 'asset-003', 'asset-005'],
    priority: 1,
  },
  {
    id: 'heir-002',
    name: '张伟',
    relationship: 'child',
    email: 'zhangwei@example.com',
    phone: '139****1234',
    notificationPreference: 'both',
    isVerified: true,
    createdAt: new Date('2024-01-12').toISOString(),
    assignedAssets: ['asset-002', 'asset-004', 'asset-006'],
    priority: 2,
  },
  {
    id: 'heir-003',
    name: '张建国',
    relationship: 'parent',
    email: 'zhangjianguo@example.com',
    phone: '137****9876',
    notificationPreference: 'sms',
    isVerified: false,
    createdAt: new Date('2024-02-01').toISOString(),
    assignedAssets: [],
    priority: 3,
  },
];

const createInitialWitnesses = (): Witness[] => [
  {
    id: 'witness-001',
    name: '王律师',
    email: 'wanglawyer@lawfirm.com',
    phone: '136****5555',
    verificationStatus: 'verified',
    isLawyer: true,
    barNumber: '11010120201234567',
    firmName: '北京恒信律师事务所',
    verifiedAt: new Date('2024-02-15').toISOString(),
    createdAt: new Date('2024-02-10').toISOString(),
  },
  {
    id: 'witness-002',
    name: '陈刚',
    email: 'chengang@example.com',
    phone: '135****7777',
    verificationStatus: 'pending',
    isLawyer: false,
    createdAt: new Date('2024-03-01').toISOString(),
  },
];

const createInitialWill = (): DigitalWill => ({
  id: 'will-001',
  ownerId: 'user-001',
  title: '我的数字遗产安排',
  description: '在我无法管理数字资产时，按照以下安排将资产移交给指定继承人。',
  status: 'draft',
  triggerCondition: {
    type: 'inactivity_days',
    inactivityDays: DEFAULT_INACTIVITY_DAYS,
    requiresWitnessConfirmation: true,
    witnessCount: DEFAULT_WITNESS_COUNT,
    lawyerApprovalRequired: true,
  },
  executionSteps: [
    {
      id: 'step-001',
      order: 1,
      title: '通知继承人',
      description: '向所有指定继承人发送通知邮件，告知数字遗嘱已触发',
      delayDays: 0,
      actionType: 'notify',
      targetHeirIds: ['heir-001', 'heir-002', 'heir-003'],
      completed: false,
    },
    {
      id: 'step-002',
      order: 2,
      title: '移交社交媒体账号',
      description: '在7天后向第一顺位继承人移交社交媒体账号访问权限',
      delayDays: 7,
      actionType: 'transfer',
      targetAssetIds: ['asset-001', 'asset-005'],
      targetHeirIds: ['heir-001'],
      completed: false,
    },
    {
      id: 'step-003',
      order: 3,
      title: '移交加密资产',
      description: '在30天后，在律师见证下移交加密货币钱包',
      delayDays: 30,
      actionType: 'reveal_credentials',
      targetAssetIds: ['asset-003'],
      targetHeirIds: ['heir-001'],
      completed: false,
    },
    {
      id: 'step-004',
      order: 4,
      title: '移交云存储和其他资产',
      description: '在60天后移交所有剩余数字资产',
      delayDays: 60,
      actionType: 'transfer',
      targetAssetIds: ['asset-002', 'asset-004', 'asset-006'],
      targetHeirIds: ['heir-002'],
      completed: false,
    },
  ],
  witnessIds: ['witness-001', 'witness-002'],
  lawyerIds: ['witness-001'],
  lastActiveAt: new Date().toISOString(),
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date().toISOString(),
});

const createInitialAuditLogs = (): AuditLogEntry[] => {
  const logs: AuditLogEntry[] = [];
  let previousHash = '00000000';

  const logData = [
    { action: 'login' as AuditActionType, desc: '用户登录系统', time: new Date('2024-06-01 09:30:00') },
    { action: 'asset_created' as AuditActionType, desc: '添加资产：微信账号', time: new Date('2024-06-02 14:20:00') },
    { action: 'heir_added' as AuditActionType, desc: '添加继承人：李芳', time: new Date('2024-06-03 10:15:00') },
    { action: 'will_updated' as AuditActionType, desc: '更新数字遗嘱触发条件', time: new Date('2024-06-05 16:45:00') },
    { action: 'mfa_enabled' as AuditActionType, desc: '启用多因素身份验证', time: new Date('2024-06-08 11:00:00') },
    { action: 'asset_updated' as AuditActionType, desc: '更新资产：比特币钱包信息', time: new Date('2024-06-10 15:30:00') },
    { action: 'witness_approved' as AuditActionType, desc: '见证人王律师已确认', time: new Date('2024-06-11 09:00:00') },
  ];

  logData.forEach((log, index) => {
    const data = `${log.action}-${log.desc}-${log.time.toISOString()}`;
    const hash = generateHash(data + previousHash);
    logs.push({
      id: `log-${String(index + 1).padStart(3, '0')}`,
      timestamp: log.time.toISOString(),
      action: log.action,
      userId: 'user-001',
      userRole: 'owner',
      description: log.desc,
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/125.0.0.0 Windows NT 10.0',
      transactionHash: hash,
      previousHash,
    });
    previousHash = hash;
  });

  return logs.reverse();
};

const createInitialNotifications = (): Notification[] => [
  {
    id: 'notif-001',
    type: 'info',
    title: '欢迎使用数字遗产平台',
    message: '请完善您的数字资产清单和继承人信息',
    read: false,
    createdAt: new Date('2024-06-01').toISOString(),
  },
  {
    id: 'notif-002',
    type: 'warning',
    title: '见证人待确认',
    message: '见证人陈刚尚未确认身份，请提醒其完成验证',
    read: false,
    createdAt: new Date('2024-06-03').toISOString(),
  },
  {
    id: 'notif-003',
    type: 'success',
    title: '律师已认证',
    message: '王律师已完成律师身份认证，可以参与遗嘱执行',
    read: true,
    createdAt: new Date('2024-06-08').toISOString(),
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: initialUser,
      assets: createInitialAssets(),
      heirs: createInitialHeirs(),
      will: createInitialWill(),
      witnesses: createInitialWitnesses(),
      auditLogs: createInitialAuditLogs(),
      notifications: createInitialNotifications(),

      setCurrentUser: (user) => set({ currentUser: user }),

      updateUser: (updates) =>
        set((state) => {
          if (!state.currentUser) return {};
          const updated = { ...state.currentUser, ...updates };
          return { currentUser: updated };
        }),

      addAsset: (asset) => {
        const now = new Date().toISOString();
        const newAsset: DigitalAsset = {
          ...asset,
          id: generateId(),
          status: 'active',
          createdAt: now,
          updatedAt: now,
          healthCheckPeriod: asset.healthCheckPeriod || DEFAULT_HEALTH_CHECK_PERIOD,
          reminderRule: asset.reminderRule || { enabled: true, daysBefore: DEFAULT_REMINDER_DAYS, repeat: true },
        };
        set((state) => ({ assets: [newAsset, ...state.assets] }));
        get().addAuditLog({
          action: 'asset_created',
          description: `添加资产：${asset.name}`,
          resourceType: 'asset',
          resourceId: newAsset.id,
        });
      },

      updateAsset: (id, updates) => {
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        }));
        get().addAuditLog({
          action: 'asset_updated',
          description: `更新资产信息`,
          resourceType: 'asset',
          resourceId: id,
        });
      },

      deleteAsset: (id) => {
        const asset = get().assets.find((a) => a.id === id);
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        }));
        if (asset) {
          get().addAuditLog({
            action: 'asset_deleted',
            description: `删除资产：${asset.name}`,
            resourceType: 'asset',
            resourceId: id,
          });
        }
      },

      getAssetsByType: (type) => get().assets.filter((a) => a.type === type),

      getAssetsByHeir: (heirId) => get().assets.filter((a) => a.heirId === heirId),

      verifyAsset: (id) => {
        const now = new Date().toISOString();
        const asset = get().assets.find((a) => a.id === id);
        if (!asset) return;

        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id
              ? { ...a, lastVerifiedAt: now, updatedAt: now }
              : a
          ),
        }));

        get().addAuditLog({
          action: 'asset_verified',
          description: `验证资产：${asset.name}`,
          resourceType: 'asset',
          resourceId: id,
        });

        get().addNotification({
          type: 'success',
          title: '资产验证完成',
          message: `资产「${asset.name}」已完成健康检查验证`,
        });
      },

      updateAssetHealthCheck: (id, period, customDays, reminderRule) => {
        const asset = get().assets.find((a) => a.id === id);
        if (!asset) return;

        const updates: Partial<DigitalAsset> = {
          healthCheckPeriod: period,
          customPeriodDays: customDays,
          updatedAt: new Date().toISOString(),
        };

        if (reminderRule) {
          updates.reminderRule = reminderRule;
        }

        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));

        get().addAuditLog({
          action: 'healthcheck_settings_updated',
          description: `更新资产健康检查设置：${asset.name}`,
          resourceType: 'asset',
          resourceId: id,
        });
      },

      generateHealthCheckReminders: () => {
        const { assets, notifications } = get();
        const now = new Date();

        assets.forEach((asset) => {
          if (!asset.reminderRule.enabled) return;

          const status = getHealthCheckStatus(
            asset.lastVerifiedAt,
            asset.healthCheckPeriod,
            asset.customPeriodDays,
            asset.reminderRule.daysBefore
          );

          if (status === 'overdue' || status === 'warning') {
            const periodDays = getHealthCheckPeriodDays(asset.healthCheckPeriod, asset.customPeriodDays);
            const lastVerifiedDays = asset.lastVerifiedAt
              ? Math.floor((now.getTime() - new Date(asset.lastVerifiedAt).getTime()) / (1000 * 60 * 60 * 24))
              : 0;

            const existingReminder = notifications.find(
              (n) =>
                n.message.includes(asset.name) &&
                (n.title === '资产健康检查逾期' || n.title === '资产健康检查即将到期') &&
                !n.read
            );

            if (!existingReminder || asset.reminderRule.repeat) {
              const isOverdue = status === 'overdue';
              const title = isOverdue ? '资产健康检查逾期' : '资产健康检查即将到期';
              const message = isOverdue
                ? `资产「${asset.name}」已超过验证周期 ${lastVerifiedDays - periodDays} 天，请尽快验证`
                : `资产「${asset.name}」将在 ${periodDays - lastVerifiedDays} 天后到期，请及时验证`;

              get().addNotification({
                type: isOverdue ? 'error' : 'warning',
                title,
                message,
              });

              get().addAuditLog({
                action: 'healthcheck_reminder',
                description: `${title}：${asset.name}`,
                resourceType: 'asset',
                resourceId: asset.id,
              });
            }
          }
        });
      },

      getOverdueAssets: () => {
        const { assets } = get();
        return assets.filter((asset) => {
          const status = getHealthCheckStatus(
            asset.lastVerifiedAt,
            asset.healthCheckPeriod,
            asset.customPeriodDays,
            asset.reminderRule.daysBefore
          );
          return status === 'overdue';
        });
      },

      getWarningAssets: () => {
        const { assets } = get();
        return assets.filter((asset) => {
          const status = getHealthCheckStatus(
            asset.lastVerifiedAt,
            asset.healthCheckPeriod,
            asset.customPeriodDays,
            asset.reminderRule.daysBefore
          );
          return status === 'warning';
        });
      },

      addHeir: (heir) => {
        const now = new Date().toISOString();
        const currentHeirs = get().heirs;
        const maxPriority = currentHeirs.length > 0
          ? Math.max(...currentHeirs.map((h) => h.priority))
          : 0;
        const newHeir: Heir = {
          ...heir,
          id: generateId(),
          isVerified: false,
          assignedAssets: [],
          priority: maxPriority + 1,
          createdAt: now,
        };
        set((state) => ({ heirs: [...state.heirs, newHeir] }));
        get().addAuditLog({
          action: 'heir_added',
          description: `添加继承人：${heir.name}`,
          resourceType: 'heir',
          resourceId: newHeir.id,
        });
      },

      updateHeir: (id, updates) => {
        set((state) => ({
          heirs: state.heirs.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },

      deleteHeir: (id) => {
        const heir = get().heirs.find((h) => h.id === id);
        set((state) => {
          const updatedHeirs = state.heirs
            .filter((h) => h.id !== id)
            .sort((a, b) => a.priority - b.priority)
            .map((h, index) => ({ ...h, priority: index + 1 }));
          const updatedAssets = state.assets.map((asset) => {
            const newChain = asset.heirChain.filter((heirId) => heirId !== id);
            const newHeirId = newChain.length > 0 ? newChain[0] : undefined;
            return {
              ...asset,
              heirChain: newChain,
              heirId: newHeirId,
            };
          });
          return { heirs: updatedHeirs, assets: updatedAssets };
        });
        if (heir) {
          get().addAuditLog({
            action: 'heir_removed',
            description: `移除继承人：${heir.name}`,
            resourceType: 'heir',
            resourceId: id,
          });
        }
      },

      reorderHeirs: (heirIds) => {
        set((state) => {
          const reordered = heirIds.map((id, index) => {
            const heir = state.heirs.find((h) => h.id === id);
            return heir ? { ...heir, priority: index + 1 } : null;
          }).filter(Boolean) as Heir[];
          return { heirs: reordered };
        });
        get().addAuditLog({
          action: 'heir_added',
          description: '继承人顺位已调整',
          resourceType: 'heir',
        });
      },

      createWill: (will) => {
        const now = new Date().toISOString();
        const newWill: DigitalWill = {
          id: generateId(),
          ownerId: get().currentUser?.id || '',
          title: will.title || '我的数字遗嘱',
          description: will.description,
          status: 'draft',
          triggerCondition: will.triggerCondition || {
            type: 'inactivity_days',
            inactivityDays: DEFAULT_INACTIVITY_DAYS,
          },
          executionSteps: will.executionSteps || [],
          witnessIds: will.witnessIds || [],
          lawyerIds: will.lawyerIds || [],
          lastActiveAt: now,
          createdAt: now,
          updatedAt: now,
        };
        set({ will: newWill });
      },

      updateWill: (updates) => {
        set((state) => {
          if (!state.will) return {};
          return {
            will: { ...state.will, ...updates, updatedAt: new Date().toISOString() },
          };
        });
        get().addAuditLog({
          action: 'will_updated',
          description: '更新数字遗嘱',
          resourceType: 'will',
          resourceId: get().will?.id,
        });
      },

      addExecutionStep: (step) => {
        const newStep: ExecutionStep = {
          ...step,
          id: generateId(),
          completed: false,
        };
        set((state) => {
          if (!state.will) return {};
          const steps = [...state.will.executionSteps, newStep].sort((a, b) => a.order - b.order);
          return { will: { ...state.will, executionSteps: steps } };
        });
      },

      updateExecutionStep: (stepId, updates) => {
        set((state) => {
          if (!state.will) return {};
          return {
            will: {
              ...state.will,
              executionSteps: state.will.executionSteps.map((s) =>
                s.id === stepId ? { ...s, ...updates } : s
              ),
            },
          };
        });
      },

      removeExecutionStep: (stepId) => {
        set((state) => {
          if (!state.will) return {};
          return {
            will: {
              ...state.will,
              executionSteps: state.will.executionSteps.filter((s) => s.id !== stepId),
            },
          };
        });
      },

      triggerWill: () => {
        const now = new Date().toISOString();
        set((state) => {
          if (!state.will) return {};
          return {
            will: {
              ...state.will,
              status: 'triggered',
              triggeredAt: now,
              updatedAt: now,
            },
          };
        });
        get().addAuditLog({
          action: 'will_triggered',
          description: '数字遗嘱已触发',
          resourceType: 'will',
          resourceId: get().will?.id,
        });
        get().addNotification({
          type: 'warning',
          title: '数字遗嘱已触发',
          message: '遗嘱执行流程已启动，请按步骤完成资产移交',
        });
      },

      activateWill: () => {
        const now = new Date().toISOString();
        set((state) => {
          if (!state.will) return {};
          return {
            will: {
              ...state.will,
              status: 'active',
              updatedAt: now,
            },
          };
        });
        get().addAuditLog({
          action: 'will_updated',
          description: '数字遗嘱已生效',
          resourceType: 'will',
          resourceId: get().will?.id,
        });
      },

      addWitness: (witness) => {
        const now = new Date().toISOString();
        const newWitness: Witness = {
          ...witness,
          id: generateId(),
          verificationStatus: 'pending',
          createdAt: now,
        };
        set((state) => ({ witnesses: [...state.witnesses, newWitness] }));
      },

      updateWitness: (id, updates) => {
        set((state) => ({
          witnesses: state.witnesses.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        }));
      },

      deleteWitness: (id) => {
        set((state) => ({
          witnesses: state.witnesses.filter((w) => w.id !== id),
        }));
      },

      verifyWitness: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          witnesses: state.witnesses.map((w) =>
            w.id === id
              ? { ...w, verificationStatus: 'verified' as VerificationStatus, verifiedAt: now }
              : w
          ),
        }));
        const witness = get().witnesses.find((w) => w.id === id);
        if (witness) {
          get().addAuditLog({
            action: witness.isLawyer ? 'lawyer_approved' : 'witness_approved',
            description: `${witness.isLawyer ? '律师' : '见证人'}已验证：${witness.name}`,
            resourceType: 'witness',
            resourceId: id,
          });
        }
      },

      addAuditLog: (entry) => {
        const now = new Date().toISOString();
        const currentUser = get().currentUser;
        const lastLog = get().auditLogs[0];
        const previousHash = lastLog?.transactionHash || '00000000';
        const data = `${entry.action}-${entry.description}-${now}`;
        const transactionHash = generateHash(data + previousHash);

        const newLog: AuditLogEntry = {
          id: generateId(),
          timestamp: now,
          action: entry.action,
          userId: currentUser?.id || 'anonymous',
          userRole: currentUser?.role || 'admin',
          description: entry.description,
          ipAddress: '127.0.0.1',
          userAgent: navigator.userAgent,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          previousValue: entry.previousValue,
          newValue: entry.newValue,
          transactionHash,
          previousHash,
        };

        set((state) => ({
          auditLogs: [newLog, ...state.auditLogs],
        }));
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      recordActivity: () => {
        const now = new Date().toISOString();
        set((state) => {
          if (!state.will) return {};
          return {
            will: { ...state.will, lastActiveAt: now },
            currentUser: state.currentUser
              ? { ...state.currentUser, lastLoginAt: now }
              : state.currentUser,
          };
        });
      },

      simulation: {
        mode: 'idle',
        currentStepIndex: -1,
        report: null,
        isPlaying: false,
        playSpeed: 1,
      },

      startSimulation: () => {
        const { will, assets, heirs, witnesses } = get();
        if (!will) {
          get().addNotification({
            type: 'error',
            title: '模拟失败',
            message: '未找到遗嘱配置',
          });
          return;
        }

        const warnings: string[] = [];
        const triggerDate = new Date().toISOString();

        if (will.triggerCondition.requiresWitnessConfirmation) {
          const verifiedCount = witnesses.filter(w => w.verificationStatus === 'verified').length;
          const required = will.triggerCondition.witnessCount || DEFAULT_WITNESS_COUNT;
          if (verifiedCount < required) {
            warnings.push(`见证人验证不足：已验证 ${verifiedCount}/${required} 位`);
          }
        }
        if (will.triggerCondition.lawyerApprovalRequired) {
          const verifiedLawyers = witnesses.filter(w => w.isLawyer && w.verificationStatus === 'verified').length;
          if (verifiedLawyers < 1) {
            warnings.push('缺少已验证的律师审批');
          }
        }

        const unassignedAssets = assets.filter(a => !a.heirId && a.heirChain.length === 0);
        if (unassignedAssets.length > 0) {
          warnings.push(`${unassignedAssets.length} 项资产未分配继承人`);
        }

        const unverifiedHeirs = heirs.filter(h => !h.isVerified);
        if (unverifiedHeirs.length > 0) {
          warnings.push(`${unverifiedHeirs.length} 位继承人尚未完成身份验证`);
        }

        const heirMap = new Map(heirs.map(h => [h.id, h]));
        const witnessMap = new Map(witnesses.map(w => [w.id, w]));
        const assetMap = new Map(assets.map(a => [a.id, a]));

        let cumulativeDays = 0;
        const steps: SimulationStepDetail[] = will.executionSteps
          .sort((a, b) => a.order - b.order)
          .map((step) => {
            cumulativeDays += step.delayDays;
            const stepWarnings: string[] = [];

            const notifyTargets: SimulationNotifyTarget[] = [];
            (step.targetHeirIds || []).forEach(heirId => {
              const heir = heirMap.get(heirId);
              if (heir) {
                notifyTargets.push({
                  heirId: heir.id,
                  name: heir.name,
                  email: heir.email,
                  phone: heir.phone,
                  role: 'heir',
                  notificationMethod: heir.notificationPreference,
                });
              } else {
                stepWarnings.push(`继承人 ${heirId} 不存在`);
              }
            });

            if (step.actionType === 'notify' && notifyTargets.length === 0) {
              will.witnessIds.forEach(witnessId => {
                const witness = witnessMap.get(witnessId);
                if (witness) {
                  notifyTargets.push({
                    witnessId: witness.id,
                    name: witness.name,
                    email: witness.email,
                    phone: witness.phone,
                    role: witness.isLawyer ? 'lawyer' : 'witness',
                    notificationMethod: 'email',
                  });
                }
              });
            }

            const transferItems: SimulationTransferItem[] = [];
            (step.targetAssetIds || []).forEach(assetId => {
              const asset = assetMap.get(assetId);
              if (asset) {
                const heirId = asset.heirChain[0] || asset.heirId;
                const heir = heirId ? heirMap.get(heirId) : undefined;
                if (heir) {
                  transferItems.push({
                    assetId: asset.id,
                    assetName: asset.name,
                    assetType: asset.type,
                    assetValue: asset.value,
                    heirId: heir.id,
                    heirName: heir.name,
                    transferInstructions: asset.transferInstructions,
                  });
                } else {
                  stepWarnings.push(`资产「${asset.name}」未指定有效继承人`);
                }
              } else {
                stepWarnings.push(`资产 ${assetId} 不存在`);
              }
            });

            return {
              stepId: step.id,
              stepOrder: step.order,
              stepTitle: step.title,
              stepDescription: step.description,
              actionType: step.actionType,
              delayDays: step.delayDays,
              cumulativeDelayDays: cumulativeDays,
              notifyTargets,
              transferItems,
              estimatedExecutionDate: addDaysToDate(triggerDate, cumulativeDays),
              warnings: stepWarnings,
            };
          });

        const uniqueNotified = new Set<string>();
        steps.forEach(s => s.notifyTargets.forEach(t => uniqueNotified.add(t.email)));

        const heirBreakdown = heirs.map(heir => {
          const heirAssets = steps.flatMap(s => s.transferItems).filter(t => t.heirId === heir.id);
          return {
            heirId: heir.id,
            heirName: heir.name,
            assetCount: heirAssets.length,
            assetValue: heirAssets.reduce((sum, t) => sum + (t.assetValue || 0), 0),
          };
        }).filter(h => h.assetCount > 0);

        const totalAssetValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
        const totalTransferredValue = steps.flatMap(s => s.transferItems).reduce((sum, t) => sum + (t.assetValue || 0), 0);
        const assignedRatio = assets.length > 0
          ? steps.flatMap(s => s.transferItems).length / assets.length
          : 0;

        let readinessScore = 100;
        readinessScore -= warnings.length * 5;
        readinessScore -= (1 - assignedRatio) * 20;
        readinessScore = Math.max(0, Math.min(100, Math.round(readinessScore)));

        const summary: SimulationSummary = {
          totalSteps: steps.length,
          totalDurationDays: cumulativeDays,
          totalNotifiedPeople: uniqueNotified.size,
          totalTransferredAssets: steps.flatMap(s => s.transferItems).length,
          totalAssetValue: totalTransferredValue,
          heirBreakdown,
          warnings,
          readinessScore,
        };

        const report: SimulationReport = {
          id: generateId(),
          simulationTime: new Date().toISOString(),
          triggerCondition: will.triggerCondition,
          steps,
          summary,
          triggerDate,
        };

        set({
          simulation: {
            mode: 'running',
            currentStepIndex: 0,
            report,
            isPlaying: false,
            playSpeed: 1,
          },
        });

        get().addNotification({
          type: 'info',
          title: '沙箱模拟已启动',
          message: `共 ${steps.length} 个执行步骤，预计 ${cumulativeDays} 天完成`,
        });
      },

      stopSimulation: () => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            mode: 'completed',
            isPlaying: false,
          },
        }));
      },

      resetSimulation: () => {
        set({
          simulation: {
            mode: 'idle',
            currentStepIndex: -1,
            report: null,
            isPlaying: false,
            playSpeed: 1,
          },
        });
      },

      advanceSimulationStep: () => {
        const { simulation } = get();
        if (!simulation.report) return;

        const nextIndex = simulation.currentStepIndex + 1;
        if (nextIndex >= simulation.report.steps.length) {
          set({
            simulation: {
              ...simulation,
              mode: 'completed',
              isPlaying: false,
            },
          });
        } else {
          set({
            simulation: {
              ...simulation,
              currentStepIndex: nextIndex,
            },
          });
        }
      },

      setSimulationPlaySpeed: (speed: number) => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            playSpeed: speed,
          },
        }));
      },

      toggleSimulationPlay: () => {
        set((state) => ({
          simulation: {
            ...state.simulation,
            isPlaying: !state.simulation.isPlaying,
          },
        }));
      },
    }),
    {
      name: 'digital-legacy-storage',
    }
  )
);
