/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConfig } from '@/store/hooks';
import { AgGridReact } from 'ag-grid-react';
import { useMemo } from 'react';
import { appendOffsetColumn, applyEditableColumns, applyOffsetRowData, buildColumnDefs, getAgGridTheme, mergeColumnDefs, TxAgGridPagination, type ITxAgGrid } from '.';
import { TxLoading } from '../TxLoading';

export default function TxAgGrid<TData = any>({ isLoading, offset, className = 'flex flex-1 min-h-0 flex-col', rowData, columnDefs, option, pagination, ...props }: ITxAgGrid<TData>) {
  const config = useConfig();
  const theme = getAgGridTheme(config.themeId);
  const resolvedRowData = useMemo(() => applyOffsetRowData(rowData, offset), [offset, rowData]);

  const resolvedColumnDefs = useMemo(() => {
    const base = columnDefs?.length ? columnDefs : buildColumnDefs(option?.headers, option?.addHeaders, option?.hiddenHeaders, resolvedRowData);
    const merged = mergeColumnDefs(base, option?.customColumnDefs);
    const withOffset = appendOffsetColumn(merged, offset, !!option?.rowSelection);
    const defs = applyEditableColumns(withOffset, option?.editColumns);
    return defs;
  }, [columnDefs, offset, option?.customColumnDefs, option?.headers, option?.addHeaders, option?.hiddenHeaders, option?.editColumns, option?.rowSelection, resolvedRowData]);

  if (isLoading) return <TxLoading className="flex-1 h-full" visible={true} />;

  return (
    <div className={className}>
      <div className="min-h-0 flex-1">
        <AgGridReact theme={theme} rowData={resolvedRowData} columnDefs={resolvedColumnDefs} rowSelection={option?.rowSelection} {...props} />
      </div>

      {pagination && pagination.totalRows > pagination.pageSize && (
        <div className="ag-paging-panel">
          <div className="flex min-h-11 w-full items-center justify-end gap-2  py-1 ">
            <TxAgGridPagination
              currentPage={pagination.currentPage}
              totalRows={pagination.totalRows}
              pageSize={pagination.pageSize}
              pageButtonCount={pagination.pageButtonCount}
              suppressPageStepNavigation={pagination.suppressPageStepNavigation}
              suppressPageGroupNavigation={pagination.suppressPageGroupNavigation}
              onChangePage={pagination.onChangePage}
              onChangePageGroup={pagination.onChangePageGroup}
              maxPage={pagination.maxPage}
              theme={pagination.theme}
            />
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
