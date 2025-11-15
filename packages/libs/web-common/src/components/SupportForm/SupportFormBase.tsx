import React from 'react';
import './SupportFormBase.scss';

interface Props {
  children: React.ReactNode;
}

const SupportFormBase: React.FC<Props> = ({ children }) => (
  <div className="support-form-base">
    <div className="support-form-contents">{children}</div>
  </div>
);

export default SupportFormBase;
