/**
 * ⚠️ Layout 전용 컴포넌트
 * - ResizeObserver 기반 size 계산
 * - dynamic width / height 필요
 * - inline style 의도적으로 허용
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { ITxCoolTableScrollerRef, ITxFlexLayoutProps } from '.';

export const TxCoolTableScroller = forwardRef<ITxCoolTableScrollerRef, ITxFlexLayoutProps>(({ resetDetecter, className = 'flex-1', footer, disableHScroll = false, disableVScroll = false, children, onLayout }, ref) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const onLayoutRef = useRef<((evt: HTMLDivElement) => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onLayoutRef.current = onLayout || null;
  }, [onLayout]);

  function resetScroll() {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop = 0;
    scrollContainerRef.current.scrollLeft = 0;
  }

  /**
   * resetDetecter 변경 시 스크롤 초기화
   * - 다양한 타입 수용 (number, string, boolean, object, array)
   * - 참조가 바뀌는 경우만 동작함 (object/array는 매번 새로 생성 필요)
   */
  useEffect(() => {
    // 💡 resetDetecter가 null 또는 undefined가 아닌 경우만 reset
    if (resetDetecter != null) resetScroll();
  }, [resetDetecter]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
        setReady(true);
        if (typeof onLayoutRef.current === 'function') {
          onLayoutRef.current(element);
        }
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function getBottomState() {
    const el = scrollContainerRef.current;

    if (!el) {
      return {
        isAtBottom: false,
        scrollHeight: 0,
      };
    }

    return {
      isAtBottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 1,
      scrollHeight: el.scrollHeight,
    };
  }

  function scrollToPrevBottomAsTop(prevScrollHeight: number) {
    const el = scrollContainerRef.current;
    if (!el) return;

    // ✅ 기존 bottom 위치를 top으로
    el.scrollTop = prevScrollHeight;
  }

  function scrollToBottom(offset: number = 0) {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight - el.clientHeight + offset;
  }

  useImperativeHandle(ref, () => ({
    getBottomState,
    scrollToPrevBottomAsTop,
    resetScroll,
    scrollToBottom,
  }));

  return (
    <div ref={containerRef} className={className}>
      <div
        className="flex flex-col w-full h-full overflow-hidden"
        style={{
          width: !disableVScroll ? size.width : undefined,
          height: !disableHScroll ? size.height : undefined,
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        {/* ✅ 스크롤 영역 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className={`relative w-full h-full 
                ${disableHScroll ? '' : 'overflow-x-auto'} 
                ${disableVScroll ? '' : 'overflow-y-auto'} 
                whitespace-nowrap`}
          >
            {children}
          </div>
        </div>

        {/* ✅ 하단 고정 footer */}
        {footer && <div className="shrink-0 justify-center flex">{footer}</div>}
      </div>
    </div>
  );
});

TxCoolTableScroller.displayName = 'TxCoolTableScroller';
