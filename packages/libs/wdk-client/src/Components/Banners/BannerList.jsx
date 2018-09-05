import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Banner from './Banner';

class BannerList extends React.Component {
  constructor (props) {
    super(props);
  }

  onBannerClose (index) {
    const { banners, onClose } = this.props;
    if (onClose) onClose(index, banners[index]);
  }

  render () {
    const { banners } = this.props;

    const list = banners.map((banner, index) => (
      <CSSTransition
        key={index}
        classNames="banner-list"
        timeout={300}
      >
        <Banner
          banner={banner}
          onClose={() => this.onBannerClose(index)}
        />
      </CSSTransition>
    ));

    return !banners.length ? null : (
      <div className="wdk-BannerList">
        <TransitionGroup>
          {list}
        </TransitionGroup>
      </div>
    )
  }
}

export default BannerList;
