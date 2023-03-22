import { add, reduce, keyBy } from 'lodash';
import React from 'react';
import { getId, getDisplayName, getTargetType } from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';

/** Map search tree to menu items.  */
function getSearchItems(searchTree, recordClasses) {
  if (searchTree == null || recordClasses == null) return [];
  return searchTree.children.map(createMenuItem);
}

/** Map a search node to a meny entry */
function createMenuItem(searchNode) {
  const question = getTargetType(searchNode) === 'search' && searchNode.wdkReference;
  return {
    id: getId(searchNode),
    text: getDisplayName(searchNode),
    children: searchNode.children.map(createMenuItem),
    route: question && `/search/${question.outputRecordClassName}/${question.urlSegment}`
  };
}

/**
 * Common menu items used by our sites.
 * Some are used in the small menu, and some in the main menu.
 * We collect them here to allow the specific site to decide where and
 * how to use them.
 *
 * This is imperfect, but what it provides is the construction of the most
 * common set of menu items used across our sites, allowing each site to
 * modify or extend the data structure at will.
 *
 * Note, each top-level entry has a unique id. This can be leveraged to alter
 * the final structure of the menu items.
 *
 * @param {object} props Header props
 */
export function makeMenuItems(props) {
  const {
    basketCounts,
    user,
    siteConfig,
    showLoginForm,
    showLogoutWarning,
    includeQueryGrid = true
  } = props;

  const {
    facebookUrl,
    twitterUrl,
    youtubeUrl,
    webAppUrl,
  } = siteConfig;

  const totalBasketCount = reduce(basketCounts, add, 0);

  const isLoggedIn = user && !user.isGuest;

  return keyBy( [
    { id: 'home', text: 'Home', tooltip: 'Go to the home page', url: webAppUrl },
    { id: 'search', text: 'New Search', tooltip: 'Start a new search strategy',
      children: getSearchItems(props.searchTree, props.recordClasses).concat(
        includeQueryGrid ? [
          { id: 'query-grid', text: 'View all available searches', route: '/query-grid' }
        ] : [])
    },
    { id: 'strategies', text: 'My Strategies',  route: '/workspace/strategies' },
    {
      id: 'basket',
      text: <span>My Basket <span style={{ color: '#600000' }}>({totalBasketCount})</span></span>,
      route: '/workspace/basket',
      loginRequired: true
    },
    {
      id: 'favorites',
      text: 'My Favorites',
      route: '/workspace/favorites',
      loginRequired: true
    },

    isLoggedIn ? {
      id: 'profileOrLogin',
      text: `${user.properties.firstName} ${user.properties.lastName}'s Profile`,
      route: '/user/profile'
    } : {
      id: 'profileOrLogin',
      text: 'Login',
      url: '#login',
      onClick: e => { e.preventDefault(); showLoginForm(); }
    },

    isLoggedIn ? {
      id: 'registerOrLogout',
      text: 'Logout',
      url: '#logout',
      onClick: e => { e.preventDefault(); showLogoutWarning(); }
    } : {
      id: 'registerOrLogout',
      text: 'Register',
      route: '/user/registration'
    },
    {
      id: 'contactUs',
      text: 'Contact Us',
      route: '/contact-us',
      target: '_blank'
    }
  ]
    .concat(twitterUrl ? {
      id: 'twitter',
      liClassName: 'eupathdb-SmallMenuSocialMediaContainer',
      className: 'eupathdb-SocialMedia eupathdb-SocialMedia__twitter',
      url: twitterUrl,
      title: 'Follow us on Twitter!',
      target: '_blank'
    } : [])
    .concat(facebookUrl ? {
      id: 'facebook',
      liClassName: 'eupathdb-SmallMenuSocialMediaContainer',
      className: 'eupathdb-SocialMedia eupathdb-SocialMedia__facebook',
      url: facebookUrl,
      title: 'Follow us on Facebook!',
      target: '_blank'
    } : [])
    .concat(youtubeUrl ? {
      id: 'youtube',
      liClassName: 'eupathdb-SmallMenuSocialMediaContainer',
      className: 'eupathdb-SocialMedia eupathdb-SocialMedia__youtube',
      url: youtubeUrl,
      title: 'Follow us on YouTube!',
      target: '_blank'
    } : [])
    ,"id")
}
