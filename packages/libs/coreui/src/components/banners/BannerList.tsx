// import React, { useCallback } from 'react';
// import { TransitionGroup, CSSTransition } from 'react-transition-group';

// import Banner from './Banner';

// export default function BannerList(props: Props) {
//   const { banners } = props;

//   function onBannerClose(index: number) { // useCallback hook
//     const { banners, onClose } = props;
//     if (onClose) onClose(index, banners[index]);
//   }

//   const list = banners.map((banner, index) => (
//     <CSSTransition
//       key={index}
//       classNames="banner-list"
//       timeout={300}
//     >
//       <Banner
//         banner={banner}
//         onClose={() => onBannerClose(index)}
//       />
//     </CSSTransition>
//   ));

//   return !banners.length ? null : (
//     <div className="wdk-BannerList">
//       <TransitionGroup>
//         {list}
//       </TransitionGroup>
//     </div>
//   )
// }
