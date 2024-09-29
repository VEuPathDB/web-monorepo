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
import { jsx as _jsx } from 'react/jsx-runtime';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  clearBadUpload,
  submitUploadForm,
} from '../Actions/UserDatasetUploadActions';
import UploadForm from '../Components/UploadForm';
import { assertIsUserDatasetUploadCompatibleWdkService } from '../Service/UserDatasetUploadWrappers';
export default function UserDatasetUploadController({
  baseUrl,
  datasetUploadType,
  urlParams,
}) {
  var _a, _b;
  useSetDocumentTitle(datasetUploadType.uploadTitle);
  const projectId = useWdkService(
    (wdkService) => wdkService.getConfig().then((config) => config.projectId),
    []
  );
  const supportedFileUploadTypes = useWdkService(
    (wdkService) =>
      __awaiter(this, void 0, void 0, function* () {
        assertIsUserDatasetUploadCompatibleWdkService(wdkService);
        if (projectId == null) {
          return undefined;
        }
        return wdkService.getSupportedFileUploadTypes(
          projectId,
          datasetUploadType.type
        );
      }),
    [projectId, datasetUploadType.type]
  );
  const strategyOptions = useWdkService(
    (wdkService) =>
      __awaiter(this, void 0, void 0, function* () {
        var _c;
        if (
          !((_c = datasetUploadType.formConfig.uploadMethodConfig.result) ===
            null || _c === void 0
            ? void 0
            : _c.offerStrategyUpload)
        ) {
          return [];
        }
        const strategies = yield wdkService.getStrategies();
        const compatibleRecordTypeNames = new Set(
          Object.keys(
            datasetUploadType.formConfig.uploadMethodConfig.result
              .compatibleRecordTypes
          )
        );
        return strategies.filter(
          (strategy) =>
            strategy.recordClassName != null &&
            compatibleRecordTypeNames.has(strategy.recordClassName)
        );
      }),
    [
      (_a = datasetUploadType.formConfig.uploadMethodConfig.result) === null ||
      _a === void 0
        ? void 0
        : _a.offerStrategyUpload,
    ]
  );
  const badUploadMessage = useSelector(
    (stateSlice) => stateSlice.userDatasetUpload.badUploadMessage
  );
  const dispatch = useDispatch();
  const clearBadUploadMessage = useCallback(() => {
    dispatch(clearBadUpload);
  }, [dispatch]);
  const submitForm = useCallback(
    (formSubmission, redirectTo) => {
      dispatch(submitUploadForm(formSubmission, redirectTo));
    },
    [dispatch]
  );
  return projectId == null ||
    supportedFileUploadTypes == null ||
    strategyOptions == null
    ? _jsx(Loading, {})
    : _jsx(
        'div',
        Object.assign(
          { className: 'stack' },
          {
            children: _jsx(UploadForm, {
              baseUrl: baseUrl,
              datasetUploadType: datasetUploadType,
              projectId: projectId,
              badUploadMessage: badUploadMessage,
              clearBadUpload: clearBadUploadMessage,
              submitForm: submitForm,
              urlParams: urlParams,
              strategyOptions: strategyOptions,
              resultUploadConfig:
                datasetUploadType.formConfig.uploadMethodConfig.result,
              supportedFileUploadTypes: supportedFileUploadTypes,
              maxSizeBytes:
                (_b = datasetUploadType.formConfig.uploadMethodConfig.file) ===
                  null || _b === void 0
                  ? void 0
                  : _b.maxSizeBytes,
            }),
          }
        )
      );
}
//# sourceMappingURL=UserDatasetNewUploadController.js.map
