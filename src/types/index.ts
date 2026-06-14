export type AssetType = 'social_media' | 'cloud_storage' | 'crypto_wallet' | 'subscription' | 'email' | 'other';

export type AssetStatus = 'active' | 'inactive' | 'transferred';

export type HeirRelationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'friend' | 'lawyer' | 'other';

export type TriggerType = 'inactivity_days' | 'date_based' | 'manual' | 'death_certificate';

export type WillStatus = 'draft' | 'active' | 'triggered' | 'executing' | 'completed';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type ApprovalGroupStatus = 'pending' | 'approved' | 'rejected' | 'partial';

export type WitnessApprovalDecision = 'approved' | 'rejected' | 'pending';

export type HealthCheckPeriod = '7_days' | '30_days' | '90_days' | '180_days' | '365_days' | 'custom';

export type HealthCheckStatus = 'normal' | 'warning' | 'overdue' | 'never';

export type ReminderRule = {
  enabled: boolean;
  daysBefore: number;
  repeat: boolean;
};

export type UserRole = 'owner' | 'heir' | 'witness' | 'lawyer' | 'admin';

export type AuditActionType =
  | 'asset_created'
  | 'asset_updated'
  | 'asset_deleted'
  | 'heir_added'
  | 'heir_removed'
  | 'will_updated'
  | 'will_triggered'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'login'
  | 'logout'
  | 'asset_transferred'
  | 'witness_approved'
  | 'lawyer_approved'
  | 'notification_sent'
  | 'asset_verified'
  | 'healthcheck_reminder'
  | 'healthcheck_settings_updated'
  | 'approval_group_created'
  | 'approval_group_updated'
  | 'approval_group_deleted'
  | 'witness_assigned_to_group'
  | 'witness_removed_from_group'
  | 'witness_approval_submitted'
  | 'approval_group_completed'
  | 'will_execution_advanced'
  | 'branch_condition_evaluated'
  | 'branch_path_triggered'
  | 'bulk_heir_assigned'
  | 'bulk_type_updated'
  | 'bulk_export_csv';

export interface DigitalAsset {
  id: string;
  name: string;
  type: AssetType;
  username?: string;
  url?: string;
  description?: string;
  value?: number;
  currency?: string;
  heirId?: string;
  heirChain: string[];
  transferInstructions?: string;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
  healthCheckPeriod: HealthCheckPeriod;
  customPeriodDays?: number;
  reminderRule: ReminderRule;
}

export interface Heir {
  id: string;
  name: string;
  relationship: HeirRelationship;
  email: string;
  phone?: string;
  avatar?: string;
  notificationPreference: 'email' | 'sms' | 'both';
  isVerified: boolean;
  createdAt: string;
  assignedAssets: string[];
  priority: number;
}

export interface TriggerCondition {
  type: TriggerType;
  inactivityDays?: number;
  triggerDate?: string;
  requiresDeathCertificate?: boolean;
  requiresWitnessConfirmation?: boolean;
  witnessCount?: number;
  lawyerApprovalRequired?: boolean;
}

export type ConditionOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'contains' | 'verified' | 'not_verified' | 'status_is';

export type ConditionField = 'asset_value' | 'heir_verified' | 'asset_status' | 'witness_count' | 'approval_progress' | 'custom';

export interface BranchCondition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value?: string | number;
  label: string;
  resourceIds?: string[];
}

export interface Branch {
  id: string;
  label: string;
  conditions: BranchCondition[];
  conditionLogic: 'and' | 'or';
  targetStepIds: string[];
  color: string;
}

export interface ExecutionStep {
  id: string;
  order: number;
  title: string;
  description: string;
  delayDays: number;
  actionType: 'notify' | 'transfer' | 'reveal_credentials' | 'delete_data';
  targetAssetIds?: string[];
  targetHeirIds?: string[];
  branches?: Branch[];
  triggeredBranchId?: string;
  completed: boolean;
  completedAt?: string;
}

export interface DigitalWill {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  status: WillStatus;
  triggerCondition: TriggerCondition;
  executionSteps: ExecutionStep[];
  witnessIds: string[];
  lawyerIds: string[];
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
  triggeredAt?: string;
}

export interface Witness {
  id: string;
  name: string;
  email: string;
  phone?: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  isLawyer: boolean;
  barNumber?: string;
  firmName?: string;
  createdAt: string;
}

export interface WitnessApproval {
  witnessId: string;
  decision: WitnessApprovalDecision;
  decidedAt?: string;
  comment?: string;
}

export interface WitnessApprovalGroup {
  id: string;
  name: string;
  description?: string;
  witnessIds: string[];
  requiredApprovals: number;
  approvals: WitnessApproval[];
  status: ApprovalGroupStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface WillExecutionState {
  allGroupsApproved: boolean;
  canProceedToExecution: boolean;
  overallProgress: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditActionType;
  userId: string;
  userRole: UserRole;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  previousValue?: string;
  newValue?: string;
  transactionHash: string;
  previousHash: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  mfaEnabled: boolean;
  mfaMethod?: 'authenticator' | 'sms' | 'email';
  lastLoginAt?: string;
  createdAt: string;
  twoFactorSecret?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SimulationNotifyTarget {
  heirId?: string;
  witnessId?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'heir' | 'witness' | 'lawyer';
  notificationMethod: 'email' | 'sms' | 'both';
}

export interface SimulationTransferItem {
  assetId: string;
  assetName: string;
  assetType: AssetType;
  assetValue?: number;
  heirId: string;
  heirName: string;
  transferInstructions?: string;
}

export interface SimulationStepDetail {
  stepId: string;
  stepOrder: number;
  stepTitle: string;
  stepDescription: string;
  actionType: ExecutionStep['actionType'];
  delayDays: number;
  cumulativeDelayDays: number;
  notifyTargets: SimulationNotifyTarget[];
  transferItems: SimulationTransferItem[];
  estimatedExecutionDate: string;
  warnings: string[];
}

export interface SimulationSummary {
  totalSteps: number;
  totalDurationDays: number;
  totalNotifiedPeople: number;
  totalTransferredAssets: number;
  totalAssetValue: number;
  heirBreakdown: {
    heirId: string;
    heirName: string;
    assetCount: number;
    assetValue: number;
  }[];
  warnings: string[];
  readinessScore: number;
}

export interface SimulationReport {
  id: string;
  simulationTime: string;
  triggerCondition: TriggerCondition;
  steps: SimulationStepDetail[];
  summary: SimulationSummary;
  triggerDate: string;
}

export type SimulationMode = 'idle' | 'running' | 'completed';

export interface SimulationState {
  mode: SimulationMode;
  currentStepIndex: number;
  report: SimulationReport | null;
  isPlaying: boolean;
  playSpeed: number;
}
