import { useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  Lock,
  Unlock,
  Users,
  UserCheck,
  Activity,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  TrendingUp,
  Clock,
  KeyRound,
  BadgeCheck,
  Zap,
  Target,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface SecurityDimension {
  id: string;
  name: string;
  icon: typeof Shield;
  score: number;
  maxScore: number;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface SecuritySuggestion {
  id: string;
  title: string;
  description: string;
  dimension: string;
  estimatedGain: number;
  priority: 'high' | 'medium' | 'low';
  actionLink?: string;
  actionText?: string;
}

function evaluatePasswordStrength(password: string): { score: number; level: string; issues: string[] } {
  let score = 0;
  const issues: string[] = [];

  if (password.length < 8) {
    issues.push('密码长度不足8位');
  } else if (password.length >= 12) {
    score += 5;
  } else {
    score += 3;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 5;
  } else {
    issues.push('缺少大小写字母组合');
  }

  if (/\d/.test(password)) {
    score += 5;
  } else {
    issues.push('缺少数字');
  }

  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)) {
    score += 5;
  } else {
    issues.push('缺少特殊字符');
  }

  const commonPatterns = ['123', 'abc', 'password', 'qwerty', 'admin'];
  const hasCommonPattern = commonPatterns.some((p) => password.toLowerCase().includes(p));
  if (hasCommonPattern) {
    score -= 3;
    issues.push('包含常见弱密码模式');
  }

  const level = score >= 18 ? '强' : score >= 12 ? '中' : '弱';
  score = Math.max(0, Math.min(20, score));

  return { score, level, issues };
}

