export function ucFirst(text: string): string {
  return typeof text === 'string' && text.length > 1
    ? text[0].toUpperCase() + text.slice(1)
    : text;
}

export function filterKeysFromObject<T extends Record<string, any>>(
  object: T,
  keys: string[] = []
): Partial<T> {
  if (typeof object !== 'object' || !Object.keys(object).length) return object;
  return Object.entries(object).reduce<Partial<T>>((output, entry) => {
    const [key, value] = entry;
    if (!keys.includes(key)) output[key as keyof T] = value;
    return output;
  }, {});
}

interface SiteConfig {
  facebookUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  vimeoUrl?: string;
  blueskyUrl?: string;
  discordUrl?: string;
  linkedinUrl?: string;
}

interface IconMenuItem {
  type: string;
  url: string;
  target: string;
}

export function iconMenuItemsFromSocials(
  siteConfig: SiteConfig = {}
): IconMenuItem[] {
  const {
    facebookUrl,
    twitterUrl,
    youtubeUrl,
    vimeoUrl,
    blueskyUrl,
    discordUrl,
    linkedinUrl,
  } = siteConfig;
  const items: IconMenuItem[] = [];
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
    items.push({ type: 'linkedin', url: linkedinUrl, target: '_blank' });

  return items;
}

interface MenuItem {
  text: string;
  url: string;
  target: string;
}

export function menuItemsFromSocials(
  siteConfig: SiteConfig = {}
): MenuItem[] {
  return ['Facebook', 'Twitter', 'YouTube']
    .filter((siteName) => {
      const key = (siteName.toLowerCase() + 'Url') as keyof SiteConfig;
      return key in siteConfig && siteConfig[key] && siteConfig[key]!.length;
    })
    .map((siteName) => {
      const key = (siteName.toLowerCase() + 'Url') as keyof SiteConfig;
      return {
        text: siteName,
        url: siteConfig[key]!,
        target: '_blank',
      };
    });
}
