import { useStateForObject } from '@/core/hooks';
import { parseApiError } from '@/core/network';
import { TxButton, TxCoolTable, TxCoolTablePagination, TxCoolTableScroller, TxFieldDropdown, TxLoading, TxModal, TxSearchInput, type ITxCoolTableOption, type ITxCoolTableRenderBodyProps } from '@/core/tx-ui';
import { apiGetMembers } from '@/domains/member/member.api';
import { defaultBodyRenderer } from '@/lib/defaultBodyRenderer';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
import { apiDeleteExceptionLog, apiGetExceptionLog, apiGetExceptionLogs, ExceptionLogStatus, type ExceptionLogDetailDto, type ExceptionLogListDto } from './exception-log.api';

const ITEMSIZE = 50;
const METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'];
const STATUSES = Object.values(ExceptionLogStatus);

type ExceptionLogTableRow = ExceptionLogListDto & { IDX: number };

const tableOptions: ITxCoolTableOption = {
  headers: ['IDX', 'path', 'message', 'status', 'assignedTo', 'method', 'createdAt'], // filter 리스트와 순서 일치 할것
  colWidths: [4, 20, 42, 10, 14, 6, 13],
  bodyStyles: {
    path: { maxWidth: '20em' },
    message: { maxWidth: '42em', textAlign: 'left' },
    assignedTo: { maxWidth: '14em' },
  },
};

export default function AdminExceptionLogList() {
  const [filter, setFilter] = useStateForObject({ page: 1, message: '', path: '', status: undefined as ExceptionLogStatus | undefined, method: '' });
  const [selectedId, setSelectedId] = useState<string>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['exception-logs', filter],
    queryFn: async () => {
      const res = await apiGetExceptionLogs({
        page: filter.page,
        limit: ITEMSIZE,
        message: filter.message,
        path: filter.path,
        status: filter.status,
        method: filter.method,
      });

      return {
        data: (res.data?.map((item, idx) => ({ IDX: (filter.page - 1) * ITEMSIZE + idx + 1, ...item })) as ExceptionLogTableRow[]) ?? [],
        total: res.total,
      };
    },
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  const {
    data: selectedLog,
    isLoading: isDetailLoading,
    // refetch: refetchSelected,
  } = useQuery<ExceptionLogDetailDto | undefined>({
    queryKey: ['exception-log', selectedId],
    queryFn: async () => {
      if (!selectedId) return undefined;
      return apiGetExceptionLog(selectedId);
    },
    enabled: !!selectedId,
  });

  const { data: members } = useQuery({
    queryKey: ['exception-log-members'],
    queryFn: async () => {
      const res = await apiGetMembers({ offset: 0, limit: 100 });
      return res.data ?? [];
    },
    staleTime: 1000 * 60,
  });

  // const memberOptions = (members ?? []).map((member) => ({
  //   name: member.username,
  //   value: member.id,
  // }));

  const memberNameById = new Map((members ?? []).map((member) => [member.id, member.username]));
  const canDelete = selectedLog?.status === ExceptionLogStatus.RESOLVED && dayjs(selectedLog.createdAt).isBefore(dayjs().subtract(30, 'day'));

  function renderBody(props: ITxCoolTableRenderBodyProps<ExceptionLogTableRow>) {
    if (props.key === 'assignedTo') {
      return props.value ? (memberNameById.get(props.value as string) ?? props.value) : '-';
    }

    return defaultBodyRenderer(props);
  }

  function openSelectedLog(items: ExceptionLogTableRow[]) {
    if (!items[0]) return;
    setSelectedId(items[0].id);
  }

  // async function refreshSelected() {
  //   await refetch();
  //   if (selectedId) {
  //     await refetchSelected();
  //   }
  // }

  // async function changeStatus(status: ExceptionLogStatus | undefined) {
  //   if (!selectedId || !status) return;

  //   try {
  //     await apiPatchExceptionLogStatus(selectedId, status);
  //     await refreshSelected();
  //   } catch (error) {
  //     alert(parseApiError(error).message);
  //   }
  // }

  // async function assignMember(assignedTo: string | null) {
  //   if (!selectedId) return;

  //   try {
  //     await apiPatchExceptionLogAssign(selectedId, assignedTo);
  //     await refreshSelected();
  //   } catch (error) {
  //     alert(parseApiError(error).message);
  //   }
  // }

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

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-end justify-between gap-3 mb-4">
        {/* 헤더 리스트와 순서 일치 시킬것 */}
        <TxSearchInput className="flex-1" caption="path" placeholder="Search path" onSubmitText={(path) => setFilter({ path, page: 1 })} onClear={(path) => setFilter({ path, page: 1 })} />
        <TxSearchInput className="flex-1" caption="message" placeholder="Search message" onSubmitText={(message) => setFilter({ message, page: 1 })} onClear={(message) => setFilter({ message, page: 1 })} />
        <TxFieldDropdown caption="status" data={STATUSES} onChangeValue={(status) => setFilter({ status: status.value as ExceptionLogStatus | undefined, page: 1 })} addNoChoiceItem />
        <TxFieldDropdown caption="method" data={METHODS} onChangeValue={(method) => setFilter({ method: method.value, page: 1 })} addNoChoiceItem />
        {/* <TxFieldDropdown caption="set status" data={STATUSES} value={selectedLog?.status} onChangeValue={(status) => void changeStatus(status.value as ExceptionLogStatus | undefined)} />
        <TxFieldDropdown caption="assign" data={memberOptions} value={selectedLog?.assignedTo ?? undefined} onChangeValue={(member) => void assignMember((member.value as string | undefined) ?? null)} addNoChoiceItem /> */}
        <TxButton label="Delete" disabled={!canDelete} onClick={() => void deleteSelected()} />
      </div>

      <TxCoolTableScroller className="flex-1 flex" footer={(data?.total ?? 0) > ITEMSIZE && <TxCoolTablePagination value={filter.page} itemCount={data?.total ?? 0} onChangePage={(page) => setFilter({ page })} itemVisibleCount={ITEMSIZE} />}>
        {isLoading ? <TxLoading className="flex-1 h-full" visible={true} /> : <TxCoolTable className="w-full text-sm text-center" data={data?.data} renderBody={renderBody} options={tableOptions} useRowSelect onSelections={openSelectedLog} />}
      </TxCoolTableScroller>

      <TxModal visible={!!selectedId} title="Exception Log" onExit={() => setSelectedId(undefined)} className="max-w-5xl w-[90vw]">
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
              <span className="font-semibold">assigned</span>
              <span>{selectedLog?.assignedTo ? (memberNameById.get(selectedLog.assignedTo) ?? selectedLog.assignedTo) : '-'}</span>
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
    </div>
  );
}
