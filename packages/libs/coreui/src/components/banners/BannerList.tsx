import { css } from '@emotion/react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Banner, { BannerProps } from './Banner';

type BannerListProps = {
  onClose: (index: number, banner: BannerProps) => void;
  banners: BannerProps[];
};

export default function BannerList(props: BannerListProps) {
  const { banners } = props;

  function onBannerClose(index: number) {
    const { banners, onClose } = props;
    if (onClose) onClose(index, banners[index]);
  }

  const list = banners.map((banner, index) => (
    <CSSTransition key={index} timeout={300}>
      <Banner banner={banner} onClose={() => onBannerClose(index)} />
    </CSSTransition>
  ));

  return !banners.length ? null : (
    <div
      css={css`
        padding: 0;
      `}
    >
      <TransitionGroup>{list}</TransitionGroup>
    </div>
  );
}
