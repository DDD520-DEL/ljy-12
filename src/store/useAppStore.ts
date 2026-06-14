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
  WitnessApprovalGroup,
  WitnessApprovalDecision,
  WillExecutionState,
  Branch,
  BranchCondition,
  EmergencyContact,
  EmergencyContactSettings,
  TimeCapsule,
  TimeCapsuleStatus,
  Credential,
  CredentialField,
  CredentialCategory,
  CredentialAccessLevel,
  VaultState,
  Charity,
  DonationPlan,
  DonationItem,
  DonationAllocation,
  DonationExecutionState,
  DonationStatus,
  DonationItemType,
  CharityCategory,
  HeirVerificationDetail,
  VerificationMaterial,
  VerificationHistoryRecord,
  HeirVerificationStatus,
  VerificationMaterialType,
  AssetNote,
  AssetNoteCategory,
} from '@/types';
import {
  generateId,
  generateHash,
  DEFAULT_INACTIVITY_DAYS,
  DEFAULT_WITNESS_COUNT,
  DEFAULT_HEALTH_CHECK_PERIOD,
  DEFAULT_REMINDER_DAYS,
  DEFAULT_EMERGENCY_THRESHOLD_DAYS,
  DEFAULT_EMERGENCY_CONFIRMATION_WINDOW,
  getHealthCheckStatus,
  getHealthCheckPeriodDays,
  addDaysToDate,
  daysSince,
  formatDate,
  getTimeCapsuleStatus,
  DEFAULT_AUTO_LOCK_MINUTES,
  CREDENTIAL_CATEGORY_LABELS,
  PRESET_CHARITIES,
  CHARITY_CATEGORY_LABELS,
} from '@/constants';

interface AppState {
  currentUser: User | null;
  assets: DigitalAsset[];
  heirs: Heir[];
  will: DigitalWill | null;
  witnesses: Witness[];
  approvalGroups: WitnessApprovalGroup[];
  auditLogs: AuditLogEntry[];
  notifications: Notification[];
  emergencyContact: EmergencyContact | null;
  emergencySettings: EmergencyContactSettings;
  credentials: Credential[];
  vault: VaultState;

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
  bulkUpdateHeir: (assetIds: string[], heirChain: string[]) => void;
  bulkUpdateType: (assetIds: string[], type: AssetType) => void;

  addHeir: (heir: Omit<Heir, 'id' | 'createdAt' | 'isVerified' | 'assignedAssets' | 'priority'>) => void;
  updateHeir: (id: string, updates: Partial<Heir>) => void;
  deleteHeir: (id: string) => void;
  reorderHeirs: (heirIds: string[]) => void;
  sendHeirVerificationReminder: (heirId: string) => void;
  resetHeirVerification: (heirId: string) => void;
  verifyHeir: (heirId: string) => void;
  rejectHeirVerification: (heirId: string, reason: string) => void;
  approveHeirMaterial: (heirId: string, materialId: string) => void;
  rejectHeirMaterial: (heirId: string, materialId: string, reason: string) => void;
  submitHeirMaterial: (heirId: string, material: Omit<VerificationMaterial, 'id' | 'uploadedAt' | 'status'>) => void;
  getHeirVerificationOverview: () => { total: number; verified: number; pending: number; rejected: number; inProgress: number };

  createWill: (will: Partial<DigitalWill>) => void;
  updateWill: (updates: Partial<DigitalWill>) => void;
  addExecutionStep: (step: Omit<ExecutionStep, 'id' | 'completed'>) => void;
  updateExecutionStep: (stepId: string, updates: Partial<ExecutionStep>) => void;
  removeExecutionStep: (stepId: string) => void;
  evaluateBranchConditions: (stepId: string) => string | null;
  executeStepWithBranches: (stepId: string) => void;
  triggerWill: () => void;
  activateWill: () => void;

  addWitness: (witness: Omit<Witness, 'id' | 'createdAt' | 'verificationStatus'>) => void;
  updateWitness: (id: string, updates: Partial<Witness>) => void;
  deleteWitness: (id: string) => void;
  verifyWitness: (id: string) => void;

