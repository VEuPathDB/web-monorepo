import React, { useCallback } from 'react';
import { RouteProps, Route, RouteComponentProps, StaticContext } from 'react-router';
import LoginRequiredDisclaimer from 'wdk-client/Views/User/LoginRequiredDisclaimer';
import { ErrorBoundary } from 'wdk-client/Controllers';

interface Props extends RouteProps {
  requiresLogin: boolean;
  disclaimerProps?: { toDoWhatMessage?: string, extraParagraphContent?: JSX.Element}
}

export default function WdkRoute(routeProps: Props) {
  const { component: Component, requiresLogin, disclaimerProps, ...restProps } = routeProps;

  const render = useCallback((props: RouteComponentProps<any, StaticContext, any>) => {
    const content = Component == null ? null
      : requiresLogin ? (
        <LoginRequiredDisclaimer {...disclaimerProps || {}}>
          <Component {...props}/>
        </LoginRequiredDisclaimer>
      )
      : <Component {...props}/>;
    return <ErrorBoundary>{content}</ErrorBoundary>
  }, [Component, requiresLogin]);

  return (
    <Route {...restProps} render={render} />
  );
}
