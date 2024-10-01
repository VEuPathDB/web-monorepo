import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { bytesToHuman } from '@veupathdb/wdk-client/lib/Utils/Converters';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import tutStep2 from './images/tut-step-2.jpg';
import tutStep3 from './images/tut-step-3.jpg';
function UserDatasetHelp({
  hasDirectUpload,
  projectName,
  quotaSize,
  workspaceTitle,
}) {
  // FIXME: Perhaps this should be provided via static content?
  return hasDirectUpload
    ? _jsxs(
        'div',
        Object.assign(
          { className: 'UserDataset-Help' },
          {
            children: [
              _jsxs('section', {
                children: [
                  _jsx('h2', { children: 'Preparing data for upload' }),
                  _jsx('h4', {
                    children: 'Processing amplicon sequencing reads ',
                  }),
                  'Taxon counts can be obtained from metagenome sequences through commonly available tools. Three of the most common ones (',
                  _jsx(
                    'a',
                    Object.assign(
                      { href: 'https://benjjneb.github.io/dada2' },
                      { children: 'DADA2' }
                    )
                  ),
                  ',',
                  ' ',
                  _jsx(
                    'a',
                    Object.assign(
                      { href: 'www.qiime.org' },
                      { children: 'QIIME' }
                    )
                  ),
                  ', and',
                  ' ',
                  _jsx(
                    'a',
                    Object.assign(
                      { href: 'www.mothur.org/wiki/Make.biom' },
                      { children: 'Mothur' }
                    )
                  ),
                  ") have been integrated into workflows, and are available as a free online service, through NIAID's ",
                  _jsx(
                    'a',
                    Object.assign(
                      { href: 'https://nephele.niaid.nih.gov/' },
                      { children: 'Nephele' }
                    )
                  ),
                  ' project.',
                  _jsx('h4', { children: 'Formatting the input ' }),
                  'You can upload any file that contains processed taxonomic reads in a valid BIOM format. See ',
                  _jsx(
                    'a',
                    Object.assign(
                      { href: 'http://biom-format.org/' },
                      { children: 'this page' }
                    )
                  ),
                  ' ',
                  'for examples. If your data is in a different format - for example TSV - you can use',
                  ' ',
                  _jsx(
                    'a',
                    Object.assign(
                      {
                        href: 'http://biom-format.org/documentation/biom_conversion.html',
                      },
                      { children: 'conversion tools' }
                    )
                  ),
                  ' ',
                  'from the Python package ',
                  _jsx('code', { children: 'biom-format' }),
                  '.',
                  _jsx('h4', { children: 'Sample Details' }),
                  'Annotations for samples are not required, but they can be useful for subsetting and grouping samples.',
                  _jsx('br', {}),
                  _jsx('br', {}),
                  'If possible, try to include rich sample details in your uploaded file, to obtain full benefits from our suite of visualisation and analysis tools.',
                  _jsx('br', {}),
                  _jsx('br', {}),
                  'This',
                  ' ',
                  _jsx(
                    'a',
                    Object.assign(
                      {
                        href: 'http://biom-format.org/documentation/adding_metadata.html',
                      },
                      { children: 'documentation page' }
                    )
                  ),
                  ' ',
                  'shows how to add sample details to a BIOM file using a tool',
                  ' ',
                  _jsx('code', { children: 'biom-add-metadata' }),
                  '.',
                ],
              }),
              _jsxs('section', {
                children: [
                  _jsx('h2', { children: 'Tips for analysis' }),
                  'Queries for user data sets work like they do for MicrobiomeDB data sets, allowing you to either proceed with the whole data set for analysis, or selecting a subset based on sample details or by taxon abundance. You can access them from each data set page.',
                  _jsx('br', {}),
                  'You can extend and modify those searches using the strategies panel on the results page. This allows comparing uploaded data sets with each other, or with public MicrobiomeDB data sets.',
                  _jsx('br', {}),
                  _jsx('br', {}),
                  'All analyses and visualisations available for MicrobiomeDB data sets can also be used on the uploaded data set, for example:',
                  _jsx('br', {}),
                  _jsxs('ul', {
                    children: [
                      _jsxs('li', {
                        children: [
                          'Box and Whisker plot showing most abundant taxa, split by sample groups',
                          ' ',
                        ],
                      }),
                      _jsxs('li', {
                        children: [
                          'Alpha diversity trends for samples annotated by continuous variables like patient height or age',
                          ' ',
                        ],
                      }),
                      _jsx('li', {
                        children:
                          'Beta diversity plots annotated by sample groups',
                      }),
                      _jsxs('li', {
                        children: [
                          ' ',
                          'Report of differentially abundant samples between groups of samples',
                          ' ',
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }
        )
      )
    : _jsx('div', {
        children: _jsxs(
          'div',
          Object.assign(
            { className: 'row UserDataset-Help' },
            {
              children: [
                _jsxs(
                  'div',
                  Object.assign(
                    { className: 'box xs-12' },
                    {
                      children: [
                        _jsx('h2', { children: 'Introduction' }),
                        _jsx('iframe', {
                          title: 'Introduction to User Datasets',
                          src: 'https://www.youtube-nocookie.com/embed/igQZHjRBqV0',
                          frameBorder: '0',
                          allow:
                            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                          allowFullScreen: true,
                          width: '560',
                          height: '315',
                        }),
                      ],
                    }
                  )
                ),
                _jsxs(
                  'div',
                  Object.assign(
                    { className: 'box xs-12 md-6' },
                    {
                      children: [
                        _jsx('h2', { children: 'VEuPathDB Galaxy' }),
                        _jsx('img', {
                          alt: 'Screenshoot for step 2 of tutorial',
                          src: tutStep2,
                        }),
                        _jsxs('ul', {
                          children: [
                            _jsxs('li', {
                              children: [
                                'Use the ',
                                _jsx('b', {
                                  children: 'VEuPathDB Export Tools',
                                }),
                                ' on the left-side navigation, at ',
                                _jsx(
                                  Link,
                                  Object.assign(
                                    { to: '/galaxy-orientation' },
                                    { children: 'VEuPathDB Galaxy' }
                                  )
                                ),
                                '.',
                              ],
                            }),
                            _jsxs('li', {
                              children: [
                                'Prepare your export data set by selecting the files (galaxy data sets) in your history.',
                                ' ',
                              ],
                            }),
                            _jsxs('li', {
                              children: [
                                'The data set name, summary and description can be edited later in the ',
                                _jsx('i', { children: workspaceTitle }),
                                ' page.',
                              ],
                            }),
                            _jsxs('li', {
                              children: [
                                "When you're ready, ",
                                _jsx('code', { children: 'Execute' }),
                                ' the export. The process of exporting to VEuPathDB may take some time. Progress can be monitored from the right-side history panel in Galaxy.',
                              ],
                            }),
                          ],
                        }),
                      ],
                    }
                  )
                ),
                _jsxs(
                  'div',
                  Object.assign(
                    { className: 'box xs-12 md-6' },
                    {
                      children: [
                        _jsxs('h2', { children: [workspaceTitle, ' page'] }),
                        _jsx('img', {
                          alt: 'Screenshoot for step 3 of tutorial',
                          src: tutStep3,
                        }),
                        _jsxs('ul', {
                          children: [
                            _jsxs('li', {
                              children: [
                                'You can now view, manage, share, and utilize your data set in',
                                ' ',
                                _jsx('b', { children: projectName }),
                                '.',
                              ],
                            }),
                            _jsxs('li', {
                              children: [
                                workspaceTitle,
                                " you've created contribute to a per-user upload limit/quota of ",
                                _jsx('b', {
                                  children: bytesToHuman(quotaSize),
                                }),
                                '.',
                              ],
                            }),
                            _jsxs('li', {
                              children: [
                                ' ',
                                "Bigwig files can be sent to JBrowse in the data set's detail page. Click the data set name or status icon to see this page.",
                              ],
                            }),
                          ],
                        }),
                      ],
                    }
                  )
                ),
              ],
            }
          )
        ),
      });
}
export default UserDatasetHelp;
//# sourceMappingURL=UserDatasetHelp.js.map
