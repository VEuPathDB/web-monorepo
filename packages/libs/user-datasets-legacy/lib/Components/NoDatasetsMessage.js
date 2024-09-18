import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Link } from '@veupathdb/wdk-client/lib/Components';
function NoDatasetsMessage({ baseUrl, hasDirectUpload, helpRoute }) {
  return _jsxs(
    'div',
    Object.assign(
      { className: 'UserDataset-NoDatasets' },
      {
        children: [
          _jsx(
            'div',
            Object.assign(
              { className: 'UserDataset-NoDatasets__lead' },
              { children: 'You do not have any data sets.' }
            )
          ),
          _jsxs('ul', {
            children: [
              hasDirectUpload
                ? _jsxs('li', {
                    children: [
                      'Try adding a data set using the',
                      ' ',
                      _jsx(
                        Link,
                        Object.assign(
                          { to: `${baseUrl}/new` },
                          { children: 'New upload' }
                        )
                      ),
                      ' section above.',
                    ],
                  })
                : _jsxs('li', {
                    children: [
                      'To add a data set, go to',
                      ' ',
                      _jsx(
                        'a',
                        Object.assign(
                          { href: 'https://veupathdb.globusgenomics.org' },
                          { children: 'VEuPathDB Galaxy' }
                        )
                      ),
                      '.',
                    ],
                  }),
              _jsxs('li', {
                children: [
                  'For an overview of the functionality, see the',
                  ' ',
                  _jsx(
                    Link,
                    Object.assign({ to: `${helpRoute}` }, { children: 'Help' })
                  ),
                  ' page.',
                ],
              }),
            ],
          }),
        ],
      }
    )
  );
}
export default NoDatasetsMessage;
//# sourceMappingURL=NoDatasetsMessage.js.map
