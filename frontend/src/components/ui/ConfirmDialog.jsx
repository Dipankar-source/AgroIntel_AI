import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info } from "lucide-react";

/**
 * ConfirmDialog – reusable confirmation modal
 *
 * Props:
 *   open          boolean
 *   onClose       () => void
 *   onConfirm     () => void
 *   title         string
 *   description   string | ReactNode
 *   confirmLabel  string   (default "Confirm")
 *   cancelLabel   string   (default "Cancel")
 *   variant       "danger" | "warning" | "info"  (default "danger")
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}) => {
  const config = {
    danger: {
      icon: <AlertTriangle size={22} className="text-red-500" />,
      iconBg: "bg-red-50 dark:bg-red-900/20",
      btn: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
    },
    warning: {
      icon: <AlertTriangle size={22} className="text-amber-500" />,
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      btn: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 text-white",
    },
    info: {
      icon: <Info size={22} className="text-emerald-600" />,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      btn: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white",
    },
  };

  const { icon, iconBg, btn } = config[variant] ?? config.danger;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm bg-white dark:bg-gray-900
                       rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700
                       overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                         transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={16} />
            </button>

            {/* Body */}
            <div className="px-6 pt-6 pb-4 flex items-start gap-4">
              <div className={`flex-none p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4
                            bg-gray-50 dark:bg-gray-800/60
                            border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                           bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600
                           rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-offset-2
                            transition-colors ${btn}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
