import React from 'react';
import { RouteEntry } from "wdk-client/Core/RouteEntry";

export function wrapRoutes(ebrcRoutes: RouteEntry[]): RouteEntry[] {
  return [
    {
      path: '/',
      component: () => <div>Future OrthoMCL Home Page</div>
    },
    ...ebrcRoutes
  ];
}
