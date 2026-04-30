import React from 'react';
import { TxInputTheme } from '.';
import { cm } from '..';

export interface ITxInputLikeProps {
  value?: string;
  placeholder?: string;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  ariaLabel?: string;
}

/**
 * ✅ TxInputLike
 * 입력창처럼 보이는 div (focus, click, keyboard 등 대응)
 * - 실제 `<input>` 태그가 아닌 div를 이용한 커스텀 입력형 컴포넌트
 * - 디자인 자유도가 높은 셀렉트/데이트피커/모달 트리거 등에 활용
 *
 * 🔸 props 설명
 * @param value - 현재 입력값 또는 선택된 값 (문자열)
 * @param placeholder - 값이 없을 경우 표시되는 안내 텍스트
 * @param className - Tailwind 등 사용자 정의 클래스 적용
 * @param onClick - 클릭 시 호출될 콜백
 * @param onKeyDown - 키보드 접근 시 호출될 콜백 (Enter 등)
 * @param ariaLabel - 접근성(스크린 리더 등)을 위한 라벨 (기본값: "선택 입력")
 *
 * @returns 입력창처럼 보이는 버튼형 div
 */
const TxInputLike: React.FC<ITxInputLikeProps> = ({ value, placeholder = '', className, onClick, onKeyDown, ariaLabel = '선택 입력' }) => {
  return (
    <div
      role="button" // 접근성: 버튼 역할
      tabIndex={0} // 접근성: 포커스 가능
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-haspopup="dialog" // 접근성: 팝업/다이얼로그가 열릴 수 있음을 알림
      aria-expanded={false} // 접근성: 현재 열려 있는지 여부 (필요 시 상태로 제어 가능)
      aria-label={ariaLabel}
      className={cm(TxInputTheme.input, 'px-2 py-2 text-left truncate min-w-[8em] cursor-text select-none ', className)}
    >
      {/* 값이 있으면 표시, 없으면 placeholder */}
      {value || <span className="text-gray-400">{placeholder}</span>}
    </div>
  );
};

export default TxInputLike;
