/* eslint-disable @typescript-eslint/no-explicit-any */

import dayjs from 'dayjs';
import _ from 'lodash';

/**
 * 일정 시간(ms) 동안 대기합니다.
 * @param millisecond 지연 시간 (기본값: 1000ms)
 * @returns 지정된 시간(ms) 후에 resolve되는 Promise
 */
export async function waitForSeconds(millisecond: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millisecond));
}

/**
 * 주어진 범위 내에서 bias에 따라 쏠린 랜덤 실수 생성
 *
 * @param min 최소값 (포함)
 * @param max 최대값 (제외)
 * @param bias 쏠림 위치 (0 = min 쏠림, 1 = max 쏠림, 0.5 = 중앙)
 * @param weight 쏠림 강도 (0 = 무쏠림, 1 = 완전 bias), 기본 0.8
 * @returns min 이상 max 미만의 랜덤 실수
 */
export function rand(min: number, max: number, bias?: number, weight: number = 0.8): number {
  if (bias == undefined) return min + (max - min) * Math.random();

  if (bias < 0 || bias > 1) {
    console.warn(`[rand] bias (${bias}) is out of range (0 ~ 1). Clamped.`);
  }
  if (weight < 0 || weight > 1) {
    console.warn(`[rand] weight (${weight}) is out of range (0 ~ 1). Clamped.`);
  }

  const t = Math.random();

  bias = Math.min(1, Math.max(0, bias));
  weight = Math.min(1, Math.max(0, weight)); // 안정성

  const tSkewed = t * (1 - weight) + bias * weight;

  return min + (max - min) * tSkewed;
}

/**
 * 주어진 범위 내에서 랜덤한 정수 생성
 *
 * @param min 최소값 (포함)
 * @param max 최대값 (제외)
 * @param bias 쏠림 위치 (0 = min 쏠림, 1 = max 쏠림, 0.5 = 중앙)
 * @param weight 쏠림 강도 (0 = 무쏠림, 1 = 완전 bias), 기본 0.8
 * @returns min 이상 max 미만의 랜덤 정수
 */
export function randInt(min: number, max: number, bias?: number, weight?: number): number {
  return Math.floor(rand(min, max, bias, weight));
}

/**
 * 지정된 날짜 범위 내에서 랜덤 날짜 생성
 *
 * @param min 최소값 (포함)
 * @param max 최대값 (제외)
 * @param bias 쏠림 위치 (0 = min 쏠림, 1 = max 쏠림, 0.5 = 중앙)
 * @param weight 쏠림 강도 (0 = 무쏠림, 1 = 완전 bias), 기본 0.8
 * @returns startDate 이상 endDate 이하의 랜덤 날짜
 */
export function randDate(startDate: Date, endDate: Date, bias?: number, weight?: number): Date {
  const startMillis = startDate.getTime();
  const endMillis = endDate.getTime();
  const randMillis = randInt(startMillis, endMillis, bias, weight);
  return new Date(randMillis);
}

/**
 * 전달된 arr배열에서 하나의 값을 추출 하여 리턴한다.
 *
 * @param arr 생성할 값이 들어 있는 배열
 * @param bias 쏠림 위치 (0 = min 쏠림, 1 = max 쏠림, 0.5 = 중앙)
 * @param weight 쏠림 강도 (0 = 무쏠림, 1 = 완전 bias), 기본 0.8
 */
export function randPick(arr: object[], bias?: number, weight?: number) {
  const idx = randInt(0, arr.length, bias, weight);
  return arr[idx];
}
/**
 * 랜덤 이미지 URL 생성 (picsum.photos)
 * @param size 이미지 크기 (정사각형, 기본값: 100)
 * @returns 랜덤한 이미지의 picsum.photos URL
 */
export function randImageUri(size: number = 100): string {
  return `https://picsum.photos/id/${randInt(100, 1000)}/${size}/${size}.jpg`;
}

/**
 * 랜덤한 IPv4 주소 생성
 * @returns 형식이 "x.x.x.x"인 랜덤 IP 주소 문자열
 */
export function randIP(): string {
  const randomByte = () => Math.floor(Math.random() * 256);
  return `${randomByte()}.${randomByte()}.${randomByte()}.${randomByte()}`;
}

/**
 * 이메일 주소에서 아이디(앞부분) 추출
 * @param email 이메일 주소
 * @returns "example@domain.com"에서 "example" 추출
 */
export function emailToId(email: string): string {
  return email.substring(0, email.indexOf('@'));
}
/**
 * 객체의 undefined 값을 null로 대체합니다.
 * @param obj 대상 객체
 * @returns 모든 undefined 값을 null로 치환한 새 객체
 * @example
 * intergrity({ a: 1, b: undefined }) // { a: 1, b: null }
 */
