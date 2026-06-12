import { useState } from 'react';
import {
  Scale,
  Users,
  UserCheck,
  Clock,
  Plus,
  X,
  Mail,
  Phone,
  Building,
  Award,
  CheckCircle,
  XCircle,
  Send,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { formatDate } from '@/constants';
import type { Witness, VerificationStatus } from '@/types';

export default function Witnesses() {
  const witnesses = useAppStore((state) => state.witnesses);
  const addWitness = useAppStore((state) => state.addWitness);
  const updateWitness = useAppStore((state) => state.updateWitness);
  const deleteWitness = useAppStore((state) => state.deleteWitness);
  const verifyWitness = useAppStore((state) => state.verifyWitness);
  const addNotification = useAppStore((state) => state.addNotification);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isLawyer: false,
    barNumber: '',
    firmName: '',
  });

  const handleOpenModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      isLawyer: false,
      barNumber: '',
      firmName: '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWitness(formData);
    addNotification({
      type: 'info',
      title: '见证人已添加',
      message: `已向 ${formData.name} 发送验证邀请`,
    });
    handleCloseModal();
  };

  const handleVerify = (id: string) => {
    verifyWitness(id);
    addNotification({
      type: 'success',
      title: '验证通过',
      message: '见证人身份已验证',
    });
  };

  const handleSendReminder = (name: string) => {
    addNotification({
      type: 'info',
      title: '提醒已发送',
      message: `已向 ${name} 发送验证提醒`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要移除见证人 ${name} 吗？`)) {
      deleteWitness(id);
    }
  };

  const statusColors: Record<VerificationStatus, string> = {
    pending: 'bg-amber-100 text-amber-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const statusIcons: Record<VerificationStatus, typeof Clock> = {
    pending: Clock,
    verified: CheckCircle,
    rejected: XCircle,
  };

  const totalWitnesses = witnesses.length;
  const verifiedWitnesses = witnesses.filter((w) => w.verificationStatus === 'verified').length;
  const pendingWitnesses = witnesses.filter((w) => w.verificationStatus === 'pending').length;
  const lawyers = witnesses.filter((w) => w.isLawyer);
  const verifiedLawyers = lawyers.filter((w) => w.verificationStatus === 'verified').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">见证与授权</h1>
          <p className="text-gray-500 mt-1">管理遗嘱执行的见证人和律师授权</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加见证人
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalWitnesses}</p>
              <p className="text-sm text-gray-500">见证人总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{verifiedWitnesses}</p>
              <p className="text-sm text-gray-500">已验证</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lawyers.length}</p>
              <p className="text-sm text-gray-500">律师</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingWitnesses}</p>
              <p className="text-sm text-gray-500">待验证</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Scale className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">律师见证机制</h3>
            <p className="text-purple-100 mt-1">
              专业律师参与遗嘱执行过程，确保数字遗产移交合法合规，具有法律效力
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{verifiedLawyers}</p>
            <p className="text-sm text-purple-200">认证律师</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">见证人列表</h3>

        {witnesses.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无见证人</p>
            <button
              onClick={handleOpenModal}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              添加第一位见证人
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {witnesses.map((witness) => {
              const StatusIcon = statusIcons[witness.verificationStatus];
              return (
                <div
                  key={witness.id}
                  className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center',
                        witness.isLawyer ? 'bg-purple-100' : 'bg-blue-100'
                      )}>
                        {witness.isLawyer ? (
                          <Scale className="w-6 h-6 text-purple-600" />
                        ) : (
                          <Users className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{witness.name}</h4>
                          {witness.isLawyer && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              律师
                            </span>
                          )}
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1',
                              statusColors[witness.verificationStatus]
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {witness.verificationStatus === 'pending'
                              ? '待验证'
                              : witness.verificationStatus === 'verified'
                              ? '已验证'
                              : '已拒绝'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Mail className="w-4 h-4" />
                            {witness.email}
                          </div>
                          {witness.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Phone className="w-4 h-4" />
                              {witness.phone}
                            </div>
                          )}
                        </div>
                        {witness.isLawyer && (
                          <div className="flex items-center gap-4 mt-2">
                            {witness.firmName && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Building className="w-4 h-4" />
                                {witness.firmName}
                              </div>
                            )}
                            {witness.barNumber && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Award className="w-4 h-4" />
                                执业证号：{witness.barNumber}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {witness.verificationStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleSendReminder(witness.name)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            提醒
                          </button>
                          <button
                            onClick={() => handleVerify(witness.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            验证
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(witness.id, witness.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    添加于 {formatDate(witness.createdAt)}
                    {witness.verifiedAt && ` · 验证于 ${formatDate(witness.verifiedAt)}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">授权流程说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">1. 邀请见证人</h4>
            <p className="text-sm text-gray-500 mt-2">
              添加见证人并发送验证邀请，见证人需确认身份
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Scale className="w-7 h-7 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">2. 律师认证</h4>
            <p className="text-sm text-gray-500 mt-2">
              律师需提供执业证号进行资格核验，确保法律效力
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">3. 执行见证</h4>
            <p className="text-sm text-gray-500 mt-2">
              遗嘱触发时，见证人共同参与并监督资产移交过程
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">添加见证人</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="见证人姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="138****1234"
                />
              </div>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isLawyer}
                  onChange={(e) => setFormData({ ...formData, isLawyer: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div>
                  <p className="font-medium text-gray-900">是律师</p>
                  <p className="text-xs text-gray-500">具有律师执业资格，可以见证遗嘱执行</p>
                </div>
              </label>

              {formData.isLawyer && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">律师执业证号</label>
                    <input
                      type="text"
                      value={formData.barNumber}
                      onChange={(e) => setFormData({ ...formData, barNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="执业证号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">律所名称</label>
                    <input
                      type="text"
                      value={formData.firmName}
                      onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="律师事务所名称"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
