import dayjs from 'dayjs';

export function numberToPeriod(value: number): Date[] {
  return [
    dayjs()
      .add(-value + 1, 'day')
      .startOf('day')
      .toDate(),
    dayjs().endOf('day').toDate(),
  ];
}