export function intergrity(obj: Record<string, object>): Record<string, object | null> {
  const keys = Object.keys(obj);
  const rtVal: Record<string, object | null> = {};
  keys.forEach((k) => {
    rtVal[k] = obj[k] ?? null;
  });
  return rtVal;
}

/**
 * 주어진 객체에서 특정 키만 추출하여 새 객체를 생성합니다.
 * 값이 undefined인 경우 null로 대체됩니다.
 * @param obj 대상 객체
 * @param args 추출할 키 목록
 * @returns 지정된 키만 포함된 새 객체
 * @example
 * mapping({ a: 1, b: 2, c: 3 }, "a", "c") // { a: 1, c: 3 }
 */
export function mapping(obj: Record<string, unknown>, ...args: string[]): Record<string, unknown> {
  const rtVal: Record<string, unknown> = {};
  args.forEach((k) => {
    rtVal[k] = obj[k] ?? null;
  });
  return rtVal;
}

/**
 * 보간 함수 (선형 보간, Linear Interpolation)
 * @param start 시작 값
 * @param end 끝 값
 * @param amt 보간 비율 (0~1)
 * @returns 보간된 값
 * @example
 * lerp(0, 10, 0.5) // 5
 */
export function lerp(start: number, end: number, amt: number): number {
  return (1 - amt) * start + amt * end;
}

/**
 * 2차원 벡터 타입 정의
 */
interface Vector2 {
  x: number;
  y: number;
}

/**
 * 2D 벡터의 선형 보간
 * @param start 시작 벡터
 * @param end 종료 벡터
 * @param amt 보간 비율 (0~1)
 * @returns 보간된 2D 벡터
 * @example
 * lerpVector2({ x: 0, y: 0 }, { x: 10, y: 10 }, 0.5) // { x: 5, y: 5 }
 */
export function lerpVector2(start: Vector2, end: Vector2, amt: number): Vector2 {
  const x = (1 - amt) * start.x + amt * end.x;
  const y = (1 - amt) * start.y + amt * end.y;
  return { x, y };
}

/**
 * 문자열을 기반으로 6자리 HEX 색상 코드를 생성합니다.
 * 문자열 길이가 6보다 짧을 경우 0으로 보완하며,
 * 각 문자의 유니코드 값을 기반으로 HEX 조합을 생성합니다.
 * @param str 임의의 문자열
 * @returns "#"로 시작하는 6자리 HEX 색상 문자열
 * @example
 * stringToHex("test") // "#a3b4c2" (입력에 따라 달라질 수 있음)
 */
export function stringToHex(str: string): string {
  if (!str) return '#407adf';
  str = str.replace('.', '');
  let hex = '';
  for (let i = 0; i < 6; i++) {
    if (str.length < 6 && i >= str.length) {
      hex += '0';
    } else {
      const code = str.charCodeAt(i).toString(16);
      const calcHex = parseInt(code[0] || '0') + parseInt(code[1] || '0');
      hex += calcHex.toString(16);
    }
  }
  return '#' + hex.substring(0, 6);
}

/**
 * 숫자를 기준으로 사전 정의된 HEX 색상 배열에서 색상 값을 반환합니다.
 * @param n 입력 숫자
 * @returns HEX 색상 코드
 * @example
 * numberToHex(3) // "#3B82F6"
 */
export const numberToHex = (n: number): string => {
  const colors = [
    '#EF4444', // red-500
    '#F59E0B', // amber-500
    '#10B981', // emerald-500
    '#3B82F6', // blue-500
    '#6366F1', // indigo-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#F97316', // orange-500
    '#22D3EE', // cyan-400
    '#14B8A6', // teal-500
    '#84CC16', // lime-500
    '#EAB308', // yellow-500
    '#0EA5E9', // sky-500
    '#A855F7', // purple-500
    '#6EE7B7', // green-300
  ];

  const index = Math.abs(n) % colors.length;
  return colors[index];
};

/**
 * 짧고 유니크한 ID 문자열을 생성합니다.
 * 현재 시간을 base-36 문자열로 변환 후 역순으로 만들고,
 * 지정된 범위 내의 랜덤 문자열을 결합합니다.
 * @param pow 랜덤 문자열의 범위 제어용 지수 (기본값: 1)
 * @returns 짧은 고유 문자열 ID
 * @example
 * shortUID() // "k4w9n7z5"
 */
let shortUIDCounter = 0;
export function shortUID(): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  shortUIDCounter = (shortUIDCounter + 1) % 10000; // 0~9999
  return time + rand + shortUIDCounter.toString(36);
}

/**
 * 주어진 값이 숫자인지 여부를 검사합니다.
 * 내부적으로 `parseInt` 결과가 NaN인지 체크합니다.
 * @param val 검사할 값
 * @returns 숫자일 경우 true, 아닐 경우 false
 * @example
 * isNumber("123") // true
 * isNumber("abc") // false
 */
export function isNumber(val: any): boolean {
  return !isNaN(parseInt(val));
}

