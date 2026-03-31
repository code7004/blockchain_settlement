import { useEffect, useState } from 'react';
import { cm } from '..';

interface ITxCapsLockCheck {
  className?: string;
  text?: string;
  locale?: (text: string) => string;
  /** 메시지가 없을 때도 레이아웃 공간을 유지할지 여부 (기본값: true) */
  preserveSpace?: boolean;
}

/**
 * TxCapsLockChecker
 *
 * - key 이벤트에서 CapsLock 상태를 감지하여 경고 메시지를 표시
 * - preserveSpace=true면 메시지가 없을 때도 같은 높이의 영역을 확보하여 레이아웃 점프를 방지
 *
 * @example
 * <TxCapsLockChecker />
 * <TxCapsLockChecker text="caps 감지" />
 * <TxCapsLockChecker i18n={$t} preserveSpace={false} />
 */
export const TxCapsLockCheck = ({ className, text = 'Caps Lock이 켜져 있습니다.', locale = (k) => k, preserveSpace = true }: ITxCapsLockCheck) => {
  const [caps, _caps] = useState(false);

  useEffect(() => {
    // ✅ 키 이벤트에서 CapsLock 상태 감지 (최신 표준)
    const hdKey = (e: KeyboardEvent) => {
      const isOn = e.getModifierState?.('CapsLock') ?? false;
      _caps(isOn);
    };

    // ✅ 창 포커스가 빠지면 메시지 숨김 (UX)
    const hdBlurWindow = () => _caps(false);

    window.addEventListener('keydown', hdKey, { passive: true });
    window.addEventListener('keyup', hdKey, { passive: true });
    window.addEventListener('blur', hdBlurWindow, { passive: true });

    return () => {
      window.removeEventListener('keydown', hdKey);
      window.removeEventListener('keyup', hdKey);
      window.removeEventListener('blur', hdBlurWindow);
    };
  }, []);

  // ✅ 메시지 비표시 시에도 레이아웃 공간 유지(옵션)
  if (!caps) {
    if (!preserveSpace) return null;
    // 공간 유지 의도: 공백을 넣어 높이 유지
    return <p className={className}>&nbsp;</p>;
  }

  return (
    <p className={cm('text-red-500 text-sm', className)} role="status" aria-live="polite">
      ⚠️ {locale(text)}
    </p>
  );
};
