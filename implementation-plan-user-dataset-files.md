# Implementation Plan: Add User Dataset Files to Two Routes

## Overview

Add the user dataset file download functionality (uploaded/processed files from VDI service) to two routes:

1. **EDA Downloads page** - `/app/workspace/analyses/:studyId/:analysisId/download`
2. **WDK Record page** - `/app/record/userdataset/:id`

## Problem Statement

Currently, when users have a user dataset (uploaded data), there are two places they might view it:

1. **EDA Downloads page** - Shows release files for internal/curated datasets, but when an EDA study is based on a user dataset, there's no way to download the uploaded and processed files
2. **WDK Record page** - Shows metadata (publication, contact, ID, etc.) but does NOT show any file download capability

The user dataset detail page (`/workspace/datasets/:id`) already has this functionality, but it needs to also be available on these two additional routes.

## Components Involved

### Source Component (existing):

- **UserDatasetDetail**: `packages/libs/user-datasets/src/lib/Components/Detail/UserDatasetDetail.tsx`
  - Contains `renderFileSection()` method (lines 521-548) that displays uploaded/processed files
  - Uses Mesa tables to show file listings
  - Provides download functionality via `wdkService.getUserDatasetFiles()`
  - Shows two sections: "Uploaded Files" and "Processed Files"

### Target Components (to modify):

#### Route 1: EDA Downloads Page

- **Downloads**: `packages/libs/eda/src/lib/workspace/DownloadTab/Downloads.tsx`
  - Already has `isUserStudy` flag available (line 47)
  - Currently shows release files only for non-user studies (line 131)
  - Has two-column layout with Column One containing download sections

#### Route 2: WDK Record Page

- **UserDatasetRecordClass**: `packages/libs/web-common/src/components/records/UserDatasetRecordClasses.UserDatasetRecordClass.jsx`
  - Currently shows metadata only (publication, contact, ID, date, summary, accessibility)
  - Does NOT currently show any file information
  - RecordHeading component can be extended to add files section

## Implementation Steps

### 1. Create Reusable UserDatasetFiles Component

**New file**: `packages/libs/user-datasets/src/lib/Components/UserDatasetFiles.tsx`

Extract the file display logic from UserDatasetDetail into a standalone component that:

- Accepts file listing data as props (upload/install zip details)
- Displays two Mesa tables (uploaded files, processed files)
- Provides download functionality
- Handles expand/collapse for file contents
- Shows file sizes in human-readable format

**Props interface:**

```typescript
interface UserDatasetFilesProps {
  datasetId: string;
  files: {
    upload?: {
      zipSize: number;
      contents: Array<{ fileName: string; fileSize: number }>;
    };
    install?: {
      zipSize: number;
      contents: Array<{ fileName: string; fileSize: number }>;
    };
  };
  wdkService: WdkService;
  isInstalled?: boolean;
  dataNoun?: { singular: string; plural: string };
}
```

**Component responsibilities:**

- Render "Data Files" section heading
- Create two Mesa tables (one for upload.zip, one for install.zip)
- Display file listings with expandable details
- Provide download buttons
- Handle file size formatting using `bytesToHuman()` utility

### 2. Update EDA Downloads Component

**File**: `packages/libs/eda/src/lib/workspace/DownloadTab/Downloads.tsx`

**Changes needed:**

- Import VDI helper functions and types
- Add hook to fetch user dataset file listing
- Add conditional rendering for user dataset files section
- Ensure proper error handling and loading states

**Specific additions:**

```typescript
// New imports (add to existing imports section)
import { wdkRecordIdToDiyUserDatasetId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';
import { isVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service';
import { UserDatasetFiles } from '@veupathdb/user-datasets';

// New hook (after line 47, after isUserStudy declaration)
const vdiDatasetId = isUserStudy
  ? wdkRecordIdToDiyUserDatasetId(datasetId)
  : null;

const userDatasetFilesResult = useWdkService(
  async (wdkService) => {
    if (!isUserStudy || !vdiDatasetId) {
      return { data: null, error: null };
    }

    if (!isVdiCompatibleWdkService(wdkService)) {
      return {
        data: null,
        error: 'VDI service is not configured. Unable to load dataset files.',
      };
    }

    try {
      const files = await wdkService.getUserDatasetFileListing(vdiDatasetId);
      return { data: files, error: null };
    } catch (error) {
      console.error('Failed to fetch user dataset files:', error);
      return {
        data: null,
        error: 'Failed to load dataset files. Please try again later.',
      };
    }
  },
  [isUserStudy, vdiDatasetId]
);

// New section in render (in Column One, after MySubset section around line 239)
{
  isUserStudy &&
    (userDatasetFilesResult?.error ? (
      <div className="error-message">
        <h2>Data Files</h2>
        <p>{userDatasetFilesResult.error}</p>
      </div>
    ) : userDatasetFilesResult?.data ? (
      <UserDatasetFiles
        datasetId={vdiDatasetId}
        files={userDatasetFilesResult.data}
        wdkService={wdkService}
        isInstalled={true}
      />
    ) : userDatasetFilesResult === undefined ? (
      <div>
        <h2>Data Files</h2>
        <Loading />
      </div>
    ) : null);
}
```

