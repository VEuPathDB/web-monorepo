import React from 'react';
import { Link } from 'react-router-dom';
import { allowAiAssistedCommentCreation } from '@veupathdb/web-common/lib/config';

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#fff',
  border: '1px solid #ccc',
  color: '#444',
  borderRadius: '4px',
  padding: '4px 10px',
  fontSize: '13px',
  textDecoration: 'none',
  cursor: 'pointer',
};

const betaPillStyle = {
  background: '#0a7c83',
  color: '#fff',
  fontSize: '10px',
  fontWeight: 700,
  borderRadius: '8px',
  padding: '1px 6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const buttonRowStyle = {
  display: 'flex',
  gap: '8px',
  marginBottom: '1em',
  flexWrap: 'wrap',
  alignItems: 'center',
};

export function addCommentLink(getLink, getAiLink) {
  return function UserCommentsSection(props) {
    let link = getLink(props);

    if (getAiLink) {
      return (
        <div>
          <div style={buttonRowStyle}>
            {/* Vanilla "Add a comment" button hidden for the AI-comments beta
                demo. Restore for production (renders regardless of the
                allowAiAssistedCommentCreation flag):
            <a href={link} style={buttonStyle}>
              <i className="fa fa-plus" />
              Add a comment <i className="fa fa-comment" />
            </a>
            */}
            {/* AI button is gated: shown only when the feature is enabled. */}
            {allowAiAssistedCommentCreation && (
              <Link to={getAiLink(props)} style={buttonStyle}>
                <i className="fa fa-plus" />
                Add AI-assisted comment <span style={betaPillStyle}>Beta</span>
              </Link>
            )}
          </div>
          <props.DefaultComponent {...props} />
        </div>
      );
    }

    return (
      <div>
        <p>
          <a href={link}>
            Add a comment <i className="fa fa-comment" />
          </a>
        </p>
        <props.DefaultComponent {...props} />
      </div>
    );
  };
}
