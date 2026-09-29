'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Info, CheckCircle2, X } from 'lucide-react';

export type ModalVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmationModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-500" />,
          iconBg: 'bg-red-500/10 dark:bg-red-500/20 text-red-500 border-red-500/20',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 ring-red-500/30',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 border-amber-500/20',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30 ring-amber-500/30',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
          iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 border-emerald-500/20',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 ring-emerald-500/30',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-brand-500" />,
          iconBg: 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 border-brand-500/20',
          confirmBtn: 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30 ring-brand-500/30',
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#141721] rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-white/10 z-10 animate-scaleUp overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon Badge */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${currentStyles.iconBg}`}>
            {currentStyles.icon}
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
            {title}
          </h3>

          {/* Message */}
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-sm leading-relaxed">
            {message}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 font-bold text-xs sm:text-sm transition disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={async () => {
                await onConfirm();
              }}
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${currentStyles.confirmBtn}`}
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