**Error Handling Strategy:**

- Returns structured object with `{ data, error }` instead of just data or null
- Shows error message to user if VDI service not configured
- Shows error message if API call fails
- Shows loading indicator while fetching
- Only renders nothing if not a user study

### 3. Update WDK Record Page Customization

**File**: `packages/libs/web-common/src/components/records/UserDatasetRecordClasses.UserDatasetRecordClass.jsx`

**Changes needed:**

- Import VDI helper functions and UserDatasetFiles component
- Add hook to fetch user dataset file listing in RecordHeading component
- Add conditional rendering for user dataset files section after metadata
- Ensure proper error handling and loading states

**Specific additions:**

```javascript
// New imports (add to existing imports section)
import Loading from '@veupathdb/wdk-client/lib/Components/Loading/Loading';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { wdkRecordIdToDiyUserDatasetId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';
import { isVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service';
import { UserDatasetFiles } from '@veupathdb/user-datasets/lib/Components/UserDatasetFiles';

// In RecordHeading function (after datasetID extraction)
let vdiDatasetId = wdkRecordIdToDiyUserDatasetId(datasetID);

// Fetch user dataset files
const userDatasetFilesResult = useWdkService(
  async (wdkService) => {
    if (!vdiDatasetId) {
      return { data: null, error: null };
    }

    if (!isVdiCompatibleWdkService(wdkService)) {
      return {
        data: null,
        error: 'VDI service is not configured. Unable to load dataset files.',
      };
    }

    try {
      const files = await wdkService.getUserDatasetFileListing(vdiDatasetId);
      return { data: files, error: null };
    } catch (error) {
      console.error('Failed to fetch user dataset files:', error);
      return {
        data: null,
        error: 'Failed to load dataset files. Please try again later.',
      };
    }
  },
  [vdiDatasetId]
);

// Add after the RecordOverview div (before closing the fragment)
{
  userDatasetFilesResult?.error ? (
    <div className="error-message" style={{ marginTop: '1.5em' }}>
      <h2>Data Files</h2>
      <p>{userDatasetFilesResult.error}</p>
    </div>
  ) : userDatasetFilesResult?.data ? (
    <div style={{ marginTop: '1.5em' }}>
      <UserDatasetFiles
        datasetId={vdiDatasetId}
        files={userDatasetFilesResult.data}
        installStatus="complete"
      />
    </div>
  ) : userDatasetFilesResult === undefined ? (
    <div style={{ marginTop: '1.5em' }}>
      <h2>Data Files</h2>
      <Loading />
    </div>
  ) : null;
}
```

**Component Integration:**

- The files section is added directly to the RecordHeading component
- It appears below the metadata section (Publication, Contact, ID, etc.)
- Uses the same error handling and loading pattern as the EDA Downloads component
- No backend table modification required - fetches data directly from VDI service

## Technical Details

### VDI API Integration

- **Dataset ID conversion**: WDK record ID (e.g., `EDAUD_xyz`) → VDI dataset ID (e.g., `xyz`)
- **File listing endpoint**: `GET /vdi-service/datasets/{datasetId}/files`
- **Download endpoint**: `GET /vdi-service/datasets/{datasetId}/files/{zipFileType}`
- **Authentication**: Uses WDK auth tokens (Auth-Key or Bearer token)

### Data Flow

1. Downloads component checks `isUserStudy` flag from `studyMetadata`
2. If true, extract VDI dataset ID from WDK record ID using `wdkRecordIdToDiyUserDatasetId()`
3. Call `wdkService.getUserDatasetFileListing(vdiDatasetId)` via `useWdkService` hook
4. Receive file listing with upload/install zip details
5. Pass data to UserDatasetFiles component as props
6. Component renders Mesa tables with download links
7. Downloads use `wdkService.getUserDatasetFiles(datasetId, zipType)` which triggers browser download

### File Listing Structure

```typescript
{
  upload?: {
    zipSize: number,
    contents: Array<{ fileName: string, fileSize: number }>
  },
  install?: {
    zipSize: number,
    contents: Array<{ fileName: string, fileSize: number }>
  }
}
```

### isUserStudy Flag Source

The `isUserStudy` flag comes from the permissions system:

- Fetched from Study Access API
- Available in `studyMetadata` via `useStudyMetadata()` hook
- Part of the permission entry for each dataset
- Indicates whether the study is a user-uploaded dataset vs internal/curated dataset

### ID Mapping

User datasets use a special ID format:

