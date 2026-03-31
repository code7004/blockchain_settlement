import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, type ReactNode } from 'react';
import { TxModalTheme } from '.';
import { IconClose, cm, themeMerge, type DeepPartial } from '..';

export interface ITxModalProps {
  children: ReactNode;
  className?: string;
  theme?: DeepPartial<typeof TxModalTheme>;
  visible: boolean;
  onExit?: () => void;
  /** 외부 영역 클릭 시 닫힘 방지 */
  preventOutside?: boolean;
  title?: string;
}

export const TxModal: React.FC<ITxModalProps> = ({ title, theme, visible, children, onExit = () => {}, className, preventOutside = false }) => {
  const stableTheme = useMemo(() => themeMerge(TxModalTheme, theme, 'override'), [theme]);
  // ✅ ESC 키 닫기
  useEffect(() => {
    const hdKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) onExit();
    };
    window.addEventListener('keydown', hdKey);
    return () => window.removeEventListener('keydown', hdKey);
  }, [visible, onExit]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-tag="TxPopup"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'txpopup-title' : undefined}
          className={cm('fixed inset-0 z-50 flex items-center justify-center', className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 배경 오버레이 */}
          <motion.div
            role="presentation"
            className={stableTheme.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={() => {
              if (!preventOutside) onExit();
            }}
          />

          {/* 팝업 컨테이너 */}
          <motion.div
            className={stableTheme.container}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div id="txpopup-title" className={stableTheme.header}>
                <div className="flex items-center justify-center flex-1 font-bold">{title}</div>
                <IconClose className="cursor-pointer text-slate-200" height="1.5em" width="1.5em" onClick={onExit} />
              </div>
            )}
            <div className={cm(stableTheme.body, className)}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
