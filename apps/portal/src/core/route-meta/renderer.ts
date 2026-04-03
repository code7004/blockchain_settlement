// core/route-meta/render.ts
import { useRoutes } from 'react-router-dom';
import type { RouteTree } from './';
import { buildRouteObjects } from './';

/**
 * RouteRenderer
 * ------------------------------------------------------------------
 * Connects the RouteTree (definition layer) to React Router.
 *
 * Execution Flow:
 * RouteTree → buildRouteObjects → useRoutes → Rendered Route Element
 *
 * - Only routes with `enabled !== false` are registered.
 * - `meta` information is excluded from the Router execution layer.
 *
 * @param data RouteTree (route definition structure)
 * @returns React element resolved by React Router
 */
export const RouteRenderer = ({ data }: { data: RouteTree }) => {
  const element = useRoutes(buildRouteObjects(data));
  return element;
};
