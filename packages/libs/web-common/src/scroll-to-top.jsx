/**
 * Created by dfalke on 8/24/16.
 */
import React from 'react';
import { render } from 'react-dom';
import { throttle, once, partial } from 'lodash';

const visibleStyle = {
  color: 'white',
  background: 'rgba(0, 0, 0, 0.19)',
  border: 'none',
  outline: 'none',
  padding: '8px',
  position: 'fixed',
  bottom: '85px',
  right: '16px',
  zIndex: 1000,
  opacity: 1,
  visibility: 'visible',
  transition: 'background .5s, opacity .5s, visibility .5s',
};

const hoverStyle = Object.assign({}, visibleStyle, {
  background: 'rgba(0, 0, 0, 0.5)',
});

const hiddenStyle = Object.assign({}, visibleStyle, {
  opacity: 0,
  visibility: 'hidden',
});

const scrollToTop = () => {
  location.hash = '';
  window.scrollTo(window.scrollX, 0);
};

const ScrollToTop = ({ style }) => (
  <button
    type="button"
    style={style}
    onClick={scrollToTop}
    onMouseEnter={renderScrollToTopWithHover}
    onMouseLeave={renderScrollToTopWithOutHover}
    title="Go back to the top of the page."
  >
    <i className="fa fa-2x fa-arrow-up"></i>
  </button>
);

const getDomNode = once(() =>
  document.body.appendChild(document.createElement('div'))
);

const renderScrollToTop = (style) =>
  render(
    <ScrollToTop style={window.scrollY > 250 ? style : hiddenStyle} />,
    getDomNode()
  );

const renderScrollToTopWithHover = partial(renderScrollToTop, hoverStyle);

const renderScrollToTopWithOutHover = partial(renderScrollToTop, visibleStyle);

window.addEventListener('scroll', throttle(renderScrollToTopWithOutHover, 250));
