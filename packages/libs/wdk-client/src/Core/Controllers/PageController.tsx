import ViewController from '../../Core/Controllers/ViewController';
import { RouteComponentProps } from 'react-router';

/**
 * A ViewController that is intended to render a UI on an entire screen.
 */
export default class PageController<
  Props = {},
  State = {}
> extends ViewController<Props, State> {
  /*--------------- Methods to override to display content ---------------*/

  /**
   * Returns the title of this page
   */
  getTitle(): string {
    return 'WDK';
  }

  setDocumentTitle(): void {
    if (this.isRenderDataLoadError()) {
      document.title = 'Error';
    } else if (this.isRenderDataNotFound()) {
      document.title = 'Page not found';
    } else if (this.isRenderDataPermissionDenied()) {
      document.title = 'Permission denied';
    } else if (!this.isRenderDataLoaded()) {
      document.title = 'Loading...';
    } else {
      document.title = this.getTitle();
    }
  }

  componentDidMount(): void {
    super.componentDidMount();
    this.setDocumentTitle();
  }

  componentDidUpdate(prevProps: Props & RouteComponentProps<any>): void {
    this.loadData(prevProps);
    this.setDocumentTitle();
  }
}
