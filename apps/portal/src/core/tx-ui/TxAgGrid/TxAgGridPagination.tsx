import { useCallback, useMemo } from 'react';
import { TxButton } from '../TxButton';
import { cm, themeMerge } from '../tx-ui.utils';
import { TxAgGridPaginationTheme } from './TxAgGrid.theme';
import type { ITxAgGridPaginationProps } from './TxAgGrid.types';

export const TxAgGridPagination = ({ currentPage, totalRows, pageSize, theme, pageButtonCount = 10, suppressPageStepNavigation = false, suppressPageGroupNavigation = false, onChangePage, onChangePageGroup, maxPage }: ITxAgGridPaginationProps) => {
  const stableTheme = useMemo(() => themeMerge(TxAgGridPaginationTheme, theme, 'override'), [theme]);

  const totalPages = useMemo(() => {
    if (pageSize <= 0) return 0;

    const maxPagesByWindow = Math.floor(10000 / pageSize);
    const calculatedPages = Math.ceil(totalRows / pageSize);
    const hardLimit = maxPage ?? maxPagesByWindow;

    return Math.min(calculatedPages, hardLimit);
  }, [maxPage, pageSize, totalRows]);

  const pages = useMemo(() => {
    if (currentPage <= 0 || totalRows <= 0) return [];

    const groupIndex = Math.floor((currentPage - 1) / pageButtonCount);
    const startPage = groupIndex * pageButtonCount + 1;
    const endPage = Math.min(totalPages, startPage + pageButtonCount - 1);

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }, [currentPage, pageButtonCount, totalPages, totalRows]);

  const handleChangePage = useCallback(
    (nextPage: number) => {
      if (nextPage === currentPage) return;

      if (pages.length && (nextPage > pages[pages.length - 1] || nextPage < pages[0])) {
        onChangePageGroup?.(nextPage, Math.max(0, Math.floor((nextPage - 1) / pageButtonCount)));
      }

      onChangePage?.(nextPage);
    },
    [currentPage, onChangePage, onChangePageGroup, pageButtonCount, pages],
  );

  const canMovePage = (offset: number) => currentPage + offset >= 1 && currentPage + offset <= totalPages;

  const handleMovePage = (offset: number) => {
    if (canMovePage(offset)) handleChangePage(currentPage + offset);
  };

  const canMovePageGroup = (offset: number) => {
    const groupStart = pages[0];
    const groupEnd = pages[pages.length - 1];

    if (offset > 0) return groupEnd < totalPages;
    if (offset < 0) return groupStart > 1;

    return false;
  };

  const handleMovePageGroup = (offset: number) => {
    const targetPage = Math.max(1, Math.min(currentPage + offset, totalPages));
    handleChangePage(targetPage);
  };

  if (totalRows < 1) return <></>;

  return (
    <div data-tag="TxAgGridPagination" className={stableTheme.group}>
      {!suppressPageGroupNavigation && (
        <TxButton
          onClick={() => handleMovePageGroup(-pageButtonCount)}
          label="<<"
          className={cm(stableTheme.button.base, !canMovePageGroup(-pageButtonCount) && stableTheme.button.disabled, 'rounded-l')}
          disabled={!canMovePageGroup(-pageButtonCount)}
        />
      )}

      {!suppressPageStepNavigation && <TxButton onClick={() => handleMovePage(-1)} label="<" className={cm(stableTheme.button.base, !canMovePage(-1) && stableTheme.button.disabled)} disabled={!canMovePage(-1)} />}

      {pages.map((page) => (
        <TxButton key={page} onClick={() => handleChangePage(page)} label={`${page}`} variant={currentPage === page ? 'primary' : 'ghost'} className={cm(stableTheme.button.base, currentPage === page && stableTheme.button.active)} />
      ))}

      {!suppressPageStepNavigation && <TxButton onClick={() => handleMovePage(1)} label=">" className={cm(stableTheme.button.base, !canMovePage(1) && stableTheme.button.disabled)} disabled={!canMovePage(1)} />}

      {!suppressPageGroupNavigation && (
        <TxButton onClick={() => handleMovePageGroup(pageButtonCount)} label=">>" className={cm(stableTheme.button.base, !canMovePageGroup(pageButtonCount) && stableTheme.button.disabled, 'rounded-r')} disabled={!canMovePageGroup(pageButtonCount)} />
      )}
    </div>
  );
};
