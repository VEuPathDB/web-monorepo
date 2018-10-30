import makeMainMenuItems from './mainMenuItems';
import ClassicSiteHeader from 'ebrc-client/components/ClassicSiteHeader';

export default {
  SiteHeader: () => SiteHeader
}

function SiteHeader() {
  return (
    <ClassicSiteHeader
      makeMainMenuItems={makeMainMenuItems}
      isPartOfEuPathDB={false}
      includeQueryGrid={false}
    />
  )
}