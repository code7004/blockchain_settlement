import type { ReactNode } from 'react';
import type { TxTabsTheme } from '.';
import type { DeepPartial } from '..';

/**
 * Tabs 내부 Head 렌더러에 전달되는 기본 속성
 *
 * @typedef {Object} ITxTabRenderHeadProps
 * @property {string} title - 탭 이름 (UI 표시용)
 * @property {boolean} isActive - 현재 탭 활성 여부
 * @property {() => void} onClick - 탭 클릭 이벤트 핸들러
 */
export interface ITxTabRenderHeadProps {
  title: string;
  isActive: boolean;
  theme?: DeepPartial<typeof TxTabsTheme>;
  onClick: () => void;
}

/**
 * TxTabs 컴포넌트 Props 정의
 *
 * @typedef {Object} ITxTabs
 * @property {string} [className] - 외부 Wrapper에 추가할 클래스
 * @property {string[]} tabs - 탭 이름 문자열 배열
 * @property {ReactNode[]} [tabData] - body 데이터 배열 (renderBody 미사용 시)
 * @property {number} [value] - 외부에서 제어 가능한 현재 활성 탭 index
 * @property {(text: string) => string} [locale] - 다국어 변환 함수
 * @property {(props: ITxTabRenderHeadProps) => ReactNode} [renderHead] - 커스텀 탭 헤더 렌더러
 * @property {(props:{name: string, index: number}) => ReactNode} [renderBody] - 탭 콘텐츠 렌더러
 * @property {(evt: number) => void} [onChange] - 탭 변경 시 호출되는 콜백
 */
export interface ITxTabs {
  className?: string;
  theme?: DeepPartial<typeof TxTabsTheme>;
  tabs: string[];
  tabData?: ReactNode[];
  value?: number;
  locale?: (text: string) => string;
  renderHead?: (props: ITxTabRenderHeadProps) => ReactNode;
  renderBody?: (props: { name: string; index: number }) => ReactNode;
  onChange?: (evt: number) => void;
}
