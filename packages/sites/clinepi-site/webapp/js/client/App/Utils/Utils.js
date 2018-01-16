export function ucFirst (text) {
  return typeof text === 'string' && text.length > 1
    ? text[0].toUpperCase() + text.slice(1)
    : text;
};

export function iconMenuItemsFromSocials (siteConfig = {}) {
  const { facebookUrl, twitterUrl, youtubeUrl } = siteConfig;
  const items = [];
  if (facebookUrl) items.push({ type: 'facebook', url: facebookUrl, target: '_blank' });
  if (twitterUrl) items.push({ type: 'twitter', url: twitterUrl, target: '_blank' });
  if (youtubeUrl) items.push({ type: 'youtube', url: youtubeUrl, target: '_blank' });
  return items;
}

export function menuItemsFromSocials (siteConfig = {}) {
  return ['Facebook', 'Twitter', 'YouTube']
    .filter(siteName => {
      const key = siteName.toLowerCase() + 'Url';
      return key in siteConfig && siteConfig[key] && siteConfig[key].length
    })
    .map(siteName => ({
      text: siteName,
      url: siteConfig[siteName.toLowerCase() + 'Url']
    }));
};
