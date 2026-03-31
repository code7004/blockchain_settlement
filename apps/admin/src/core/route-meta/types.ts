// route.types.ts
import type { ReactNode } from 'react';
import type { ActionFunction, LoaderFunction } from 'react-router-dom';
/**
 * RouteTree
 * ------------------------------------------------------------------
 * RouteNode들의 트리 구조이며,
 * 애플리케이션의 라우트 정의 계층을 표현합니다.
 *
 * Execution Flow:
 * RouteTree → buildRouteObjects → React Router
 */
export type RouteTree = Record<string, RouteNode>;

/**
 * RouteNode
 * ------------------------------------------------------------------
 * 라우트 정의 단위 객체입니다.
 *
 * React Router의 RouteObject와 분리된 정의 계층이며,
 * buildRouteObjects를 통해 실행 계층으로 변환됩니다.
 *
 * - children은 key-value 트리 구조를 유지합니다.
 * - enabled는 Router 등록 여부를 제어합니다.
 * - meta는 UI/권한과 같은 확장 정보를 포함합니다.
 */
export interface RouteNode {
  index?: boolean;
  path?: string;
  element?: ReactNode;
  loader?: LoaderFunction;
  action?: ActionFunction;
  errorElement?: ReactNode;
  children?: RouteTree;

  meta?: RouteMeta;
  enabled?: boolean; // default: true. false일 경우 Router 실행 계층에 등록되지 않음
}

/**
 * RouteMeta
 * ------------------------------------------------------------------
 * UI 및 접근 제어와 관련된 확장 정보입니다.
 *
 * - hidden: 메뉴 생성 시 노출 여부 제어
 * - permissions: 접근 권한 필터링 기준
 *
 * 해당 정보는 Router 실행 계층에는 전달되지 않습니다.
 */
export interface RouteMeta {
  label?: string;
  icon?: ReactNode;
  description?: string;
  hidden?: boolean;
  permissions?: string[];
  onClick?: () => void;
}
