/**
 * route-meta
 * ------------------------------------------------------------------
 * Architecture
 *
 * Definition Layer
 *   RouteTree (Single Source of Truth)
 *
 * Execution Layer
 *   buildRouteObjects → React Router (useRoutes)
 *
 * Navigation Layer
 *   getNavigableRoutes → GNB / Menu generation
 *
 * Runtime Layer
 *   useCurrentRouteNode → Current route matching
 *
 * Execution Flow:
 * RouteTree → buildRouteObjects → useRoutes → RouteRenderer
 *
 * This module intentionally separates:
 * - Route Definition
 * - Router Execution
 * - Navigation Filtering
 * - Runtime Route Matching
 *
 * Routing Policy:
 * - All RouteNode must explicitly define `path`.
 * - Absolute paths are used for consistency across automation layers.
 * - React Router index routes are intentionally not used.
 */

export * from './types';
export * from './utils';
export * from './hooks';
export * from './renderer';
