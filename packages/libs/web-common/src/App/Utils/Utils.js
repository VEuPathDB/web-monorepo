export function ucFirst(text) {
  return typeof text === 'string' && text.length > 1
    ? text[0].toUpperCase() + text.slice(1)
    : text;
}

export function filterKeysFromObject(object, keys = []) {
  if (typeof object !== 'object' || !Object.keys(object).length) return object;
  return Object.entries(object).reduce((output, entry, entries) => {
    const [key, value] = entry;
    if (!keys.includes(key)) output[key] = value;
    return output;
  }, {});
}

export function iconMenuItemsFromSocials(siteConfig = {}) {
  const {
    facebookUrl,
    twitterUrl,
    youtubeUrl,
    vimeoUrl,
    blueskyUrl,
    discordUrl,
    linkedinUrl,
  } = siteConfig;
  const items = [];
  if (facebookUrl)
    items.push({ type: 'facebook', url: facebookUrl, target: '_blank' });
  if (twitterUrl)
    items.push({ type: 'twitter', url: twitterUrl, target: '_blank' });
  if (youtubeUrl)
    items.push({ type: 'youtube', url: youtubeUrl, target: '_blank' });
  if (vimeoUrl) items.push({ type: 'vimeo', url: vimeoUrl, target: '_blank' });
  if (blueskyUrl)
    items.push({ type: 'bluesky', url: blueskyUrl, target: '_blank' });
  if (discordUrl)
    items.push({ type: 'discord', url: discordUrl, target: '_blank' });
  if (linkedinUrl)
    items.push({ type: 'linkedin', url: linkedUrl, target: '_blank' });

  return items;
}

export function menuItemsFromSocials(siteConfig = {}) {
  return ['Facebook', 'Twitter', 'YouTube']
    .filter((siteName) => {
      const key = siteName.toLowerCase() + 'Url';
      return key in siteConfig && siteConfig[key] && siteConfig[key].length;
    })
    .map((siteName) => ({
      text: siteName,
      url: siteConfig[siteName.toLowerCase() + 'Url'],
      target: '_blank',
    }));
}
