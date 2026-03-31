import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { cm, themeMerge } from '..';
import { TxTabsTheme } from './TxTabs.theme';
import type { ITxTabRenderHeadProps, ITxTabs } from './TxTabs.types';

/**
 * TxTabs
 * ----------------------------------------------------------------------------
 * - 다중 탭 UI를 제공하는 공통 컴포넌트
 * - Theme 기반으로 스타일 제어 (Tailwind 직접 사용 금지)
 * - 탭 변경 로직을 내부에서 처리하며, 외부 제어(value + ref.changeTab) 모두 지원
 * - renderHead, renderBody를 통한 완전 커스터마이징 가능
 * ----------------------------------------------------------------------------
 *
 * @component
 * @example
 * <TxTabs
 *   tabs={["A", "B", "C"]}
 *   value={1}
 *   onChange={idx => console.log(idx)}
 * />
 *
 * @param {ITxTabs} props
 * @param {React.Ref} ref - 외부에서 changeTab 호출 가능
 * @returns {JSX.Element}
 */
export const TxTabs = forwardRef(({ tabs, locale = (k: string) => k, className, theme, value, renderHead, renderBody, onChange }: ITxTabs, ref) => {
  const stableTheme = useMemo(() => themeMerge(TxTabsTheme, theme, 'override'), [theme]);
  /**
   * 내부 상태: 현재 활성 탭 index
   * - 외부 value prop 변경 시 동기화
   */
  const [activeIdx, _activeIdx] = useState(value || 0);

  // 외부에서 value 변경 시 반영
  useEffect(() => {
    if (value != null) _activeIdx(value);
  }, [value]);

  /**
   * 외부 제어용 changeTab 메서드 노출
   * @function
   * @name changeTab
   * @param {number} idx - 변경할 탭 index
   */
  const changeTab = (idx: number) => _activeIdx(idx);
  useImperativeHandle(ref, () => ({ changeTab }), []);

  /**
   * 기본 탭 헤더 렌더러
   * - Theme 기반 default
   * - renderHead 없을 경우 자동 적용
   *
   * @function
   * @name defaultRenderHead
   * @param {ITxTabRenderHeadProps} props - 렌더링 정보
   * @returns {ReactNode}
   */
  const defaultRenderHead = ({ title, isActive, theme, onClick }: ITxTabRenderHeadProps) => {
    return (
      <button role="tab" onClick={onClick} className={`${stableTheme.headBase} ${isActive ? theme?.headActive : theme?.headInner}`}>
        {locale(title)}
      </button>
    );
  };

  /**
   * 탭 변경 핸들러
   * - 내부 state 변경
   * - onChange 콜백 트리거
   *
   * @function
   * @name hdChange
   * @param {number} next - 선택된 탭 index
   */
  function hdChange(next: number) {
    if (activeIdx == next) return;
    _activeIdx(next);
    onChange?.(next);
  }

  /**
   * 컴포넌트 최종 렌더링 구조
   * - header: 탭 버튼 목록
   * - body: 현재 활성 탭 콘텐츠
   */
  return (
    <div className={cm(stableTheme.wrapper, className)} data-tag="TxTabs">
      {/* 탭 헤더 */}
      <div className={stableTheme.headWrapper} role="tablist">
        {tabs.map((t, idx) => {
          const Head = renderHead || defaultRenderHead;
          return <React.Fragment key={idx}>{Head({ title: t, theme: stableTheme, isActive: activeIdx === idx, onClick: () => hdChange(idx) })}</React.Fragment>;
        })}
      </div>

      {/* 콘텐츠 영역 */}
      {renderBody && <div className={stableTheme.body}>{renderBody({ name: tabs[activeIdx], index: activeIdx })}</div>}
    </div>
  );
});

TxTabs.displayName = 'TxTabs';
