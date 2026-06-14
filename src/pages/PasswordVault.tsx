import { useState, useMemo, useEffect } from 'react';
import {
  KeyRound,
  Lock,
  Unlock,
  Plus,
  PlusCircle,
  MinusCircle,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  FileKey,
  Key,
  CreditCard,
  HelpCircle,
  Award,
  User,
  UserCheck,
  Gavel,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Tag,
  Link2,
  Calendar,
  Fingerprint,
  RefreshCw,
  Logs,
  LockKeyhole,
  Hash,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  CREDENTIAL_CATEGORY_LABELS,
  CREDENTIAL_CATEGORY_COLORS,
  CREDENTIAL_ACCESS_LEVEL_LABELS,
  CREDENTIAL_ACCESS_LEVEL_COLORS,
  formatDate,
  generateId,
  DEFAULT_AUTO_LOCK_MINUTES,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_MINUTES,
} from '@/constants';
import { cn } from '@/lib/utils';
import type {
  Credential,
  CredentialCategory,
  CredentialAccessLevel,
  CredentialField,
} from '@/types';

const categoryIcons: Record<CredentialCategory, typeof KeyRound> = {
  password: Lock,
  recovery_key: RefreshCw,
  api_key: FileKey,
  seed_phrase: Hash,
  pin_code: CreditCard,
  security_question: HelpCircle,
  certificate: Award,
  other: Key,
};

const accessLevelIcons: Record<CredentialAccessLevel, typeof User> = {
  owner_only: ShieldCheck,
  heir_step_1: UserCheck,
  heir_step_2: UserCheck,
  heir_step_3: UserCheck,
  witness_only: Eye,
  lawyer_only: Gavel,
};

