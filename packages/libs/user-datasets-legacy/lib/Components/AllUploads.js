var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useCallback, useMemo } from 'react';
import { Checkbox, Link } from '@veupathdb/wdk-client/lib/Components';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import UserDatasetEmptyState from './EmptyState';
import { useProjectFilter } from '../Hooks/project-filter';
const ClearAllMessagesButton = (onClickCallback, buttonContent) =>
  _jsx(
    'button',
    Object.assign(
      { type: 'submit', className: 'btn', onClick: onClickCallback },
      { children: buttonContent }
    )
  );
const UploadHeader = ({ color, iconType, date }) =>
  _jsxs(
    'div',
    Object.assign(
      { style: { color } },
      {
        children: [
          _jsx(Icon, { fa: iconType }),
          _jsx(
            'span',
            Object.assign(
              { style: { marginLeft: '0.5em' } },
              { children: new Date(date).toLocaleString() }
            )
          ),
        ],
      }
    )
  );
const OngoingUpload = (upload, onClickCancel) =>
  _jsxs('div', {
    children: [
      _jsx(UploadHeader, {
        color: 'orange',
        iconType: 'cogs',
        date: upload.finished || upload.started,
      }),
      _jsxs('div', {
        children: [
          'Currently uploading: ',
          _jsx('code', { children: upload.datasetName }),
        ],
      }),
      _jsxs('div', {
        children: [
          'Status:',
          ' ',
          upload.status +
            (upload.stepPercent ? ' ... ' + upload.stepPercent + '%' : ''),
        ],
      }),
      upload.isCancellable &&
        _jsx(
          'button',
          Object.assign(
            { className: 'btn', onClick: () => onClickCancel() },
            { children: 'Cancel upload' }
          )
        ),
    ],
  });
const SuccessfulUpload = (upload, baseUrl) =>
  _jsxs('div', {
    children: [
      _jsx(UploadHeader, {
        color: 'green',
        iconType: 'check-circle',
        date: upload.finished || upload.started,
      }),
      'Successfully uploaded: \u00A0',
      _jsx(
        Link,
        Object.assign(
          {
            to:
              upload.datasetId != null
                ? `${baseUrl}/${upload.datasetId}`
                : baseUrl,
          },
          { children: _jsx('code', { children: upload.datasetName }) }
        )
      ),
    ],
  });
const InvalidatedUpload = (upload) => {
  return _jsxs('div', {
    children: [
      _jsx(UploadHeader, {
        color: 'red',
        iconType: 'exclamation-triangle',
        date: upload.finished || upload.started,
      }),
      _jsxs('div', {
        children: [
          _jsx('code', { children: upload.datasetName }),
          ' was rejected as it is invalid',
          upload.errors
            ? _jsxs('span', {
                children: [
                  ':',
                  _jsx('code', {
                    children: upload.errors.map((line, ix) =>
                      _jsx('div', { children: line }, ix)
                    ),
                  }),
                ],
              })
            : _jsx('span', { children: '.' }),
        ],
      }),
    ],
  });
};
const FailedUpload = (upload) =>
  _jsxs('div', {
    children: [
      _jsx(UploadHeader, {
        color: 'red',
        iconType: 'exclamation-triangle',
        date: upload.finished || upload.started,
      }),
      _jsxs('div', {
        children: [
          _jsx('code', { children: upload.datasetName }),
          ' could not be uploaded.',
        ],
      }),
      _jsxs('div', {
        children: [
          'Please try again. If the problem persists, please let us know through our \u00A0',
          _jsx(
            Link,
            Object.assign(
              { to: '/contact-us', target: '_blank' },
              { children: 'support form' }
            )
          ),
          '.',
        ],
      }),
    ],
  });
const UploadsTable = (props) => {
  const { baseUrl, uploads, cancelCurrentUpload } = props;
  return _jsx(
    'table',
    Object.assign(
      { style: { margin: '1em 0' } },
      {
        children: _jsx('tbody', {
          children: uploads.map((upload, ix) =>
            _jsx(
              'tr',
              {
                children: _jsx(
                  'td',
                  Object.assign(
                    { style: { fontSize: 'larger', paddingBottom: '1em' } },
                    {
                      children: upload.isOngoing
                        ? OngoingUpload(upload, () =>
                            cancelCurrentUpload(upload.id)
                          )
                        : upload.isSuccessful
                        ? SuccessfulUpload(upload, baseUrl)
                        : upload.isUserError
                        ? InvalidatedUpload(upload)
                        : FailedUpload(upload),
                    }
                  )
                ),
              },
              ix + '-' + upload.datasetName
            )
          ),
        }),
      }
    )
  );
};
const RefreshButton = () =>
  _jsx(
    'button',
    Object.assign(
      {
        type: 'submit',
        className: 'btn',
        onClick: () => {
          window.location.reload();
        },
      },
      { children: 'Refresh page' }
    )
  );
