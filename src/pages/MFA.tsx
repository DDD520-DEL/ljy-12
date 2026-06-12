import { useState } from 'react';
import {
  Shield,
  Smartphone,
  Mail,
  KeyRound,
  CheckCircle,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export default function MFA() {
  const currentUser = useAppStore((state) => state.currentUser);
  const updateUser = useAppStore((state) => state.updateUser);
  const addAuditLog = useAppStore((state) => state.addAuditLog);
  const addNotification = useAppStore((state) => state.addNotification);

  const [showSecret, setShowSecret] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'authenticator' | 'sms' | 'email'>('authenticator');
  const [copied, setCopied] = useState(false);

  const mfaMethods = [
    {
      id: 'authenticator',
      name: '身份验证器应用',
      description: '使用 Google Authenticator 或 Authy 等应用生成动态验证码',
      icon: Smartphone,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'sms',
      name: '短信验证码',
      description: '通过手机短信接收验证码',
      icon: Mail,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'email',
      name: '邮箱验证码',
      description: '通过邮箱接收验证码',
      icon: Mail,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const mockSecret = 'JBSWY3DPEHPK3PXP';

  const handleEnableMFA = () => {
    setShowEnableModal(true);
  };

  const handleConfirmEnable = () => {
    if (verificationCode.length === 6) {
      updateUser({
        mfaEnabled: true,
        mfaMethod: selectedMethod,
      });
      addAuditLog({
        action: 'mfa_enabled',
        description: `启用多因素身份验证（${selectedMethod === 'authenticator' ? '身份验证器' : selectedMethod === 'sms' ? '短信' : '邮箱'}）`,
      });
      addNotification({
        type: 'success',
        title: '多因素验证已启用',
        message: '您的账户安全等级已提升',
      });
      setShowEnableModal(false);
      setVerificationCode('');
    }
  };

  const handleDisableMFA = () => {
    if (confirm('确定要禁用多因素身份验证吗？这会降低账户安全性。')) {
      updateUser({
        mfaEnabled: false,
        mfaMethod: undefined,
      });
      addAuditLog({
        action: 'mfa_disabled',
        description: '禁用多因素身份验证',
      });
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(mockSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">身份验证</h1>
        <p className="text-gray-500 mt-1">管理您的账户安全和多因素验证设置</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            currentUser?.mfaEnabled ? 'bg-green-100' : 'bg-amber-100'
          )}>
            <Shield className={cn(
              'w-8 h-8',
              currentUser?.mfaEnabled ? 'text-green-600' : 'text-amber-600'
            )} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">账户安全状态</h2>
            <div className="flex items-center gap-2 mt-1">
              {currentUser?.mfaEnabled ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">高安全性</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="text-amber-600 font-medium">建议加强</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">密码强度</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-green-500 rounded-full" />
              </div>
              <span className="text-sm font-medium text-green-600">强</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">多因素验证</p>
            <p className="text-lg font-semibold mt-2">
              {currentUser?.mfaEnabled ? '已启用' : '未启用'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">安全评分</p>
            <p className="text-lg font-semibold mt-2">
              {currentUser?.mfaEnabled ? '95/100' : '65/100'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-emerald-500" />
          多因素身份验证方式
        </h3>

        <div className="space-y-3">
          {mfaMethods.map((method) => {
            const Icon = method.icon;
            const isActive = currentUser?.mfaEnabled && currentUser.mfaMethod === method.id;
            const isEnabled = currentUser?.mfaEnabled;

            return (
              <div
                key={method.id}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all',
                  isActive
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', method.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                          当前使用
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                  </div>
                  {isActive ? (
                    <button
                      onClick={handleDisableMFA}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      禁用
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedMethod(method.id as 'authenticator' | 'sms' | 'email');
                        handleEnableMFA();
                      }}
                      className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      启用
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-500" />
          恢复密钥
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          恢复密钥用于在您无法使用多因素验证设备时恢复账户访问权限。请将其保存在安全的地方。
        </p>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">密钥</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCopySecret}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="font-mono text-lg tracking-wider text-gray-900">
            {showSecret ? mockSecret : '•••• •••• •••• ••••'}
          </div>
        </div>

        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">重要提示</p>
              <p className="text-sm text-amber-700 mt-1">
                请将恢复密钥妥善保存在安全的物理位置，切勿存储在电脑或云端。如果丢失恢复密钥且无法使用验证设备，您将无法访问账户。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">为什么需要多因素验证？</h3>
            <p className="text-slate-300 mt-1">
              您的数字遗产包含敏感的财务和个人信息。多因素验证为您的账户添加了额外的安全层，
              即使密码泄露，攻击者也无法访问您的账户。
            </p>
          </div>
        </div>
      </div>

      {showEnableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">设置多因素验证</h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedMethod === 'authenticator'
                  ? '使用身份验证器应用扫描二维码'
                  : selectedMethod === 'sms'
                  ? '输入您的手机号以接收验证码'
                  : '验证码将发送到您的邮箱'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {selectedMethod === 'authenticator' && (
                <div className="text-center">
                  <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">模拟二维码</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">或手动输入密钥</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-mono">
                      {mockSecret}
                    </code>
                    <button
                      onClick={handleCopySecret}
                      className="p-1.5 text-gray-500 hover:text-gray-700"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {selectedMethod === 'sms' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                  <input
                    type="tel"
                    placeholder="请输入手机号"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  输入6位验证码
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 text-2xl text-center font-mono tracking-widest border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="000000"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEnableModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmEnable}
                  disabled={verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认启用
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
