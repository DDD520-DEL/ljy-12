export type AssetType = 'social_media' | 'cloud_storage' | 'crypto_wallet' | 'subscription' | 'email' | 'other';

export type AssetStatus = 'active' | 'inactive' | 'transferred';

export type HeirRelationship = 'spouse' | 'child' | 'parent' | 'sibling' | 'friend' | 'lawyer' | 'other';

export type TriggerType = 'inactivity_days' | 'date_based' | 'manual' | 'death_certificate';

export type WillStatus = 'draft' | 'active' | 'triggered' | 'executing' | 'completed';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

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
  | 'healthcheck_settings_updated';

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

export interface ExecutionStep {
  id: string;
  order: number;
  title: string;
  description: string;
  delayDays: number;
  actionType: 'notify' | 'transfer' | 'reveal_credentials' | 'delete_data';
  targetAssetIds?: string[];
  targetHeirIds?: string[];
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
