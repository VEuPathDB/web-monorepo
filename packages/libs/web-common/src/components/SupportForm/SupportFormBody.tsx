import React from 'react';

interface Props {
  children: React.ReactNode;
}

const SupportFormBody: React.FC<Props> = ({ children }) => (
  <div className="support-form-body">{children}</div>
);

export default SupportFormBody;
