import { map } from 'lodash';
import React from 'react';

export default function NewWindowLink(props) {
  let {
    href,
    className,
    windowName = 'apidb_window',
    onClick = () => {},
    children,
  } = props;
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        onClick(e);
        if (!e.isDefaultPrevented()) {
          e.preventDefault();
          openPopup(e.currentTarget.href, windowName);
        }
      }}
    >
      {children}
    </a>
  );
}

function openPopup(windowUrl, windowName) {
  var windowWidth = 1050;
  var windowHeight = 740;
  var windowLeft = screen.width / 2 - windowWidth / 2;
  var windowTop = screen.height / 2 - windowHeight / 2;
  var defaultFeatures = {
    location: 'no',
    menubar: 'no',
    toolbar: 'no',
    personalbar: 'no',
    resizable: 'yes',
    scrollbars: 'yes',
    status: 'yes',
    width: windowWidth,
    height: windowHeight,
    top: windowTop,
    left: windowLeft,
  };

  let windowFeatures = map(defaultFeatures, function (v, k) {
    return k + '=' + v;
  }).join(',');
  window.open(windowUrl, windowName.replace(/-/g, '_'), windowFeatures).focus();
}