/**
 * 각도를 라디안(radian)으로 변환합니다.
 * @param degree 도(degree) 단위의 각도
 * @returns 라디안 단위의 각도 값
 * @example
 * toRadians(180) // ≈ 3.14159
 */
export function toRadians(degree: number): number {
  return Math.PI * (degree / 180);
}

/**
 * 도(degree) 단위 각도로부터 sin 값을 계산합니다.
 * 소수점 오류 보정을 위해 라디안 값을 고정 소수점 처리합니다.
 * @param degree 도 단위 각도
 * @returns 해당 각도의 사인 값
 */
export function toSin(degree: number): number {
  return Math.sin(parseFloat(toRadians(degree).toFixed(15)));
}

/**
 * 도(degree) 단위 각도로부터 cos 값을 계산합니다.
 * 소수점 오류 보정을 위해 라디안 값을 고정 소수점 처리합니다.
 * @param degree 도 단위 각도
 * @returns 해당 각도의 코사인 값
 */
export function toCos(degree: number): number {
  return Math.cos(parseFloat(toRadians(degree).toFixed(15)));
}

/**
 * 회전을 위한 입력 파라미터 정의
 */
interface RotationInput {
  x1: number; // 회전할 원본 점의 x 좌표
  y1: number; // 회전할 원본 점의 y 좌표
  cx: number; // 기준 중심점의 x 좌표
  cy: number; // 기준 중심점의 y 좌표
  degree: number; // 회전 각도 (도 단위)
}

/**
 * 특정 점을 기준으로 주어진 각도만큼 회전한 새로운 좌표를 반환합니다.
 * @param input 회전 기준점과 원본 좌표, 각도
 * @returns 회전된 2D 좌표
 * @example
 * toRotation({ x1: 10, y1: 0, cx: 0, cy: 0, degree: 90 }) // { x: 0, y: 10 }
 */
export function toRotation({ x1, y1, cx, cy, degree }: RotationInput): Vector2 {
  const x = cx + (x1 - cx) * toCos(degree) - (y1 - cy) * toSin(degree);
  const y = cy + (x1 - cx) * toSin(degree) + (y1 - cy) * toCos(degree);
  return { x, y };
}

/**
 * source 객체의 모든 키-값 쌍을 target 객체로 복사합니다.
 * (깊은 복사가 아닌 얕은 복사)
 * @param source 원본 객체
 * @param target 대상 객체
 * @example
 * keyCopy({ a: 1 }, {}) // 대상 객체는 { a: 1 }로 바뀜
 */
export function keyCopy(source: Record<string, any>, target: Record<string, any>): void {
  const keys = Object.keys(source);
  keys.forEach((k) => {
    target[k] = source[k];
  });
}

/**
 * 주어진 정렬 기준 배열에 따라 객체 배열을 정렬합니다.
 * 기준 배열에 없는 값은 뒤쪽에 배치됩니다.
 * @param target 정렬 대상 객체 배열 (각 객체는 name 필드를 가져야 함)
 * @param sort name 값의 정렬 기준 배열
 * @returns 정렬된 객체 배열
 * @example
 * sortArray([{ name: "b" }, { name: "a" }], ["a", "b"]) // [{ name: "a" }, { name: "b" }]
 */
export function sortArray<T extends { name: string }>(target: T[], sort: string[]): T[] {
  return target
    .map((e) => ({
      ...e,
      index: sort.indexOf(e.name) !== -1 ? sort.indexOf(e.name) : target.length,
    }))
    .sort((a, b) => a.index - b.index);
}

/**
 * 현재 URL에 쿼리 파라미터를 추가하거나 제거합니다.
 * 내부적으로 "?i=i&" 구문을 기준으로 기존 쿼리를 제거한 뒤 새 값을 추가합니다.
 * @param json 추가할 쿼리 파라미터 객체 (null 또는 빈 객체일 경우 쿼리 제거)
 * @example
 * href({ page: 2, sort: "desc" }) // URL → ?i=i&page=2&sort=desc
 */
export function href(json?: Record<string, any> | null): void {
  const HRPARSER = '?i=i&';
  if (!json || Object.keys(json).length < 1) {
    window.history.pushState('', '', window.location.href.split(HRPARSER)[0]);
    return;
  }
  let path = window.location.href.split(HRPARSER)[0] + HRPARSER;
  for (const key in json) {
    path += key + '=' + json[key] + '&';
  }
  window.history.pushState('', '', encodeURI(path.replace(/&$/, '')));
}
/**
 * 초 단위 경과 시간을 사람이 읽기 쉬운 형태로 변환합니다.
 * 단위: 초, 분, 시간, 일, 달, 년 (하위 단위 포함, 0은 생략)
 * @param seconds 경과 시간 (초 단위)
 * @param decimals 표시할 소수점 자릿수 (기본값: 2)
 * @param locale 문자열 변환 함수 (예: i18n의 $t)
 * @returns 예: "3분 20초 전", "1시간 24분 전"
 * @example
 * elapsedTimeToLabel(6.5, 1, t => t);     // "6.5초 전"
 * elapsedTimeToLabel(90, 0, t => t);      // "1분 30초 전"
 * elapsedTimeToLabel(3665, 0, t => t);    // "1시간 1분 전"
 */
