/* eslint-disable @typescript-eslint/no-explicit-any */
import { AGGrid_Theme_TYPE } from '@/constants';
import { themeAlpine, themeBalham, themeMaterial, themeQuartz, type ColDef } from 'ag-grid-community';
import { TxAgGridIconEdit, type ITxAgGridColumn, type ITxAgGridColumnDef, type ITxAgGridFieldKey } from '.';

const TX_AG_GRID_OFFSET_FIELD = '#';
const TX_AG_GRID_OFFSET_COLUMN: ColDef<any> = {
  field: TX_AG_GRID_OFFSET_FIELD,
  headerName: '#',
  width: 56,
  minWidth: 56,
  maxWidth: 60,
  pinned: 'left',
  lockPinned: true,
  sortable: false,
  editable: false,
  resizable: false,
  suppressMovable: true,
  cellClass: 'text-center',
  headerClass: 'text-center',
};

function getOffsetColumnDef<TData = any>(useRowSelection?: boolean): ColDef<TData> {
  if (!useRowSelection) return TX_AG_GRID_OFFSET_COLUMN as ColDef<TData>;

  return {
    ...TX_AG_GRID_OFFSET_COLUMN,
    pinned: undefined,
    lockPinned: false,
  } as ColDef<TData>;
}

function hasField<TData>(column: ITxAgGridColumn<TData>): column is ColDef<TData> & { field: string } {
  return 'field' in column && typeof column.field === 'string';
}

function withEditHeaderIcon<TData>(column: ColDef<TData>): ColDef<TData> {
  return {
    ...column,
    headerComponentParams: {
      ...(column.headerComponentParams ?? {}),
      innerHeaderComponent: TxAgGridIconEdit,
    },
  };
}

export function getAgGridTheme(id?: AGGrid_Theme_TYPE) {
  switch (id) {
    case AGGrid_Theme_TYPE.Alpine:
      return themeAlpine;
    case AGGrid_Theme_TYPE.Balham:
      return themeBalham;
    case AGGrid_Theme_TYPE.Material:
      return themeMaterial;
    default:
      return themeQuartz;
  }
}

export function applyOffsetRowData<TData = any>(rowData?: TData[] | null, offset?: number): TData[] {
  if (!rowData?.length) return rowData ?? [];
  if (offset == null) return rowData;

  return rowData.map((row, index) => {
    if (!row || typeof row !== 'object') return row;
    return { ...(row as object), [TX_AG_GRID_OFFSET_FIELD]: offset + index + 1 } as TData;
  });
}

export function appendOffsetColumn<TData = any>(columnDefs?: ITxAgGridColumnDef<TData> | null, offset?: number, useRowSelection?: boolean): ITxAgGridColumnDef<TData> | undefined {
  if (offset == null) return columnDefs ?? undefined;
  if (!columnDefs?.length) return [getOffsetColumnDef<TData>(useRowSelection)];

  const offsetColumnDef = getOffsetColumnDef<TData>(useRowSelection);
  const offsetColumns: ITxAgGridColumnDef<TData> = [];
  const otherColumns: ITxAgGridColumnDef<TData> = [];

  columnDefs.forEach((column) => {
    if ('field' in column && column.field === TX_AG_GRID_OFFSET_FIELD) {
      offsetColumns.push({ ...offsetColumnDef, ...column } as ColDef<TData>);
      return;
    }

    otherColumns.push(column);
  });

  if (!offsetColumns.length) {
    offsetColumns.push(offsetColumnDef);
  }

  return [...offsetColumns, ...otherColumns];
}

export function buildColumnDefs<TData = any>(headers?: ITxAgGridFieldKey<TData>[], addHeaders?: ITxAgGridFieldKey<TData>[], hiddenHeaders?: ITxAgGridFieldKey<TData>[], rowData?: TData[] | null): ITxAgGridColumnDef<TData> | undefined {
  const hiddenHeaderSet = new Set(hiddenHeaders ?? []);
  const toColumnDef = (field: ITxAgGridFieldKey<TData>): ColDef<TData> => ({ field: field as ColDef<TData>['field'] });
  const appendHeaders = (columnDefs: ColDef<TData>[]) => {
    if (!addHeaders?.length) return columnDefs;

    const existingFields = new Set(
      columnDefs.reduce<string[]>((fields, column) => {
        if (typeof column.field === 'string') fields.push(column.field);
        return fields;
      }, []),
    );
    const extraColumns = addHeaders.filter((field) => !hiddenHeaderSet.has(field) && !existingFields.has(String(field))).map(toColumnDef);

    return [...columnDefs, ...extraColumns];
  };

  if (headers?.length) {
    return appendHeaders(headers.filter((field) => !hiddenHeaderSet.has(field)).map(toColumnDef));
  }

  const firstRow = rowData?.[0];
  if (!firstRow || typeof firstRow !== 'object') {
    return appendHeaders([]);
  }

  return appendHeaders(
    Object.keys(firstRow)
      .filter((field): field is ITxAgGridFieldKey<TData> => !hiddenHeaderSet.has(field as ITxAgGridFieldKey<TData>))
      .map(toColumnDef),
  );
}

export function mergeColumnDefs<TData = any>(columnDefs?: ITxAgGridColumnDef<TData> | null, customColumnDefs?: ITxAgGridColumnDef<TData> | null): ITxAgGridColumnDef<TData> | undefined {
  if (!columnDefs?.length) return undefined;
  if (!customColumnDefs?.length) return columnDefs;

  const customMap = new Map<string, ColDef<TData>>();
  customColumnDefs.forEach((column) => {
    if (hasField(column)) customMap.set(column.field, column);
  });

  const mergedColumnDefs = columnDefs.map((column) => {
    if (!hasField(column)) return column;

    const customColumn = customMap.get(column.field);
    if (!customColumn) return column;

    return { ...column, ...customColumn };
  });

  return mergedColumnDefs;
}

export function applyEditableColumns<TData = any>(columnDefs?: ColDef<TData>[] | null, editColumns?: '*' | (keyof TData | string)[]): ColDef<TData>[] | null | undefined {
  if (!columnDefs?.length) return columnDefs;
  if (!editColumns) return columnDefs;

  const isAll = editColumns === '*';
  const editableSet = new Set(editColumns as string[]);

  return columnDefs.map((column) => {
    if (!column.field) return column;
    if (!isAll && !editableSet.has(column.field)) return column;

    return withEditHeaderIcon({
      ...column,
      editable: true,
    });
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
