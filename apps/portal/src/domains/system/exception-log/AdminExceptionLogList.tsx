import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxAgGrid, TxButton, TxFlex, TxForm, TxLoading, TxModal, type ITxAgGridOption } from '@/core/tx-ui';
import { customColumnDefs } from '@/lib/defaultBodyRenderer';
import { useAuth } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import type { CellClickedEvent, CellValueChangedEvent } from 'ag-grid-community';
import dayjs from 'dayjs';
import { useState } from 'react';
import { apiDeleteExceptionLog, apiGetExceptionLog, apiGetExceptionLogs, apiPatchExceptionLog, ExceptionLogStatus, type ExceptionLogDetailDto, type ExceptionLogListDto, type GetExceptionLogsQueryDto } from './exception-log.api';

const ITEMSIZE = 50;
const METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'];
const STATUSES = Object.values(ExceptionLogStatus);

const tableOptions: ITxAgGridOption = {
  headers: ['source', 'statusCode', 'errorName', 'path', 'message', 'method', 'status', 'workerName', 'writer', 'assigneeMemberUsername', 'createdAt'],
  customColumnDefs: [...customColumnDefs, { field: 'assigneeMemberUsername', width: 14 }, { field: 'status', singleClickEdit: true, cellEditor: 'agSelectCellEditor', cellEditorParams: { values: STATUSES } }],
  editColumns: ['status'],
  colWidths: [4, 20, 42, 10, 14, 6, 13],
};

export default function AdminExceptionLogList() {
  const auth = useAuth();
  const [filter, _filter] = useStateForObject<GetExceptionLogsQueryDto>({ offset: 0, limit: ITEMSIZE, message: '', path: '', status: undefined as ExceptionLogStatus | undefined, method: '' });
  const [selectedId, setSelectedId] = useState<string>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exception-logs', filter],
    queryFn: async () => {
      const res = await apiGetExceptionLogs(filter);

      return { data: res.data, total: res.total };
    },
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  const { data: selectedLog, isLoading: isDetailLoading } = useQuery<ExceptionLogDetailDto | undefined>({
    queryKey: ['exception-log', selectedId],
    queryFn: async () => {
      if (!selectedId) return undefined;
      return apiGetExceptionLog(selectedId);
    },
    enabled: !!selectedId,
  });

  const canDelete = selectedLog?.status === ExceptionLogStatus.RESOLVED && dayjs(selectedLog.createdAt).isBefore(dayjs().subtract(30, 'day'));

  function hdCellClicked(event: CellClickedEvent<ExceptionLogListDto>): void {
    if (!event.data || event.colDef.field === 'status') return;
    setSelectedId(event.data.id);
  }

  async function deleteSelected() {
    if (!selectedId || !canDelete) return;
    if (!confirm('Delete selected exception log?')) return;

    try {
      await apiDeleteExceptionLog(selectedId);
      setSelectedId(undefined);
      await refetch();
    } catch (error) {
      alert(parseApiError(error).message);
    }
  }

  async function hdCellValueChanged(event: CellValueChangedEvent<ExceptionLogListDto>) {
    if (!event.data || !event.value) return;

    try {
      await apiPatchExceptionLog(event.data.id, { status: event.value, assigneeMemberId: auth.id });
      await refetch();
    } catch (error) {
      alert(parseApiError(error).message);
    }
  }

  return (
    <TxFlex className="flex flex-1 flex-col">
      <TxForm className="mb-4 flex flex-row items-end justify-between gap-3">
        <TxForm.SearchInput className="flex-1" caption="path" placeholder="Search path" onSubmitText={(path) => _filter({ path, offset: 0 })} onClear={(path) => _filter({ path, offset: 0 })} />
        <TxForm.SearchInput className="flex-1" caption="message" placeholder="Search message" onSubmitText={(message) => _filter({ message, offset: 0 })} onClear={(message) => _filter({ message, offset: 0 })} />
        <TxForm.Dropdown caption="method" data={METHODS} onChangeValue={(method) => _filter({ method: method.value, offset: 0 })} addNoChoiceItem />
        <TxForm.Dropdown caption="status" data={STATUSES} onChangeValue={(status) => _filter({ status: status.value as ExceptionLogStatus | undefined, offset: 0 })} addNoChoiceItem />
        <TxButton label="Delete" disabled={!canDelete} onClick={() => void deleteSelected()} />
      </TxForm>
      <TxAgGrid
        rowData={data?.data}
        option={tableOptions}
        isLoading={isLoading}
        defaultColDef={{ flex: 1 }}
        offset={filter.offset}
        pagination={{
          currentPage: 1 + filter.offset / ITEMSIZE,
          totalRows: data?.total ?? 0,
          pageSize: ITEMSIZE,
          onChangePage: (page) => _filter({ offset: (page - 1) * ITEMSIZE }),
        }}
        onCellClicked={hdCellClicked}
        onCellValueChanged={hdCellValueChanged}
      />

      <TxModal visible={!!selectedId} title="Exception Log" onExit={() => setSelectedId(undefined)}>
        {isDetailLoading ? (
          <TxLoading className="h-40" visible={true} />
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <div className="grid grid-cols-[6em_1fr] gap-2">
              <span className="font-semibold">time</span>
              <span>{selectedLog?.createdAt ? dayjs(selectedLog.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
              <span className="font-semibold">method</span>
              <span>{selectedLog?.method ?? '-'}</span>
              <span className="font-semibold">status</span>
              <span>{selectedLog?.status ?? '-'}</span>
              <span className="font-semibold">assignee</span>
              <span>{selectedLog?.assigneeMemberUsername ?? selectedLog?.assigneeMemberId ?? '-'}</span>
              <span className="font-semibold">writer</span>
              <span>{selectedLog?.writer ?? '-'}</span>
              <span className="font-semibold">path</span>
              <span className="break-all">{selectedLog?.path ?? '-'}</span>
              <span className="font-semibold">message</span>
              <span className="break-all">{selectedLog?.message ?? '-'}</span>
            </div>
            <pre className="max-h-[60vh] overflow-auto rounded bg-slate-950 p-4 text-left text-xs text-slate-100 whitespace-pre-wrap">{selectedLog?.stack ?? 'No stack'}</pre>
          </div>
        )}
      </TxModal>
    </TxFlex>
  );
}
