import React from 'react';
import './SupportFormBase.scss';

const SupportFormBase = ({ children }) => (
  <div className="support-form-base">
    <div className="support-form-contents">{children}</div>
  </div>
);

export default SupportFormBase;
