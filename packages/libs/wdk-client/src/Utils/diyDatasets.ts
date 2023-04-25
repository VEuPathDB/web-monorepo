export function isDiyWdkRecordId(wdkDatasetId: string) {
  return wdkDatasetId.startsWith('EDAUD_');
}

export function wdkRecordIdToDiyUserDatasetId(wdkDatasetId: string) {
  if (!isDiyWdkRecordId(wdkDatasetId)) {
    throw new Error(
      `Tried to obtain the user dataset id of an incompatible WDK record with id ${wdkDatasetId}`
    );
  }

  return Number(wdkDatasetId.replace(/^EDAUD_/, ''));
}

export function diyUserDatasetIdToWdkRecordId(userDatasetId: number) {
  return `EDAUD_${userDatasetId}`;
}