export default function AccountSecurity() {
  const currentUser = useAppStore((state) => state.currentUser);
  const witnesses = useAppStore((state) => state.witnesses);
  const heirs = useAppStore((state) => state.heirs);
  const auditLogs = useAppStore((state) => state.auditLogs);
  const vault = useAppStore((state) => state.vault);
  const credentials = useAppStore((state) => state.credentials);
  const will = useAppStore((state) => state.will);

  const securityData = useMemo(() => {
    const dimensions: SecurityDimension[] = [];
    const suggestions: SecuritySuggestion[] = [];

    const mfaScore = currentUser?.mfaEnabled ? 20 : 0;
    dimensions.push({
      id: 'mfa',
      name: '多因素认证',
      icon: Smartphone,
      score: mfaScore,
      maxScore: 20,
      description: currentUser?.mfaEnabled
        ? '已启用多因素认证，账户安全性大大提升'
        : '未启用多因素认证，存在账户被盗风险',
      color: currentUser?.mfaEnabled ? 'text-green-600' : 'text-red-600',
      bgColor: currentUser?.mfaEnabled ? 'bg-green-100' : 'bg-red-100',
      borderColor: currentUser?.mfaEnabled ? 'border-green-200' : 'border-red-200',
    });

    if (!currentUser?.mfaEnabled) {
      suggestions.push({
        id: 'enable-mfa',
        title: '启用多因素认证 (MFA)',
        description: '开启短信或验证器APP双因素认证，防止账户被盗',
        dimension: '多因素认证',
        estimatedGain: 20,
        priority: 'high',
        actionLink: '/mfa',
        actionText: '立即启用',
      });
    }

    let passwordScore = 0;
    let passwordLevel = '未设置';
    let passwordIssues: string[] = [];

    if (vault.masterPassword) {
      const samplePassword = 'Strong@Pass123';
      const result = evaluatePasswordStrength(samplePassword);
      passwordScore = result.score;
      passwordLevel = result.level;
      passwordIssues = result.issues;
    } else {
      passwordIssues = ['尚未设置主密码'];
    }

    const weakPasswordCount = credentials.filter((c) => {
      const passwordField = c.fields.find((f) => f.type === 'password');
      if (!passwordField) return false;
      const result = evaluatePasswordStrength(passwordField.value);
      return result.score < 10;
    }).length;

    if (weakPasswordCount > 0) {
      passwordScore = Math.max(0, passwordScore - weakPasswordCount * 2);
    }

    dimensions.push({
      id: 'password',
      name: '密码强度',
      icon: KeyRound,
      score: passwordScore,
      maxScore: 20,
      description: vault.masterPassword
        ? `主密码强度：${passwordLevel}，${weakPasswordCount > 0 ? `${weakPasswordCount} 个凭据密码较弱` : '所有密码强度良好'}`
        : '未设置主密码，密码保险箱未受保护',
      color: passwordScore >= 15 ? 'text-green-600' : passwordScore >= 10 ? 'text-amber-600' : 'text-red-600',
      bgColor: passwordScore >= 15 ? 'bg-green-100' : passwordScore >= 10 ? 'bg-amber-100' : 'bg-red-100',
      borderColor: passwordScore >= 15 ? 'border-green-200' : passwordScore >= 10 ? 'border-amber-200' : 'border-red-200',
    });

    if (!vault.masterPassword) {
      suggestions.push({
        id: 'set-master-password',
        title: '设置主密码保护保险箱',
        description: '设置强主密码以保护密码保险箱中的所有敏感凭据',
        dimension: '密码强度',
        estimatedGain: 15,
        priority: 'high',
        actionLink: '/vault',
        actionText: '去设置',
      });
    } else if (passwordIssues.length > 0) {
      suggestions.push({
        id: 'improve-master-password',
        title: '增强主密码强度',
        description: passwordIssues.join('；'),
        dimension: '密码强度',
        estimatedGain: 20 - passwordScore,
        priority: 'medium',
        actionLink: '/vault',
        actionText: '修改密码',
      });
    }

    if (weakPasswordCount > 0) {
      suggestions.push({
        id: 'strengthen-weak-passwords',
        title: `加强 ${weakPasswordCount} 个弱密码`,
        description: '使用密码生成器创建更强的随机密码',
        dimension: '密码强度',
        estimatedGain: weakPasswordCount * 2,
        priority: 'medium',
        actionLink: '/vault',
        actionText: '查看凭据',
      });
    }

    const verifiedWitnesses = witnesses.filter((w) => w.verificationStatus === 'verified').length;
    const totalWitnesses = witnesses.length;
    let witnessScore = 0;
    if (verifiedWitnesses >= 3) witnessScore = 20;
    else if (verifiedWitnesses === 2) witnessScore = 15;
    else if (verifiedWitnesses === 1) witnessScore = 10;
    else if (totalWitnesses > 0) witnessScore = 5;

    const hasLawyer = witnesses.some((w) => w.isLawyer && w.verificationStatus === 'verified');
    if (hasLawyer) witnessScore = Math.min(20, witnessScore + 3);

    dimensions.push({
      id: 'witnesses',
      name: '见证人配置',
      icon: Users,
      score: witnessScore,
      maxScore: 20,
      description: `已验证见证人 ${verifiedWitnesses}/${totalWitnesses} 位${hasLawyer ? '，含认证律师' : ''}`,
      color: witnessScore >= 15 ? 'text-green-600' : witnessScore >= 8 ? 'text-amber-600' : 'text-red-600',
      bgColor: witnessScore >= 15 ? 'bg-green-100' : witnessScore >= 8 ? 'bg-amber-100' : 'bg-red-100',
      borderColor: witnessScore >= 15 ? 'border-green-200' : witnessScore >= 8 ? 'border-amber-200' : 'border-red-200',
    });

    if (verifiedWitnesses < 2) {
      suggestions.push({
        id: 'add-more-witnesses',
        title: '添加更多见证人',
        description: `建议至少配置2位已验证见证人，当前仅有 ${verifiedWitnesses} 位`,
        dimension: '见证人配置',
        estimatedGain: Math.min(15, 15 - witnessScore + 5),
        priority: 'high',
        actionLink: '/witnesses',
        actionText: '添加见证人',
      });
    }

    if (!hasLawyer) {
      suggestions.push({
        id: 'add-lawyer-witness',
        title: '添加律师作为见证人',
        description: '律师见证人可提供法律合规性审核，增强遗嘱法律效力',
        dimension: '见证人配置',
        estimatedGain: 3,
        priority: 'medium',
        actionLink: '/witnesses',
        actionText: '添加律师',
      });
    }

    const verifiedHeirs = heirs.filter((h) => h.isVerified).length;
    const totalHeirs = heirs.length;
    const heirVerificationRate = totalHeirs > 0 ? verifiedHeirs / totalHeirs : 0;
    let heirScore = 0;
    if (heirVerificationRate >= 1) heirScore = 20;
    else if (heirVerificationRate >= 0.75) heirScore = 15;
    else if (heirVerificationRate >= 0.5) heirScore = 10;
    else if (heirVerificationRate >= 0.25) heirScore = 5;

    const pendingMaterials = heirs.reduce((sum, h) => {
      if (!h.verification) return sum;
      return sum + (h.verification.totalMaterialsRequired - h.verification.verifiedMaterials);
    }, 0);

    dimensions.push({
      id: 'heirs',
      name: '继承人验证',
      icon: BadgeCheck,
      score: heirScore,
      maxScore: 20,
      description: `继承人验证完成率 ${verifiedHeirs}/${totalHeirs}（${Math.round(heirVerificationRate * 100)}%）`,
      color: heirScore >= 15 ? 'text-green-600' : heirScore >= 8 ? 'text-amber-600' : 'text-red-600',
      bgColor: heirScore >= 15 ? 'bg-green-100' : heirScore >= 8 ? 'bg-amber-100' : 'bg-red-100',
      borderColor: heirScore >= 15 ? 'border-green-200' : heirScore >= 8 ? 'border-amber-200' : 'border-red-200',
    });

    if (heirVerificationRate < 1) {
      const uncompletedHeirs = heirs.filter((h) => !h.isVerified);
      suggestions.push({
        id: 'complete-heir-verification',
        title: `完成 ${uncompletedHeirs.length} 位继承人的身份验证`,
        description: pendingMaterials > 0
          ? `尚有 ${pendingMaterials} 份验证材料待审核`
          : `继承人 ${uncompletedHeirs.map((h) => h.name).join('、')} 尚未完成验证`,
        dimension: '继承人验证',
        estimatedGain: 20 - heirScore,
        priority: 'high',
        actionLink: '/heir-verification',
        actionText: '前往验证中心',
      });
    }

    const now = new Date();
    const loginLogs = auditLogs.filter((log) => log.action === 'login');
    let activityScore = 0;
    let activityDescription = '';

    if (loginLogs.length > 0) {
      const lastLogin = new Date(loginLogs[0].timestamp);
      const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLogin <= 7) {
        activityScore = 20;
        activityDescription = `最近登录：${daysSinceLogin} 天前，账户活跃度良好`;
      } else if (daysSinceLogin <= 30) {
        activityScore = 15;
        activityDescription = `最近登录：${daysSinceLogin} 天前，建议定期登录保持活跃`;
      } else if (daysSinceLogin <= 90) {
        activityScore = 10;
        activityDescription = `最近登录：${daysSinceLogin} 天前，账户活跃度偏低`;
      } else {
        activityScore = 5;
        activityDescription = `最近登录：${daysSinceLogin} 天前，账户长期未登录，可能被误触发遗嘱`;
      }
    } else {
      activityScore = 0;
      activityDescription = '暂无登录记录';
    }

    const willStatus = will?.status || 'draft';
    const willActive = willStatus === 'active';
    if (!willActive) {
      activityScore = Math.max(0, activityScore - 5);
    }

    dimensions.push({
      id: 'activity',
      name: '账户活跃度',
      icon: Activity,
      score: activityScore,
      maxScore: 20,
      description: activityDescription + (willActive ? '' : '，遗嘱尚未激活'),
      color: activityScore >= 15 ? 'text-green-600' : activityScore >= 8 ? 'text-amber-600' : 'text-red-600',
      bgColor: activityScore >= 15 ? 'bg-green-100' : activityScore >= 8 ? 'bg-amber-100' : 'bg-red-100',
      borderColor: activityScore >= 15 ? 'border-green-200' : activityScore >= 8 ? 'border-amber-200' : 'border-red-200',
    });

    if (activityScore < 15) {
      suggestions.push({
        id: 'increase-activity',
        title: '保持定期登录',
        description: '每月至少登录一次，避免因长期不活跃导致遗嘱被误触发',
        dimension: '账户活跃度',
        estimatedGain: 20 - activityScore,
        priority: 'medium',
      });
    }

    if (!willActive) {
      suggestions.push({
        id: 'activate-will',
        title: '激活数字遗嘱',
        description: '完成遗嘱配置并激活，确保资产按照您的意愿进行分配',
        dimension: '账户活跃度',
        estimatedGain: 5,
        priority: 'high',
        actionLink: '/will',
        actionText: '激活遗嘱',
      });
    }

    const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0);

    suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.estimatedGain - a.estimatedGain;
    });

    return { dimensions, suggestions, totalScore };
  }, [currentUser, witnesses, heirs, auditLogs, vault, credentials, will]);

  const { dimensions, suggestions, totalScore } = securityData;

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: '优秀', color: 'text-green-600', bgColor: 'bg-green-500' };
    if (score >= 60) return { label: '良好', color: 'text-blue-600', bgColor: 'bg-blue-500' };
    if (score >= 40) return { label: '一般', color: 'text-amber-600', bgColor: 'bg-amber-500' };
    return { label: '危险', color: 'text-red-600', bgColor: 'bg-red-500' };
  };

  const scoreLevel = getScoreLevel(totalScore);
  const maxPossibleGain = suggestions.reduce((sum, s) => sum + s.estimatedGain, 0);

  const getScoreIcon = (score: number) => {
    if (score >= 80) return ShieldCheck;
    if (score >= 50) return ShieldHalf;
    return ShieldAlert;
  };

  const ScoreIcon = getScoreIcon(totalScore);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">账户安全评分</h1>
        <p className="text-gray-500 mt-1">多维度综合评估账户安全状况，获取个性化改进建议</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className={cn(
                'w-32 h-32 rounded-full flex items-center justify-center mx-auto',
                totalScore >= 80 ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                totalScore >= 60 ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
                totalScore >= 40 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                'bg-gradient-to-br from-red-400 to-rose-500'
              )}>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{totalScore}</p>
                  <p className="text-xs text-white/80">/ 100</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                  scoreLevel.bgColor + ' text-white'
                )}>
                  <ScoreIcon className="w-4 h-4" />
                  安全等级：{scoreLevel.label}
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                {totalScore >= 80
                  ? '账户安全性优秀，请继续保持良好的安全习惯'
                  : totalScore >= 60
                  ? '账户安全性良好，但还有提升空间'
                  : totalScore >= 40
                  ? '账户安全性一般，建议尽快处理高优先级项'
                  : '账户存在较高安全风险，请立即采取措施'}
              </p>
              {maxPossibleGain > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      完成所有建议可提升至 {Math.min(100, totalScore + maxPossibleGain)} 分
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-4">各维度得分</h3>
              <div className="space-y-3">
                {dimensions.map((dim) => {
                  const DimIcon = dim.icon;
                  const percentage = (dim.score / dim.maxScore) * 100;
                  return (
                    <div key={dim.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <DimIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{dim.name}</span>
                        </div>
                        <span className={cn('text-sm font-medium', dim.color)}>
                          {dim.score}/{dim.maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700',
                            dim.score >= dim.maxScore * 0.75 ? 'bg-green-500' :
                            dim.score >= dim.maxScore * 0.5 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">安全维度详情</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dimensions.map((dim) => {
                const DimIcon = dim.icon;
                const percentage = (dim.score / dim.maxScore) * 100;
                return (
                  <div
                    key={dim.id}
                    className={cn(
                      'rounded-xl p-5 border transition-all hover:shadow-md',
                      dim.bgColor,
                      dim.borderColor
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        dim.bgColor,
                        'border',
                        dim.borderColor
                      )}>
                        <DimIcon className={cn('w-6 h-6', dim.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-gray-900">{dim.name}</h4>
                          <span className={cn('text-lg font-bold', dim.color)}>
                            {dim.score}/{dim.maxScore}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{dim.description}</p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>完成度</span>
                            <span>{Math.round(percentage)}%</span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-2">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-700',
                                dim.score >= dim.maxScore * 0.75 ? 'bg-green-500' :
                                dim.score >= dim.maxScore * 0.5 ? 'bg-amber-500' : 'bg-red-500'
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                改进建议
              </h3>
              <span className="text-sm text-gray-500">
                共 {suggestions.length} 项建议
              </span>
            </div>

            {suggestions.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheck className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">太棒了！您的账户安全性已达到最佳状态</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => {
                  const priorityConfig = {
                    high: { label: '高优先级', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
                    medium: { label: '中优先级', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
                    low: { label: '低优先级', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Info },
                  };
                  const config = priorityConfig[suggestion.priority];
                  const PriorityIcon = config.icon;

                  const dimColor = dimensions.find(d => d.name === suggestion.dimension)?.color || 'text-gray-600';

                  return (
                    <div
                      key={suggestion.id}
                      className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          suggestion.priority === 'high' ? 'bg-red-100' :
                          suggestion.priority === 'medium' ? 'bg-amber-100' : 'bg-blue-100'
                        )}>
                          <PriorityIcon className={cn(
                            'w-5 h-5',
                            suggestion.priority === 'high' ? 'text-red-600' :
                            suggestion.priority === 'medium' ? 'text-amber-600' : 'text-blue-600'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                                <span className={cn(
                                  'px-2 py-0.5 rounded-full text-xs font-medium border',
                                  config.color
                                )}>
                                  <PriorityIcon className="w-3 h-3 inline mr-1" />
                                  {config.label}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">{suggestion.description}</p>
                              <div className="mt-2 flex items-center gap-3">
                                <span className={cn('text-xs font-medium', dimColor)}>
                                  维度：{suggestion.dimension}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                                <ArrowUp className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-bold text-emerald-700">
                                  +{suggestion.estimatedGain} 分
                                </span>
                              </div>
                              {suggestion.actionLink && (
                                <a
                                  href={suggestion.actionLink}
                                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  <Zap className="w-4 h-4" />
                                  {suggestion.actionText || '立即处理'}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">安全最佳实践</h3>
                <p className="text-slate-300 mt-1 text-sm">
                  定期审查账户安全设置，保护您的数字资产和遗产规划
                </p>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-2xl font-bold">{suggestions.filter(s => s.priority === 'high').length}</p>
                  <p className="text-xs text-slate-400">待处理高风险项</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{dimensions.filter(d => d.score >= d.maxScore * 0.9).length}</p>
                  <p className="text-xs text-slate-400">已达标维度</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>启用 MFA</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>强密码策略</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>多位见证人</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>定期登录</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
