import { parse } from 'querystring';
import { mapValues } from 'lodash';
import { RouteComponentProps, RouteProps } from 'react-router';

export interface RouteEntry {
  readonly path: string;
  readonly exact?: false;
  readonly component: RouteProps['component'];
  readonly requiresLogin?: boolean;
  readonly rootClassNameModifier?: string;
  readonly isFullscreen?: boolean;
}

export function parseQueryString(props: RouteComponentProps<any>): Record<string, string> {
  return mapValues(parse(props.location.search.slice(1)), (arrayOrString = '') => String(arrayOrString));
}
