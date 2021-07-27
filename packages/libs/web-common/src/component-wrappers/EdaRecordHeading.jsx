import { makeEdaRoute } from 'ebrc-client/routes';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function EdaRecordHeading(props) {
  const location = useLocation();
  if (location.pathname.startsWith('/eda')) return <props.DefaultComponent {...props}/>;
  
  return (
    <>
      <div style={{
        padding: '1.8em 0',
        position: 'absolute',
        right: 0
      }}>
        <Link to={`${makeEdaRoute(props.record.id[0].value)}/new`} className="btn" style={{
          fontSize: '1.8em',
          backgroundColor: '#1976d2',
          color: 'white',
        }}>
          Analyze this study
        </Link>
      </div>
      <props.DefaultComponent {...props} />
    </>
  )
}