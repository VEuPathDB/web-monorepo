var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (
          e.indexOf(p[i]) < 0 &&
          Object.prototype.propertyIsEnumerable.call(s, p[i])
        )
          t[p[i]] = s[p[i]];
      }
    return t;
  };
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { keyBy } from 'lodash';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import {
  TextBox,
  TextArea,
  FileInput,
  RadioList,
  SingleSelect,
} from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import './UploadForm.scss';
const cx = makeClassNameHelper('UploadForm');
function UploadForm({
  badUploadMessage,
  baseUrl,
  datasetUploadType,
  projectId,
  urlParams,
  strategyOptions,
  resultUploadConfig,
  clearBadUpload,
  submitForm,
  supportedFileUploadTypes,
  maxSizeBytes,
}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
  const strategyOptionsByStrategyId = useMemo(
    () => keyBy(strategyOptions, (option) => option.strategyId),
    [strategyOptions]
  );
  const { useFixedUploadMethod: useFixedUploadMethodStr } = urlParams;
  const useFixedUploadMethod = useMemo(
    () => useFixedUploadMethodStr === 'true',
    [useFixedUploadMethodStr]
  );
  const displayUrlUploadMethod =
    ((_a = datasetUploadType.formConfig.uploadMethodConfig.url) === null ||
    _a === void 0
      ? void 0
      : _a.offer) !== false;
  const displayStrategyUploadMethod =
    (_b = datasetUploadType.formConfig.uploadMethodConfig.result) === null ||
    _b === void 0
      ? void 0
      : _b.offerStrategyUpload;
  const enableStrategyUploadMethod =
    Boolean(displayStrategyUploadMethod) && strategyOptions.length > 0;
  const [name, setName] = useState(
    (_c = urlParams.datasetName) !== null && _c !== void 0 ? _c : ''
  );
  const [summary, setSummary] = useState(
    (_d = urlParams.datasetSummary) !== null && _d !== void 0 ? _d : ''
  );
  const [description, setDescription] = useState(
    (_e = urlParams.datasetDescription) !== null && _e !== void 0 ? _e : ''
  );
  const [dataUploadMode, setDataUploadMode] = useState(
    urlParams.datasetStepId
      ? 'step'
      : urlParams.datasetStrategyRootStepId && enableStrategyUploadMethod
      ? 'strategy'
      : urlParams.datasetUrl && displayUrlUploadMethod
      ? 'url'
      : 'file'
  );
  const [file, setFile] = useState();
  const [url, setUrl] = useState(
    (_f = urlParams.datasetUrl) !== null && _f !== void 0 ? _f : ''
  );
  const initialStepId = useMemo(() => {
    var _a, _b;
    const parsedStepIdParam = Number(urlParams.datasetStepId);
    if (isFinite(parsedStepIdParam)) {
      return parsedStepIdParam;
    }
    const parsedStrategyIdParam = Number(urlParams.datasetStrategyId);
    return !enableStrategyUploadMethod || !isFinite(parsedStrategyIdParam)
      ? (_a = strategyOptions[0]) === null || _a === void 0
        ? void 0
        : _a.rootStepId
      : (_b = strategyOptionsByStrategyId[parsedStrategyIdParam]) === null ||
        _b === void 0
      ? void 0
      : _b.rootStepId;
  }, [
    urlParams.datasetStepId,
    urlParams.datasetStrategyId,
    strategyOptions,
    strategyOptionsByStrategyId,
    enableStrategyUploadMethod,
  ]);
  const [stepId, setStepId] = useState(initialStepId);
  useEffect(() => {
    setStepId(initialStepId);
  }, [initialStepId]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const dataUploadSelection = useMemo(() => {
    if (dataUploadMode === 'file') {
      return { type: 'file', file };
    }
    if (dataUploadMode === 'url') {
      return { type: 'url', url };
    }
    if (resultUploadConfig == null) {
      throw new Error('This data set type does not support result uploads.');
    }
    if (stepId == null) {
      return { type: 'result' };
    }
    return {
      type: 'result',
      stepId,
      compatibleRecordTypes: resultUploadConfig.compatibleRecordTypes,
    };
  }, [dataUploadMode, file, url, resultUploadConfig, stepId]);
  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const formValidation = validateForm(
        projectId,
        datasetUploadType,
        enableStrategyUploadMethod,
        {
          name,
          summary,
          description,
          dataUploadSelection,
        }
      );
      if (!formValidation.valid) {
        setErrorMessages(formValidation.errors);
      } else {
        setSubmitting(true);
        submitForm(formValidation.submission, `${baseUrl}/recent`);
      }
    },
    [
      baseUrl,
      projectId,
      datasetUploadType,
      enableStrategyUploadMethod,
      name,
      summary,
      description,
      dataUploadSelection,
      submitForm,
    ]
  );
  useEffect(() => {
    if (badUploadMessage != null) {
      setErrorMessages([badUploadMessage.message]);
      setSubmitting(false);
    }
  }, [badUploadMessage]);
  useEffect(() => {
    return () => {
      clearBadUpload();
    };
  }, [clearBadUpload]);
  const nameInputProps =
    (_g = datasetUploadType.formConfig.name) === null || _g === void 0
      ? void 0
      : _g.inputProps;
  const summaryInputProps =
    (_h = datasetUploadType.formConfig.summary) === null || _h === void 0
      ? void 0
      : _h.inputProps;
  const descriptionInputProps =
    (_j = datasetUploadType.formConfig.description) === null || _j === void 0
      ? void 0
      : _j.inputProps;
  const summaryRequired =
    (_k =
      summaryInputProps === null || summaryInputProps === void 0
        ? void 0
        : summaryInputProps.required) !== null && _k !== void 0
      ? _k
      : true;
  const descriptionRequired =
    (_l =
      descriptionInputProps === null || descriptionInputProps === void 0
        ? void 0
        : descriptionInputProps.required) !== null && _l !== void 0
      ? _l
      : true;
  const defaultFileInputField = _jsx(FileInput, {
    accept: supportedFileUploadTypes
      .map((fileUploadType) => `.${fileUploadType}`)
      .join(','),
    required: dataUploadMode === 'file',
    disabled: dataUploadMode !== 'file' || useFixedUploadMethod,
    maxSizeBytes: maxSizeBytes,
    onChange: (file) => {
      const fileWithSpacedRemovedFromName =
        file &&
        new File(
          [file],
          file === null || file === void 0
            ? void 0
            : file.name.replace(/\s+/g, '_'),
          file
        );
      setFile(
        fileWithSpacedRemovedFromName !== null &&
          fileWithSpacedRemovedFromName !== void 0
          ? fileWithSpacedRemovedFromName
          : undefined
      );
    },
  });
  const renderFileInput =
    (_m = datasetUploadType.formConfig.uploadMethodConfig.file) === null ||
    _m === void 0
      ? void 0
      : _m.render;
  const fileInputField =
    renderFileInput == null
      ? defaultFileInputField
      : renderFileInput({ fieldNode: defaultFileInputField });
  const uploadMethodItems = [
    {
      value: 'file',
      disabled: useFixedUploadMethod,
      display: _jsxs(React.Fragment, {
        children: [
          _jsx(
            FieldLabel,
            Object.assign(
              { htmlFor: 'data-set-file', required: dataUploadMode === 'file' },
              { children: 'Upload File' }
            )
          ),
          _jsx(
            'div',
            Object.assign(
              {
                id: 'data-set-file',
                className: cx(
                  '--UploadMethodField',
                  dataUploadMode !== 'file' && 'disabled'
                ),
              },
              { children: fileInputField }
            )
          ),
        ],
      }),
    },
  ]
    .concat(
      !displayUrlUploadMethod
        ? []
        : [
            {
              value: 'url',
              disabled: useFixedUploadMethod,
              display: _jsxs(React.Fragment, {
                children: [
                  _jsx(
                    FieldLabel,
                    Object.assign(
                      {
                        htmlFor: 'data-set-url',
                        required: dataUploadMode === 'url',
                      },
                      { children: 'Upload URL' }
                    )
                  ),
                  _jsx(TextBox, {
                    type: 'input',
                    className: cx(
                      '--UploadMethodField',
                      dataUploadMode !== 'url' && 'disabled'
                    ),
                    id: 'data-set-url',
                    placeholder: 'Address of a data file from the Web',
                    value: url,
                    required: dataUploadMode === 'url',
                    disabled: dataUploadMode !== 'url' || useFixedUploadMethod,
                    onChange: setUrl,
                  }),
                ],
              }),
            },
          ]
    )
    .concat(
      !displayStrategyUploadMethod
        ? []
        : [
            {
              value: 'strategy',
              disabled: !enableStrategyUploadMethod || useFixedUploadMethod,
              display: _jsxs(React.Fragment, {
                children: [
                  _jsx(
                    FieldLabel,
                    Object.assign(
                      {
                        htmlFor: 'data-set-strategy',
                        required: dataUploadMode === 'strategy',
                      },
                      { children: 'Upload Strategy' }
                    )
                  ),
                  _jsx(
                    'div',
                    Object.assign(
                      {
                        id: 'data-set-strategy',
                        className: cx(
                          '--UploadMethodField',
                          dataUploadMode !== 'strategy' && 'disabled'
                        ),
                      },
                      {
                        children: _jsx(SingleSelect, {
                          value: `${stepId}`,
                          items: strategyOptions.map((option) => ({
                            value: `${option.rootStepId}`,
                            display: `${option.name}${
                              !option.isSaved ? '*' : ''
                            }`,
                          })),
                          required: dataUploadMode === 'strategy',
                          onChange: (value) => {
                            setStepId(Number(value));
                          },
                        }),
                      }
                    )
                  ),
                ],
              }),
            },
          ]
    );
  return _jsxs(
    'form',
    Object.assign(
      {
        className: cx(),
        style: submitting ? { opacity: '0.5' } : {},
        onSubmit: onSubmit,
      },
      {
        children: [
          errorMessages.length > 0 &&
            _jsx(ErrorMessage, { errors: errorMessages }),
          _jsxs('div', {
            children: [
              _jsx('h2', { children: datasetUploadType.uploadTitle }),
              _jsxs(
                'div',
                Object.assign(
                  { className: 'formSection' },
                  {
                    children: [
                      _jsx(
                        FieldLabel,
                        Object.assign(
                          { required: true, htmlFor: 'data-set-name' },
                          { children: 'Name' }
                        )
                      ),
                      _jsx('br', {}),
                      _jsx(
                        TextBox,
                        Object.assign(
                          {
                            type: 'input',
                            id: 'data-set-name',
                            placeholder: 'name of the data set',
                          },
                          nameInputProps,
                          { required: true, value: name, onChange: setName }
                        )
                      ),
                    ],
                  }
                )
              ),
              _jsxs(
                'div',
                Object.assign(
                  { className: 'formSection' },
                  {
                    children: [
                      _jsx(
                        FieldLabel,
                        Object.assign(
                          {
                            htmlFor: 'data-set-summary',
                            required: summaryRequired,
                          },
                          { children: 'Summary' }
                        )
                      ),
                      _jsx(
                        TextBox,
                        Object.assign(
                          {
                            type: 'input',
                            id: 'data-set-summary',
                            placeholder:
                              'brief summary of the data set contents',
                            required: summaryRequired,
                          },
                          summaryInputProps,
                          { value: summary, onChange: setSummary }
                        )
                      ),
                    ],
                  }
                )
              ),
              _jsxs(
                'div',
                Object.assign(
                  { className: 'formSection' },
                  {
                    children: [
                      _jsx(
                        FieldLabel,
                        Object.assign(
                          {
                            htmlFor: 'data-set-description',
                            required: descriptionRequired,
                          },
                          { children: 'Description' }
                        )
                      ),
                      _jsx(
                        TextArea,
                        Object.assign(
                          {
                            id: 'data-set-description',
                            placeholder:
                              'brief description of the data set contents',
                            required: descriptionRequired,
                          },
                          descriptionInputProps,
                          { value: description, onChange: setDescription }
                        )
                      ),
                    ],
                  }
                )
              ),
              _jsx(
                'div',
                Object.assign(
                  { className: 'formSection' },
                  {
                    children:
                      uploadMethodItems.length === 1
                        ? _jsx(
                            'div',
                            Object.assign(
                              { className: cx('--UploadMethodSelector') },
                              {
                                children: _jsx(
                                  'div',
                                  Object.assign(
                                    { className: cx('--FixedUploadItem') },
                                    { children: uploadMethodItems[0].display }
                                  )
                                ),
                              }
                            )
                          )
                        : _jsx(RadioList, {
                            name: 'data-set-radio',
                            className: cx('--UploadMethodSelector'),
                            value: dataUploadMode,
                            onChange: (value) => {
                              if (
                                value !== 'url' &&
                                value !== 'file' &&
                                value !== 'strategy'
                              ) {
                                throw new Error(
                                  `Unrecognized upload method '${value}' encountered.`
                                );
                              }
                              setDataUploadMode(value);
                            },
                            items: uploadMethodItems,
                          }),
                  }
                )
              ),
            ],
          }),
          _jsx(
            'button',
            Object.assign(
              { type: 'submit', className: 'btn', disabled: submitting },
              { children: 'Upload Data Set' }
            )
          ),
          (_p =
            (_o = datasetUploadType.formConfig) === null || _o === void 0
              ? void 0
              : _o.renderInfo) === null || _p === void 0
            ? void 0
            : _p.call(_o),
        ],
      }
    )
  );
}
function FieldLabel(_a) {
  var { children, required } = _a,
    labelProps = __rest(_a, ['children', 'required']);
  return _jsxs(
    'label',
    Object.assign({}, labelProps, {
      children: [children, required ? '*' : null],
    })
  );
}
function ErrorMessage({ errors }) {
  return _jsxs(
    'div',
    Object.assign(
      { className: 'ui-state-error', style: { fontSize: 'large' } },
      {
        children: [
          _jsxs('div', {
            children: [
              _jsx(Icon, { fa: 'exclamation-triangle' }),
              '\u00A0 Could not upload data set',
            ],
          }),
          errors.map((error, ix) =>
            _jsx(
              'div',
              Object.assign(
                { className: 'ui-state-error-text' },
                { children: error }
              ),
              ix
            )
          ),
        ],
      }
    )
  );
}
function validateForm(
  projectId,
  datasetUploadType,
  enableResultUploadMethod,
  formContent
) {
  const { name, summary, description, dataUploadSelection } = formContent;
  if (!isCompleteDataUploadSelection(dataUploadSelection)) {
    return {
      valid: false,
      errors: !enableResultUploadMethod
        ? ['Required: data file or URL']
        : ['Required: data file, URL, or strategy'],
    };
  }
  if (
    dataUploadSelection.type === 'url' &&
    !isValidUrl(dataUploadSelection.url)
  ) {
    return {
      valid: false,
      errors: ['The provided data URL does not seem valid'],
    };
  }
  return {
    valid: true,
    submission: {
      name,
      summary,
      description,
      datasetType: datasetUploadType.type,
      projects: [projectId],
      dataUploadSelection,
    },
  };
}
function isCompleteDataUploadSelection(dataUploadSelection) {
  return Object.values(dataUploadSelection).every((value) => value != null);
}
// https://stackoverflow.com/a/43467144
function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}
export default UploadForm;
//# sourceMappingURL=UploadForm.js.map
