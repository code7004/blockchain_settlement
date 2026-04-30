/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ColDef, ColGroupDef, RowSelectionOptions } from 'ag-grid-community';
import type { AgGridReactProps } from 'ag-grid-react';
import type { DeepPartial } from '../tx-ui.utils';
import { TxAgGridPaginationTheme } from './TxAgGrid.theme';

export type ITxAgGridFieldKey<TData = any> = Extract<keyof TData, string> | (string & {});
export type ITxAgGridColumn<TData = any> = ColDef<TData> | ColGroupDef<TData>;
export type ITxAgGridColumnDef<TData = any> = ITxAgGridColumn<TData>[];
export type ITxAgGridColumnOverrideMap<TData = any> = Partial<Record<ITxAgGridFieldKey<TData>, ColDef<TData>>>;

export interface ITxAgGridPaginationProps {
  currentPage: number;
  totalRows: number;
  pageSize: number;
  theme?: DeepPartial<typeof TxAgGridPaginationTheme>;
  pageButtonCount?: number;
  suppressPageStepNavigation?: boolean;
  suppressPageGroupNavigation?: boolean;
  onChangePage?: (page: number) => void;
  onChangePageGroup?: (page: number, group: number) => void;
  maxPage?: number;
}

export interface ITxAgGridOption<TData = any> {
  hiddenHeader?: boolean;
  customColumnDefs?: ITxAgGridColumnDef<TData>;
  headers?: ITxAgGridFieldKey<TData>[];
  addHeaders?: ITxAgGridFieldKey<TData>[];
  hiddenHeaders?: ITxAgGridFieldKey<TData>[];
  colWidths?: number[];
  sortColumns?: '*' | 'none' | ITxAgGridFieldKey<TData>[];
  editColumns?: '*' | ITxAgGridFieldKey<TData>[];
  rowSelection?: 'single' | 'multiple' | RowSelectionOptions<any, any, any> | undefined;
}

export interface ITxAgGrid<TData = any> extends Omit<AgGridReactProps<any>, 'columnDefs' | 'pagination' | 'rowData' | 'onCellValueChanged'> {
  isLoading?: boolean;
  data?: TData;
  rowData?: TData[] | null;
  columnDefs?: ITxAgGridColumnDef<TData>;
  offset?: number | undefined;
  option?: ITxAgGridOption<TData>;
  pagination?: ITxAgGridPaginationProps;
  onCellValueChanged?: AgGridReactProps<TData>['onCellValueChanged'];
}
/* eslint-enable @typescript-eslint/no-explicit-any */