  createApprovalGroup: (group: Omit<WitnessApprovalGroup, 'id' | 'createdAt' | 'updatedAt' | 'approvals' | 'status'>) => void;
  updateApprovalGroup: (groupId: string, updates: Partial<Omit<WitnessApprovalGroup, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteApprovalGroup: (groupId: string) => void;
  assignWitnessToGroup: (groupId: string, witnessId: string) => void;
  removeWitnessFromGroup: (groupId: string, witnessId: string) => void;
  submitWitnessApproval: (groupId: string, witnessId: string, decision: WitnessApprovalDecision, comment?: string) => void;
  getApprovalGroupProgress: (groupId: string) => { approved: number; required: number; total: number; percentage: number };
  getWillExecutionState: () => WillExecutionState;

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

  setEmergencyContact: (contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'isVerified' | 'status'>) => void;
  updateEmergencyContact: (updates: Partial<EmergencyContact>) => void;
  removeEmergencyContact: () => void;
  verifyEmergencyContact: () => void;
  updateEmergencySettings: (settings: Partial<EmergencyContactSettings>) => void;
  notifyEmergencyContact: () => void;
  emergencyContactConfirmAlive: (note?: string) => void;
  emergencyContactConfirmDeceased: (note?: string) => void;
  emergencyContactTriggerWill: (note?: string) => void;
  emergencyContactExtendPeriod: (days: number, note?: string) => void;
  checkEmergencyThreshold: () => void;
  getEmergencyContactStatus: () => { daysInactive: number; thresholdDays: number; isOverThreshold: boolean; confirmationWindowDays: number; daysSinceNotification?: number; isInConfirmationWindow: boolean };

  setTimeCapsule: (assetId: string, capsule: Omit<TimeCapsule, 'createdAt'>) => void;
  removeTimeCapsule: (assetId: string) => void;
  unlockTimeCapsule: (assetId: string) => void;
  autoDecryptExpiredCapsules: () => void;
  getCapsuleAssets: () => DigitalAsset[];
  getLockedCapsuleAssets: () => DigitalAsset[];
  getUnlockedCapsuleAssets: () => DigitalAsset[];

  addCredential: (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt' | 'isEncrypted'> & { fields: Omit<CredentialField, 'id'>[] }) => void;
  updateCredential: (id: string, updates: Partial<Omit<Credential, 'id' | 'createdAt'>>) => void;
  deleteCredential: (id: string) => void;
  getCredentialsByAsset: (assetId: string) => Credential[];
  getCredentialsByCategory: (category: CredentialCategory) => Credential[];
  markCredentialAccessed: (id: string) => void;
  revealCredential: (id: string) => CredentialField[] | null;

  setMasterPassword: (password: string, hint?: string) => boolean;
  changeMasterPassword: (oldPassword: string, newPassword: string, hint?: string) => boolean;
  verifyMasterPassword: (password: string) => boolean;
  unlockVault: (password: string) => boolean;
  lockVault: () => void;
  updateVaultAutoLock: (minutes: number) => void;
  getDecryptedCredentialsForHeir: (heirId: string, executionStep: number) => Credential[];

  presetCharities: Charity[];
  customCharities: Charity[];
  donationPlan: DonationPlan | null;

  addCustomCharity: (charity: Omit<Charity, 'id' | 'isPreset'>) => void;
  updateCustomCharity: (id: string, updates: Partial<Charity>) => void;
  removeCustomCharity: (id: string) => void;
  getAllCharities: () => Charity[];
  getCharitiesByCategory: (category: CharityCategory) => Charity[];

  createDonationPlan: (plan: Partial<DonationPlan> & { title: string }) => void;
  updateDonationPlan: (updates: Partial<DonationPlan>) => void;
  deleteDonationPlan: () => void;
  activateDonationPlan: () => void;

  addDonationItem: (item: Omit<DonationItem, 'id'>) => void;
  updateDonationItem: (itemId: string, updates: Partial<DonationItem>) => void;
  removeDonationItem: (itemId: string) => void;

  setDonationAllocation: (itemId: string, allocations: Array<{ charityId: string; percentage: number }>) => void;
  updateDonationAllocation: (allocationId: string, updates: Partial<DonationAllocation>) => void;

  getDonationExecutionState: () => DonationExecutionState;
  startDonationExecution: () => void;
  completeDonationStep: (itemId: string) => void;
  completeDonationExecution: () => void;
  cancelDonationExecution: () => void;

  getDonationTotalValue: () => number;
  getDonationItemValue: (item: DonationItem) => number;

  assetNotes: AssetNote[];
  addAssetNote: (note: Omit<AssetNote, 'id' | 'createdAt' | 'updatedAt'> & { authorId?: string; authorName?: string }) => void;
  updateAssetNote: (id: string, updates: Partial<Omit<AssetNote, 'id' | 'assetId' | 'createdAt'>>) => void;
  deleteAssetNote: (id: string) => void;
  getAssetNotesByAsset: (assetId: string) => AssetNote[];
  getAssetNotesByCategory: (assetId: string, category: AssetNoteCategory) => AssetNote[];
  getImportantNotes: (assetId?: string) => AssetNote[];
  toggleAssetNoteImportant: (id: string) => void;
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
    timeCapsule: {
      enabled: true,
      unlockDate: new Date('2028-01-01').toISOString(),
      status: 'locked',
      createdAt: new Date('2024-06-01').toISOString(),
      note: '子女成年后解锁',
    },
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
    verification: {
      status: 'verified',
      progress: 100,
      totalMaterialsRequired: 3,
      submittedMaterials: 3,
      verifiedMaterials: 3,
      reminderCount: 0,
      invitedAt: new Date('2024-01-10').toISOString(),
      verifiedAt: new Date('2024-01-20').toISOString(),
      materials: [
        {
          id: 'mat-001',
          type: 'id_card',
          name: '身份证正反面',
          fileName: 'id_card_lifang.jpg',
          uploadedAt: new Date('2024-01-12').toISOString(),
          verifiedAt: new Date('2024-01-15').toISOString(),
          status: 'verified',
        },
        {
          id: 'mat-002',
          type: 'household_register',
          name: '户口本本人页',
          fileName: 'household_lifang.jpg',
          uploadedAt: new Date('2024-01-13').toISOString(),
          verifiedAt: new Date('2024-01-16').toISOString(),
          status: 'verified',
        },
        {
          id: 'mat-003',
          type: 'marriage_certificate',
          name: '结婚证',
          fileName: 'marriage_cert.jpg',
          uploadedAt: new Date('2024-01-14').toISOString(),
          verifiedAt: new Date('2024-01-18').toISOString(),
          status: 'verified',
        },
      ],
      history: [
        {
          id: 'hist-001',
          timestamp: new Date('2024-01-10').toISOString(),
          action: 'invited',
          operatorName: '张明',
          operatorRole: 'owner',
          note: '系统发送验证邀请邮件',
        },
        {
          id: 'hist-002',
          timestamp: new Date('2024-01-12').toISOString(),
          action: 'material_submitted',
          operatorName: '李芳',
          operatorRole: 'heir',
          materialName: '身份证正反面',
        },
        {
          id: 'hist-003',
          timestamp: new Date('2024-01-13').toISOString(),
          action: 'material_submitted',
          operatorName: '李芳',
          operatorRole: 'heir',
          materialName: '户口本本人页',
        },
        {
          id: 'hist-004',
          timestamp: new Date('2024-01-14').toISOString(),
          action: 'material_submitted',
          operatorName: '李芳',
          operatorRole: 'heir',
          materialName: '结婚证',
        },
        {
          id: 'hist-005',
          timestamp: new Date('2024-01-15').toISOString(),
          action: 'material_approved',
          operatorName: '系统管理员',
          operatorRole: 'admin',
          materialName: '身份证正反面',
        },
        {
          id: 'hist-006',
          timestamp: new Date('2024-01-16').toISOString(),
          action: 'material_approved',
          operatorName: '系统管理员',
          operatorRole: 'admin',
          materialName: '户口本本人页',
        },
        {
          id: 'hist-007',
          timestamp: new Date('2024-01-18').toISOString(),
          action: 'material_approved',
          operatorName: '王律师',
          operatorRole: 'lawyer',
          materialName: '结婚证',
        },
        {
          id: 'hist-008',
          timestamp: new Date('2024-01-20').toISOString(),
          action: 'verified',
          operatorName: '系统管理员',
          operatorRole: 'admin',
          note: '所有材料审核通过，身份验证完成',
        },
      ],
    },
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
    verification: {
      status: 'verified',
      progress: 100,
      totalMaterialsRequired: 3,
      submittedMaterials: 3,
      verifiedMaterials: 3,
      reminderCount: 1,
      lastReminderAt: new Date('2024-01-25').toISOString(),
      invitedAt: new Date('2024-01-12').toISOString(),
      verifiedAt: new Date('2024-02-05').toISOString(),
      materials: [
        {
          id: 'mat-004',
          type: 'id_card',
          name: '身份证正反面',
          fileName: 'id_card_zhangwei.jpg',
          uploadedAt: new Date('2024-01-20').toISOString(),
          verifiedAt: new Date('2024-01-28').toISOString(),
          status: 'verified',
        },
        {
          id: 'mat-005',
          type: 'birth_certificate',
          name: '出生证明',
          fileName: 'birth_cert_zhangwei.jpg',
          uploadedAt: new Date('2024-01-22').toISOString(),
          verifiedAt: new Date('2024-01-30').toISOString(),
          status: 'verified',
        },
        {
          id: 'mat-006',
          type: 'household_register',
          name: '户口本本人页',
          fileName: 'hukou_zhangwei.jpg',
          uploadedAt: new Date('2024-01-26').toISOString(),
          verifiedAt: new Date('2024-02-02').toISOString(),
          status: 'verified',
        },
      ],
      history: [
        {
          id: 'hist-009',
          timestamp: new Date('2024-01-12').toISOString(),
          action: 'invited',
          operatorName: '张明',
          operatorRole: 'owner',
          note: '系统发送验证邀请邮件',
        },
        {
          id: 'hist-010',
          timestamp: new Date('2024-01-20').toISOString(),
          action: 'material_submitted',
          operatorName: '张伟',
          operatorRole: 'heir',
          materialName: '身份证正反面',
        },
        {
          id: 'hist-011',
          timestamp: new Date('2024-01-22').toISOString(),
          action: 'material_submitted',
          operatorName: '张伟',
          operatorRole: 'heir',
          materialName: '出生证明',
        },
        {
          id: 'hist-012',
          timestamp: new Date('2024-01-25').toISOString(),
          action: 'reminder_sent',
          operatorName: '系统管理员',
          operatorRole: 'admin',
          note: '提醒提交剩余验证材料',
        },
        {
          id: 'hist-013',
          timestamp: new Date('2024-01-26').toISOString(),
          action: 'material_submitted',
          operatorName: '张伟',
          operatorRole: 'heir',
          materialName: '户口本本人页',
        },
        {
          id: 'hist-014',
          timestamp: new Date('2024-01-28').toISOString(),
          action: 'material_approved',
          operatorName: '系统管理员',
          operatorRole: 'admin',
          materialName: '身份证正反面',
        },
        {
          id: 'hist-015',
          timestamp: new Date('2024-01-30').toISOString(),
          action: 'material_approved',
          operatorName: '系统管理员',
          operatorRole: 'admin',
          materialName: '出生证明',
        },
        {
          id: 'hist-016',
          timestamp: new Date('2024-02-02').toISOString(),
          action: 'material_approved',
          operatorName: '系统管理员',
          operatorRole: 'admin',
          materialName: '户口本本人页',
        },
        {
          id: 'hist-017',
          timestamp: new Date('2024-02-05').toISOString(),
          action: 'verified',
          operatorName: '系统管理员',
          operatorRole: 'admin',
          note: '所有材料审核通过，身份验证完成',
        },
      ],
    },
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
    verification: {
      status: 'in_progress',
      progress: 33,
      totalMaterialsRequired: 3,
      submittedMaterials: 1,
      verifiedMaterials: 0,
      reminderCount: 2,
      lastReminderAt: new Date('2024-06-01').toISOString(),
      invitedAt: new Date('2024-02-01').toISOString(),
      materials: [
        {
          id: 'mat-007',
          type: 'id_card',
          name: '身份证正反面',
          fileName: 'id_card_zjg.jpg',
          uploadedAt: new Date('2024-02-10').toISOString(),
          status: 'pending',
        },
        {
          id: 'mat-008',
          type: 'household_register',
          name: '户口本本人页',
          status: 'pending',
        },
        {
          id: 'mat-009',
          type: 'birth_certificate',
          name: '亲属关系证明',
          status: 'pending',
        },
      ],
      history: [
        {
          id: 'hist-018',
          timestamp: new Date('2024-02-01').toISOString(),
          action: 'invited',
          operatorName: '张明',
          operatorRole: 'owner',
          note: '系统发送验证邀请短信',
        },
        {
          id: 'hist-019',
          timestamp: new Date('2024-02-10').toISOString(),
          action: 'material_submitted',
          operatorName: '张建国',
          operatorRole: 'heir',
          materialName: '身份证正反面',
        },
        {
          id: 'hist-020',
          timestamp: new Date('2024-03-15').toISOString(),
          action: 'reminder_sent',
          operatorName: '系统管理员',
          operatorRole: 'admin',
          note: '第一次提醒：请尽快提交剩余验证材料',
        },
        {
          id: 'hist-021',
          timestamp: new Date('2024-06-01').toISOString(),
          action: 'reminder_sent',
          operatorName: '系统管理员',
          operatorRole: 'admin',
          note: '第二次提醒：验证材料尚未提交完整，请尽快完成',
        },
      ],
    },
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

const createInitialApprovalGroups = (): WitnessApprovalGroup[] => [
  {
    id: 'group-001',
    name: '律师审批组',
    description: '由执业律师组成的审批组，负责法律合规性审核',
    witnessIds: ['witness-001'],
    requiredApprovals: 1,
    approvals: [],
    status: 'pending',
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString(),
  },
  {
    id: 'group-002',
    name: '亲友见证组',
    description: '由亲友见证人组成的审批组，确认遗嘱执行意愿',
    witnessIds: ['witness-002'],
    requiredApprovals: 1,
    approvals: [],
    status: 'pending',
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2024-03-01').toISOString(),
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
  let logIndex = 1;

  const users: { id: string; role: 'owner' | 'heir' | 'witness' | 'lawyer' | 'admin'; name: string }[] = [
    { id: 'user-001', role: 'owner', name: '张明' },
    { id: 'user-002', role: 'heir', name: '李芳' },
    { id: 'user-003', role: 'heir', name: '张伟' },
    { id: 'user-004', role: 'lawyer', name: '王律师' },
    { id: 'user-005', role: 'witness', name: '陈刚' },
    { id: 'user-006', role: 'admin', name: '系统管理员' },
  ];

  const resourceTypes = ['asset', 'heir', 'will', 'witness', 'approval_group', 'user', 'notification', 'emergency_contact', 'settings', 'time_capsule'];
  const actions: AuditActionType[] = [
    'asset_created', 'asset_updated', 'asset_deleted', 'asset_verified',
    'heir_added', 'heir_removed',
    'will_updated', 'will_triggered',
    'mfa_enabled', 'mfa_disabled',
    'login', 'logout',
    'witness_approved', 'lawyer_approved',
    'notification_sent',
    'healthcheck_reminder', 'healthcheck_settings_updated',
    'approval_group_created', 'approval_group_updated', 'approval_group_deleted',
    'witness_assigned_to_group', 'witness_removed_from_group', 'witness_approval_submitted',
    'bulk_heir_assigned', 'bulk_type_updated', 'bulk_export_csv',
    'emergency_contact_added', 'emergency_contact_updated', 'emergency_contact_removed', 'emergency_contact_notified',
    'time_capsule_created', 'time_capsule_updated', 'time_capsule_unlocked',
    'donation_plan_created', 'donation_plan_updated', 'donation_plan_deleted',
    'donation_item_added', 'donation_item_removed', 'donation_allocation_updated',
    'donation_execution_started', 'donation_execution_completed', 'donation_step_completed',
  ];

  const actionDescriptions: Record<AuditActionType, (userName: string, resourceType: string) => string> = {
    asset_created: (_, rt) => `创建${rt}资产记录`,
    asset_updated: (_, rt) => `更新${rt}资产信息`,
    asset_deleted: (_, rt) => `删除${rt}资产`,
    asset_verified: (_, rt) => `验证${rt}资产状态`,
    heir_added: (name) => `${name}添加了继承人`,
    heir_removed: (name) => `${name}移除了继承人`,
    will_updated: (name) => `${name}更新了数字遗嘱`,
    will_triggered: (name) => `${name}触发了遗嘱执行`,
    mfa_enabled: (name) => `${name}启用了多因素认证`,
    mfa_disabled: (name) => `${name}禁用了多因素认证`,
    login: (name) => `${name}登录了系统`,
    logout: (name) => `${name}退出了系统`,
    witness_approved: (name) => `见证人${name}已确认身份`,
    lawyer_approved: (name) => `律师${name}已通过认证`,
    notification_sent: (name, rt) => `${name}发送了${rt}相关通知`,
    healthcheck_reminder: (_, rt) => `系统发送${rt}健康检查提醒`,
    healthcheck_settings_updated: (name, rt) => `${name}更新了${rt}健康检查设置`,
    approval_group_created: (name) => `${name}创建了审批组`,
    approval_group_updated: (name) => `${name}更新了审批组`,
    approval_group_deleted: (name) => `${name}删除了审批组`,
    witness_assigned_to_group: (name) => `${name}分配了见证人到审批组`,
    witness_removed_from_group: (name) => `${name}从审批组移除了见证人`,
    witness_approval_submitted: (name) => `${name}提交了审批意见`,
    approval_group_completed: () => `审批组已完成审批`,
    will_execution_advanced: () => `遗嘱执行进度推进`,
    branch_condition_evaluated: () => `条件分支已评估`,
    branch_path_triggered: () => `条件分支路径已触发`,
    bulk_heir_assigned: (name) => `${name}批量分配了继承人`,
    bulk_type_updated: (name) => `${name}批量修改了资产分类`,
    bulk_export_csv: (name) => `${name}导出了资产清单CSV`,
    emergency_contact_added: (name) => `${name}添加了紧急联系人`,
    emergency_contact_updated: (name) => `${name}更新了紧急联系人`,
    emergency_contact_removed: (name) => `${name}移除了紧急联系人`,
    emergency_contact_verified: (name) => `${name}验证了紧急联系人`,
    emergency_contact_notified: (name) => `${name}通知了紧急联系人`,
    emergency_contact_confirmed_alive: (name) => `紧急联系人确认${name}健在`,
    emergency_contact_confirmed_deceased: (name) => `紧急联系人确认${name}身故`,
    emergency_contact_triggered_will: () => `紧急联系人触发了遗嘱`,
    emergency_contact_extended_period: (name) => `${name}延长了观察期`,
    emergency_settings_updated: (name) => `${name}更新了紧急联系人设置`,
    time_capsule_created: (name) => `${name}创建了时间胶囊`,
    time_capsule_updated: (name) => `${name}更新了时间胶囊`,
    time_capsule_unlocked: (name) => `${name}解锁了时间胶囊`,
    time_capsule_auto_decrypted: () => `时间胶囊已自动解密`,
    asset_transferred: (name, rt) => `${name}移交了${rt}资产`,

    donation_plan_created: (name) => `${name}创建了捐赠规划`,
    donation_plan_updated: (name) => `${name}更新了捐赠规划`,
    donation_plan_deleted: (name) => `${name}删除了捐赠规划`,
    donation_item_added: (name) => `${name}添加了捐赠项目`,
    donation_item_removed: (name) => `${name}移除了捐赠项目`,
    donation_allocation_updated: (name) => `${name}更新了捐赠分配规则`,
    donation_execution_started: (name) => `${name}启动了捐赠执行`,
    donation_execution_completed: (name) => `${name}完成了全部捐赠执行`,
    donation_step_completed: (name) => `${name}完成了一个捐赠步骤`,

    credential_created: (name) => `${name}创建了凭据`,
    credential_updated: (name) => `${name}更新了凭据`,
    credential_deleted: (name) => `${name}删除了凭据`,
    credential_viewed: (name) => `${name}查看了凭据`,
    credential_revealed: (name) => `${name}解密了凭据内容`,
    credential_decrypted_for_heir: (name) => `${name}向继承人解密凭据`,
    master_password_set: (name) => `${name}设置了主密码`,
    master_password_changed: (name) => `${name}修改了主密码`,
    vault_locked: (name) => `${name}锁定了密码保险箱`,
    vault_unlocked: (name) => `${name}解锁了密码保险箱`,

    heir_verification_reminder_sent: (name) => `${name}发送了继承人验证提醒`,
    heir_verification_reset: (name) => `${name}重置了继承人验证流程`,
    heir_verification_completed: (name) => `${name}完成了继承人身份验证`,
    heir_verification_rejected: (name) => `${name}拒绝了继承人身份验证`,
    heir_verification_material_submitted: (name) => `${name}提交了验证材料`,
    heir_verification_material_approved: (name) => `${name}通过了验证材料`,
    heir_verification_material_rejected: (name) => `${name}驳回了验证材料`,
  };

  const ipAddresses = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '192.168.2.88', '10.0.1.200'];
  const userAgents = [
    'Chrome/125.0.0.0 Windows NT 10.0',
    'Safari/17.0 Macintosh; Intel Mac OS X 14_0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
    'Firefox/126.0 Windows NT 10.0',
    'Edge/125.0 Windows NT 10.0',
  ];

  const now = new Date();
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() - dayOffset);
    const logsPerDay = Math.floor(Math.random() * 8) + 3;

    for (let i = 0; i < logsPerDay; i++) {
      const logTime = new Date(dayDate);
      logTime.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      const desc = actionDescriptions[action]?.(user.name, resourceType) || `${user.name}执行了操作`;

      const data = `${action}-${desc}-${logTime.toISOString()}`;
      const hash = generateHash(data + previousHash);

      logs.push({
        id: `log-${String(logIndex).padStart(4, '0')}`,
        timestamp: logTime.toISOString(),
        action,
        userId: user.id,
        userRole: user.role,
        description: desc,
        ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
        resourceType,
        resourceId: `res-${Math.floor(Math.random() * 100)}`,
        transactionHash: hash,
        previousHash,
      });
      previousHash = hash;
      logIndex++;
    }
  }

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

const createInitialCredentials = (): Credential[] => [
  {
    id: 'cred-001',
    assetId: 'asset-001',
    name: '微信登录密码',
    category: 'password',
    description: '微信账号主登录密码，包含支付密码',
    fields: [
      { id: 'f-001', label: '登录密码', value: 'Weixin@2024#Secure', type: 'password', isSensitive: true },
      { id: 'f-002', label: '支付密码', value: '886622', type: 'password', isSensitive: true },
    ],
    accessLevel: 'heir_step_1',
    heirChainOrder: 1,
    revealDelayDays: 7,
    isEncrypted: true,
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
    lastAccessedAt: new Date('2024-06-01').toISOString(),
    tags: ['重要', '社交媒体'],
  },
  {
    id: 'cred-002',
    assetId: 'asset-003',
    name: '比特币钱包恢复助记词',
    category: 'seed_phrase',
    description: '冷钱包 BIP39 助记词，共24个单词',
    fields: [
      { id: 'f-003', label: '助记词', value: 'abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual', type: 'textarea', isSensitive: true },
    ],
    accessLevel: 'heir_step_2',
    heirChainOrder: 2,
    revealDelayDays: 30,
    isEncrypted: true,
    createdAt: new Date('2024-03-10').toISOString(),
    updatedAt: new Date('2024-03-10').toISOString(),
    lastAccessedAt: new Date('2024-05-15').toISOString(),
    tags: ['加密货币', '最高权限'],
  },
  {
    id: 'cred-003',
    assetId: 'asset-002',
    name: '百度网盘账号密码',
    category: 'password',
    description: '百度网盘登录凭证，约2TB家庭照片',
    fields: [
      { id: 'f-004', label: '账号', value: 'zhangming@example.com', type: 'text', isSensitive: false },
      { id: 'f-005', label: '密码', value: 'BaiduPan!Family2024', type: 'password', isSensitive: true },
    ],
    accessLevel: 'heir_step_1',
    heirChainOrder: 1,
    revealDelayDays: 7,
    isEncrypted: true,
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date('2024-02-15').toISOString(),
    tags: ['家庭相册'],
  },
  {
    id: 'cred-004',
    assetId: 'asset-005',
    name: 'Gmail 两步验证恢复密钥',
    category: 'recovery_key',
    description: 'Google 账号 2FA 恢复代码，用于紧急恢复访问',
    fields: [
      { id: 'f-006', label: '恢复代码 1', value: 'ABCD-1234-EFGH-5678', type: 'text', isSensitive: true },
      { id: 'f-007', label: '恢复代码 2', value: 'IJKL-9012-MNOP-3456', type: 'text', isSensitive: true },
      { id: 'f-008', label: '恢复代码 3', value: 'QRST-7890-UVWX-1234', type: 'text', isSensitive: true },
    ],
    accessLevel: 'heir_step_1',
    heirChainOrder: 1,
    revealDelayDays: 7,
    isEncrypted: true,
    createdAt: new Date('2024-04-05').toISOString(),
    updatedAt: new Date('2024-04-05').toISOString(),
    tags: ['邮箱', '重要'],
  },
  {
    id: 'cred-005',
    name: '银行保险柜钥匙存放位置',
    category: 'other',
    description: '存放比特币硬件钱包和重要文件的银行保险柜信息',
    fields: [
      { id: 'f-009', label: '银行名称', value: '中国工商银行北京分行营业部', type: 'text', isSensitive: false },
      { id: 'f-010', label: '保险柜编号', value: 'A-2088', type: 'text', isSensitive: true },
      { id: 'f-011', label: '钥匙存放', value: '家中书房抽屉密码盒内（密码1984）', type: 'textarea', isSensitive: true },
    ],
    accessLevel: 'lawyer_only',
    revealDelayDays: 0,
    isEncrypted: true,
    createdAt: new Date('2024-05-01').toISOString(),
    updatedAt: new Date('2024-05-01').toISOString(),
    tags: ['实物', '律师见证'],
  },
];

const createInitialVaultState = (): VaultState => ({
  isUnlocked: false,
  masterPassword: null,
  failedAttempts: 0,
  autoLockMinutes: DEFAULT_AUTO_LOCK_MINUTES,
});

const createInitialAssetNotes = (): AssetNote[] => [
  {
    id: 'note-001',
    assetId: 'asset-001',
    category: 'inheritance_tips',
    title: '账号继承注意事项',
    content: '此微信账号绑定了个人手机号，请在继承后及时更换绑定手机号。\n\n注意事项：\n1. 登录后先前往「设置-账号与安全」修改绑定手机号\n2. 支付密码需要在银行保险柜中取出硬件密钥后重置\n3. 请保留重要聊天记录的备份',
    contentHtml: '<p>此微信账号绑定了个人手机号，请在继承后<strong>及时更换绑定手机号</strong>。</p><p><br></p><p>注意事项：</p><ol><li>登录后先前往「设置-账号与安全」修改绑定手机号</li><li>支付密码需要在银行保险柜中取出硬件密钥后重置</li><li>请保留重要聊天记录的备份</li></ol>',
    createdAt: new Date('2024-05-15').toISOString(),
    updatedAt: new Date('2024-05-15').toISOString(),
    authorId: 'user-001',
    authorName: '张明',
    isImportant: true,
    tags: ['重要', '手机号更换'],
  },
  {
    id: 'note-002',
    assetId: 'asset-001',
    category: 'emotional_message',
    title: '给芳的话',
    content: '芳，这个微信里有我们从相识到现在的所有聊天记录，还有孩子们的成长照片。\n\n我知道你一直很珍惜这些回忆，希望它们能在我不在的时候，给你带来一些温暖。\n\n记得告诉孩子们，爸爸永远爱他们。—— 张明',
    contentHtml: '<p>芳，这个微信里有我们从相识到现在的所有聊天记录，还有孩子们的成长照片。</p><p><br></p><p>我知道你一直很珍惜这些回忆，希望它们能在我不在的时候，给你带来一些温暖。</p><p><br></p><p>记得告诉孩子们，<strong>爸爸永远爱他们</strong>。—— 张明</p>',
    createdAt: new Date('2024-05-20').toISOString(),
    updatedAt: new Date('2024-05-20').toISOString(),
    authorId: 'user-001',
    authorName: '张明',
    isImportant: true,
    tags: ['情感', '家人'],
  },
  {
    id: 'note-003',
    assetId: 'asset-002',
    category: 'operation_guide',
    title: '百度网盘使用指引',
    content: '亲爱的伟伟：\n\n百度网盘中存放了全家人这些年的照片和视频。\n\n📁 目录结构：\n- /家庭照片/：按年份分类的照片\n- /重要文档/：房产证、学历证明等扫描件\n- /工作资料/：我的工作项目备份\n\n💡 操作建议：\n1. 建议下载「百度网盘」客户端，体验更好\n2. 可以将重要照片下载到本地硬盘做双备份\n3. 里面有你小时候的视频，记得看看',
    contentHtml: '<p>亲爱的伟伟：</p><p><br></p><p>百度网盘中存放了全家人这些年的照片和视频。</p><p><br></p><p>📁 目录结构：</p><ul><li>/家庭照片/：按年份分类的照片</li><li>/重要文档/：房产证、学历证明等扫描件</li><li>/工作资料/：我的工作项目备份</li></ul><p><br></p><p>💡 操作建议：</p><ol><li>建议下载「百度网盘」客户端，体验更好</li><li>可以将重要照片下载到本地硬盘做双备份</li><li>里面有你小时候的视频，记得看看 😊</li></ol>',
    createdAt: new Date('2024-06-01').toISOString(),
    updatedAt: new Date('2024-06-01').toISOString(),
    authorId: 'user-001',
    authorName: '张明',
    isImportant: false,
    tags: ['操作指引', '家庭相册'],
  },
  {
    id: 'note-004',
    assetId: 'asset-003',
    category: 'inheritance_tips',
    title: '比特币钱包继承重要提示',
    content: '⚠️ 极高价值资产，请务必仔细阅读！\n\n【资产说明】\n约0.5个比特币，存储在硬件冷钱包中。\n\n【取件流程】\n1. 联系王律师（律师见证下开启）\n2. 前往中国工商银行北京分行营业部\n3. 开启保险柜编号 A-2088\n4. 内有硬件钱包 + 助记词纸质备份\n\n【安全提示】\n- 绝对不要在联网电脑上输入助记词\n- 使用官方钱包软件进行转账\n- 建议分多次小额转账，避免引起关注\n- 如有疑问，先咨询王律师',
    contentHtml: '<p><strong>⚠️ 极高价值资产，请务必仔细阅读！</strong></p><p><br></p><p>【资产说明】</p><p>约0.5个比特币，存储在硬件冷钱包中。</p><p><br></p><p>【取件流程】</p><ol><li>联系王律师（<em>律师见证下开启</em>）</li><li>前往中国工商银行北京分行营业部</li><li>开启保险柜编号 A-2088</li><li>内有硬件钱包 + 助记词纸质备份</li></ol><p><br></p><p>【安全提示】</p><ul><li>绝对<strong>不要</strong>在联网电脑上输入助记词</li><li>使用<strong>官方钱包软件</strong>进行转账</li><li>建议分多次小额转账，避免引起关注</li><li>如有疑问，先咨询王律师</li></ul>',
    createdAt: new Date('2024-04-10').toISOString(),
    updatedAt: new Date('2024-06-05').toISOString(),
    authorId: 'user-001',
    authorName: '张明',
    isImportant: true,
    tags: ['最高优先级', '律师见证', '安全警示'],
  },
  {
    id: 'note-005',
    assetId: 'asset-005',
    category: 'operation_guide',
    title: 'Gmail邮箱账号处理指引',
    content: '芳，这个Gmail是我主要的工作邮箱：\n\n📧 需要处理的事项：\n1. 工作相关的邮件，请转发给我的同事李伟（liwei@company.com）\n2. 各种网站注册的账号，建议逐一修改绑定邮箱\n3. 银行账单邮件请留意，不要漏看\n4. 我的简历和求职信在「工作资料」标签中\n\n💡 两步验证恢复代码已保存在密码保险箱中，请妥善保管。',
    contentHtml: '<p>芳，这个Gmail是我主要的工作邮箱：</p><p><br></p><p>📧 需要处理的事项：</p><ol><li>工作相关的邮件，请转发给我的同事李伟（liwei@company.com）</li><li>各种网站注册的账号，建议逐一修改绑定邮箱</li><li>银行账单邮件请留意，不要漏看</li><li>我的简历和求职信在「工作资料」标签中</li></ol><p><br></p><p>💡 两步验证恢复代码已保存在密码保险箱中，请妥善保管。</p>',
    createdAt: new Date('2024-06-08').toISOString(),
    updatedAt: new Date('2024-06-08').toISOString(),
    authorId: 'user-001',
    authorName: '张明',
    isImportant: false,
    tags: ['工作邮箱', '转发', '恢复代码'],
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
      approvalGroups: createInitialApprovalGroups(),
      auditLogs: createInitialAuditLogs(),
      notifications: createInitialNotifications(),
      emergencyContact: null,
      emergencySettings: {
        enabled: false,
        thresholdDays: DEFAULT_EMERGENCY_THRESHOLD_DAYS,
        confirmationWindowDays: DEFAULT_EMERGENCY_CONFIRMATION_WINDOW,
      },
      credentials: createInitialCredentials(),
      vault: createInitialVaultState(),
      assetNotes: createInitialAssetNotes(),

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

      bulkUpdateHeir: (assetIds, heirChain) => {
        const now = new Date().toISOString();
        const heirId = heirChain.length > 0 ? heirChain[0] : undefined;
        const assets = get().assets.filter((a) => assetIds.includes(a.id));
        const assetNames = assets.map((a) => a.name).join('、');

        set((state) => ({
          assets: state.assets.map((a) =>
            assetIds.includes(a.id)
              ? { ...a, heirChain, heirId, updatedAt: now }
              : a
          ),
        }));

        const heirName = heirId ? get().heirs.find((h) => h.id === heirId)?.name : '未分配';
        get().addAuditLog({
          action: 'bulk_heir_assigned',
          description: `批量为 ${assetIds.length} 项资产分配继承人「${heirName || '未分配'}」：${assetNames}`,
          resourceType: 'asset',
          resourceId: assetIds.join(','),
          newValue: JSON.stringify({ heirChain, heirId }),
        });

        get().addNotification({
          type: 'success',
          title: '批量分配成功',
          message: `已为 ${assetIds.length} 项资产分配继承人「${heirName || '未分配'}」`,
        });
      },

      bulkUpdateType: (assetIds, type) => {
        const now = new Date().toISOString();
        const assets = get().assets.filter((a) => assetIds.includes(a.id));
        const assetNames = assets.map((a) => a.name).join('、');

        set((state) => ({
          assets: state.assets.map((a) =>
            assetIds.includes(a.id)
              ? { ...a, type, updatedAt: now }
              : a
          ),
        }));

        const typeLabels: Record<AssetType, string> = {
          social_media: '社交媒体',
          cloud_storage: '云存储',
          crypto_wallet: '加密货币钱包',
          subscription: '订阅服务',
          email: '电子邮箱',
          other: '其他',
        };

        get().addAuditLog({
          action: 'bulk_type_updated',
          description: `批量修改 ${assetIds.length} 项资产分类为「${typeLabels[type]}」：${assetNames}`,
          resourceType: 'asset',
          resourceId: assetIds.join(','),
          newValue: type,
        });

        get().addNotification({
          type: 'success',
          title: '批量修改成功',
          message: `已将 ${assetIds.length} 项资产分类修改为「${typeLabels[type]}」`,
        });
      },

      addHeir: (heir) => {
        const now = new Date().toISOString();
        const currentHeirs = get().heirs;
        const maxPriority = currentHeirs.length > 0
          ? Math.max(...currentHeirs.map((h) => h.priority))
          : 0;
        const verification: HeirVerificationDetail = {
          status: 'not_started',
          progress: 0,
          totalMaterialsRequired: 3,
          submittedMaterials: 0,
          verifiedMaterials: 0,
          reminderCount: 0,
          invitedAt: now,
          materials: [
            {
              id: generateId(),
              type: 'id_card',
              name: '身份证正反面',
              status: 'pending',
            },
            {
              id: generateId(),
              type: 'household_register',
              name: '户口本本人页',
              status: 'pending',
            },
            {
              id: generateId(),
              type: 'birth_certificate',
              name: '亲属关系证明',
              status: 'pending',
            },
          ],
          history: [
            {
              id: generateId(),
              timestamp: now,
              action: 'invited',
              operatorName: get().currentUser?.name,
              operatorRole: get().currentUser?.role,
              note: '系统发送验证邀请',
            },
          ],
        };
        const newHeir: Heir = {
          ...heir,
          id: generateId(),
          isVerified: false,
          assignedAssets: [],
          priority: maxPriority + 1,
          createdAt: now,
          verification,
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

      sendHeirVerificationReminder: (heirId) => {
        const now = new Date().toISOString();
        const heir = get().heirs.find((h) => h.id === heirId);
        if (!heir || !heir.verification) return;

        const historyRecord: VerificationHistoryRecord = {
          id: generateId(),
          timestamp: now,
          action: 'reminder_sent',
          operatorName: get().currentUser?.name,
          operatorRole: get().currentUser?.role,
          note: '管理员手动发送验证提醒',
        };

        set((state) => ({
          heirs: state.heirs.map((h) =>
            h.id === heirId && h.verification
              ? {
                  ...h,
                  verification: {
                    ...h.verification,
                    lastReminderAt: now,
                    reminderCount: h.verification.reminderCount + 1,
                    history: [...h.verification.history, historyRecord],
                  },
                }
              : h
          ),
        }));

        get().addAuditLog({
          action: 'heir_verification_reminder_sent',
          description: `向继承人「${heir.name}」发送验证提醒`,
          resourceType: 'heir',
          resourceId: heirId,
        });

        get().addNotification({
          type: 'info',
          title: '提醒已发送',
          message: `已向 ${heir.name} 发送身份验证提醒邮件`,
        });
      },

      resetHeirVerification: (heirId) => {
        const now = new Date().toISOString();
        const heir = get().heirs.find((h) => h.id === heirId);
        if (!heir || !heir.verification) return;

        const resetMaterials: VerificationMaterial[] = heir.verification.materials.map((m) => ({
          ...m,
          status: 'pending' as VerificationStatus,
          uploadedAt: m.uploadedAt,
          verifiedAt: undefined,
          fileName: undefined,
        }));

        const historyRecord: VerificationHistoryRecord = {
          id: generateId(),
          timestamp: now,
          action: 'reset',
          operatorName: get().currentUser?.name,
          operatorRole: get().currentUser?.role,
          note: '管理员重置验证流程',
        };

        set((state) => ({
          heirs: state.heirs.map((h) =>
            h.id === heirId && h.verification
              ? {
                  ...h,
                  isVerified: false,
                  verification: {
                    ...h.verification,
                    status: 'not_started',
                    progress: 0,
                    submittedMaterials: 0,
                    verifiedMaterials: 0,
                    rejectionReason: undefined,
                    materials: resetMaterials,
                    history: [...h.verification.history, historyRecord],
                  },
                }
              : h
          ),
        }));

        get().addAuditLog({
          action: 'heir_verification_reset',
          description: `重置继承人「${heir.name}」的验证流程`,
          resourceType: 'heir',
          resourceId: heirId,
        });

        get().addNotification({
          type: 'info',
          title: '验证已重置',
          message: `继承人 ${heir.name} 的验证流程已重置`,
        });
      },

      verifyHeir: (heirId) => {
        const now = new Date().toISOString();
        const heir = get().heirs.find((h) => h.id === heirId);
        if (!heir || !heir.verification) return;

        const historyRecord: VerificationHistoryRecord = {
          id: generateId(),
          timestamp: now,
          action: 'verified',
          operatorName: get().currentUser?.name,
          operatorRole: get().currentUser?.role,
          note: '管理员手动确认验证通过',
        };

        set((state) => ({
          heirs: state.heirs.map((h) =>
            h.id === heirId && h.verification
              ? {
                  ...h,
                  isVerified: true,
                  verification: {
                    ...h.verification,
                    status: 'verified',
                    progress: 100,
                    verifiedMaterials: h.verification.totalMaterialsRequired,
                    submittedMaterials: h.verification.totalMaterialsRequired,
                    verifiedAt: now,
                    history: [...h.verification.history, historyRecord],
                  },
                }
              : h
          ),
        }));

        get().addAuditLog({
          action: 'heir_verification_completed',
          description: `继承人「${heir.name}」身份验证通过`,
          resourceType: 'heir',
          resourceId: heirId,
        });

        get().addNotification({
          type: 'success',
          title: '验证通过',
          message: `继承人 ${heir.name} 身份验证已通过`,
        });
      },

      rejectHeirVerification: (heirId, reason) => {
        const now = new Date().toISOString();
        const heir = get().heirs.find((h) => h.id === heirId);
        if (!heir || !heir.verification) return;

        const historyRecord: VerificationHistoryRecord = {
          id: generateId(),
          timestamp: now,
          action: 'rejected',
          operatorName: get().currentUser?.name,
          operatorRole: get().currentUser?.role,
          note: reason,
        };

        set((state) => ({
          heirs: state.heirs.map((h) =>
            h.id === heirId && h.verification
              ? {
                  ...h,
                  isVerified: false,
                  verification: {
                    ...h.verification,
                    status: 'rejected',
                    rejectionReason: reason,
                    history: [...h.verification.history, historyRecord],
                  },
                }
              : h
          ),
        }));

        get().addAuditLog({
          action: 'heir_verification_rejected',
          description: `继承人「${heir.name}」身份验证被拒绝`,
          resourceType: 'heir',
          resourceId: heirId,
          newValue: reason,
        });

        get().addNotification({
          type: 'error',
          title: '验证拒绝',
          message: `继承人 ${heir.name} 的身份验证已被拒绝`,
        });
      },

      approveHeirMaterial: (heirId, materialId) => {
        const now = new Date().toISOString();
        const heir = get().heirs.find((h) => h.id === heirId);
        if (!heir || !heir.verification) return;

        const material = heir.verification.materials.find((m) => m.id === materialId);
        if (!material) return;

        const historyRecord: VerificationHistoryRecord = {
          id: generateId(),
          timestamp: now,
          action: 'material_approved',
          operatorName: get().currentUser?.name,
          operatorRole: get().currentUser?.role,
          materialId,
          materialName: material.name,
        };

        set((state) => ({
          heirs: state.heirs.map((h) => {
            if (h.id !== heirId || !h.verification) return h;

            const updatedMaterials = h.verification.materials.map((m) =>
              m.id === materialId
                ? { ...m, status: 'verified' as VerificationStatus, verifiedAt: now }
                : m
            );

            const verifiedCount = updatedMaterials.filter((m) => m.status === 'verified').length;
            const submittedCount = updatedMaterials.filter((m) => m.uploadedAt).length;
            const progress = h.verification.totalMaterialsRequired > 0
              ? Math.round((verifiedCount / h.verification.totalMaterialsRequired) * 100)
              : 0;

            const allVerified = verifiedCount >= h.verification.totalMaterialsRequired;

            return {
              ...h,
              isVerified: allVerified,
              verification: {
                ...h.verification,
                status: allVerified ? 'verified' : 'in_progress',
                progress,
                submittedMaterials: submittedCount,
                verifiedMaterials: verifiedCount,
                verifiedAt: allVerified ? now : h.verification.verifiedAt,
                materials: updatedMaterials,
                history: [...h.verification.history, historyRecord],
              },
            };
          }),
        }));

        get().addAuditLog({
          action: 'heir_verification_material_approved',
          description: `继承人「${heir.name}」的材料「${material.name}」审核通过`,
          resourceType: 'heir',
          resourceId: heirId,
        });
      },

      rejectHeirMaterial: (heirId, materialId, reason) => {
        const now = new Date().toISOString();
        const heir = get().heirs.find((h) => h.id === heirId);
        if (!heir || !heir.verification) return;

        const material = heir.verification.materials.find((m) => m.id === materialId);
        if (!material) return;

        const historyRecord: VerificationHistoryRecord = {
          id: generateId(),
          timestamp: now,
          action: 'material_rejected',
          operatorName: get().currentUser?.name,
          operatorRole: get().currentUser?.role,
          materialId,
          materialName: material.name,
          note: reason,
        };

        set((state) => ({
          heirs: state.heirs.map((h) => {
            if (h.id !== heirId || !h.verification) return h;

            const updatedMaterials = h.verification.materials.map((m) =>
              m.id === materialId
                ? { ...m, status: 'rejected' as VerificationStatus, note: reason }
                : m
            );

            const verifiedCount = updatedMaterials.filter((m) => m.status === 'verified').length;
            const progress = h.verification.totalMaterialsRequired > 0
              ? Math.round((verifiedCount / h.verification.totalMaterialsRequired) * 100)
              : 0;

            return {
              ...h,
              isVerified: false,
              verification: {
                ...h.verification,
                status: 'in_progress',
                progress,
                verifiedMaterials: verifiedCount,
                materials: updatedMaterials,
                history: [...h.verification.history, historyRecord],
              },
            };
          }),
        }));

        get().addAuditLog({
          action: 'heir_verification_material_rejected',
          description: `继承人「${heir.name}」的材料「${material.name}」被驳回`,
          resourceType: 'heir',
          resourceId: heirId,
          newValue: reason,
        });
      },

      submitHeirMaterial: (heirId, material) => {
        const now = new Date().toISOString();
        const heir = get().heirs.find((h) => h.id === heirId);
        if (!heir || !heir.verification) return;

        const historyRecord: VerificationHistoryRecord = {
          id: generateId(),
          timestamp: now,
          action: 'material_submitted',
          operatorName: heir.name,
          operatorRole: 'heir',
          materialName: material.name,
        };

        set((state) => ({
          heirs: state.heirs.map((h) => {
            if (h.id !== heirId || !h.verification) return h;

            const updatedMaterials = h.verification.materials.map((m) =>
              m.type === material.type
                ? {
                    ...m,
                    name: material.name,
                    fileName: material.fileName,
                    uploadedAt: now,
                    status: 'pending' as VerificationStatus,
                    note: material.note,
                  }
                : m
            );

            const submittedCount = updatedMaterials.filter((m) => m.uploadedAt).length;
            const verifiedCount = updatedMaterials.filter((m) => m.status === 'verified').length;
            const progress = h.verification.totalMaterialsRequired > 0
              ? Math.round((submittedCount / h.verification.totalMaterialsRequired) * 100)
              : 0;

            return {
              ...h,
              verification: {
                ...h.verification,
                status: submittedCount > 0 ? 'in_progress' : 'not_started',
                progress,
                submittedMaterials: submittedCount,
                verifiedMaterials: verifiedCount,
                materials: updatedMaterials,
                history: [...h.verification.history, historyRecord],
              },
            };
          }),
        }));

        get().addAuditLog({
          action: 'heir_verification_material_submitted',
          description: `继承人「${heir.name}」提交了材料「${material.name}」`,
          resourceType: 'heir',
          resourceId: heirId,
        });
      },

      getHeirVerificationOverview: () => {
        const { heirs } = get();
        const total = heirs.length;
        const verified = heirs.filter((h) => h.verification?.status === 'verified').length;
        const inProgress = heirs.filter((h) => h.verification?.status === 'in_progress').length;
        const rejected = heirs.filter((h) => h.verification?.status === 'rejected').length;
        const pending = heirs.filter(
          (h) => !h.verification || h.verification.status === 'not_started'
        ).length;
        return { total, verified, inProgress, rejected, pending };
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

      evaluateBranchConditions: (stepId) => {
        const { will, assets, heirs, witnesses, approvalGroups } = get();
        if (!will) return null;
        const step = will.executionSteps.find((s) => s.id === stepId);
        if (!step || !step.branches || step.branches.length === 0) return null;

        const evaluateCondition = (condition: BranchCondition): boolean => {
          switch (condition.field) {
            case 'asset_value': {
              const targetAssets = condition.resourceIds && condition.resourceIds.length > 0
                ? assets.filter((a) => condition.resourceIds!.includes(a.id))
                : assets;
              const totalValue = targetAssets.reduce((sum, a) => sum + (a.value || 0), 0);
              const threshold = typeof condition.value === 'number' ? condition.value : Number(condition.value) || 0;
              switch (condition.operator) {
                case 'gt': return totalValue > threshold;
                case 'gte': return totalValue >= threshold;
                case 'lt': return totalValue < threshold;
                case 'lte': return totalValue <= threshold;
                case 'eq': return totalValue === threshold;
                case 'neq': return totalValue !== threshold;
                default: return false;
              }
            }
            case 'heir_verified': {
              const targetHeirs = condition.resourceIds && condition.resourceIds.length > 0
                ? heirs.filter((h) => condition.resourceIds!.includes(h.id))
                : heirs;
              if (condition.operator === 'verified') {
                return targetHeirs.every((h) => h.isVerified);
              }
              if (condition.operator === 'not_verified') {
                return targetHeirs.some((h) => !h.isVerified);
              }
              return false;
            }
            case 'asset_status': {
              const targetAssets = condition.resourceIds && condition.resourceIds.length > 0
                ? assets.filter((a) => condition.resourceIds!.includes(a.id))
                : assets;
              const statusValue = typeof condition.value === 'string' ? condition.value : String(condition.value || 'active');
              return targetAssets.some((a) => a.status === statusValue);
            }
            case 'witness_count': {
              const verifiedCount = witnesses.filter((w) => w.verificationStatus === 'verified').length;
              const threshold = typeof condition.value === 'number' ? condition.value : Number(condition.value) || 0;
              switch (condition.operator) {
                case 'gt': return verifiedCount > threshold;
                case 'gte': return verifiedCount >= threshold;
                case 'lt': return verifiedCount < threshold;
                case 'lte': return verifiedCount <= threshold;
                case 'eq': return verifiedCount === threshold;
                default: return false;
              }
            }
            case 'approval_progress': {
              const completedGroups = approvalGroups.filter((g) => g.status === 'approved').length;
              const totalGroups = approvalGroups.length;
              const progressPercent = totalGroups > 0 ? Math.round((completedGroups / totalGroups) * 100) : 0;
              const threshold = typeof condition.value === 'number' ? condition.value : Number(condition.value) || 0;
              switch (condition.operator) {
                case 'gte': return progressPercent >= threshold;
                case 'gt': return progressPercent > threshold;
                case 'lte': return progressPercent <= threshold;
                case 'lt': return progressPercent < threshold;
                case 'eq': return progressPercent === threshold;
                default: return false;
              }
            }
            case 'custom':
              return true;
            default:
              return false;
          }
        };

        const evaluateBranch = (branch: Branch): boolean => {
          if (branch.conditions.length === 0) return false;
          if (branch.conditionLogic === 'and') {
            return branch.conditions.every(evaluateCondition);
          }
          return branch.conditions.some(evaluateCondition);
        };

        for (const branch of step.branches) {
          if (evaluateBranch(branch)) {
            return branch.id;
          }
        }
        return null;
      },

      executeStepWithBranches: (stepId) => {
        const { will } = get();
        if (!will) return;
        const step = will.executionSteps.find((s) => s.id === stepId);
        if (!step) return;

        if (step.branches && step.branches.length > 0) {
          const triggeredBranchId = get().evaluateBranchConditions(stepId);
          const triggeredBranch = triggeredBranchId
            ? step.branches.find((b) => b.id === triggeredBranchId)
            : null;

          set((state) => {
            if (!state.will) return {};
            return {
              will: {
                ...state.will,
                executionSteps: state.will.executionSteps.map((s) =>
                  s.id === stepId ? { ...s, triggeredBranchId: triggeredBranchId || undefined } : s
                ),
              },
            };
          });

          const branchDesc = triggeredBranch
            ? `步骤「${step.title}」条件分支评估结果：触发分支「${triggeredBranch.label}」`
            : `步骤「${step.title}」条件分支评估结果：无匹配分支，走默认路径`;

          get().addAuditLog({
            action: 'branch_condition_evaluated',
            description: branchDesc,
            resourceType: 'will',
            resourceId: will.id,
            newValue: triggeredBranchId || 'default',
          });

          if (triggeredBranch) {
            const conditionDesc = triggeredBranch.conditions
              .map((c) => c.label)
              .join(triggeredBranch.conditionLogic === 'and' ? ' 且 ' : ' 或 ');

            get().addAuditLog({
              action: 'branch_path_triggered',
              description: `分支路径「${triggeredBranch.label}」已触发，条件：${conditionDesc}，目标步骤：${triggeredBranch.targetStepIds.length}个`,
              resourceType: 'will',
              resourceId: will.id,
              newValue: JSON.stringify({
                branchId: triggeredBranch.id,
                branchLabel: triggeredBranch.label,
                targetStepIds: triggeredBranch.targetStepIds,
                conditions: triggeredBranch.conditions.map((c) => ({
                  field: c.field,
                  operator: c.operator,
                  value: c.value,
                  label: c.label,
                })),
              }),
            });
          }
        }
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
        get().autoDecryptExpiredCapsules();
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

      createApprovalGroup: (group) => {
        const now = new Date().toISOString();
        const newGroup: WitnessApprovalGroup = {
          ...group,
          id: generateId(),
          approvals: group.witnessIds.map((wId) => ({
            witnessId: wId,
            decision: 'pending',
          })),
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ approvalGroups: [...state.approvalGroups, newGroup] }));
        get().addAuditLog({
          action: 'approval_group_created',
          description: `创建审批组：${group.name}`,
          resourceType: 'approval_group',
          resourceId: newGroup.id,
        });
      },

      updateApprovalGroup: (groupId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          approvalGroups: state.approvalGroups.map((g) =>
            g.id === groupId ? { ...g, ...updates, updatedAt: now } : g
          ),
        }));
        const group = get().approvalGroups.find((g) => g.id === groupId);
        if (group) {
          get().addAuditLog({
            action: 'approval_group_updated',
            description: `更新审批组：${group.name}`,
            resourceType: 'approval_group',
            resourceId: groupId,
          });
        }
      },

      deleteApprovalGroup: (groupId) => {
        const group = get().approvalGroups.find((g) => g.id === groupId);
        set((state) => ({
          approvalGroups: state.approvalGroups.filter((g) => g.id !== groupId),
        }));
        if (group) {
          get().addAuditLog({
            action: 'approval_group_deleted',
            description: `删除审批组：${group.name}`,
            resourceType: 'approval_group',
            resourceId: groupId,
          });
        }
      },

      assignWitnessToGroup: (groupId, witnessId) => {
        const now = new Date().toISOString();
        set((state) => ({
          approvalGroups: state.approvalGroups.map((g) => {
            if (g.id !== groupId) return g;
            if (g.witnessIds.includes(witnessId)) return g;
            return {
              ...g,
              witnessIds: [...g.witnessIds, witnessId],
              approvals: [...g.approvals, { witnessId, decision: 'pending' }],
              updatedAt: now,
              status: 'pending',
              completedAt: undefined,
            };
          }),
        }));
        const group = get().approvalGroups.find((g) => g.id === groupId);
        const witness = get().witnesses.find((w) => w.id === witnessId);
        if (group && witness) {
          get().addAuditLog({
            action: 'witness_assigned_to_group',
            description: `将见证人「${witness.name}」分配到审批组「${group.name}」`,
            resourceType: 'approval_group',
            resourceId: groupId,
            newValue: witnessId,
          });
        }
      },

      removeWitnessFromGroup: (groupId, witnessId) => {
        const now = new Date().toISOString();
        set((state) => ({
          approvalGroups: state.approvalGroups.map((g) => {
            if (g.id !== groupId) return g;
            const newWitnessIds = g.witnessIds.filter((id) => id !== witnessId);
            const newApprovals = g.approvals.filter((a) => a.witnessId !== witnessId);
            const approvedCount = newApprovals.filter((a) => a.decision === 'approved').length;
            const rejectedCount = newApprovals.filter((a) => a.decision === 'rejected').length;
            let newStatus: WitnessApprovalGroup['status'] = 'pending';
            if (newWitnessIds.length === 0) {
              newStatus = 'pending';
            } else if (approvedCount >= g.requiredApprovals) {
              newStatus = 'approved';
            } else if (rejectedCount > newWitnessIds.length - g.requiredApprovals) {
              newStatus = 'rejected';
            } else if (approvedCount > 0 || rejectedCount > 0) {
              newStatus = 'partial';
            }
            return {
              ...g,
              witnessIds: newWitnessIds,
              approvals: newApprovals,
              updatedAt: now,
              status: newStatus,
              completedAt: newStatus === 'approved' || newStatus === 'rejected' ? now : undefined,
            };
          }),
        }));
        const group = get().approvalGroups.find((g) => g.id === groupId);
        const witness = get().witnesses.find((w) => w.id === witnessId);
        if (group && witness) {
          get().addAuditLog({
            action: 'witness_removed_from_group',
            description: `从审批组「${group.name}」移除见证人「${witness.name}」`,
            resourceType: 'approval_group',
            resourceId: groupId,
            previousValue: witnessId,
          });
        }
      },

      submitWitnessApproval: (groupId, witnessId, decision, comment) => {
        const now = new Date().toISOString();
        set((state) => ({
          approvalGroups: state.approvalGroups.map((g) => {
            if (g.id !== groupId) return g;
            const newApprovals = g.approvals.map((a) =>
              a.witnessId === witnessId
                ? { ...a, decision, decidedAt: now, comment }
                : a
            );
            const approvedCount = newApprovals.filter((a) => a.decision === 'approved').length;
            const rejectedCount = newApprovals.filter((a) => a.decision === 'rejected').length;
            let newStatus: WitnessApprovalGroup['status'] = g.status;
            let completedAt = g.completedAt;
            if (approvedCount >= g.requiredApprovals) {
              newStatus = 'approved';
              completedAt = now;
            } else if (rejectedCount > g.witnessIds.length - g.requiredApprovals) {
              newStatus = 'rejected';
              completedAt = now;
            } else if (approvedCount > 0 || rejectedCount > 0) {
              newStatus = 'partial';
            }
            return {
              ...g,
              approvals: newApprovals,
              status: newStatus,
              updatedAt: now,
              completedAt,
            };
          }),
        }));
        const group = get().approvalGroups.find((g) => g.id === groupId);
        const witness = get().witnesses.find((w) => w.id === witnessId);
        if (group && witness) {
          get().addAuditLog({
            action: 'witness_approval_submitted',
            description: `见证人「${witness.name}」在审批组「${group.name}」提交了「${decision === 'approved' ? '同意' : decision === 'rejected' ? '拒绝' : '待定'}」意见${comment ? `：${comment}` : ''}`,
            resourceType: 'approval_group',
            resourceId: groupId,
            newValue: decision,
          });
          if (group.status === 'approved' || group.status === 'rejected') {
            get().addAuditLog({
              action: 'approval_group_completed',
              description: `审批组「${group.name}」已完成，结果：${group.status === 'approved' ? '通过' : '拒绝'}`,
              resourceType: 'approval_group',
              resourceId: groupId,
              newValue: group.status,
            });
            const execState = get().getWillExecutionState();
            if (execState.allGroupsApproved && get().will?.status === 'triggered') {
              get().addAuditLog({
                action: 'will_execution_advanced',
                description: '所有审批组已通过，遗嘱可进入执行阶段',
                resourceType: 'will',
                resourceId: get().will?.id,
              });
              get().updateWill({ status: 'executing' });
            }
          }
        }
      },

      getApprovalGroupProgress: (groupId) => {
        const group = get().approvalGroups.find((g) => g.id === groupId);
        if (!group) return { approved: 0, required: 0, total: 0, percentage: 0 };
        const approved = group.approvals.filter((a) => a.decision === 'approved').length;
        const total = group.witnessIds.length;
        const required = group.requiredApprovals;
        const percentage = total > 0 ? Math.min(100, Math.round((approved / required) * 100)) : 0;
        return { approved, required, total, percentage };
      },

      getWillExecutionState: () => {
        const groups = get().approvalGroups;
        if (groups.length === 0) {
          return {
            allGroupsApproved: true,
            canProceedToExecution: true,
            overallProgress: 100,
          };
        }
        const completedGroups = groups.filter((g) => g.status === 'approved').length;
        const totalGroups = groups.length;
        const allApproved = completedGroups === totalGroups;
        const progress = totalGroups > 0 ? Math.round((completedGroups / totalGroups) * 100) : 100;
        return {
          allGroupsApproved: allApproved,
          canProceedToExecution: allApproved,
          overallProgress: progress,
        };
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

        const allTransferItems = steps.flatMap(s => s.transferItems);

        const uniqueTransferredAssetIds = new Set<string>();
        allTransferItems.forEach(t => uniqueTransferredAssetIds.add(t.assetId));
        const uniqueTransferredAssetIdSet = uniqueTransferredAssetIds;

        const assetValueMap = new Map<string, number>();
        allTransferItems.forEach(t => {
          if (!assetValueMap.has(t.assetId)) {
            assetValueMap.set(t.assetId, t.assetValue || 0);
          }
        });
        const uniqueTransferredValue = Array.from(assetValueMap.values()).reduce((sum, v) => sum + v, 0);

        const heirAssetMap = new Map<string, { ids: Set<string>; value: number }>();
        allTransferItems.forEach(t => {
          if (!heirAssetMap.has(t.heirId)) {
            heirAssetMap.set(t.heirId, { ids: new Set(), value: 0 });
          }
          const entry = heirAssetMap.get(t.heirId)!;
          if (!entry.ids.has(t.assetId)) {
            entry.ids.add(t.assetId);
            entry.value += t.assetValue || 0;
          }
        });

        const heirBreakdown = heirs
          .filter(heir => heirAssetMap.has(heir.id))
          .map(heir => {
            const entry = heirAssetMap.get(heir.id)!;
            return {
              heirId: heir.id,
              heirName: heir.name,
              assetCount: entry.ids.size,
              assetValue: entry.value,
            };
          });

        const assignedRatio = assets.length > 0
          ? uniqueTransferredAssetIdSet.size / assets.length
          : 0;

        let readinessScore = 100;
        readinessScore -= warnings.length * 5;
        readinessScore -= (1 - assignedRatio) * 20;

        const assetsWithHeir = assets.filter(a => a.heirId || a.heirChain.length > 0);
        const unassignedInSteps = assetsWithHeir.filter(a => !uniqueTransferredAssetIdSet.has(a.id));
        readinessScore -= unassignedInSteps.length * 3;

        const stepsWithoutAssets = steps.filter(s =>
          (s.actionType === 'transfer' || s.actionType === 'reveal_credentials' || s.actionType === 'delete_data') &&
          s.transferItems.length === 0
        );
        readinessScore -= stepsWithoutAssets.length * 5;

        readinessScore = Math.max(0, Math.min(100, Math.round(readinessScore)));

        const summary: SimulationSummary = {
          totalSteps: steps.length,
          totalDurationDays: cumulativeDays,
          totalNotifiedPeople: uniqueNotified.size,
          totalTransferredAssets: uniqueTransferredAssetIdSet.size,
          totalAssetValue: uniqueTransferredValue,
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

      setEmergencyContact: (contact) => {
        const { heirs } = get();
        const isDuplicateWithHeir = heirs.some(
          (h) => h.name.trim() === contact.name.trim()
        );
        if (isDuplicateWithHeir) {
          get().addNotification({
            type: 'error',
            title: '添加失败',
            message: `「${contact.name}」已在继承人名单中，紧急联系人不能同时为继承人`,
          });
          return;
        }
        const now = new Date().toISOString();
        const newContact: EmergencyContact = {
          ...contact,
          id: generateId(),
          createdAt: now,
          isVerified: false,
          status: 'pending',
        };
        set({ emergencyContact: newContact });
        get().addAuditLog({
          action: 'emergency_contact_added',
          description: `添加紧急联系人：${contact.name}`,
          resourceType: 'emergency_contact',
          resourceId: newContact.id,
        });
        get().addNotification({
          type: 'info',
          title: '紧急联系人已添加',
          message: `紧急联系人「${contact.name}」已添加，请通知其完成验证`,
        });
      },

      updateEmergencyContact: (updates) => {
        const { heirs, emergencyContact } = get();
        if (!emergencyContact) return;
        if (updates.name) {
          const newName = updates.name.trim();
          const isDuplicateWithHeir = heirs.some(
            (h) => h.name.trim() === newName
          );
          if (isDuplicateWithHeir) {
            get().addNotification({
              type: 'error',
              title: '更新失败',
              message: `「${newName}」已在继承人名单中，紧急联系人不能同时为继承人`,
            });
            return;
          }
        }
        set((state) => {
          if (!state.emergencyContact) return {};
          return {
            emergencyContact: { ...state.emergencyContact, ...updates },
          };
        });
        get().addAuditLog({
          action: 'emergency_contact_updated',
          description: '更新紧急联系人信息',
          resourceType: 'emergency_contact',
          resourceId: get().emergencyContact?.id,
        });
      },

      removeEmergencyContact: () => {
        const contact = get().emergencyContact;
        set({ emergencyContact: null });
        if (contact) {
          get().addAuditLog({
            action: 'emergency_contact_removed',
            description: `移除紧急联系人：${contact.name}`,
            resourceType: 'emergency_contact',
            resourceId: contact.id,
          });
          get().addNotification({
            type: 'warning',
            title: '紧急联系人已移除',
            message: '您已移除紧急联系人，建议重新设置以保障资产安全',
          });
        }
      },

      verifyEmergencyContact: () => {
        set((state) => {
          if (!state.emergencyContact) return {};
          return {
            emergencyContact: {
              ...state.emergencyContact,
              isVerified: true,
              status: 'pending',
            },
          };
        });
        get().addAuditLog({
          action: 'emergency_contact_verified',
          description: '紧急联系人已完成验证',
          resourceType: 'emergency_contact',
          resourceId: get().emergencyContact?.id,
        });
        get().addNotification({
          type: 'success',
          title: '紧急联系人已验证',
          message: '紧急联系人身份已确认，可以参与遗嘱触发流程',
        });
      },

      updateEmergencySettings: (settings) => {
        set((state) => ({
          emergencySettings: { ...state.emergencySettings, ...settings },
        }));
        get().addAuditLog({
          action: 'emergency_settings_updated',
          description: '更新紧急联系人设置',
          resourceType: 'emergency_settings',
        });
      },

      notifyEmergencyContact: () => {
        const { emergencyContact, emergencySettings } = get();
        if (!emergencyContact || !emergencySettings.enabled) return;

        const now = new Date().toISOString();
        set((state) => {
          if (!state.emergencyContact) return {};
          return {
            emergencyContact: {
              ...state.emergencyContact,
              status: 'notified',
              notifiedAt: now,
            },
          };
        });

        get().addAuditLog({
          action: 'emergency_contact_notified',
          description: `已通知紧急联系人：${emergencyContact.name}`,
          resourceType: 'emergency_contact',
          resourceId: emergencyContact.id,
        });

        get().addNotification({
          type: 'warning',
          title: '紧急联系人已通知',
          message: `已向「${emergencyContact.name}」发送状态确认通知，请等待其回复`,
        });
      },

      emergencyContactConfirmAlive: (note) => {
        const { emergencyContact } = get();
        if (!emergencyContact) return;

        const now = new Date().toISOString();
        set((state) => {
          if (!state.emergencyContact || !state.will) return {};
          return {
            emergencyContact: {
              ...state.emergencyContact,
              status: 'confirmed_alive',
              confirmedAt: now,
              note,
            },
            will: {
              ...state.will,
              lastActiveAt: now,
            },
            currentUser: state.currentUser
              ? { ...state.currentUser, lastLoginAt: now }
              : state.currentUser,
          };
        });

        get().addAuditLog({
          action: 'emergency_contact_confirmed_alive',
          description: `紧急联系人「${emergencyContact.name}」确认用户健在，已重置活动时间`,
          resourceType: 'emergency_contact',
          resourceId: emergencyContact.id,
          newValue: note,
        });

        get().addNotification({
          type: 'success',
          title: '已确认用户健在',
          message: '活动时间已重置，遗嘱触发倒计时重新计算',
        });
      },

      emergencyContactConfirmDeceased: (note) => {
        const { emergencyContact } = get();
        if (!emergencyContact) return;

        const now = new Date().toISOString();
        set((state) => {
          if (!state.emergencyContact) return {};
          return {
            emergencyContact: {
              ...state.emergencyContact,
              status: 'confirmed_deceased',
              confirmedAt: now,
              note,
            },
          };
        });

        get().addAuditLog({
          action: 'emergency_contact_confirmed_deceased',
          description: `紧急联系人「${emergencyContact.name}」确认用户身故`,
          resourceType: 'emergency_contact',
          resourceId: emergencyContact.id,
          newValue: note,
        });

        get().addNotification({
          type: 'error',
          title: '已确认用户身故',
          message: '紧急联系人已确认用户身故，可以触发遗嘱执行',
        });
      },

      emergencyContactTriggerWill: (note) => {
        const { emergencyContact, triggerWill } = get();
        if (!emergencyContact) return;

        const now = new Date().toISOString();
        set((state) => {
          if (!state.emergencyContact) return {};
          return {
            emergencyContact: {
              ...state.emergencyContact,
              status: 'triggered_will',
              confirmedAt: now,
              note,
            },
          };
        });

        triggerWill();

        get().addAuditLog({
          action: 'emergency_contact_triggered_will',
          description: `紧急联系人「${emergencyContact.name}」代为触发遗嘱执行`,
          resourceType: 'emergency_contact',
          resourceId: emergencyContact.id,
          newValue: note,
        });
      },

      emergencyContactExtendPeriod: (days, note) => {
        const { emergencyContact, will } = get();
        if (!emergencyContact || !will) return;

        const now = new Date().toISOString();
        const extendedDate = addDaysToDate(will.lastActiveAt, days);

        set((state) => {
          if (!state.emergencyContact || !state.will) return {};
          return {
            emergencyContact: {
              ...state.emergencyContact,
              status: 'extended_period',
              confirmedAt: now,
              extendedDays: days,
              note,
            },
            will: {
              ...state.will,
              lastActiveAt: extendedDate,
            },
          };
        });

        get().addAuditLog({
          action: 'emergency_contact_extended_period',
          description: `紧急联系人「${emergencyContact.name}」延长观察期 ${days} 天`,
          resourceType: 'emergency_contact',
          resourceId: emergencyContact.id,
          newValue: JSON.stringify({ days, note }),
        });

        get().addNotification({
          type: 'info',
          title: '观察期已延长',
          message: `遗嘱触发观察期已延长 ${days} 天，延长至 ${formatDate(extendedDate)}`,
        });
      },

      checkEmergencyThreshold: () => {
        const { will, emergencyContact, emergencySettings, notifyEmergencyContact } = get();
        if (!will || !emergencyContact || !emergencySettings.enabled) return;
        if (!emergencyContact.isVerified) return;

        const daysInactive = daysSince(will.lastActiveAt);
        const isOverThreshold = daysInactive >= emergencySettings.thresholdDays;

        if (isOverThreshold && emergencyContact.status === 'pending') {
          notifyEmergencyContact();
        }
      },

      getEmergencyContactStatus: () => {
        const { will, emergencySettings, emergencyContact } = get();
        const daysInactive = will ? daysSince(will.lastActiveAt) : 0;
        const thresholdDays = emergencySettings.thresholdDays;
        const isOverThreshold = daysInactive >= thresholdDays;
        const confirmationWindowDays = emergencySettings.confirmationWindowDays;

        let daysSinceNotification: number | undefined;
        let isInConfirmationWindow = false;

        if (emergencyContact?.notifiedAt) {
          daysSinceNotification = daysSince(emergencyContact.notifiedAt);
          isInConfirmationWindow = daysSinceNotification <= confirmationWindowDays;
        }

        return {
          daysInactive,
          thresholdDays,
          isOverThreshold,
          confirmationWindowDays,
          daysSinceNotification,
          isInConfirmationWindow,
        };
      },

      setTimeCapsule: (assetId, capsule) => {
        const asset = get().assets.find((a) => a.id === assetId);
        if (!asset) return;

        const now = new Date().toISOString();
        const fullCapsule: TimeCapsule = {
          ...capsule,
          createdAt: now,
        };

        const effectiveStatus = getTimeCapsuleStatus(fullCapsule);

        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === assetId
              ? { ...a, timeCapsule: { ...fullCapsule, status: effectiveStatus }, updatedAt: now }
              : a
          ),
        }));

        const isNew = !asset.timeCapsule?.enabled;
        get().addAuditLog({
          action: isNew ? 'time_capsule_created' : 'time_capsule_updated',
          description: isNew
            ? `为资产「${asset.name}」创建时间胶囊，解锁日期：${formatDate(fullCapsule.unlockDate)}`
            : `更新资产「${asset.name}」的时间胶囊设置`,
          resourceType: 'asset',
          resourceId: assetId,
          newValue: JSON.stringify({ unlockDate: fullCapsule.unlockDate, note: fullCapsule.note }),
        });

        get().addNotification({
          type: 'success',
          title: isNew ? '时间胶囊已创建' : '时间胶囊已更新',
          message: isNew
            ? `资产「${asset.name}」已设置为时间胶囊，将在 ${formatDate(fullCapsule.unlockDate)} 后解锁`
            : `资产「${asset.name}」的时间胶囊设置已更新`,
        });
      },