const ErrorMessage = (message) =>
  _jsx(
    'div',
    Object.assign(
      { className: 'ui-state-error', style: { fontSize: 'large' } },
      {
        children: message
          .split('\n')
          .map((line, ix) =>
            _jsxs(
              'div',
              Object.assign(
                { className: 'ui-state-error-text' },
                {
                  children: [
                    ix === 0 && _jsx(Icon, { fa: 'exclamation-triangle' }),
                    line,
                  ],
                }
              ),
              ix
            )
          ),
      }
    )
  );
const AllUploads = (props) => {
  const uploads = useMemo(() => {
    var _a;
    return (_a = props.uploadList) !== null && _a !== void 0 ? _a : [];
  }, [props.uploadList]);
  const ongoingUploads = useMemo(
    () => uploads.filter((u) => u.isOngoing),
    [uploads]
  );
  const finishedUploads = useMemo(
    () => uploads.filter((u) => !u.isOngoing),
    [uploads]
  );
  const projectInfo = useWdkService(
    (wdkService) =>
      __awaiter(void 0, void 0, void 0, function* () {
        const config = yield wdkService.getConfig();
        return {
          id: config.projectId,
          name: config.displayName,
        };
      }),
    []
  );
  const [projectFilter, setProjectFilter] = useProjectFilter();
  const hasUploadFromAnotherProject = useMemo(
    () =>
      uploads.some((upload) =>
        upload.projects.some(
          (project) =>
            project !==
            (projectInfo === null || projectInfo === void 0
              ? void 0
              : projectInfo.id)
        )
      ),
    [projectInfo, uploads]
  );
  const projectFilterApplied = projectFilter !== false;
  const uploadFilterPredicate = useCallback(
    (upload) =>
      projectInfo == null ||
      !projectFilterApplied ||
      upload.projects.includes(projectInfo.id),
    [projectInfo, projectFilterApplied]
  );
  const filteredUploads = useMemo(
    () => uploads.filter(uploadFilterPredicate),
    [uploads, uploadFilterPredicate]
  );
  const filteredFinishedUploads = useMemo(
    () => finishedUploads.filter(uploadFilterPredicate),
    [finishedUploads, uploadFilterPredicate]
  );
  return _jsxs('div', {
    children: [
      props.errorMessage != null && ErrorMessage(props.errorMessage),
      ongoingUploads.length > 0 && RefreshButton(),
      projectInfo != null &&
        hasUploadFromAnotherProject &&
        _jsxs(
          'div',
          Object.assign(
            { style: { display: 'flex', gap: '0.25em', margin: '0.5em' } },
            {
              children: [
                _jsx(Checkbox, {
                  id: 'recent-uploads-project-filter',
                  value: projectFilterApplied,
                  onChange: () => {
                    setProjectFilter((projectFilter) => !projectFilter);
                  },
                }),
                _jsxs(
                  'label',
                  Object.assign(
                    { htmlFor: 'recent-uploads-project-filter' },
                    { children: ['Only show uploads to ', projectInfo.name] }
                  )
                ),
              ],
            }
          )
        ),
      filteredUploads.length > 0 &&
        _jsx(UploadsTable, {
          baseUrl: props.baseUrl,
          uploads: filteredUploads,
          cancelCurrentUpload: props.actions.cancelCurrentUpload,
        }),
      filteredFinishedUploads.length > 0 &&
        ClearAllMessagesButton(
          () =>
            props.actions.clearMessages(
              filteredFinishedUploads.map((u) => u.id)
            ),
          projectFilterApplied && hasUploadFromAnotherProject
            ? 'Clear These Messages'
            : 'Clear All Messages'
        ),
      props.errorMessage == null &&
        projectInfo != null &&
        filteredUploads.length === 0 &&
        _jsx(UserDatasetEmptyState, {
          message:
            uploads.length === 0
              ? 'There are no recent uploads to be displayed.'
              : `There are no recent ${projectInfo.name} uploads to be displayed. Uncheck "Only show uploads to ${projectInfo.name}" to see all your recent uploads.`,
        }),
    ],
  });
};
export default AllUploads;
//# sourceMappingURL=AllUploads.js.map
