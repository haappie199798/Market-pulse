import React, { useState } from 'react';
import { AlertRule } from '../types';
import {
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const AlertsManager: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertRule[]>([
    {
      id: 'a1',
      symbol: 'NIFTY50',
      alertType: 'PRICE_ABOVE',
      params: { value: 25000 },
      isActive: true,
      createdAt: '2026-07-22T10:00:00Z',
    },
    {
      id: 'a2',
      symbol: 'BANKNIFTY',
      alertType: 'RSI_CROSS',
      params: { value: 70, timeframe: '15m' },
      isActive: true,
      createdAt: '2026-07-22T11:30:00Z',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [symbol, setSymbol] = useState('NIFTY50');
  const [alertType, setAlertType] = useState<AlertRule['alertType']>('PRICE_ABOVE');
  const [value, setValue] = useState<number>(24900);

  const handleCreateAlert = () => {
    const newRule: AlertRule = {
      id: `alert-${Date.now()}`,
      symbol,
      alertType,
      params: { value },
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setAlerts([newRule, ...alerts]);
    setShowModal(false);
  };

  const toggleAlert = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-emerald-400" />
            Market Alerts & Notification Rules
          </h2>
          <p className="text-xs text-slate-400">Evaluated on every 5-minute cycle tick</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Alert Rule</span>
        </button>
      </div>

      {/* ACTIVE ALERTS LIST */}
      <div className="space-y-3">
        {alerts.map((rule) => (
          <div
            key={rule.id}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${rule.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-100">{rule.symbol}</span>
                  <span className="px-2 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                    {rule.alertType.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  Notify when value reaches <strong className="text-slate-200 font-mono">{rule.params.value}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleAlert(rule.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  rule.isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {rule.isActive ? 'ACTIVE' : 'PAUSED'}
              </button>

              <button
                onClick={() => deleteAlert(rule.id)}
                className="p-2 text-slate-500 hover:text-rose-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ALERT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">
              Create Market Alert Rule
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Index / Symbol</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="NIFTY50">NIFTY 50</option>
                  <option value="BANKNIFTY">BANK NIFTY</option>
                  <option value="FINNIFTY">FIN NIFTY</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Condition Type</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="PRICE_ABOVE">Price Rises Above</option>
                  <option value="PRICE_BELOW">Price Drops Below</option>
                  <option value="RSI_CROSS">RSI (14) Crosses</option>
                  <option value="SUPERTREND_FLIP">Supertrend Flip</option>
                  <option value="PCR_CROSS">Option PCR Crosses</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Threshold Value</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Set Alert
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