export function elapsedTimeToLabel(seconds: number, decimals: number = 2, locale: (text: string) => string = (t) => t): string {
  if (seconds == null || isNaN(seconds)) return '';
  if (seconds < 0) return locale('just_now');

  const sec = seconds;
  const min = sec / 60;
  const hour = min / 60;
  const day = hour / 24;
  const month = day / 30;
  const year = month / 12;

  // 🔹 초 단위
  if (sec < 60) {
    const v = parseFloat(Number(sec).toFixed(decimals));
    return `${v}${locale('second')}`;
  }

  // 🔹 분 단위
  if (min < 60) {
    const m = Math.floor(min);
    const s = Math.round((min - m) * 60);
    return s > 0 ? `${m}${locale('minute')} ${s}${locale('second')}` : `${m}${locale('minute')}`;
  }

  // 🔹 시간 단위
  if (hour < 24) {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return m > 0 ? `${h}${locale('hour')} ${m}${locale('minute')}` : `${h}${locale('hour')}`;
  }

  // 🔹 일 단위
  if (day < 30) return `${Math.floor(day)}${locale('day')}`;

  // 🔹 달 단위
  if (month < 12) return `${Math.floor(month)}${locale('month')}`;

  // 🔹 년 단위
  return `${Math.floor(year)}${locale('year')}`;
}

/**
 * 숫자 배열을 정렬합니다.
 * @param array 정렬할 숫자 배열
 * @param type 정렬 방식 ("asc": 오름차순, "desc": 내림차순)
 * @returns 정렬된 숫자 배열 (원본 배열은 변경되지 않음)
 * @example
 * numSort([3, 1, 2]) // [1, 2, 3]
 * numSort([3, 1, 2], "desc") // [3, 2, 1]
 */
export function numSort(array: number[], type: 'asc' | 'desc' = 'asc'): number[] {
  return type === 'desc' ? [...array].sort((a, b) => b - a) : [...array].sort((a, b) => a - b);
}
/**
 * 커스텀 우선순위 배열을 기반으로 객체 배열을 정렬합니다.
 * @param array 정렬할 객체 배열
 * @param customOrder 우선순위가 정의된 값 목록
 * @param key 정렬 기준이 되는 객체의 키
 * @param sortOrder 정렬 순서 ("asc" | "desc", 기본값: "asc")
 * @returns 정렬된 객체 배열
 * @example
 * sortByOrder(data, ["high", "medium", "low"], "priority", "asc")
 */
