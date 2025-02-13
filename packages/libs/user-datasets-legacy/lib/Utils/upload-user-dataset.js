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
import { assertIsUserDatasetUploadCompatibleWdkService } from '../Service/UserDatasetUploadWrappers';
export function uploadUserDataset(wdkService, formSubmission) {
  return __awaiter(this, void 0, void 0, function* () {
    assertIsUserDatasetUploadCompatibleWdkService(wdkService);
    const newUserDatasetConfig = yield makeNewUserDatasetConfig(
      wdkService,
      formSubmission
    );
    return yield wdkService.addDataset(newUserDatasetConfig);
  });
}
export function makeNewUserDatasetConfig(wdkService, formSubmission) {
  return __awaiter(this, void 0, void 0, function* () {
    if (formSubmission.dataUploadSelection.type !== 'result') {
      return Object.assign(Object.assign({}, formSubmission), {
        uploadMethod: formSubmission.dataUploadSelection,
      });
    }
    const { compatibleRecordTypes, stepId } =
      formSubmission.dataUploadSelection;
    const { recordClassName } = yield wdkService.findStep(stepId);
    const resultReportSettings = compatibleRecordTypes[recordClassName];
    if (resultReportSettings == null) {
      throw new Error(
        `Tried to upload a result (step id ${stepId}) with an incompatible record type ${recordClassName}.`
      );
    }
    return Object.assign(Object.assign({}, formSubmission), {
      uploadMethod: Object.assign(
        { type: 'result', stepId },
        resultReportSettings
      ),
    });
  });
}
//# sourceMappingURL=upload-user-dataset.js.map
