import React from 'react';
import { LEGAL_DISCLAIMER_TEXT, SEBI_NOTICE } from '../constants/legal';
import { ShieldAlert, X, CheckCircle2 } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-slate-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-amber-400">
          <ShieldAlert className="w-6 h-6" />
          <h3 className="text-base font-extrabold text-white">
            SEBI Regulatory & Legal Disclaimer
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <p className="font-semibold text-amber-300">{SEBI_NOTICE}</p>
          <p>{LEGAL_DISCLAIMER_TEXT}</p>
        </div>

        <div className="space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>DPDP Act 2023 Compliant Data Privacy</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Automated Mathematical Models Only (No Buy/Sell Tips)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Delayed Market Snapshot Data Notice</span>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
