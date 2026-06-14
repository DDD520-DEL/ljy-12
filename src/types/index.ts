export type AssetType = 'social_media' | 'cloud_storage' | 'crypto_wallet' | 'subscription' | 'email' | 'other';

export type AssetStatus = 'active' | 'inactive' | 'transferred';

export type HeirRelationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'friend' | 'lawyer' | 'other';

export type TriggerType = 'inactivity_days' | 'date_based' | 'manual' | 'death_certificate';

export type WillStatus = 'draft' | 'active' | 'triggered' | 'executing' | 'completed';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type HeirVerificationStatus = 'not_started' | 'in_progress' | 'verified' | 'rejected' | 'expired';

export type VerificationMaterialType =
  | 'id_card'
  | 'household_register'
  | 'birth_certificate'
  | 'marriage_certificate'
  | 'death_certificate'
  | 'power_of_attorney'
  | 'other';

export interface VerificationMaterial {
  id: string;
  type: VerificationMaterialType;
  name: string;
  fileName?: string;
  uploadedAt?: string;
  verifiedAt?: string;
  status: VerificationStatus;
  note?: string;
}

export interface VerificationHistoryRecord {
  id: string;
  timestamp: string;
  action: 'invited' | 'material_submitted' | 'material_approved' | 'material_rejected' | 'verified' | 'rejected' | 'reset' | 'reminder_sent';
  operatorId?: string;
  operatorName?: string;
  operatorRole?: UserRole;
  note?: string;
  materialId?: string;
  materialName?: string;
}

export interface HeirVerificationDetail {
  status: HeirVerificationStatus;
  progress: number;
  totalMaterialsRequired: number;
  submittedMaterials: number;
  verifiedMaterials: number;
  lastReminderAt?: string;
  reminderCount: number;
  rejectionReason?: string;
  materials: VerificationMaterial[];
  history: VerificationHistoryRecord[];
  invitedAt: string;
  verifiedAt?: string;
}

export type ApprovalGroupStatus = 'pending' | 'approved' | 'rejected' | 'partial';

export type WitnessApprovalDecision = 'approved' | 'rejected' | 'pending';

export type HealthCheckPeriod = '7_days' | '30_days' | '90_days' | '180_days' | '365_days' | 'custom';

export type HealthCheckStatus = 'normal' | 'warning' | 'overdue' | 'never';

export type EmergencyContactStatus = 'pending' | 'notified' | 'confirmed_alive' | 'confirmed_deceased' | 'triggered_will' | 'extended_period';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone?: string;
  notificationPreference: 'email' | 'sms' | 'both';
  isVerified: boolean;
  createdAt: string;
  status: EmergencyContactStatus;
  notifiedAt?: string;
  confirmedAt?: string;
  extendedDays?: number;
  note?: string;
}

export interface EmergencyContactSettings {
  enabled: boolean;
  thresholdDays: number;
  confirmationWindowDays: number;
  contactId?: string;
}

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
  | 'bulk_export_csv'
  | 'emergency_contact_added'
  | 'emergency_contact_updated'
  | 'emergency_contact_removed'
  | 'emergency_contact_verified'
  | 'emergency_contact_notified'
  | 'emergency_contact_confirmed_alive'
  | 'emergency_contact_confirmed_deceased'
  | 'emergency_contact_triggered_will'
  | 'emergency_contact_extended_period'
  | 'emergency_settings_updated'
  | 'time_capsule_created'
  | 'heir_verification_reminder_sent'
  | 'heir_verification_reset'
  | 'heir_verification_completed'
  | 'heir_verification_rejected'
  | 'heir_verification_material_submitted'
  | 'heir_verification_material_approved'
  | 'heir_verification_material_rejected'
  | 'time_capsule_updated'
  | 'time_capsule_unlocked'
  | 'time_capsule_auto_decrypted'
  | 'credential_created'
  | 'credential_updated'
  | 'credential_deleted'
  | 'credential_viewed'
  | 'credential_revealed'
  | 'credential_decrypted_for_heir'
  | 'master_password_set'
  | 'master_password_changed'
  | 'vault_locked'
  | 'vault_unlocked'
  | 'donation_plan_created'
  | 'donation_plan_updated'
  | 'donation_plan_deleted'
  | 'donation_item_added'
  | 'donation_item_removed'
  | 'donation_allocation_updated'
  | 'donation_execution_started'
  | 'donation_execution_completed'
  | 'donation_step_completed';