export default function PasswordVault() {
  const credentials = useAppStore((state) => state.credentials);
  const assets = useAppStore((state) => state.assets);
  const heirs = useAppStore((state) => state.heirs);
  const vault = useAppStore((state) => state.vault);
  const will = useAppStore((state) => state.will);
  const addCredential = useAppStore((state) => state.addCredential);
  const updateCredential = useAppStore((state) => state.updateCredential);
  const deleteCredential = useAppStore((state) => state.deleteCredential);
  const markCredentialAccessed = useAppStore((state) => state.markCredentialAccessed);
  const revealCredential = useAppStore((state) => state.revealCredential);
  const setMasterPassword = useAppStore((state) => state.setMasterPassword);
  const changeMasterPassword = useAppStore((state) => state.changeMasterPassword);
  const unlockVault = useAppStore((state) => state.unlockVault);
  const lockVault = useAppStore((state) => state.lockVault);
  const updateVaultAutoLock = useAppStore((state) => state.updateVaultAutoLock);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CredentialCategory | 'all'>('all');

  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [setPasswordForm, setSetPasswordForm] = useState({ password: '', confirmPassword: '', hint: '' });
  const [unlockForm, setUnlockForm] = useState({ password: '' });
  const [changePasswordForm, setChangePasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '', hint: '' });
  const [autoLockMinutes, setAutoLockMinutes] = useState(DEFAULT_AUTO_LOCK_MINUTES);

  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [credentialForm, setCredentialForm] = useState({
    name: '',
    category: 'password' as CredentialCategory,
    assetId: '' as string,
    description: '',
    accessLevel: 'owner_only' as CredentialAccessLevel,
    revealDelayDays: 0,
    tags: '' as string,
    fields: [] as Omit<CredentialField, 'id'>[],
  });

  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set());
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null);

  const [isLockedOut, setIsLockedOut] = useState(false);

  useEffect(() => {
    if (vault.lockUntil) {
      const lockDate = new Date(vault.lockUntil);
      const now = new Date();
      if (now < lockDate) {
        setIsLockedOut(true);
        const timer = setTimeout(() => {
          setIsLockedOut(false);
        }, lockDate.getTime() - now.getTime());
        return () => clearTimeout(timer);
      }
    }
    setIsLockedOut(false);
  }, [vault.lockUntil]);

  useEffect(() => {
    if (!vault.masterPassword && credentials.length > 0) {
      setShowSetPasswordModal(true);
    } else if (vault.masterPassword && !vault.isUnlocked) {
      setShowUnlockModal(true);
    }
  }, []);

  const filteredCredentials = useMemo(() => {
    return credentials.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [credentials, searchQuery, filterCategory]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = { all: credentials.length };
    Object.keys(CREDENTIAL_CATEGORY_LABELS).forEach((k) => {
      stats[k] = credentials.filter((c) => c.category === k).length;
    });
    return stats;
  }, [credentials]);

  const credentialsWithAssets = useMemo(() => {
    const assetIds = new Set<string>();
    credentials.forEach((c) => c.assetId && assetIds.add(c.assetId));
    return {
      total: credentials.length,
      withAssets: assetIds.size,
      passwordCount: credentials.filter((c) => c.category === 'password').length,
      recoveryCount: credentials.filter((c) => c.category === 'recovery_key' || c.category === 'seed_phrase').length,
      heirRevealCount: credentials.filter((c) => c.accessLevel !== 'owner_only').length,
    };
  }, [credentials]);

  const stepCounts = useMemo(() => {
    return {
      step1: credentials.filter((c) => c.accessLevel === 'heir_step_1' || c.accessLevel === 'lawyer_only' || c.accessLevel === 'witness_only').length,
      step2: credentials.filter((c) => c.accessLevel === 'heir_step_2').length,
      step3: credentials.filter((c) => c.accessLevel === 'heir_step_3').length,
    };
  }, [credentials]);

  const handleUnlock = () => {
    if (isLockedOut) return;
    const success = unlockVault(unlockForm.password);
    if (success) {
      setShowUnlockModal(false);
      setUnlockForm({ password: '' });
    }
  };

  const handleSetPassword = () => {
    if (setPasswordForm.password !== setPasswordForm.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    const success = setMasterPassword(setPasswordForm.password, setPasswordForm.hint || undefined);
    if (success) {
      setShowSetPasswordModal(false);
      setSetPasswordForm({ password: '', confirmPassword: '', hint: '' });
    }
  };

  const handleChangePassword = () => {
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      alert('两次输入的新密码不一致');
      return;
    }
    const success = changeMasterPassword(
      changePasswordForm.oldPassword,
      changePasswordForm.newPassword,
      changePasswordForm.hint || undefined
    );
    if (success) {
      setShowChangePasswordModal(false);
      setChangePasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '', hint: '' });
    }
  };

  const handleSaveAutoLock = () => {
    updateVaultAutoLock(autoLockMinutes);
    setShowSettingsModal(false);
  };

  const handleOpenAddModal = (credential?: Credential) => {
    if (!vault.isUnlocked && vault.masterPassword) {
      setShowUnlockModal(true);
      return;
    }
    if (credential) {
      setEditingCredential(credential);
      setCredentialForm({
        name: credential.name,
        category: credential.category,
        assetId: credential.assetId || '',
        description: credential.description || '',
        accessLevel: credential.accessLevel,
        revealDelayDays: credential.revealDelayDays,
        tags: credential.tags?.join(', ') || '',
        fields: credential.fields.map(({ id: _id, ...rest }) => rest),
      });
    } else {
      setEditingCredential(null);
      setCredentialForm({
        name: '',
        category: 'password',
        assetId: '',
        description: '',
        accessLevel: 'owner_only',
        revealDelayDays: 0,
        tags: '',
        fields: [
          { label: '账号', value: '', type: 'text', isSensitive: false },
          { label: '密码', value: '', type: 'password', isSensitive: true },
        ],
      });
    }
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingCredential(null);
  };

  const handleAddField = () => {
    setCredentialForm((prev) => ({
      ...prev,
      fields: [...prev.fields, { label: '', value: '', type: 'text', isSensitive: false }],
    }));
  };

  const handleRemoveField = (index: number) => {
    setCredentialForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateField = (index: number, key: string, value: any) => {
    setCredentialForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, [key]: value } : f)),
    }));
  };

  const handleSubmitCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialForm.name.trim()) {
      alert('请输入凭据名称');
      return;
    }
    const validFields = credentialForm.fields.filter((f) => f.label.trim());
    if (validFields.length === 0) {
      alert('请至少添加一个有效字段');
      return;
    }

    const tags = credentialForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: credentialForm.name.trim(),
      category: credentialForm.category,
      assetId: credentialForm.assetId || undefined,
      description: credentialForm.description || undefined,
      accessLevel: credentialForm.accessLevel,
      revealDelayDays: credentialForm.revealDelayDays,
      tags: tags.length > 0 ? tags : undefined,
      fields: validFields,
    };

    if (editingCredential) {
      updateCredential(editingCredential.id, payload);
    } else {
      addCredential(payload);
    }
    handleCloseAddModal();
  };

  const handleOpenDetail = (credential: Credential) => {
    if (!vault.isUnlocked && vault.masterPassword) {
      setShowUnlockModal(true);
      return;
    }
    setSelectedCredential(credential);
    setRevealedFields(new Set());
    markCredentialAccessed(credential.id);
    setShowDetailModal(true);
  };

  const handleToggleReveal = (fieldId: string) => {
    if (!vault.isUnlocked && vault.masterPassword) return;
    if (!revealedFields.has(fieldId)) {
      if (selectedCredential) {
        revealCredential(selectedCredential.id);
      }
    }
    setRevealedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  const handleCopyField = async (value: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedFieldId(fieldId);
      setTimeout(() => setCopiedFieldId(null), 2000);
    } catch {
      alert('复制失败');
    }
  };

  const handleDelete = (credential: Credential) => {
    if (confirm(`确定要删除凭据「${credential.name}」吗？此操作不可恢复。`)) {
      deleteCredential(credential.id);
      if (selectedCredential?.id === credential.id) {
        setShowDetailModal(false);
        setSelectedCredential(null);
      }
    }
  };

  const getAssetName = (assetId?: string) => {
    if (!assetId) return '';
    return assets.find((a) => a.id === assetId)?.name || '';
  };

  const getHeirName = (assetId?: string) => {
    if (!assetId) return '';
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return '';
    const heirId = asset.heirChain[0] || asset.heirId;
    if (!heirId) return '';
    return heirs.find((h) => h.id === heirId)?.name || '';
  };

  const renderFieldValue = (field: CredentialField) => {
    const isRevealed = revealedFields.has(field.id);
    const shouldMask = field.isSensitive && !isRevealed;

    if (field.type === 'textarea') {
      return (
        <div className="relative">
          <textarea
            readOnly
            value={shouldMask ? '••••••••••••' : field.value}
            className={cn(
              'w-full p-3 rounded-lg border text-sm resize-none',
              shouldMask ? 'font-mono tracking-widest bg-gray-50 text-gray-400' : 'bg-white text-gray-800'
            )}
            rows={3}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <input
          readOnly
          type={field.type === 'password' && !isRevealed ? 'password' : 'text'}
          value={shouldMask ? '••••••••••••' : field.value}
          className={cn(
            'flex-1 px-3 py-2 rounded-lg border text-sm',
            shouldMask ? 'font-mono tracking-widest bg-gray-50 text-gray-400' : 'bg-white text-gray-800'
          )}
        />
        {field.isSensitive && (
          <button
            onClick={() => handleToggleReveal(field.id)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
          >
            {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        <button
          onClick={() => handleCopyField(field.value, field.id)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
        >
          {copiedFieldId === field.id ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-4 rounded-2xl shadow-lg',
              vault.isUnlocked
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-slate-500 to-slate-700'
            )}>
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">密码保险箱</h1>
              <div className="flex items-center gap-2 mt-1">
                {vault.isUnlocked ? (
                  <>
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700 font-medium">已解锁</span>
                    {vault.unlockedAt && (
                      <span className="text-xs text-gray-500">· 解锁于 {formatDate(vault.unlockedAt)}</span>
                    )}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-600" />
                    <span className="text-sm text-slate-700 font-medium">
                      {vault.masterPassword ? '已锁定' : '未设置密码'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition shadow-sm"
            >
              <Settings size={18} />
              保险箱设置
            </button>
            {vault.isUnlocked ? (
              <button
                onClick={() => lockVault()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-600 hover:bg-slate-700 text-white font-medium transition shadow-sm"
              >
                <Lock size={18} />
                立即锁定
              </button>
            ) : (
              <button
                onClick={() => setShowUnlockModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-sm"
              >
                <Unlock size={18} />
                解锁保险箱
              </button>
            )}
            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium transition shadow-lg shadow-indigo-200"
            >
              <Plus size={18} />
              添加凭据
            </button>
          </div>
        </div>

        {!vault.isUnlocked && vault.masterPassword && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-indigo-900 text-white shadow-xl">
            <div className="flex items-start gap-5">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur">
                <LockKeyhole className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">保险箱已锁定</h3>
                <p className="text-white/70 mb-4 leading-relaxed">
                  所有凭据内容已通过 AES-256 加密保护，请输入主密码解锁查看。
                  {vault.failedAttempts > 0 && (
                    <span className="ml-2 text-amber-300 font-medium">
                      （已尝试 {vault.failedAttempts}/{MAX_FAILED_ATTEMPTS} 次）
                    </span>
                  )}
                  {isLockedOut && (
                    <span className="ml-2 text-red-300 font-medium">
                      （已锁定，{LOCKOUT_MINUTES} 分钟后可重试）
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowUnlockModal(true)}
                    className="px-5 py-2 rounded-xl bg-white text-slate-800 font-semibold hover:bg-gray-100 transition"
                  >
                    输入主密码解锁
                  </button>
                  {vault.masterPassword?.hint && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur">
                      <HelpCircle className="w-4 h-4 text-amber-300" />
                      <span className="text-sm text-white/80">提示：{vault.masterPassword.hint}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {will && (will.status === 'triggered' || will.status === 'executing') && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-2">遗嘱触发解密流程</h3>
                <p className="text-amber-800/80 mb-4 text-sm">
                  数字遗嘱已触发，凭据将按照预设的访问级别和延迟时间逐步向继承人解密展示。
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((step) => {
                    const count = step === 1 ? stepCounts.step1 : step === 2 ? stepCounts.step2 : stepCounts.step3;
                    const currentStep = will.status === 'executing'
                      ? Math.max(1, will.executionSteps.filter((s) => s.completed).length)
                      : 0;
                    const isActive = currentStep >= step;
                    const isCurrent = currentStep + 1 === step;
                    return (
                      <div
                        key={step}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all',
                          isActive
                            ? 'bg-emerald-50 border-emerald-300'
                            : isCurrent
                            ? 'bg-blue-50 border-blue-300 animate-pulse'
                            : 'bg-white/60 border-amber-200'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-bold',
                            isActive ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-amber-200 text-amber-800'
                          )}>
                            第 {step} 阶段
                          </span>
                          {isActive && <Check className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          {step === 1 ? '立即披露' : step === 2 ? '延迟 30 天' : '延迟 60 天'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {count} 项凭据
                          {step === 1 && '（基础访问凭据、律师/见证人）'}
                          {step === 2 && '（中级敏感凭据）'}
                          {step === 3 && '（最高权限凭据）'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{credentialsWithAssets.total}</span>
            </div>
            <p className="text-sm text-gray-500">凭据总数</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                <Link2 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{credentialsWithAssets.withAssets}</span>
            </div>
            <p className="text-sm text-gray-500">关联资产</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100">
                <Lock className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{credentialsWithAssets.passwordCount}</span>
            </div>
            <p className="text-sm text-gray-500">账号密码</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                <KeyRound className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{credentialsWithAssets.recoveryCount}</span>
            </div>
            <p className="text-sm text-gray-500">恢复密钥/助记词</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100">
                <UserCheck className="w-5 h-5 text-rose-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{credentialsWithAssets.heirRevealCount}</span>
            </div>
            <p className="text-sm text-gray-500">将被继承</p>
          </div>
        </div>

        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 text-white shadow-xl">
          <div className="flex items-start gap-5">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur">
              <Logs className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">区块链式审计日志</h3>
              <p className="text-white/70 text-sm mb-3 leading-relaxed">
                所有凭据操作（创建、查看、修改、删除、揭露明文）均自动写入不可篡改的审计日志，
                采用 SHA-256 哈希链确保完整性。继承人解密操作也会被完整记录。
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-white/60">实时记录</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-white/60">哈希链验证</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-white/60">操作人溯源</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <span className="text-white/60">IP 地址记录</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索凭据名称、描述、标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(['all', ...Object.keys(CREDENTIAL_CATEGORY_LABELS)] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat as any)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap',
                  filterCategory === cat
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {cat === 'all' ? '全部' : CREDENTIAL_CATEGORY_LABELS[cat as CredentialCategory]}
                <span className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-xs',
                  filterCategory === cat ? 'bg-white/20' : 'bg-gray-100'
                )}>
                  {categoryStats[cat] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredCredentials.length === 0 ? (
          <div className="p-16 rounded-2xl bg-white border border-dashed border-gray-300 text-center">
            <div className="inline-flex p-5 rounded-3xl bg-gradient-to-br from-slate-100 to-gray-100 mb-5">
              <KeyRound className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">暂无凭据</h3>
            <p className="text-gray-500 mb-6">
              {credentials.length === 0
                ? '开始添加您的第一个敏感凭据，所有数据将通过主密码加密保护'
                : '当前筛选条件下没有匹配的凭据'}
            </p>
            {credentials.length === 0 && (
              <button
                onClick={() => handleOpenAddModal()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-200"
              >
                <Plus size={20} />
                添加第一个凭据
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCredentials.map((credential) => {
              const CategoryIcon = categoryIcons[credential.category];
              const AccessIcon = accessLevelIcons[credential.accessLevel];
              return (
                <div
                  key={credential.id}
                  className="group p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer"
                  onClick={() => handleOpenDetail(credential)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-3 rounded-xl shadow-sm',
                        CREDENTIAL_CATEGORY_COLORS[credential.category].replace('text-', 'bg-').replace('-700', '-100').replace('-600', '-100')
                      )}>
                        <CategoryIcon className={cn(
                          'w-5 h-5',
                          CREDENTIAL_CATEGORY_COLORS[credential.category].split(' ')[1]
                        )} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 group-hover:text-indigo-700 transition">
                          {credential.name}
                        </h3>
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium mt-1',
                          CREDENTIAL_CATEGORY_COLORS[credential.category]
                        )}>
                          {CREDENTIAL_CATEGORY_LABELS[credential.category]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenAddModal(credential); }}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-500"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(credential); }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {credential.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{credential.description}</p>
                  )}

                  <div className="space-y-2.5 mb-4">
                    {credential.fields.slice(0, 3).map((field) => (
                      <div key={field.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{field.label}</span>
                        <div className="flex items-center gap-1.5">
                          {field.isSensitive && <Shield className="w-3.5 h-3.5 text-amber-500" />}
                          <span className={cn(
                            'font-mono',
                            vault.isUnlocked ? 'text-gray-700' : 'text-gray-400'
                          )}>
                            {vault.isUnlocked
                              ? (field.isSensitive ? '••••••••' : field.value.slice(0, 12) + (field.value.length > 12 ? '...' : ''))
                              : '••••••••'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {credential.fields.length > 3 && (
                      <p className="text-xs text-gray-400">还有 {credential.fields.length - 3} 个字段...</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg',
                        CREDENTIAL_ACCESS_LEVEL_COLORS[credential.accessLevel]
                      )}>
                        <AccessIcon size={12} />
                        {CREDENTIAL_ACCESS_LEVEL_LABELS[credential.accessLevel]}
                      </div>
                      {credential.assetId && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Link2 size={12} />
                          <span className="max-w-[120px] truncate">{getAssetName(credential.assetId)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      {credential.assetId && getHeirName(credential.assetId) ? (
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>继承人：{getHeirName(credential.assetId)}</span>
                        </div>
                      ) : (
                        <span></span>
                      )}
                      {credential.revealDelayDays > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>延迟 {credential.revealDelayDays} 天</span>
                        </div>
                      )}
                    </div>
                    {credential.tags && credential.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <Tag size={11} className="text-gray-400" />
                        {credential.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showSetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">设置主密码</h2>
                  <p className="text-sm text-gray-500">首次启用保险箱加密</p>
                </div>
              </div>
              <button onClick={() => setShowSetPasswordModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">请务必牢记主密码！</p>
                  <p className="text-amber-700/80 leading-relaxed">
                    主密码采用加盐哈希存储，系统无法找回。一旦丢失，所有加密的凭据将永久无法解密。
                    建议使用密码管理器妥善保存。
                  </p>
                </div>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSetPassword(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主密码（至少8位）</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={setPasswordForm.password}
                  onChange={(e) => setSetPasswordForm({ ...setPasswordForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  placeholder="输入强密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">确认主密码</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={setPasswordForm.confirmPassword}
                  onChange={(e) => setSetPasswordForm({ ...setPasswordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  placeholder="再次输入相同密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码提示 <span className="text-gray-400 font-normal">（可选）</span>
                </label>
                <input
                  type="text"
                  value={setPasswordForm.hint}
                  onChange={(e) => setSetPasswordForm({ ...setPasswordForm, hint: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  placeholder="帮助您回忆密码的提示，不要包含密码本身"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSetPasswordModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  稍后设置
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-200"
                >
                  启用加密
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800">
                  <LockKeyhole className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">解锁保险箱</h2>
                  <p className="text-sm text-gray-500">输入主密码查看凭据</p>
                </div>
              </div>
              <button onClick={() => setShowUnlockModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            {isLockedOut && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">尝试次数过多</p>
                    <p className="text-red-700/80">
                      保险箱已临时锁定 {LOCKOUT_MINUTES} 分钟，请稍后再试。
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleUnlock(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主密码</label>
                <input
                  type="password"
                  required
                  disabled={isLockedOut}
                  value={unlockForm.password}
                  onChange={(e) => setUnlockForm({ ...unlockForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="请输入主密码"
                />
              </div>
              {vault.masterPassword?.hint && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 text-sm">
                  <HelpCircle size={16} />
                  <span>密码提示：{vault.masterPassword.hint}</span>
                </div>
              )}
              {vault.failedAttempts > 0 && !isLockedOut && (
                <p className="text-sm text-amber-600 text-center">
                  剩余尝试次数：{MAX_FAILED_ATTEMPTS - vault.failedAttempts} 次
                </p>
              )}
              <button
                type="submit"
                disabled={isLockedOut}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                解锁保险箱
              </button>
              {!vault.masterPassword && (
                <button
                  type="button"
                  onClick={() => { setShowUnlockModal(false); setShowSetPasswordModal(true); }}
                  className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  还没有设置主密码？立即设置
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">修改主密码</h2>
                <p className="text-sm text-gray-500">定期更换密码提升安全性</p>
              </div>
              <button onClick={() => setShowChangePasswordModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">原主密码</label>
                <input
                  type="password"
                  required
                  value={changePasswordForm.oldPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, oldPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">新主密码</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新密码提示 <span className="text-gray-400 font-normal">（可选）</span>
                </label>
                <input
                  type="text"
                  value={changePasswordForm.hint}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, hint: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  placeholder="留空则保持原提示"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  确认修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-100 to-gray-200">
                  <Settings className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">保险箱设置</h2>
                  <p className="text-sm text-gray-500">管理安全选项</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-indigo-600" />
                  主密码管理
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">密码状态</p>
                      <p className="text-gray-500">
                        {vault.masterPassword
                          ? `上次修改：${formatDate(vault.masterPassword.lastChangedAt)}`
                          : '未设置主密码，凭据未加密'}
                      </p>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-lg text-xs font-semibold',
                      vault.masterPassword ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {vault.masterPassword ? '已加密' : '未加密'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowSettingsModal(false);
                      if (vault.masterPassword) {
                        setShowChangePasswordModal(true);
                      } else {
                        setShowSetPasswordModal(true);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition text-left"
                  >
                    {vault.masterPassword ? '修改主密码' : '设置主密码启用加密'}
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  自动锁定
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      空闲后自动锁定（分钟）
                    </label>
                    <select
                      value={autoLockMinutes}
                      onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    >
                      <option value={1}>1 分钟（最高安全）</option>
                      <option value={5}>5 分钟（推荐）</option>
                      <option value={15}>15 分钟</option>
                      <option value={30}>30 分钟</option>
                      <option value={60}>1 小时</option>
                      <option value={0}>永不自动锁定</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500">
                    当前设置：{vault.autoLockMinutes === 0 ? '已禁用自动锁定' : `${vault.autoLockMinutes} 分钟无操作后自动锁定`}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  安全建议
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>使用至少 12 位包含大小写、数字和符号的主密码</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>不要在其他网站使用相同的主密码</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>每 90 天更换一次主密码</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>设置合理的继承解密延迟，防止误触发</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleSaveAutoLock}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCredential ? '编辑凭据' : '添加凭据'}
                </h2>
                <p className="text-sm text-gray-500">
                  {editingCredential ? '修改已保存的凭据信息' : '将敏感信息加密存入保险箱'}
                </p>
              </div>
              <button onClick={handleCloseAddModal} className="p-2 rounded-xl hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitCredential} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">凭据名称 *</label>
                  <input
                    type="text"
                    required
                    value={credentialForm.name}
                    onChange={(e) => setCredentialForm({ ...credentialForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    placeholder="例如：微信登录密码"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">类别 *</label>
                  <select
                    value={credentialForm.category}
                    onChange={(e) => setCredentialForm({ ...credentialForm, category: e.target.value as CredentialCategory })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  >
                    {Object.entries(CREDENTIAL_CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">关联资产</label>
                  <select
                    value={credentialForm.assetId}
                    onChange={(e) => setCredentialForm({ ...credentialForm, assetId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  >
                    <option value="">不关联（独立凭据）</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">访问级别</label>
                  <select
                    value={credentialForm.accessLevel}
                    onChange={(e) => setCredentialForm({ ...credentialForm, accessLevel: e.target.value as CredentialAccessLevel })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  >
                    {Object.entries(CREDENTIAL_ACCESS_LEVEL_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">继承人延迟天数</label>
                  <input
                    type="number"
                    min={0}
                    value={credentialForm.revealDelayDays}
                    onChange={(e) => setCredentialForm({ ...credentialForm, revealDelayDays: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                  <textarea
                    value={credentialForm.description}
                    onChange={(e) => setCredentialForm({ ...credentialForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                    placeholder="可选，添加说明信息"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
                  <input
                    type="text"
                    value={credentialForm.tags}
                    onChange={(e) => setCredentialForm({ ...credentialForm, tags: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    placeholder="用逗号分隔，例如：重要,社交媒体,工作"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    凭据字段
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-sm font-medium transition"
                  >
                    <PlusCircle size={16} />
                    添加字段
                  </button>
                </div>

                <div className="space-y-3">
                  {credentialForm.fields.map((field, index) => (
                    <div key={index} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-4">
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">字段名</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            placeholder="如：密码"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">类型</label>
                          <select
                            value={field.type}
                            onChange={(e) => handleUpdateField(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                          >
                            <option value="text">文本</option>
                            <option value="password">密码</option>
                            <option value="textarea">多行文本</option>
                          </select>
                        </div>
                        <div className="col-span-4">
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">值</label>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={field.value}
                              onChange={(e) => handleUpdateField(index, 'value', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                              rows={2}
                            />
                          ) : (
                            <input
                              type={field.type === 'password' ? 'password' : 'text'}
                              value={field.value}
                              onChange={(e) => handleUpdateField(index, 'value', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            />
                          )}
                        </div>
                        <div className="col-span-1 flex items-end gap-2 pb-2">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.isSensitive}
                              onChange={(e) => handleUpdateField(index, 'isSensitive', e.target.checked)}
                              className="w-4 h-4 rounded text-indigo-600"
                            />
                            <span className="text-xs text-gray-500">敏感</span>
                          </label>
                          {credentialForm.fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveField(index)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition"
                            >
                              <MinusCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-200"
                >
                  {editingCredential ? '保存修改' : '加密保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedCredential && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  'p-4 rounded-2xl shadow-sm',
                  CREDENTIAL_CATEGORY_COLORS[selectedCredential.category].replace('text-', 'bg-').replace('-700', '-100').replace('-600', '-100')
                )}>
                  {(() => {
                    const Icon = categoryIcons[selectedCredential.category];
                    return <Icon className={cn('w-7 h-7', CREDENTIAL_CATEGORY_COLORS[selectedCredential.category].split(' ')[1])} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedCredential.name}</h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium',
                      CREDENTIAL_CATEGORY_COLORS[selectedCredential.category]
                    )}>
                      {CREDENTIAL_CATEGORY_LABELS[selectedCredential.category]}
                    </span>
                    {(() => {
                      const AccessIcon = accessLevelIcons[selectedCredential.accessLevel];
                      return (
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium',
                          CREDENTIAL_ACCESS_LEVEL_COLORS[selectedCredential.accessLevel]
                        )}>
                          <AccessIcon size={12} />
                          {CREDENTIAL_ACCESS_LEVEL_LABELS[selectedCredential.accessLevel]}
                        </span>
                      );
                    })()}
                    {selectedCredential.isEncrypted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs font-medium">
                        <Lock size={12} />
                        AES-256 加密
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { handleCloseAddModal(); handleOpenAddModal(selectedCredential); }}
                  className="p-2.5 rounded-xl hover:bg-blue-50 text-blue-500 transition"
                  title="编辑"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(selectedCredential)}
                  className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition"
                  title="删除"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedCredential(null); }}
                  className="p-2.5 rounded-xl hover:bg-gray-100 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {selectedCredential.description && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">{selectedCredential.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              {selectedCredential.assetId && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-1.5">
                    <Link2 size={14} />
                    关联数字资产
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{getAssetName(selectedCredential.assetId)}</p>
                </div>
              )}
              {selectedCredential.assetId && getHeirName(selectedCredential.assetId) && (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mb-1.5">
                    <User size={14} />
                    指定继承人
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{getHeirName(selectedCredential.assetId)}</p>
                </div>
              )}
              {selectedCredential.revealDelayDays > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                  <div className="flex items-center gap-2 text-xs text-amber-600 font-medium mb-1.5">
                    <Clock size={14} />
                    解密延迟
                  </div>
                  <p className="text-sm font-semibold text-gray-800">遗嘱触发后 {selectedCredential.revealDelayDays} 天</p>
                </div>
              )}
              {selectedCredential.lastAccessedAt && (
                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                  <div className="flex items-center gap-2 text-xs text-purple-600 font-medium mb-1.5">
                    <Eye size={14} />
                    上次访问
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(selectedCredential.lastAccessedAt)}</p>
                </div>
              )}
            </div>

            {!vault.isUnlocked && vault.masterPassword ? (
              <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-50 to-gray-100 border border-gray-200 text-center">
                <div className="inline-flex p-4 rounded-3xl bg-white shadow-sm mb-4">
                  <LockKeyhole className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">凭据内容已加密</h3>
                <p className="text-sm text-gray-500 mb-5">请先解锁保险箱以查看明文内容</p>
                <button
                  onClick={() => { setShowDetailModal(false); setShowUnlockModal(true); }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-md shadow-blue-200"
                >
                  <Unlock size={18} />
                  解锁保险箱
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  凭据字段
                  <span className="ml-auto text-xs font-normal text-gray-400">
                    {selectedCredential.fields.length} 个字段
                  </span>
                </h4>
                {selectedCredential.fields.map((field) => (
                  <div key={field.id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">{field.label}</span>
                        {field.isSensitive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[11px] font-medium">
                            <Shield size={10} />
                            敏感
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 uppercase tracking-wide">{field.type}</span>
                    </div>
                    {renderFieldValue(field)}
                  </div>
                ))}
              </div>
            )}

            {selectedCredential.tags && selectedCredential.tags.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-gray-400" />
                  {selectedCredential.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} />
                <span>创建于 {formatDate(selectedCredential.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw size={12} />
                <span>更新于 {formatDate(selectedCredential.updatedAt)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900/5 to-gray-800/5 border border-slate-200">
              <div className="flex items-start gap-3">
                <Logs className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-700 mb-1">审计日志已记录</p>
                  <p>
                    本次查看{revealedFields.size > 0 ? `及揭露 ${revealedFields.size} 个敏感字段` : '元数据'}的操作已写入区块链式审计日志，
                    包含操作人、时间戳、IP 地址等信息，确保所有访问可追溯。
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={() => { setShowDetailModal(false); setSelectedCredential(null); }}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
              >
                关闭
              </button>
              {vault.isUnlocked && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenAddModal(selectedCredential);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  编辑凭据
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
