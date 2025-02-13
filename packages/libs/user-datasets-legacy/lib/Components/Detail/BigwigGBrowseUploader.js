import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React from 'react';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import './BigwigGBrowseUploader.scss';
class BigwigGBrowseUploader extends React.Component {
  constructor(props) {
    super(props);
    this.getGBrowseUrl = this.getGBrowseUrl.bind(this);
  }
  getButtons() {
    const GBrowseUrl = this.getGBrowseUrl();
    return _jsx(React.Fragment, {
      children: _jsx(
        'a',
        Object.assign(
          { href: GBrowseUrl, target: '_blank', rel: 'noreferrer' },
          {
            children: _jsxs(
              'button',
              Object.assign(
                { className: 'btn btn-slim' },
                {
                  children: [
                    'View in Genome Browser ',
                    _jsx(Icon, { fa: 'chevron-circle-right right-side' }),
                  ],
                }
              )
            ),
          }
        )
      ),
    });
  }
  getGBrowseUrl() {
    const { sequenceId, genome, datasetName, datafileName } = this.props;
    var jbrowseTrackName = datasetName + ' ' + datafileName;
    return `/a/jbrowse/index.html?data=/a/service/jbrowse/tracks/${genome}&tracks=gene,${
      jbrowseTrackName || ''
    }&highlight=&loc=${sequenceId || ''}`;
  }
  render() {
    const buttons = this.getButtons();
    return _jsx(
      'div',
      Object.assign(
        { className: 'BigwigGBrowseUploader' },
        {
          children: _jsx(
            'div',
            Object.assign(
              { className: 'BigwigGBrowseUploader-Buttons' },
              { children: buttons }
            )
          ),
        }
      )
    );
  }
}
export default BigwigGBrowseUploader;
//# sourceMappingURL=BigwigGBrowseUploader.js.map
