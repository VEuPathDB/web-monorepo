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
      if (!allowAiAssistedCommentCreation) {
        // Feature off: render no add-comment button. The vanilla "Add a comment"
        // button remains commented out (beta-demo state); see the legacy branch.
        return (
          <div>
            <props.DefaultComponent {...props} />
          </div>
        );
      }
      let aiLink = getAiLink(props);
      return (
        <div>
          <div style={buttonRowStyle}>
            {/* Vanilla "Add a comment" button hidden for the AI-comments beta
                demo. Restore for production:
            <a href={link} style={buttonStyle}>
              Add a comment <i className="fa fa-comment" />
            </a>
            */}
            <Link to={aiLink} style={buttonStyle}>
              Add AI-assisted comment <span style={betaPillStyle}>Beta</span>
            </Link>
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
