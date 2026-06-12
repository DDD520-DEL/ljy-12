import { useState } from 'react';
import {
  History,
  Search,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  FileText,
  FolderKanban,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
  Copy,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { AUDIT_ACTION_LABELS, USER_ROLE_LABELS, formatDate } from '@/constants';
import { cn } from '@/lib/utils';
import type { AuditActionType, AuditLogEntry } from '@/types';

export default function AuditLog() {
  const auditLogs = useAppStore((state) => state.auditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<AuditActionType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.transactionHash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const verifyChainIntegrity = (): boolean => {
    for (let i = auditLogs.length - 1; i > 0; i--) {
      const current = auditLogs[i];
      const next = auditLogs[i - 1];
      if (current.transactionHash !== next.previousHash) {
        return false;
      }
    }
    return true;
  };

  const isChainValid = verifyChainIntegrity();

  const getActionIcon = (action: AuditActionType) => {
    if (action.includes('asset')) return FolderKanban;
    if (action.includes('heir')) return Users;
    if (action.includes('will')) return FileText;
    if (action.includes('mfa')) return Shield;
    if (action.includes('login') || action.includes('logout')) return User;
    return Zap;
  };

  const getActionColor = (action: AuditActionType) => {
    if (action.includes('deleted') || action.includes('removed') || action.includes('disabled')) {
      return 'bg-red-100 text-red-600';
    }
    if (action.includes('created') || action.includes('added') || action.includes('enabled') || action.includes('approved')) {
      return 'bg-green-100 text-green-600';
    }
    if (action.includes('updated') || action.includes('triggered')) {
      return 'bg-amber-100 text-amber-600';
    }
    return 'bg-blue-100 text-blue-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">审计日志</h1>
          <p className="text-gray-500 mt-1">所有敏感操作的不可篡改记录</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{auditLogs.length}</p>
              <p className="text-sm text-gray-500">总记录数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isChainValid ? 'bg-green-100' : 'bg-red-100'
            )}>
              {isChainValid ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {isChainValid ? '完整' : '异常'}
              </p>
              <p className="text-sm text-gray-500">区块链完整性</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">不可篡改</p>
              <p className="text-sm text-gray-500">哈希链式存储</p>
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
            <h3 className="text-xl font-bold">区块链式审计日志</h3>
            <p className="text-slate-300 mt-1">
              每条操作记录都通过哈希算法与前一条记录链接，形成不可篡改的审计链。任何对历史记录的修改都会导致哈希验证失败。
            </p>
          </div>
          {isChainValid ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">链完整</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">已篡改</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索操作描述、哈希值..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as AuditActionType | 'all')}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">全部操作</option>
            {Object.entries(AUDIT_ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无审计记录</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLogs.map((log) => {
              const Icon = getActionIcon(log.action);
              const isExpanded = expandedId === log.id;
              return (
                <div key={log.id} className="hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', getActionColor(log.action))}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{log.description}</p>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {AUDIT_ACTION_LABELS[log.action]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(log.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {USER_ROLE_LABELS[log.userRole]}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-xs">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {log.transactionHash.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="ml-14 p-4 bg-gray-50 rounded-xl space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">用户ID</p>
                            <p className="text-sm font-mono text-gray-700">{log.userId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">用户角色</p>
                            <p className="text-sm text-gray-700">{USER_ROLE_LABELS[log.userRole]}</p>
                          </div>
                          {log.resourceType && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">资源类型</p>
                              <p className="text-sm text-gray-700">{log.resourceType}</p>
                            </div>
                          )}
                          {log.resourceId && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">资源ID</p>
                              <p className="text-sm font-mono text-gray-700">{log.resourceId}</p>
                            </div>
                          )}
                        </div>

                        {log.ipAddress && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">IP地址</p>
                            <p className="text-sm font-mono text-gray-700">{log.ipAddress}</p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-500">交易哈希</p>
                            <button
                              onClick={() => handleCopyHash(log.transactionHash)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {copiedHash === log.transactionHash ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs font-mono text-emerald-600 break-all">
                            {log.transactionHash}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-1">前一区块哈希</p>
                          <p className="text-xs font-mono text-gray-500 break-all">
                            {log.previousHash}
                          </p>
                        </div>

                        {log.previousValue && log.newValue && (
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">变更前</p>
                              <p className="text-sm text-red-600 font-mono">{log.previousValue}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">变更后</p>
                              <p className="text-sm text-green-600 font-mono">{log.newValue}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">日志安全特性</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">不可篡改</h4>
              <p className="text-sm text-gray-500 mt-1">
                每条记录都包含前一条记录的哈希，形成链式结构，任何篡改都会被立即发现
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">时间戳</h4>
              <p className="text-sm text-gray-500 mt-1">
                每条记录都带有精确的时间戳，确保操作顺序可追溯
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">身份追踪</h4>
              <p className="text-sm text-gray-500 mt-1">
                记录操作人、IP地址和用户代理，确保所有操作可追溯到具体个人
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