      removeTimeCapsule: (assetId) => {
        const asset = get().assets.find((a) => a.id === assetId);
        if (!asset || !asset.timeCapsule) return;

        const now = new Date().toISOString();
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === assetId
              ? { ...a, timeCapsule: undefined, updatedAt: now }
              : a
          ),
        }));

        get().addAuditLog({
          action: 'time_capsule_updated',
          description: `移除资产「${asset.name}」的时间胶囊`,
          resourceType: 'asset',
          resourceId: assetId,
          previousValue: JSON.stringify(asset.timeCapsule),
        });
      },

      unlockTimeCapsule: (assetId) => {
        const asset = get().assets.find((a) => a.id === assetId);
        if (!asset?.timeCapsule) return;

        const now = new Date().toISOString();
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === assetId && a.timeCapsule
              ? { ...a, timeCapsule: { ...a.timeCapsule, status: 'unlocked' }, updatedAt: now }
              : a
          ),
        }));

        get().addAuditLog({
          action: 'time_capsule_unlocked',
          description: `手动解锁资产「${asset.name}」的时间胶囊`,
          resourceType: 'asset',
          resourceId: assetId,
          previousValue: 'locked',
          newValue: 'unlocked',
        });

        get().addNotification({
          type: 'success',
          title: '时间胶囊已解锁',
          message: `资产「${asset.name}」的时间胶囊已手动解锁，资产信息已对继承人和见证人可见`,
        });
      },

      autoDecryptExpiredCapsules: () => {
        const { assets, will } = get();
        if (!will || (will.status !== 'triggered' && will.status !== 'executing')) return;

        let decryptedCount = 0;
        const now = new Date().toISOString();

        set((state) => ({
          assets: state.assets.map((a) => {
            if (!a.timeCapsule?.enabled || a.timeCapsule.status === 'unlocked') return a;

            const effectiveStatus = getTimeCapsuleStatus(a.timeCapsule);
            if (effectiveStatus === 'expired') {
              decryptedCount++;
              return {
                ...a,
                timeCapsule: { ...a.timeCapsule, status: 'unlocked' },
                updatedAt: now,
              };
            }
            return a;
          }),
        }));

        if (decryptedCount > 0) {
          get().addAuditLog({
            action: 'time_capsule_auto_decrypted',
            description: `遗嘱执行流程中自动解密 ${decryptedCount} 项已到期的时间胶囊资产`,
            resourceType: 'will',
            resourceId: will.id,
          });

          get().addNotification({
            type: 'info',
            title: '时间胶囊自动解密',
            message: `${decryptedCount} 项时间胶囊资产已到期，在遗嘱执行流程中已自动解密显示`,
          });
        }
      },

      getCapsuleAssets: () => get().assets.filter((a) => a.timeCapsule?.enabled),

      getLockedCapsuleAssets: () => get().assets.filter((a) => {
        if (!a.timeCapsule?.enabled) return false;
        return getTimeCapsuleStatus(a.timeCapsule) === 'locked';
      }),

      getUnlockedCapsuleAssets: () => get().assets.filter((a) => {
        if (!a.timeCapsule?.enabled) return false;
        const status = getTimeCapsuleStatus(a.timeCapsule);
        return status === 'unlocked' || status === 'expired';
      }),

      addCredential: (credential) => {
        const { vault, addAuditLog, addNotification } = get();
        if (!vault.isUnlocked && vault.masterPassword) {
          addNotification({
            type: 'error',
            title: '操作失败',
            message: '请先解锁密码保险箱',
          });
          return;
        }
        const now = new Date().toISOString();
        const newCredential: Credential = {
          ...credential,
          id: generateId(),
          fields: credential.fields.map((f) => ({ ...f, id: generateId() })),
          isEncrypted: true,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ credentials: [newCredential, ...state.credentials] }));
        addAuditLog({
          action: 'credential_created',
          description: `创建${CREDENTIAL_CATEGORY_LABELS[credential.category]}：${credential.name}${credential.assetId ? `（关联资产）` : ''}`,
          resourceType: 'credential',
          resourceId: newCredential.id,
          newValue: JSON.stringify({ category: credential.category, fieldsCount: credential.fields.length }),
        });
        addNotification({
          type: 'success',
          title: '凭据已添加',
          message: `凭据「${credential.name}」已安全加密存储`,
        });
      },

      updateCredential: (id, updates) => {
        const { vault, credentials, addAuditLog, addNotification } = get();
        if (!vault.isUnlocked && vault.masterPassword) {
          addNotification({
            type: 'error',
            title: '操作失败',
            message: '请先解锁密码保险箱',
          });
          return;
        }
        const credential = credentials.find((c) => c.id === id);
        if (!credential) return;
        const now = new Date().toISOString();
        set((state) => ({
          credentials: state.credentials.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: now } : c
          ),
        }));
        addAuditLog({
          action: 'credential_updated',
          description: `更新凭据：${credential.name}`,
          resourceType: 'credential',
          resourceId: id,
          previousValue: JSON.stringify(credential),
          newValue: JSON.stringify({ ...credential, ...updates }),
        });
        addNotification({
          type: 'success',
          title: '凭据已更新',
          message: `凭据「${credential.name}」的信息已更新`,
        });
      },

      deleteCredential: (id) => {
        const { vault, credentials, addAuditLog, addNotification } = get();
        if (!vault.isUnlocked && vault.masterPassword) {
          addNotification({
            type: 'error',
            title: '操作失败',
            message: '请先解锁密码保险箱',
          });
          return;
        }
        const credential = credentials.find((c) => c.id === id);
        set((state) => ({
          credentials: state.credentials.filter((c) => c.id !== id),
        }));
        if (credential) {
          addAuditLog({
            action: 'credential_deleted',
            description: `删除凭据：${credential.name}`,
            resourceType: 'credential',
            resourceId: id,
            previousValue: JSON.stringify({ name: credential.name, category: credential.category }),
          });
          addNotification({
            type: 'info',
            title: '凭据已删除',
            message: `凭据「${credential.name}」已从保险箱移除`,
          });
        }
      },

      getCredentialsByAsset: (assetId) => get().credentials.filter((c) => c.assetId === assetId),

      getCredentialsByCategory: (category) => get().credentials.filter((c) => c.category === category),

      markCredentialAccessed: (id) => {
        const { addAuditLog, credentials } = get();
        const credential = credentials.find((c) => c.id === id);
        if (!credential) return;
        const now = new Date().toISOString();
        set((state) => ({
          credentials: state.credentials.map((c) =>
            c.id === id ? { ...c, lastAccessedAt: now } : c
          ),
        }));
        addAuditLog({
          action: 'credential_viewed',
          description: `查看凭据元数据：${credential.name}`,
          resourceType: 'credential',
          resourceId: id,
        });
      },

      revealCredential: (id) => {
        const { vault, credentials, addAuditLog, addNotification } = get();
        if (!vault.isUnlocked && vault.masterPassword) {
          addNotification({
            type: 'error',
            title: '操作失败',
            message: '请先解锁密码保险箱',
          });
          return null;
        }
        const credential = credentials.find((c) => c.id === id);
        if (!credential) return null;
        addAuditLog({
          action: 'credential_revealed',
          description: `揭露凭据明文内容：${credential.name}`,
          resourceType: 'credential',
          resourceId: id,
          newValue: JSON.stringify({ fields: credential.fields.map((f) => ({ id: f.id, label: f.label, isSensitive: f.isSensitive })) }),
        });
        return credential.fields;
      },

      setMasterPassword: (password, hint) => {
        const { addAuditLog, addNotification, vault } = get();
        if (vault.masterPassword) {
          addNotification({
            type: 'error',
            title: '设置失败',
            message: '主密码已存在，请使用修改功能',
          });
          return false;
        }
        if (password.length < 8) {
          addNotification({
            type: 'error',
            title: '密码过短',
            message: '主密码至少需要8个字符',
          });
          return false;
        }
        const now = new Date().toISOString();
        const salt = generateId();
        const hash = generateHash(password + salt);
        set((state) => ({
          vault: {
            ...state.vault,
            masterPassword: {
              hash,
              salt,
              createdAt: now,
              lastChangedAt: now,
              hint,
            },
            isUnlocked: true,
            unlockedAt: now,
            failedAttempts: 0,
          },
        }));
        addAuditLog({
          action: 'master_password_set',
          description: '已设置主密码，保险箱加密功能已启用',
          resourceType: 'vault',
        });
        addNotification({
          type: 'success',
          title: '主密码已设置',
          message: '请务必牢记主密码，一旦丢失无法恢复',
        });
        return true;
      },

      changeMasterPassword: (oldPassword, newPassword, hint) => {
        const { vault, addAuditLog, addNotification } = get();
        if (!vault.masterPassword) {
          addNotification({
            type: 'error',
            title: '修改失败',
            message: '尚未设置主密码',
          });
          return false;
        }
        const oldHash = generateHash(oldPassword + vault.masterPassword.salt);
        if (oldHash !== vault.masterPassword.hash) {
          set((state) => ({
            vault: { ...state.vault, failedAttempts: state.vault.failedAttempts + 1 },
          }));
          addNotification({
            type: 'error',
            title: '验证失败',
            message: '原密码不正确',
          });
          return false;
        }
        if (newPassword.length < 8) {
          addNotification({
            type: 'error',
            title: '新密码过短',
            message: '主密码至少需要8个字符',
          });
          return false;
        }
        const now = new Date().toISOString();
        const salt = generateId();
        const hash = generateHash(newPassword + salt);
        set((state) => ({
          vault: {
            ...state.vault,
            masterPassword: {
              hash,
              salt,
              createdAt: state.vault.masterPassword!.createdAt,
              lastChangedAt: now,
              hint: hint ?? state.vault.masterPassword!.hint,
            },
            failedAttempts: 0,
          },
        }));
        addAuditLog({
          action: 'master_password_changed',
          description: '主密码已修改',
          resourceType: 'vault',
        });
        addNotification({
          type: 'success',
          title: '主密码已修改',
          message: '请妥善保管新的主密码',
        });
        return true;
      },

      verifyMasterPassword: (password) => {
        const { vault } = get();
        if (!vault.masterPassword) return true;
        const hash = generateHash(password + vault.masterPassword.salt);
        return hash === vault.masterPassword.hash;
      },

      unlockVault: (password) => {
        const { vault, addAuditLog, addNotification } = get();
        if (!vault.masterPassword) {
          set((state) => ({
            vault: { ...state.vault, isUnlocked: true, unlockedAt: new Date().toISOString() },
          }));
          return true;
        }
        const hash = generateHash(password + vault.masterPassword.salt);
        if (hash === vault.masterPassword.hash) {
          const now = new Date().toISOString();
          set((state) => ({
            vault: { ...state.vault, isUnlocked: true, unlockedAt: now, failedAttempts: 0 },
          }));
          addAuditLog({
            action: 'vault_unlocked',
            description: '密码保险箱已解锁',
            resourceType: 'vault',
          });
          return true;
        } else {
          const newAttempts = vault.failedAttempts + 1;
          let lockUntil: string | undefined;
          if (newAttempts >= 5) {
            const lockTime = new Date();
            lockTime.setMinutes(lockTime.getMinutes() + 30);
            lockUntil = lockTime.toISOString();
          }
          set((state) => ({
            vault: { ...state.vault, failedAttempts: newAttempts, lockUntil },
          }));
          addNotification({
            type: 'error',
            title: '解锁失败',
            message: lockUntil
              ? `尝试次数过多，保险箱已锁定30分钟`
              : `密码错误，还剩 ${5 - newAttempts} 次尝试机会`,
          });
          return false;
        }
      },

      lockVault: () => {
        const { addAuditLog } = get();
        set((state) => ({
          vault: { ...state.vault, isUnlocked: false, unlockedAt: undefined },
        }));
        addAuditLog({
          action: 'vault_locked',
          description: '密码保险箱已锁定',
          resourceType: 'vault',
        });
      },

      updateVaultAutoLock: (minutes) => {
        set((state) => ({
          vault: { ...state.vault, autoLockMinutes: minutes },
        }));
      },

      getDecryptedCredentialsForHeir: (heirId, executionStep) => {
        const { credentials, addAuditLog, will, assets } = get();
        const result: Credential[] = [];

        credentials.forEach((credential) => {
          let shouldReveal = false;

          if (credential.accessLevel === 'owner_only') {
            shouldReveal = false;
          } else if (credential.accessLevel === 'lawyer_only') {
            shouldReveal = executionStep >= 1;
          } else if (credential.accessLevel === 'witness_only') {
            shouldReveal = executionStep >= 1;
          } else if (credential.accessLevel === 'heir_step_1') {
            shouldReveal = executionStep >= 1;
          } else if (credential.accessLevel === 'heir_step_2') {
            shouldReveal = executionStep >= 2;
          } else if (credential.accessLevel === 'heir_step_3') {
            shouldReveal = executionStep >= 3;
          }

          if (shouldReveal && credential.assetId) {
            const asset = assets.find((a) => a.id === credential.assetId);
            if (asset && asset.heirChain[0] === heirId) {
              result.push(credential);
              addAuditLog({
                action: 'credential_decrypted_for_heir',
                description: `遗嘱执行阶段 ${executionStep}：向继承人解密凭据「${credential.name}」`,
                resourceType: 'credential',
                resourceId: credential.id,
                newValue: JSON.stringify({ heirId, executionStep }),
              });
            }
          } else if (shouldReveal && !credential.assetId) {
            result.push(credential);
            addAuditLog({
              action: 'credential_decrypted_for_heir',
              description: `遗嘱执行阶段 ${executionStep}：向继承人解密凭据「${credential.name}」`,
              resourceType: 'credential',
              resourceId: credential.id,
              newValue: JSON.stringify({ heirId, executionStep }),
            });
          }
        });

        return result;
      },

      presetCharities: PRESET_CHARITIES,
      customCharities: [],
      donationPlan: null,

      addCustomCharity: (charity) => {
        const now = new Date().toISOString();
        const newCharity: Charity = {
          ...charity,
          id: generateId(),
          isPreset: false,
        };
        set((state) => ({ customCharities: [...state.customCharities, newCharity] }));
        get().addAuditLog({
          action: 'donation_plan_updated',
          description: `添加自定义公益机构：${charity.name}`,
          resourceType: 'charity',
          resourceId: newCharity.id,
        });
      },

      updateCustomCharity: (id, updates) => {
        set((state) => ({
          customCharities: state.customCharities.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
        const charity = get().customCharities.find((c) => c.id === id);
        if (charity) {
          get().addAuditLog({
            action: 'donation_plan_updated',
            description: `更新公益机构信息：${charity.name}`,
            resourceType: 'charity',
            resourceId: id,
          });
        }
      },

      removeCustomCharity: (id) => {
        const charity = get().customCharities.find((c) => c.id === id);
        set((state) => ({
          customCharities: state.customCharities.filter((c) => c.id !== id),
        }));
        if (charity) {
          get().addAuditLog({
            action: 'donation_plan_updated',
            description: `删除自定义公益机构：${charity.name}`,
            resourceType: 'charity',
            resourceId: id,
          });
        }
      },

      getAllCharities: () => {
        const { presetCharities, customCharities } = get();
        return [...presetCharities, ...customCharities];
      },

      getCharitiesByCategory: (category) => {
        return get().getAllCharities().filter((c) => c.category === category);
      },

      createDonationPlan: (plan) => {
        const now = new Date().toISOString();
        const newPlan: DonationPlan = {
          id: generateId(),
          title: plan.title,
          description: plan.description,
          status: 'draft',
          items: [],
          allocations: [],
          executionStepOrder: plan.executionStepOrder ?? 3,
          delayDays: plan.delayDays ?? 0,
          createdAt: now,
          updatedAt: now,
          lawyerReviewRequired: plan.lawyerReviewRequired ?? true,
          witnessConfirmRequired: plan.witnessConfirmRequired ?? false,
        };
        set({ donationPlan: newPlan });
        get().addAuditLog({
          action: 'donation_plan_created',
          description: `创建捐赠规划：${plan.title}`,
          resourceType: 'donation_plan',
          resourceId: newPlan.id,
        });
        get().addNotification({
          type: 'success',
          title: '捐赠规划已创建',
          message: `「${plan.title}」已创建，请添加捐赠项目和分配规则`,
        });
      },

      updateDonationPlan: (updates) => {
        set((state) => {
          if (!state.donationPlan) return {};
          return {
            donationPlan: {
              ...state.donationPlan,
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          };
        });
        const plan = get().donationPlan;
        if (plan) {
          get().addAuditLog({
            action: 'donation_plan_updated',
            description: `更新捐赠规划：${plan.title}`,
            resourceType: 'donation_plan',
            resourceId: plan.id,
            newValue: JSON.stringify(updates),
          });
        }
      },

      deleteDonationPlan: () => {
        const plan = get().donationPlan;
        set({ donationPlan: null });
        if (plan) {
          get().addAuditLog({
            action: 'donation_plan_deleted',
            description: `删除捐赠规划：${plan.title}`,
            resourceType: 'donation_plan',
            resourceId: plan.id,
            previousValue: JSON.stringify(plan),
          });
          get().addNotification({
            type: 'warning',
            title: '捐赠规划已删除',
            message: `「${plan.title}」已被删除`,
          });
        }
      },

      activateDonationPlan: () => {
        const plan = get().donationPlan;
        if (!plan) return;
        if (plan.items.length === 0) {
          get().addNotification({
            type: 'error',
            title: '生效失败',
            message: '请先添加至少一个捐赠项目',
          });
          return;
        }
        const unallocatedItems = plan.items.filter(
          (item) =>
            plan.allocations.filter((a) => a.donationItemId === item.id)
              .reduce((sum, a) => sum + a.percentage, 0) !== 100
        );
        if (unallocatedItems.length > 0) {
          get().addNotification({
            type: 'error',
            title: '生效失败',
            message: `有 ${unallocatedItems.length} 个捐赠项目的分配比例不等于100%`,
          });
          return;
        }
        set((state) => {
          if (!state.donationPlan) return {};
          return {
            donationPlan: {
              ...state.donationPlan,
              status: 'active',
              updatedAt: new Date().toISOString(),
            },
          };
        });
        get().addAuditLog({
          action: 'donation_plan_updated',
          description: `捐赠规划「${plan.title}」已生效`,
          resourceType: 'donation_plan',
          resourceId: plan.id,
          newValue: 'active',
        });
        get().addNotification({
          type: 'success',
          title: '捐赠规划已生效',
          message: `「${plan.title}」将在遗嘱执行流程中按顺序执行`,
        });
      },

      addDonationItem: (item) => {
        const newItem: DonationItem = {
          ...item,
          id: generateId(),
        };
        set((state) => {
          if (!state.donationPlan) return {};
          return {
            donationPlan: {
              ...state.donationPlan,
              items: [...state.donationPlan.items, newItem],
              updatedAt: new Date().toISOString(),
            },
          };
        });
        const plan = get().donationPlan;
        if (plan) {
          const itemDesc =
            item.type === 'specific_asset'
              ? `指定资产`
              : item.type === 'value_percentage'
              ? `资产估值${item.percentageOfTotal}%`
              : `固定金额¥${item.fixedAmount?.toLocaleString()}`;
          get().addAuditLog({
            action: 'donation_item_added',
            description: `在捐赠规划「${plan.title}」中添加捐赠项目：${itemDesc}${item.note ? `（${item.note}）` : ''}`,
            resourceType: 'donation_item',
            resourceId: newItem.id,
            newValue: JSON.stringify(item),
          });
        }
      },

      updateDonationItem: (itemId, updates) => {
        set((state) => {
          if (!state.donationPlan) return {};
          return {
            donationPlan: {
              ...state.donationPlan,
              items: state.donationPlan.items.map((i) =>
                i.id === itemId ? { ...i, ...updates } : i
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
        const plan = get().donationPlan;
        const item = plan?.items.find((i) => i.id === itemId);
        if (plan && item) {
          get().addAuditLog({
            action: 'donation_plan_updated',
            description: `更新捐赠规划「${plan.title}」的捐赠项目`,
            resourceType: 'donation_item',
            resourceId: itemId,
            newValue: JSON.stringify(updates),
          });
        }
      },

      removeDonationItem: (itemId) => {
        const plan = get().donationPlan;
        const item = plan?.items.find((i) => i.id === itemId);
        set((state) => {
          if (!state.donationPlan) return {};
          return {
            donationPlan: {
              ...state.donationPlan,
              items: state.donationPlan.items.filter((i) => i.id !== itemId),
              allocations: state.donationPlan.allocations.filter(
                (a) => a.donationItemId !== itemId
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
        if (plan && item) {
          get().addAuditLog({
            action: 'donation_item_removed',
            description: `从捐赠规划「${plan.title}」中移除捐赠项目`,
            resourceType: 'donation_item',
            resourceId: itemId,
            previousValue: JSON.stringify(item),
          });
        }
      },

      setDonationAllocation: (itemId, allocations) => {
        const newAllocations: DonationAllocation[] = allocations.map((a) => ({
          id: generateId(),
          donationItemId: itemId,
          charityId: a.charityId,
          percentage: a.percentage,
        }));
        set((state) => {
          if (!state.donationPlan) return {};
          const otherAllocations = state.donationPlan.allocations.filter(
            (a) => a.donationItemId !== itemId
          );
          return {
            donationPlan: {
              ...state.donationPlan,
              allocations: [...otherAllocations, ...newAllocations],
              updatedAt: new Date().toISOString(),
            },
          };
        });
        const plan = get().donationPlan;
        if (plan) {
          const allCharities = get().getAllCharities();
          const desc = allocations
            .map((a) => {
              const charity = allCharities.find((c) => c.id === a.charityId);
              return `${charity?.name || a.charityId}: ${a.percentage}%`;
            })
            .join('，');
          get().addAuditLog({
            action: 'donation_allocation_updated',
            description: `更新捐赠项目分配规则：${desc}`,
            resourceType: 'donation_allocation',
            resourceId: itemId,
            newValue: JSON.stringify(allocations),
          });
        }
      },

      updateDonationAllocation: (allocationId, updates) => {
        set((state) => {
          if (!state.donationPlan) return {};
          return {
            donationPlan: {
              ...state.donationPlan,
              allocations: state.donationPlan.allocations.map((a) =>
                a.id === allocationId ? { ...a, ...updates } : a
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      getDonationItemValue: (item) => {
        const { assets } = get();
        const totalAssetValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
        switch (item.type) {
          case 'specific_asset': {
            const asset = assets.find((a) => a.id === item.assetId);
            return asset?.value || 0;
          }
          case 'value_percentage':
            return Math.round(totalAssetValue * (item.percentageOfTotal || 0) / 100);
          case 'fixed_amount':
            return item.fixedAmount || 0;
          default:
            return 0;
        }
      },

      getDonationTotalValue: () => {
        const { donationPlan, getDonationItemValue } = get();
        if (!donationPlan) return 0;
        return donationPlan.items.reduce((sum, item) => sum + getDonationItemValue(item), 0);
      },

      getDonationExecutionState: () => {
        const { donationPlan, getDonationItemValue, getAllCharities } = get();
        const totalDonationValue = get().getDonationTotalValue();
        const totalItems = donationPlan?.items.length || 0;
        const completedItems = donationPlan?.items.filter((i) => i.completed).length || 0;

        const charityMap = new Map<string, {
          allocatedValue: number;
          percentage: number;
          completed: boolean;
        }>();

        donationPlan?.items.forEach((item) => {
          const itemValue = getDonationItemValue(item);
          const itemAllocations = (donationPlan?.allocations || []).filter(
            (a) => a.donationItemId === item.id
          );
          itemAllocations.forEach((alloc) => {
            const allocValue = Math.round(itemValue * alloc.percentage / 100);
            const existing = charityMap.get(alloc.charityId) || {
              allocatedValue: 0,
              percentage: 0,
              completed: false,
            };
            existing.allocatedValue += allocValue;
            if (item.completed) existing.completed = true;
            charityMap.set(alloc.charityId, existing);
          });
        });

        const allocatedValue = Array.from(charityMap.values()).reduce(
          (sum, c) => sum + c.allocatedValue,
          0
        );

        if (totalDonationValue > 0) {
          charityMap.forEach((entry) => {
            entry.percentage = Math.round((entry.allocatedValue / totalDonationValue) * 100);
          });
        }

        const overallProgress =
          totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        const charityBreakdown = Array.from(charityMap.entries()).map(([charityId, entry]) => {
          const charity = getAllCharities().find((c) => c.id === charityId);
          return {
            charityId,
            charityName: charity?.name || charityId,
            category: (charity?.category || 'other') as CharityCategory,
            allocatedValue: entry.allocatedValue,
            percentage: entry.percentage,
            completed: entry.completed,
          };
        });

        return {
          totalDonationValue,
          allocatedValue,
          unallocatedValue: totalDonationValue - allocatedValue,
          completedItems,
          totalItems,
          overallProgress,
          charityBreakdown,
        };
      },

      startDonationExecution: () => {
        const plan = get().donationPlan;
        if (!plan) return;
        const now = new Date().toISOString();
        set((state) => {
          if (!state.donationPlan) return {};
          return {
            donationPlan: {
              ...state.donationPlan,
              status: 'executing',
              executedAt: now,
              updatedAt: now,
            },
          };
        });
        get().addAuditLog({
          action: 'donation_execution_started',
          description: `开始执行捐赠规划「${plan.title}」，共 ${plan.items.length} 个捐赠项目，预计捐赠总额 ¥${get().getDonationTotalValue().toLocaleString()}`,
          resourceType: 'donation_plan',
          resourceId: plan.id,
        });
        get().addNotification({
          type: 'warning',
          title: '捐赠执行已启动',
          message: `「${plan.title}」进入执行阶段，请按分配规则完成各项捐赠`,
        });
      },

      completeDonationStep: (itemId) => {
        const plan = get().donationPlan;
        const item = plan?.items.find((i) => i.id === itemId);
        if (!plan || !item || item.completed) return;
        const now = new Date().toISOString();
        set((state) => {
          if (!state.donationPlan) return {};
          return {
            donationPlan: {
              ...state.donationPlan,
              items: state.donationPlan.items.map((i) =>
                i.id === itemId ? { ...i, completed: true, completedAt: now } : i
              ),
              updatedAt: now,
            },
          };
        });
        get().addAuditLog({
          action: 'donation_step_completed',
          description: `完成捐赠项目执行，价值 ¥${get().getDonationItemValue(item).toLocaleString()}`,
          resourceType: 'donation_item',
          resourceId: itemId,
        });
      },

      completeDonationExecution: () => {
        const plan = get().donationPlan;
        if (!plan) return;
        const now = new Date().toISOString();
        set((state) => {
          if (!state.donationPlan) return {};
          return {
            donationPlan: {
              ...state.donationPlan,
              status: 'completed',
              completedAt: now,
              updatedAt: now,
              items: state.donationPlan.items.map((i) =>
                i.completed ? i : { ...i, completed: true, completedAt: now }
              ),
            },
          };
        });
        const totalValue = get().getDonationTotalValue();
        get().addAuditLog({
          action: 'donation_execution_completed',
          description: `捐赠规划「${plan.title}」全部执行完成，累计捐赠 ¥${totalValue.toLocaleString()}，涉及 ${plan.items.length} 个项目`,
          resourceType: 'donation_plan',
          resourceId: plan.id,
          newValue: JSON.stringify({ completedAt: now, totalValue }),
        });
        get().addNotification({
          type: 'success',
          title: '捐赠执行完成',
          message: `「${plan.title}」所有捐赠项目已执行完成，共计 ¥${totalValue.toLocaleString()}`,
        });
      },

      cancelDonationExecution: () => {
        const plan = get().donationPlan;
        if (!plan) return;
        set((state) => {
          if (!state.donationPlan) return {};
          return {
            donationPlan: {
              ...state.donationPlan,
              status: 'cancelled',
              updatedAt: new Date().toISOString(),
            },
          };
        });
        get().addAuditLog({
          action: 'donation_plan_updated',
          description: `取消捐赠规划「${plan.title}」的执行`,
          resourceType: 'donation_plan',
          resourceId: plan.id,
          newValue: 'cancelled',
        });
      },

      addAssetNote: (note) => {
        const now = new Date().toISOString();
        const newNote: AssetNote = {
          ...note,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ assetNotes: [newNote, ...state.assetNotes] }));
        const asset = get().assets.find((a) => a.id === note.assetId);
        get().addAuditLog({
          action: 'asset_updated',
          description: `为资产「${asset?.name || note.assetId}」添加备注：${note.title}`,
          resourceType: 'asset_note',
          resourceId: newNote.id,
        });
      },

      updateAssetNote: (id, updates) => {
        set((state) => ({
          assetNotes: state.assetNotes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        }));
        const note = get().assetNotes.find((n) => n.id === id);
        if (note) {
          const asset = get().assets.find((a) => a.id === note.assetId);
          get().addAuditLog({
            action: 'asset_updated',
            description: `更新资产「${asset?.name || note.assetId}」的备注：${note.title}`,
            resourceType: 'asset_note',
            resourceId: id,
          });
        }
      },

      deleteAssetNote: (id) => {
        const note = get().assetNotes.find((n) => n.id === id);
        set((state) => ({
          assetNotes: state.assetNotes.filter((n) => n.id !== id),
        }));
        if (note) {
          const asset = get().assets.find((a) => a.id === note.assetId);
          get().addAuditLog({
            action: 'asset_updated',
            description: `删除资产「${asset?.name || note.assetId}」的备注：${note.title}`,
            resourceType: 'asset_note',
            resourceId: id,
          });
        }
      },

      getAssetNotesByAsset: (assetId) => get().assetNotes.filter((n) => n.assetId === assetId),

      getAssetNotesByCategory: (assetId, category) =>
        get().assetNotes.filter((n) => n.assetId === assetId && n.category === category),

      getImportantNotes: (assetId) => {
        const notes = get().assetNotes.filter((n) => n.isImportant);
        if (assetId) return notes.filter((n) => n.assetId === assetId);
        return notes;
      },

      toggleAssetNoteImportant: (id) => {
        set((state) => ({
          assetNotes: state.assetNotes.map((n) =>
            n.id === id ? { ...n, isImportant: !n.isImportant, updatedAt: new Date().toISOString() } : n
          ),
        }));
      },
    }),
    {
      name: 'digital-legacy-storage',
    }
  )
);
