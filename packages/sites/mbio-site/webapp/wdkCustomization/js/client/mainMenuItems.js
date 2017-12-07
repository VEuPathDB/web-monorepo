/**
  * Get menu items
  *
  * @return {Array<Item>}
  */
export default function mainMenuItems({ siteConfig, preferences }, defaultItems) {
  return [ 
    defaultItems.search,
    defaultItems.strategies,
    defaultItems.basket,
    defaultItems.favorites,
    { 
      id: 'datasets',
      text: 'Data Sets',
      route: '/search/dataset/AllDatasets/result'
    },
   defaultItems.profileOrLogin,
   defaultItems.registerOrLogout,
   defaultItems.contactUs
  ];
}

