import type { RouteObject } from 'react-router-dom';
import type { RouteNode, RouteTree } from './types';

/**
 * buildRouteObjects
 * ------------------------------------------------------------------
 * RouteTree(정의 계층)를 React Router 실행 계층(RouteObject[])으로
 * 변환하는 함수입니다.
 *
 * Execution Flow:
 * RouteTree → buildRouteObjects → useRoutes → Rendered Element
 *
 * Responsibilities:
 * - enabled !== false 인 RouteNode만 Router에 등록
 * - meta 정보는 실행 계층으로 전달되지 않음
 * - children을 재귀적으로 변환
 *
 * @param tree RouteTree (라우트 정의 트리)
 * @returns RouteObject[]
 */
export function buildRouteObjects(tree: RouteTree): RouteObject[] {
  return Object.values(tree)
    .filter((node) => node.enabled !== false)
    .map(transformNode);
}

/**
 * transformNode
 * ------------------------------------------------------------------
 * 단일 RouteNode를 RouteObject로 변환합니다.
 *
 * - children이 존재하면 재귀적으로 변환
 * - enabled === false 인 child는 제외
 */
function transformNode(node: RouteNode): RouteObject {
  const { index, path, element, loader, action, errorElement, children: childrenTree } = node;

  const children = childrenTree
    ? Object.values(childrenTree)
        .filter((child) => child.enabled !== false)
        .map(transformNode)
    : undefined;

  if (index) return { index, path, element, loader, action, errorElement };
  else return { path, element, loader, action, errorElement, children };
}

/**
 * getNavigableRoutes
 * ------------------------------------------------------------------
 * 메뉴(GNB) 또는 링크 생성을 위한 RouteNode 리스트를 반환합니다.
 *
 * Filtering Strategy:
 * - enabled === false 인 노드는 제외
 * - meta.hidden === true 인 노드는 제외
 * - meta.permissions 존재 시 permission 일치 여부 검사
 *
 * 해당 함수는 Router 실행과 무관하며,
 * Navigation 계층에서만 사용됩니다.
 *
 * @param tree RouteTree
 * @param permission 현재 사용자 권한 (optional)
 * @returns RouteNode[]
 */
export function getNavigableRoutes(tree: RouteTree, permission?: string): RouteNode[] {
  return Object.values(tree)
    .map((node) => {
      // 1. 현재 노드 필터링
      if (node.index || !node.path) return null;
      if (node.enabled === false) return null;
      if (node.meta?.hidden) return null;

      const perms = node.meta?.permissions;
      if (perms && (!permission || !perms.includes(permission))) return null;

      // 2. children 재귀 처리
      let children: RouteTree | undefined;

      if (node.children) {
        const filteredChildren = getNavigableRoutes(node.children, permission);

        // RouteTree 형태로 다시 변환
        if (filteredChildren.length > 0) {
          children = Object.fromEntries(filteredChildren.map((child) => [child.path, child])) as RouteTree;
        }
      }

      return {
        ...node,
        ...(children ? { children } : {}),
      };
    })
    .filter((v): v is RouteNode => v !== null);
}
