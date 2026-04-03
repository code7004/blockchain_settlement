import { useCallback, useMemo } from 'react';
import { TxButton, TxCoolTablePagenationTheme, cm, themeMerge, type ITxCoolTablePaginationProps } from '..';

/**
 * TxPagenation - 페이지네이션 컴포넌트
 *
 * - 현재 페이지와 그룹 단위 페이지 목록을 표시하고, 이전/다음/그룹 이동 버튼을 제공한다.
 * - Elasticsearch, API 등에서 데이터 페이지네이션 요청 시 사용.
 * - from+size 기반의 페이징 구조에 맞춰 설계됨.
 *
 * 주요 기능:
 * 1. 현재 페이지 그룹의 페이지 번호 버튼을 렌더링
 * 2. 이전/다음 페이지 이동 및 그룹 단위 점프 버튼 제공
 * 3. 최대 페이지 수를 `itemCount`와 `itemVisibleCount`를 바탕으로 계산
 * 4. `onChangePage` 콜백을 통해 페이지 변경 시 상위 컴포넌트에 알림
 * 5. `onChangePageGroup` 콜백을 통해 페이지 그룹 변경 시 상위 컴포넌트에 알림
 *
 * Elasticsearch 등에서 `from + size > 10000` 제한이 있는 경우 `pageMaxCount` 계산 시 최대 페이지 수를 제한해 불필요한 에러를 방지해야 함.
 *
 * @param {number} itemCount        전체 아이템 개수
 * @param {number} value             controller current page
 * @param {number} itemVisibleCount 한 페이지에 표시할 아이템 개수 (기본값: 100)
 * @param {number} pageVisibleCount 한 번에 표시할 페이지 버튼 개수 (기본값: 10)
 * @param {boolean} disableNextButton 이전/다음 버튼 비활성화 여부
 * @param {boolean} disableJumpButton 그룹 점프 버튼 비활성화 여부
 * @param {(page: number) => void} onChangePage 페이지 변경 시 호출되는 콜백
 * @param {(page: number, group: number) => void} onChangePageGroup 페이지 그룹 변경 시 호출되는 콜백
 * @param {number} limitPage 최대 페이지 수 제한 (선택)
 *
 * @example
 * // 예제: 한 페이지당 50개씩 보여주고, 첫 페이지부터 시작
 * <TxPagenation startPageIdx={pageIdx} itemCount={itemCount} onChangePage={_pageIdx} itemVisibleCount={ITEMSIZE} />
 *
 * @example
 * // 예제: 10페이지 단위 그룹 이동, 이전/다음 버튼 비활성화
 * <TxPagenation itemCount={1200} itemVisibleCount={100} pageVisibleCount={10} disableNextButton={true} onChangePage={(p) => console.log("페이지 변경:", p)} />
 */

export const TxCoolTablePagination = ({ itemCount, value, theme, itemVisibleCount = 100, pageVisibleCount = 10, onChangePage, onChangePageGroup, disableNextButton = false, disableJumpButton = false, limitPage }: ITxCoolTablePaginationProps) => {
  const stableTheme = useMemo(() => themeMerge(TxCoolTablePagenationTheme, theme, 'override'), [theme]);

  // ES from+size 10000 제한 대응
  // Elasticsearch는 from+size가 10,000을 초과하면 `illegal_argument_exception`이 발생한다.
  // 따라서 pageMaxCount를 계산할 때, itemVisibleCount(페이지당 아이템 수) * pageMaxCount가
  // 10,000을 넘지 않도록 최대 페이지 수를 제한한다.
  // 예) itemVisibleCount=50 → pageMaxCount 최대 200페이지까지만 허용 (50 * 200 = 10,000)
  // 이렇게 하면 UI 페이지네이션에서 불필요하게 ES 최대 결과 제한을 초과하는 요청을 예방할 수 있다.
  const pageMaxCount = useMemo(() => {
    if (itemVisibleCount <= 0) return 0;
    const maxPagesByLimit = Math.floor(10000 / itemVisibleCount);
    const calculatedPages = Math.ceil(itemCount / itemVisibleCount);
    const hardLimit = limitPage ?? maxPagesByLimit;
    return Math.min(calculatedPages, hardLimit);
  }, [itemCount, itemVisibleCount, limitPage]);

  // ✅ 최종 currentPage (single source of truth)
  const currentPage = value ?? 1;

  const pages = useMemo(() => {
    if (currentPage === 0 || itemCount === 0) return [];
    const groupIndex = Math.floor((currentPage - 1) / pageVisibleCount);
    const startPage = groupIndex * pageVisibleCount + 1;
    const endPage = Math.min(pageMaxCount, startPage + pageVisibleCount - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [itemCount, pageVisibleCount, pageMaxCount, currentPage]);

  const hdChangePage = useCallback(
    (nextPage: number) => {
      if (nextPage === currentPage) return;

      // ✅ group 변경 감지
      if (pages.length && (nextPage > pages[pages.length - 1] || nextPage < pages[0])) {
        onChangePageGroup?.(nextPage, Math.max(0, Math.floor((nextPage - 1) / pageVisibleCount)));
      }

      onChangePage?.(nextPage);
    },
    [currentPage, pages, pageVisibleCount, onChangePage, onChangePageGroup],
  );
  const canNavigate = (offset: number) => currentPage + offset >= 1 && currentPage + offset <= pageMaxCount;

  const hdNavigate = (offset: number) => {
    if (canNavigate(offset)) hdChangePage(currentPage + offset);
  };

  const canJump = (offset: number) => {
    const groupStart = pages[0];
    const groupEnd = pages[pages.length - 1];
    if (offset > 0) return groupEnd < pageMaxCount;
    if (offset < 0) return groupStart > 1;
    return false;
  };

  const hdJump = (offset: number) => {
    const targetPage = Math.max(1, Math.min(currentPage + offset, pageMaxCount));
    hdChangePage(targetPage);
  };

  if (!itemCount || itemCount < 1) return <></>;

  return (
    <div data-tag="TxPagenation" className={stableTheme.wrapper}>
      <nav>
        <div className={stableTheme.group}>
          {!disableJumpButton && (
            <TxButton onClick={() => hdJump(-pageVisibleCount)} label="<<" className={cm(stableTheme.button.base, !canJump(-pageVisibleCount) && stableTheme.button.disabled, 'rounded-l')} disabled={!canJump(-pageVisibleCount)} />
          )}

          {!disableNextButton && <TxButton onClick={() => hdNavigate(-1)} label="<" className={cm(stableTheme.button.base, !canNavigate(-1) && stableTheme.button.disabled)} disabled={!canNavigate(-1)} />}

          {pages.map((item) => (
            <TxButton key={item} onClick={() => hdChangePage(item)} label={`${item}`} variant={currentPage === item ? 'primary' : 'ghost'} className={cm(stableTheme.button.base, value === item && stableTheme.button.active)} />
          ))}

          {!disableNextButton && <TxButton onClick={() => hdNavigate(1)} label=">" className={cm(stableTheme.button.base, !canNavigate(1) && stableTheme.button.disabled)} disabled={!canNavigate(1)} />}

          {!disableJumpButton && <TxButton onClick={() => hdJump(pageVisibleCount)} label=">>" className={cm(stableTheme.button.base, !canJump(pageVisibleCount) && stableTheme.button.disabled, 'rounded-r')} disabled={!canJump(pageVisibleCount)} />}
        </div>
      </nav>
    </div>
  );
};