export function sortByOrder<T extends Record<string, any>>(array: T[], customOrder: string[], key: string, sortOrder: 'asc' | 'desc' = 'asc'): T[] {
  return array.sort((a, b) => {
    const indexA = customOrder.indexOf(a[key]);
    const indexB = customOrder.indexOf(b[key]);

    if (indexA !== -1 && indexB !== -1) return (indexA - indexB) * (sortOrder === 'asc' ? 1 : -1);
    if (indexA !== -1) return sortOrder === 'asc' ? -1 : 1;
    if (indexB !== -1) return sortOrder === 'asc' ? 1 : -1;

    const comparison = String(a[key]).localeCompare(String(b[key]));
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

/**
 * 숫자에 3자리 콤마(,) 구분자를 추가합니다.
 * @param number 숫자 또는 숫자 형식 문자열
 * @returns 콤마 구분이 포함된 문자열
 * @example
 * numberWithDelimiter(1234567) // "1,234,567"
 */
export function numberWithDelimiter(number: number | string): string {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 숫자 또는 숫자 문자열을 로케일 포맷 형식으로 변환합니다.
 * @param number 숫자 또는 숫자 형식 문자열
 * @returns 로케일 포맷이 적용된 문자열 (예: "1,234.56")
 * @example
 * toFormattedNumber(1234.56) // "1,234.56"
 */
export function toFormattedNumber(number: number | string): string {
  const numericValue = typeof number === 'string' ? parseFloat(number) : number;
  if (isNaN(numericValue)) return '';
  return numericValue.toLocaleString();
}

/**
 * 해시 라우터를 사용하는 경우 URL을 index.html#/Landing 형태로 재구성합니다.
 * @param url 대상 URL
 * @returns 변환된 해시 라우팅 URL
 * @example
 * toHashRrouterUrl("https://domain.com/index.html#page1") // "https://domain.com/index.html#/Landing"
 */
export function toHashRrouterUrl(url: string): string {
  const indexFragment = 'index.html#';
  const landingPath = 'index.html#/Landing';
  if (url.includes(indexFragment)) {
    return url.replace(/index\.html#.*$/, landingPath);
  } else {
    const urlObj = new URL(url);
    urlObj.pathname = 'index.html';
    urlObj.hash = '/Landing';
    return urlObj.toString();
  }
}

/**
 * 숫자를 소수점 2자리로 고정하여 문자열로 반환합니다.
 * @param value 숫자 값
 * @returns 소수점 2자리 문자열
 * @example
 * oddPriceFormat(2.3456) // "2.35"
 */
export function oddPriceFormat(value: number): string {
  if (!value) return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  return (Math.round(num * 100) / 100.0).toFixed(2);
}

/**
 * 배당률(odds)과 베팅 금액(stake)을 기반으로 예상 수익금을 계산합니다.
 * @param stake 베팅 금액
 * @param odd 배당률
 * @returns 예상 수익금 (순이익)
 * @example
 * oddPredictMoney(10000, 2.5) // 15000
 */
export function oddPredictMoney(stake: number, odd: number): number {
  return parseFloat(oddPriceFormat(odd)) * stake - stake;
}

/**
 * SQL Injection 방지를 위한 문자열 이스케이프 처리
 * 작은따옴표('), 백슬래시(\), 쌍따옴표("), 백틱(`), 달러($), 퍼센트(%), 언더스코어(_) 등을 이스케이프합니다.
 * @param input 원본 문자열
 * @returns SQL에서 안전하게 사용할 수 있도록 이스케이프된 문자열
 * @example
 * toEscapeForSQL("O'Reilly") // "O''Reilly"
 */
export function toEscapeForSQL(input: string): string {
  return input.replace(/'/g, "''").replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

/**
 * 문자열에 특수문자가 포함되어 있는지 확인합니다.
 * @param input 검사할 문자열
 * @returns 특수문자가 포함되어 있으면 true, 아니면 false
 * @example
 * hasSpecialChars("abc@123") // true
 * hasSpecialChars("hello") // false
 */
export function hasSpecialChars(input: string): boolean {
  const specialCharPattern = /[!@#%^&*()\-=+{};:'"\\|,.<>/?`~$]/;
  return specialCharPattern.test(input);
}

/**
 * File 객체에서 텍스트를 비동기적으로 읽어 문자열로 반환합니다.
 * @param file 읽을 File 객체 (예: input type="file"에서 선택된 파일)
 * @returns 파일의 텍스트 내용 (Promise<string>)
 * @example
 * const text = await readTextFileAsync(file);
 */
export async function readTextFileAsync(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        resolve(ev.target.result as string);
      } else {
        reject(new Error('파일을 읽을 수 없습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 중 오류 발생'));
    reader.readAsText(file);
  });
}

/**
 * 지정된 CSS 선택자에 대응하는 스타일 규칙을 동적으로 생성하거나 업데이트합니다.
 * 이미 동일한 selector 규칙이 존재할 경우 삭제 후 재삽입됩니다.
 * @param styleId style 태그의 고유 ID
 * @param selector CSS 선택자 (예: ".my-class", "#app")
 * @param rules 스타일 객체 (React.CSSProperties 형식, camelCase 사용)
 * @example
 * createCSS("dynamic-style", ".my-class", { backgroundColor: "red", fontSize: "14px" });
 */
export function createCSS(styleId: string, selector: string, rules: React.CSSProperties): void {
  let style = document.getElementById(styleId) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement('style');
    style.type = 'text/css';
    style.id = styleId;
    document.head.appendChild(style);
  }

  const sheet = style.sheet;

  if (sheet) {
    const cssRules = Object.entries(rules)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value};`;
      })
      .join(' ');

    // 기존 동일 selector 규칙 제거
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const rule = sheet.cssRules[i];
      if (rule.cssText.startsWith(selector)) {
        sheet.deleteRule(i);
        break;
      }
    }

    try {
      sheet.insertRule(`${selector} { ${cssRules} }`, sheet.cssRules.length);
    } catch {
      console.warn('Unable to insert CSS rule.');
    }
  }
}
/**
 * 가상 선택자(::before, :hover 등)를 포함하는 CSS 규칙을 동적으로 삽입하거나 갱신합니다.
 * 이미 동일 selector가 존재하면 삭제 후 새 규칙으로 대체합니다.
 * `##`로 시작하는 값은 `#`로 치환됩니다. (예: "##000" → "#000")
 *
 * @param styleId 스타일 태그에 지정할 고유 ID
 * @param selector CSS 선택자 (예: ".btn:hover", ".item::before")
 * @param rules CSS 속성 객체 (React 스타일 형태, camelCase 가능)
 * @example
 * createCSSWithPseudo("my-style", ".btn:hover", { backgroundColor: "red" });
 */
export function createCSSWithPseudo(styleId: string, selector: string, rules: Record<string, string | number>): void {
  let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  const styleSheet = styleElement.sheet as CSSStyleSheet;

  const ruleText = Object.entries(rules)
    .map(([key, value]) => {
      const formattedValue = typeof value === 'string' && value.startsWith('##') ? value.replace('##', '#') : value;
      return `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${formattedValue};`;
    })
    .join(' ');

  const fullRuleText = `${selector} { ${ruleText} }`;

  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    const rule = styleSheet.cssRules[i] as CSSStyleRule;
    if (rule.selectorText === selector) {
      styleSheet.deleteRule(i);
      styleSheet.insertRule(fullRuleText, i);
      return;
    }
  }

  try {
    styleSheet.insertRule(fullRuleText, styleSheet.cssRules.length);
  } catch (e) {
    console.error(`Failed to insert CSS rule: ${fullRuleText}`, e);
  }
}

/**
 * 숫자를 한국어 compact 형식(단위 생략 축약)으로 포맷합니다.
 * 예: 1,200 → "1.2천", 1,000,000 → "100만"
 *
 * @example
 * compactFormatter(1200) // "1.2천"
 * compactFormatter(1000000) // "100만"
 */
const formatter = new Intl.NumberFormat('ko-KR', { notation: 'compact', maximumFractionDigits: 1 });
export const compactFormatter = (value: number) => formatter.format(value);

/**
 * 주어진 숫자가 최소값 이상, 최대값 이하인지 검사합니다.
 * 최소값 또는 최대값이 주어지지 않은 경우 해당 제한은 무시됩니다.
 *
 * @param value 검사할 숫자 값
 * @param min 최소값 (선택, undefined일 경우 하한 제한 없음)
 * @param max 최대값 (선택, undefined일 경우 상한 제한 없음)
 * @returns 조건에 부합하면 true, 그렇지 않으면 false
 * @example
 * isInRange(10, 5, 20) // true
 * isInRange(3, 5) // false
 */
export function isInRange(value: number, min?: number, max?: number): boolean {
  const minOk = typeof min === 'number' && !isNaN(min);
  const maxOk = typeof max === 'number' && !isNaN(max);

  if (!minOk && !maxOk) return true; // 전체 허용
  if (!minOk && maxOk) return value <= max;
  if (minOk && !maxOk) return value >= min;
  return value >= min! && value <= max!;
}

/**
 * 주어진 값을 안전하게 숫자로 변환합니다.
 * 변환 결과가 NaN일 경우 지정된 fallback 값을 반환합니다.
 *
 * @param value 변환할 값 (string, number, null 등)
 * @param fallback 변환 실패 시 반환할 기본값 (기본값: 0)
 * @returns 변환된 숫자 또는 fallback 값
 * @example
 * safeNumber("123") // 123
 * safeNumber("abc", -1) // -1
 */
export function safeNumber(value: unknown, fallback?: number): number | undefined {
  if (value == undefined) return fallback;

  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

/**
 * URL 쿼리 문자열에서 추출한 period 값을 Date 배열로 변환합니다.
 * @param timestampStr "Thu May 22 2025 00:00:00 GMT+0900 (한국 표준시),Wed Jun 18 2025 23:59:59 GMT+0900 (한국 표준시)" 형태의 문자열
 * @returns [startDate, endDate] 형태의 Date 배열 (형식이 올바르지 않으면 빈 배열 반환)
 * @example
 * parsePeriodParam("Thu May 22 2025 00:00:00 GMT+0900 (한국 표준시),Wed Jun 18 2025 23:59:59 GMT+0900 (한국 표준시)")
 * // [Date('2025-05-22T00:00:00+09:00'), Date('2025-06-18T23:59:59+09:00')]
 */
export function parseTimestamps(timestampStr?: string | null): Date[] | null {
  if (!timestampStr) return null;

  const parts = decodeURIComponent(timestampStr).split(',');
  const timestamps = parts.map((p) => Number(p.trim()));

  const dates = timestamps.map((ts) => new Date(ts));
  return dates.length === 2 && dates.every((d) => !isNaN(d.getTime())) ? dates : null;
}

export function num2str(n?: number | null): string {
  return Number(n || 0).toLocaleString();
}

export function numberToPeriod(start: number, end: number): Date[] {
  return [
    dayjs()
      .add(start + 1, 'day')
      .startOf('day')
      .toDate(),
    dayjs().add(end, 'day').endOf('day').toDate(),
  ];
}

export function numberToStartEndDate(start: number, end: number): { startDate?: number; endDate?: number } {
  if (start == undefined) return {};

  return {
    startDate: dayjs()
      .add(start + 1, 'day')
      .startOf('day')
      .toDate()
      .getTime(),
    endDate: dayjs().add(end, 'day').endOf('day').toDate().getTime(),
  };
}

export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function yyyymmddToTime(str: string): number {
  return new Date(Number(str.slice(0, 4)), Number(str.slice(4, 6)) - 1, Number(str.slice(6, 8))).getTime();
}
export function checkEmptyFields(form: Record<string, any>, exclude: string[] = []): Record<string, string> | null {
  if (form == null) return null;

  for (const key of Object.keys(form)) {
    const value = form[key];
    if (exclude.includes(key)) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { [key]: `${key} is empty (array)` };
      }
      continue;
    }

    const strValue = String(value ?? '').trim();
    if (strValue === '') {
      return { [key]: `${key} is empty` };
    }
  }
  return null;
}

export function checkRegexFields(form: Record<string, any>, regexs: Record<string, { reg: RegExp; message: string }>): Record<string, string> | null {
  if (form == null) return null;

  for (const key of Object.keys(regexs)) {
    const value = String(form[key] ?? '').trim();
    if (value !== '' && !regexs[key].reg.test(value)) {
      return { [key]: regexs[key].message };
    }
  }
  return null;
}

export function checkForm(form: Record<string, any>, regexs: Record<string, { reg: RegExp; message: string }>, exclude: string[] = []): Record<'message', string> {
  return checkEmptyFields(form, exclude) ?? checkRegexFields(form, regexs) ?? {};
}

/**
 * ✅ networkWrapper
 *
 * - 비동기 콜백을 실행할 때 로딩 상태를 자동으로 관리하는 유틸리티 함수.
 * - callback 실행 전/후에 `_isLoading(true/false)` 를 호출한다. (선택적)
 * - 에러 발생 시 콘솔에 출력하고, 에러는 throw 하지 않는다.
 * - 호출 결과를 그대로 반환한다.
 *
 * @template T 콜백 함수의 파라미터 타입 배열
 * @template R 콜백 함수의 반환 타입 (Promise<R>)
 *
 * @param callback 실행할 비동기 함수
 * @param _isLoadin 로딩 상태를 제어하는 함수 (boolean → void), 선택적
 * @returns 원본 callback과 동일한 시그니처를 가지는 async 함수
 *
 * @example
 * const fetchUser = networkWrapper(async (id: string) => {
 *   const res = await axios.get(`/api/v1/users/${id}`);
 *   return res.data;
 * }, setLoading);
 *
 * // 호출 시
 * await fetchUser("user123");
 */
export function networkWrapper<T extends any[], R>(callback: (...args: T) => Promise<R>, _isLoadin?: (ison: boolean) => void) {
  return async (...args: T): Promise<R | void> => {
    try {
      _isLoadin?.(true);
      return await callback(...args);
    } catch (err: any) {
      console.error(err);
      alert('처리 할수 없습니다.' + err.message);
    } finally {
      _isLoadin?.(false);
    }
  };
}
/**
 * next요소중 prev요소와 차이가 있는 항목{key,value}들을 리턴한다.
 * @param prev
 * @param next
 * @returns
 */
export function diffObject(prev: Record<string, any>, next: Record<string, any>): Partial<Record<string, any>> {
  const diff: Record<string, any> = {};
  for (const key in next) {
    if (!_.isEqual(prev[key], next[key])) {
      diff[key] = next[key];
    }
  }
  return diff;
}

export function containsNonAscii(pw: string): boolean {
  /* eslint-disable no-control-regex */
  const nonAsciiReg = /[^\x00-\x7F]/u;
  /* eslint-enable no-control-regex */
  return nonAsciiReg.test(pw);
}

/**
 * 초를 일/시/분/초로 변환
 * @param {number} totalSeconds - 변환할 총 초
 * @param {boolean} [pad=false] - 두 자리수로 0 패딩할지 여부 (ex. 05:03:09)
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, formatted: string }}
 */
export function splitSeconds(totalSeconds: number, pad = true) {
  const ts = Math.floor(totalSeconds);
  const days = Math.floor(ts / 86400);
  const hours = Math.floor((ts % 86400) / 3600);
  const minutes = Math.floor((ts % 3600) / 60);
  const seconds = ts % 60;

  const pad2 = (n: number) => (pad ? String(n).padStart(2, '0') : n);

  const formatted = days > 0 ? `${days}일 ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}` : `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;

  return { days, hours, minutes, seconds, formatted };
}

/**
 * 바이트 단위를 사람이 읽기 쉬운 형식으로 변환 (TB, GB, MB, KB, B)
 * @param bytes 변환할 바이트 수
 * @param decimals 표시할 소수점 자릿수 (기본값: 2)
 * @returns 예: "12.34 GB"
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === undefined || bytes === 0 || bytes.toString() === '0') return '0 B';
  if (bytes < 0) return 'Invalid size';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  // 소수점 자릿수 제한 및 0 제거
  const fixed = parseFloat(value.toFixed(decimals));

  return `${fixed} ${sizes[i]}`;
}

/**
 * 다양한 타입을 안전하게 쿠키에 저장한다.
 *
 * @param {string} name - 쿠키 이름
 * @param {any} value - 저장할 값
 * @param {number} [days=30] - 유지 기간 (일)
 *
 * @example
 * setCookie("page", 2);
 * setCookie("darkMode", true);
 * setCookie("filters", ["soccer", "baseball"]);
 * setCookie("profile", { id: 1, name: "kim" });
 */
export function setCookie(name: string, value: any, days = 30) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();

  let v: string;

  if (value === null) {
    v = 'null';
  } else if (typeof value === 'object') {
    v = JSON.stringify(value);
  } else {
    v = String(value);
  }

  document.cookie = `${name}=${encodeURIComponent(v)}; ${expires}; path=/`;
}

function smartParse(raw: string): unknown {
  if (raw === 'null') return null;
  if (raw === 'true') return true;
  if (raw === 'false') return false;

  if (!isNaN(Number(raw))) return Number(raw);

  if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error(error);
    }
  }

  return raw;
}

/**
 * 쿠키 값을 읽고 저장된 값을 반환한다. (자동 형변환)
 *
 * @template T
 * @param {string} name - 쿠키 이름
 * @param {T} defaultValue - 기본값
 * @returns {T} 변환된 쿠키 값 또는 기본값
 *
 * @example
 * getCookie("page", 1);
 * getCookie("darkMode", false);
 * getCookie("token", "");
 * getCookie("filters", [] as string[]);
 * getCookie("profile", { id: 0, name: "" });
 */
export function getCookie<T>(name: string, defaultValue: T): T {
  let raw: string | null = null;

  for (const part of document.cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      raw = rest.join('='); // value에 '=' 포함 대비
      break;
    }
  }

  if (raw == null) return defaultValue;

  const parsed = smartParse(decodeURIComponent(raw));
  return parsed as T;
}

/**
 * 숫자인 지 검사 한다.
 * @param value
 * @returns
 */
export function isNumeric(value: string | number) {
  return !Array.isArray(value) && value !== '' && Number.isFinite(Number(value));
}

export type MoneyColorVariant = 'deposit' | 'withdraw' | 'profit' | 'rate' | 'white' | 'etc';

/**
 * 금액 값에 따라 Tailwind 텍스트 컬러 클래스를 반환한다.
 *
 * @param {MoneyColorVariant} [variant]
 *  금액 유형
 *  - deposit  : 입금 (파란색)
 *  - withdraw : 출금 (빨간색)
 *  - profit   : 손익 (양수/음수에 따라 색상 분기)
 *
 * @param {number} value
 *  value값에 따라 컬러 변경된 profit, rate에 해당
 *
 * @param {number} base
 *  value 컬러 판단 기준 profit, rate의 컬러 분류 기준값
 *
 * @returns {string}
 *  Tailwind CSS text color class
 *
 * @example
 * getMoneyColor(10000, "deposit"); // "text-blue-400 dark:text-blue-600"
 * getMoneyColor(-5000, "profit");  // "text-red-600 dark:text-red-400"
 */
export function getMoneyColor(variant: MoneyColorVariant = 'etc', value?: number, base?: number) {
  const xBase = base || (variant == 'profit' ? 0 : 1);

  switch (variant) {
    case 'withdraw':
      return 'text-red-500 dark:text-red-600';
    case 'deposit':
      return 'text-blue-500 dark:text-blue-600';
    case 'profit':
      if (!isNumeric(value!)) return 'text-gray-900 dark:text-white';
      return Number(value) < xBase ? 'text-red-600 dart:text-red-500' : Number(value) > xBase ? 'text-blue-600 dark:text-blue-500' : '';
    case 'rate':
      if (!isNumeric(value!)) return 'text-gray-900 dark:text-white';
      return Number(value) < xBase ? 'text-red-600 dart:text-red-500' : Number(value) > xBase ? 'text-blue-600 dark:text-blue-500' : '';
    default:
      return 'text-gray-900 dark:text-white';
  }
}
/**
 * YYYYMMDD → { year, week, key }
 * 예: 20251231 → { year: 2026, week: 1, key: "2026-W01" }
 */
export function getISOWeekKey(yyyymmdd: string) {
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6)) - 1;
  const d = Number(yyyymmdd.slice(6, 8));

  // UTC 기준 (로컬 타임존 영향 제거)
  const date = new Date(Date.UTC(y, m, d));

  // ISO: 월요일=1, 일요일=7
  const day = date.getUTCDay() || 7;

  // 해당 주의 목요일로 이동
  date.setUTCDate(date.getUTCDate() + (4 - day));

  const isoYear = date.getUTCFullYear();

  // ISO year의 첫 번째 주 계산
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  const weekStr = String(week).padStart(2, '0');

  return {
    year: isoYear,
    week,
    key: `${isoYear}-W${weekStr}`,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