- **VDI dataset ID**: Plain UUID (e.g., `abc123def456`)
- **WDK record ID**: Prefixed format `EDAUD_{uuid}` (e.g., `EDAUD_abc123def456`)
- Helper functions in `diyDatasets.ts` handle conversion:
  - `isDiyWdkRecordId(id)` - checks if ID is a user dataset
  - `wdkRecordIdToDiyUserDatasetId(id)` - strips `EDAUD_` prefix
  - `diyUserDatasetIdToWdkRecordId(id)` - adds `EDAUD_` prefix

## Testing Considerations

### Test Cases

#### Route 1: EDA Downloads Page

1. **User dataset with files on EDA downloads page**

   - Navigate to user dataset EDA downloads page (`/app/workspace/analyses/EDAUD_*/new/download`)
   - Verify "Data Files" section appears after MySubset section
   - Verify uploaded files table displays correctly
   - Verify processed files table displays correctly
   - Test download functionality for both zip types

2. **Internal/curated dataset on EDA downloads page**
   - Navigate to internal dataset EDA downloads page
   - Verify "Data Files" section does NOT appear
   - Verify existing release files section still works

#### Route 2: WDK Record Page

3. **User dataset with files on WDK record page**
   - Navigate to user dataset record page (`/app/record/userdataset/EDAUD_*`)
   - Verify "Data Files" section appears after metadata section
   - Verify uploaded files table displays correctly
   - Verify processed files table displays correctly
   - Test download functionality for both zip types

#### Both Routes

4. **Empty file listings (both routes)**

   - Test with dataset that has no upload files
   - Test with dataset that has no install files
   - Verify graceful handling on both pages

5. **Large file listings (both routes)**

   - Test with dataset containing many files
   - Verify expand/collapse functionality works on both pages
   - Verify performance is acceptable

6. **Guest user access (both routes)**

   - Test as guest user on both EDA downloads and WDK record pages
   - Verify no access to user dataset files
   - Proper error handling

7. **Error handling - VDI service not configured (both routes)**

   - Test in environment where VDI service is not wrapped into wdkService
   - Verify user sees error message: "VDI service is not configured. Unable to load dataset files."
   - Verify no console errors or crashes on both pages

8. **Error handling - API failure (both routes)**

   - Mock VDI API to return 500 error
   - Verify user sees error message: "Failed to load dataset files. Please try again later."
   - Verify error is logged to console
   - Verify page remains functional on both pages

9. **Loading state (both routes)**
   - Simulate slow network
   - Verify Loading component displays while fetching
   - Verify smooth transition to content or error state

### Manual Testing URLs

**Route 1: EDA Downloads Page**

- User dataset EDA example: `https://clinepidb.org/ce/app/workspace/analyses/EDAUD_30bMNb4fDHX/new/download`
- Internal dataset EDA example: `https://clinepidb.org/ce/app/workspace/analyses/DS_123abc/new/download`

**Route 2: WDK Record Page**

- User dataset record example: `https://plasmodb.org/plasmo.beta/app/record/userdataset/EDAUD_45ILWccdqB`
- Can be accessed from user dataset listing or search results

## Files to Modify

### New Files

1. **`packages/libs/user-datasets/src/lib/Components/UserDatasetFiles.tsx`** (~150-200 lines)
   - New reusable component for displaying user dataset files
   - Contains Mesa table configuration, file rendering logic, download handlers

### Modified Files

1. **`packages/libs/eda/src/lib/workspace/DownloadTab/Downloads.tsx`** (~30 line additions)

   - Add imports for VDI utilities and component
   - Add hook to fetch file listing
   - Add conditional rendering of UserDatasetFiles component

2. **`packages/libs/web-common/src/components/records/UserDatasetRecordClasses.UserDatasetRecordClass.jsx`** (~50 line additions)
   - Add imports for VDI utilities and component
   - Add hook to fetch file listing in RecordHeading component
   - Add conditional rendering of UserDatasetFiles component after metadata section

## Dependencies

- No new external dependencies required
- Uses existing packages:
  - `@veupathdb/coreui` (Mesa component)
  - `@veupathdb/wdk-client` (WdkService)
  - `@veupathdb/user-datasets` (VDI utilities)

## Code Reuse Strategy

The new UserDatasetFiles component should be extracted from existing UserDatasetDetail code:

- Copy `renderFileSection()` method logic
- Copy `getFileTableColumns()` method
- Adapt to accept props instead of using `this.props`
- Make it a functional component using hooks
- Ensure it works in both contexts (user dataset detail page and EDA downloads page)

## Migration Notes

- This is a non-breaking change
- Only adds new functionality, doesn't modify existing behavior
- Internal/curated datasets are unaffected
- Existing user dataset detail page continues to work as before

## Future Enhancements

- Consider adding file metadata (upload date, modified date)
- Consider adding bulk download option for all files
- Consider showing file validation status
- Consider adding file preview functionality
