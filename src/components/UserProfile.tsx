import React, { useState } from 'react';
import { UserProfile, UserSessionLog } from '../types';
import {
  User,
  ShieldCheck,
  CreditCard,
  Key,
  Clock,
  Settings,
  LogOut,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Building2,
  Wallet,
  Activity,
  Layers,
  FileText,
  Mail,
  Shield
} from 'lucide-react';

interface UserProfileProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout?: () => void;
}

export const UserProfileComponent: React.FC<UserProfileProps> = ({
  user,
  onUpdateUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'funds' | 'security' | 'api' | 'risk'>('overview');
  const [copiedKey, setCopiedKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Form states for risk limits
  const [maxLoss, setMaxLoss] = useState(user.riskLimits.maxDailyLoss);
  const [maxOrderVal, setMaxOrderVal] = useState(user.riskLimits.maxOrderValue);
  const [defaultSL, setDefaultSL] = useState(user.riskLimits.defaultStopLossPct);
  const [requireConfirm, setRequireConfirm] = useState(user.riskLimits.requireOrderConfirmation);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: editName,
      email: editEmail,
    });
    setIsEditingName(false);
    triggerSuccess('Profile information updated successfully');
  };

  const handleSaveRiskLimits = () => {
    onUpdateUser({
      ...user,
      riskLimits: {
        maxDailyLoss: maxLoss,
        maxOrderValue: maxOrderVal,
        defaultStopLossPct: defaultSL,
        requireOrderConfirmation: requireConfirm,
      },
    });
    triggerSuccess('Trading risk parameters updated');
  };

  const handleRegenerateApiKey = () => {
    const newKey = `pm_live_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const newSecret = `sec_${Math.random().toString(36).substring(2, 18)}`;
    onUpdateUser({
      ...user,
      apiKey: newKey,
      apiSecret: newSecret,
    });
    triggerSuccess('Generated new algorithmic API Key and Secret');
  };

  const triggerSuccess = (msg: string) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* PROFILE HEADER HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        {savedSuccessMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 text-3xl font-black shadow-xl shadow-emerald-500/20 ring-4 ring-slate-900">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-500 text-slate-950 border-2 border-slate-900" title="Active Logged In">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {user.kycStatus} KYC
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  {user.accountType.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {user.email}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  Client ID: <strong className="text-emerald-400">{user.clientId}</strong>
                </span>
                <span className="text-slate-600">•</span>
                <span>Broker: <strong className="text-slate-200">{user.broker}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditingName(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-slate-700/50"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Edit Details</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL FOR EDITING USER INFORMATION */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              Update Account Information
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NAVIGATION TABS WITHIN PROFILE */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Account & KYC', icon: User },
          { id: 'funds', label: 'Funds & Margin', icon: Wallet },
          { id: 'security', label: 'Login History & Security', icon: Shield },
          { id: 'api', label: 'API Keys & Algo Trading', icon: Key },
          { id: 'risk', label: 'Risk & Order Limits', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACCOUNT & KYC OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Trading Demat & Broker Details
            </h3>

            <div className="divide-y divide-slate-800/60 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Client Code</span>
                <span className="font-mono font-bold text-white">{user.clientId}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Brokerage Partner</span>
                <span className="font-bold text-slate-200">{user.broker}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">KYC Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified (PAN & Aadhaar)
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Demat Account DP ID</span>
                <span className="font-mono text-slate-300">IN300128-10984521</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Primary Bank Account</span>
                <span className="font-mono text-slate-300">HDFC Bank (•••• 4892)</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Account Activation Date</span>
                <span className="text-slate-300">{user.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Active Exchange Segment Permissions
            </h3>

            <p className="text-xs text-slate-400">
              Your trading account is verified for multi-exchange live derivative and equity access:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {user.segmentPermissions.map((seg) => (
                <div key={seg} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{seg}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SEBI Risk & Regulatory Compliance
              </div>
              <p className="text-[11px] leading-relaxed">
                Registered under SEBI Broker Regulations. Quarterly settlement cycle: 1st Friday of every calendar quarter.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FUNDS & MARGIN OVERVIEW */}
      {activeTab === 'funds' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Available Cash Margin</span>
              <div className="text-2xl font-black font-mono text-emerald-400">
                ₹{user.funds.availableCash.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500">Ready for order execution</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Utilized Margin</span>
              <div className="text-2xl font-black font-mono text-amber-400">
                ₹{user.funds.usedMargin.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500">Locked in open F&O positions</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Collateral Margin</span>
              <div className="text-2xl font-black font-mono text-sky-400">
                ₹{user.funds.collateralValue.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-500">Liquid Bees & stock pledge</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium">Total Portfolio Value</span>
              <div className="text-2xl font-black font-mono text-white">
                ₹{user.funds.totalPortfolio.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">+₹{user.funds.payinToday.toLocaleString('en-IN')} today</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Instant Pay-In / Pay-Out via UPI or Net Banking</h4>
              <p className="text-xs text-slate-400">Zero brokerage deposit processing via instant IMPS/UPI gateway</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => triggerSuccess('Deposit gateway initiated via UPI')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                + Add Funds (Pay-In)
              </button>
              <button
                onClick={() => triggerSuccess('Withdrawal request placed successfully')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
              >
                Withdraw Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOGIN HISTORY & SECURITY LOGS */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Active Sessions & Login Audit Trail
              </h3>
              <p className="text-xs text-slate-400">Security audit history of IP addresses and device authorizations</p>
            </div>

            <button
              onClick={() => triggerSuccess('All secondary sessions revoked successfully')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition"
            >
              Revoke All Other Sessions
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">Date & Time</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Device / OS</th>
                  <th className="py-2.5 px-3">Browser</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {user.loginHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 text-slate-300 font-bold">
                      {new Date(log.loginTime).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-emerald-400">{log.ipAddress}</td>
                    <td className="py-3 px-3 text-slate-300">{log.device}</td>
                    <td className="py-3 px-3 text-slate-400">{log.browser}</td>
                    <td className="py-3 px-3 text-slate-400">{log.location}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: API KEYS & ALGO TRADING */}
      {activeTab === 'api' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              PulseMarket Algorithmic API Credentials
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Connect Python, Node.js, or TradingView Webhooks for automated high-frequency order placement
            </p>
          </div>

          <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                API Key (Live Client Identifier)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={user.apiKey}
                  className="w-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-emerald-400 rounded-xl px-3 py-2"
                />
                <button
                  onClick={() => copyToClipboard(user.apiKey)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                  title="Copy API Key"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                API Secret Token
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showSecret ? 'text' : 'password'}
                  readOnly
                  value={user.apiSecret}
                  className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 rounded-xl px-3 py-2"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                  title={showSecret ? 'Hide Secret' : 'Show Secret'}
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={handleRegenerateApiKey}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate API Key & Secret</span>
            </button>

            <span className="text-[11px] text-slate-500 font-mono">
              Rate Limit: 100 requests/sec • WebSocket Enabled
            </span>
          </div>
        </div>
      )}

      {/* TAB 5: RISK MANAGEMENT & ORDER LIMITS */}
      {activeTab === 'risk' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Mandatory Trading Risk Management Controls
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Prevent emotional over-trading with strict daily loss caps and automated order protection rules
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-slate-200 block">Max Daily Loss Cutoff (₹)</label>
              <input
                type="number"
                value={maxLoss}
                onChange={(e) => setMaxLoss(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-emerald-400 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">Trading will freeze for the day if net MTM loss exceeds this limit.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-slate-200 block">Max Single Order Value Limit (₹)</label>
              <input
                type="number"
                value={maxOrderVal}
                onChange={(e) => setMaxOrderVal(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-slate-200 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">Maximum exposure permitted per individual trade placement.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-slate-200 block">Default Stop-Loss %</label>
              <input
                type="number"
                step="0.5"
                value={defaultSL}
                onChange={(e) => setDefaultSL(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-slate-200 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">Auto-attach stop loss percentage on new bracket orders.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <label className="font-bold text-slate-200 block">Require 2-Step Order Confirmation</label>
                <p className="text-[10px] text-slate-500 mt-1">Prompt confirmation dialog before submitting market orders.</p>
              </div>
              <button
                onClick={() => setRequireConfirm(!requireConfirm)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                  requireConfirm
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {requireConfirm ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveRiskLimits}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
            >
              Save Risk Parameters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
