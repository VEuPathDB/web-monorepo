import { useWdkService } from '../../Hooks/WdkServiceHook';
import NewFeatureImage from '../../Core/Style/images/new-feature.png';

type Props = {
  buildIntroduced?: string;
  marginOverride?: React.CSSProperties['margin'];
};

// Component name is generic enough to be expanded into rendering other status icons, like Beta
export function WdkStatusIcon({
  buildIntroduced,
  marginOverride = '0 5px',
}: Props) {
  const currentBuild = useWdkService(
    async (wdkService) =>
      await wdkService.getConfig().then((config) => config.buildNumber)
  );
  const image =
    currentBuild === buildIntroduced
      ? { src: NewFeatureImage, alt: 'New' }
      : undefined;
  return image ? (
    <img alt={image.alt} src={image.src} style={{ margin: marginOverride }} />
  ) : null;
}