export type TimeCapsuleStatus = 'locked' | 'unlocked' | 'expired';

export interface TimeCapsule {
  enabled: boolean;
  unlockDate: string;
  status: TimeCapsuleStatus;
  createdAt: string;
  note?: string;
}

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
  timeCapsule?: TimeCapsule;
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
  verification?: HeirVerificationDetail;
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

export type WillTemplateCategory = 'family' | 'diversified' | 'simple';

export interface WillTemplate {
  id: string;
  category: WillTemplateCategory;
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  suitableFor: string[];
  notSuitableFor: string[];
  willConfig: Omit<DigitalWill, 'id' | 'ownerId' | 'status' | 'lastActiveAt' | 'createdAt' | 'updatedAt'>;
  executionFlow: {
    title: string;
    description: string;
    duration: string;
    icon: string;
  }[];
  keyFeatures: string[];
  customizableParams: {
    name: string;
    type: 'trigger' | 'step' | 'witness' | 'lawyer';
    description: string;
  }[];
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

export type CredentialCategory = 'password' | 'recovery_key' | 'api_key' | 'seed_phrase' | 'pin_code' | 'security_question' | 'certificate' | 'other';

export type CredentialAccessLevel = 'owner_only' | 'heir_step_1' | 'heir_step_2' | 'heir_step_3' | 'witness_only' | 'lawyer_only';

export interface CredentialField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'password' | 'textarea';
  isSensitive: boolean;
}

export interface Credential {
  id: string;
  assetId?: string;
  name: string;
  category: CredentialCategory;
  description?: string;
  fields: CredentialField[];
  accessLevel: CredentialAccessLevel;
  heirChainOrder?: number;
  revealDelayDays: number;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  lastModifiedBy?: string;
  tags?: string[];
}

export interface MasterPassword {
  hash: string;
  salt: string;
  createdAt: string;
  lastChangedAt: string;
  hint?: string;
  recoveryKeyHash?: string;
}

export interface VaultState {
  isUnlocked: boolean;
  unlockedAt?: string;
  masterPassword: MasterPassword | null;
  failedAttempts: number;
  lockUntil?: string;
  autoLockMinutes: number;
}

export type CharityCategory =
  | 'education'
  | 'medical'
  | 'environment'
  | 'poverty'
  | 'elderly'
  | 'children'
  | 'animal'
  | 'disaster'
  | 'culture'
  | 'other';

export type DonationItemType = 'specific_asset' | 'value_percentage' | 'fixed_amount';

export type DonationStatus = 'draft' | 'active' | 'executing' | 'completed' | 'cancelled';

export interface Charity {
  id: string;
  name: string;
  category: CharityCategory;
  description: string;
  logo?: string;
  website?: string;
  taxId?: string;
  address?: string;
  contactEmail?: string;
  rating?: number;
  isPreset: boolean;
}

export interface DonationItem {
  id: string;
  type: DonationItemType;
  assetId?: string;
  fixedAmount?: number;
  percentageOfTotal?: number;
  note?: string;
  completed?: boolean;
  completedAt?: string;
}

export interface DonationAllocation {
  id: string;
  charityId: string;
  donationItemId: string;
  percentage: number;
}

export interface DonationPlan {
  id: string;
  title: string;
  description?: string;
  status: DonationStatus;
  items: DonationItem[];
  allocations: DonationAllocation[];
  executionStepOrder: number;
  delayDays: number;
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  completedAt?: string;
  lawyerReviewRequired: boolean;
  witnessConfirmRequired: boolean;
}

export interface DonationExecutionState {
  totalDonationValue: number;
  allocatedValue: number;
  unallocatedValue: number;
  completedItems: number;
  totalItems: number;
  overallProgress: number;
  charityBreakdown: {
    charityId: string;
    charityName: string;
    category: CharityCategory;
    allocatedValue: number;
    percentage: number;
    completed: boolean;
  }[];
}
