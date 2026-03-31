import { useLocation, useParams } from 'react-router-dom';
import type { RouteNode, RouteTree } from '.';

/**
 * useCurrentRouteNode
 * ------------------------------------------------------------------
 * Runtime Layer Hook.
 *
 * RouteTree(정의 계층)를 기반으로 현재 URL과 매칭되는
 * RouteNode를 탐색합니다.
 *
 * Architecture Context:
 * Definition Layer (RouteTree)
 *        ↓
 * Runtime Matching (findRouteNode)
 *        ↓
 * Component Consumption
 *
 * Responsibilities:
 * - 현재 pathname 기준 노드 탐색
 * - URL params와 결합
 * - meta 및 location 정보 제공
 *
 * @param tree RouteTree (Single Source of Truth)
 */
export function useCurrentRouteNode(tree: RouteTree) {
  const location = useLocation();
  const params = useParams();
  const pathname = location.pathname;

  const node = findRouteNode(pathname, tree);

  return { node, meta: node?.meta, params, pathname, location };
}

/**
 * findRouteNode
 * ------------------------------------------------------------------
 * RouteTree를 재귀적으로 순회하여
 * pathname과 매칭되는 RouteNode를 반환합니다.
 *
 * Matching Strategy:
 * 1. 부모 경로 누적 기반 fullPath 계산
 * 2. 정적 경로 exact match
 * 3. 동적 파라미터 정규식 매칭
 * 4. children 재귀 탐색
 * 5. wildcard("*") fallback 처리
 *
 * @param pathname 현재 URL 경로
 * @param tree RouteTree
 * @param parentPath 부모 누적 경로
 */
function findRouteNode(pathname: string, tree: RouteTree, parentPath = ''): RouteNode | null {
  for (const key in tree) {
    const node = tree[key];
    const fullPath = normalizePath(parentPath, node.path);

    // 1) 정적 매칭
    if (fullPath.toLowerCase() === pathname.toLowerCase()) {
      return node;
    }

    // 2) 동적 매칭
    const escaped = fullPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = escaped.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`, 'i');

    if (regex.test(pathname)) {
      return node;
    }

    // 3) 자식 탐색
    if (node.children) {
      const child = findRouteNode(pathname, node.children, fullPath);
      if (child) return child;
    }
  }

  // 4) wildcard fallback (현재 depth 기준)
  const wildcard = Object.values(tree).find((n) => n.path === '*');
  if (wildcard) return wildcard;

  return null;
}

/**
 * normalizePath
 * ------------------------------------------------------------------
 * 부모 경로와 자식 경로를 결합하여 fullPath를 생성합니다.
 *
 * - child가 절대경로("/")로 시작하면 그대로 반환
 * - 중복 슬래시 제거
 * - trailing slash 제거
 * - 루트("/") 안정 처리
 */
function normalizePath(parent: string, child?: string): string {
  if (child?.startsWith('/')) return child;

  const combined = `${parent}/${child}`.replace(/\/+/g, '/').replace(/\/$/, '');

  return combined === '' ? '/' : combined;
}
