# Website Features

This document aims to provide an overview of website features, and where to find
the code for those features. Many have dedicated packages, but some do not.

## WDK Strategies

- Entry points:
  - [StrategyWorkspaceController](packages/libs/wdk-client/src/Controllers/StrategyWorkspaceController.tsx)
  - [StrategyViewController](packages/libs/wdk-client/src/Controllers/StrategyViewController.tsx)
  - [StrategyPanelController](packages/libs/wdk-client/src/Controllers/StrategyPanelController.tsx)

## WDK Questions

- Entry points:
  - [QuestionController](packages/libs/wdk-client/src/Controllers/QuestionController.tsx)

## WDK Records

- Entry points:
  - [RecordController](packages/libs/wdk-client/src/Controllers/RecordController.tsx)

## WDK Basket

- Entry points:
  - [BasketController](packages/libs/wdk-client/src/Controllers/BasketController.tsx)
  - [BasketPaneController](packages/libs/wdk-client/src/Controllers/BasketPaneController.tsx)

## WDK Favorites

- Entry points:
  - [FavoritesController](packages/libs/wdk-client/src/Controllers/FavoritesController.tsx)

## Site Search

- Entry points:
  - [SiteSearchController](packages/libs/web-common/src/controllers/SiteSearchController.tsx)

## User Datasets

- Entry points:
  - [UserDatasetRouter](packages/libs/user-datasets/src/lib/Controllers/UserDatasetRouter.tsx)

## EDA Workspace

- Entry points:
  - [WorkspaceRouter](packages/libs/eda/src/lib/workspace/WorkspaceRouter.tsx)

## EDA Map

- Entry points:
  - [MapVeuContainer](packages/libs/eda/src/lib/map/MapVeuContainer.tsx)

## Dataset Access Management Dashboard (aka, Study Access Management Dashboard)

- Entry points:
  - [StudyAccessController](packages/libs/study-data-access/src/study-access/components/StudyAccessController.tsx)

## Dataset Access Restrictions

- Entry points:
  - [DataRestrictionDaemon](packages/libs/study-data-access/src/data-restriction/DataRestrictionDaemon.jsx)

## Multi BLAST / Diamond BLAST

- Entry points:
  - [BlastWorkspaceRouter](packages/libs/multi-blast/src/lib/controllers/BlastWorkspaceRouter.tsx)

## Sequence Retrieval

- Entry points:
  - [FastaConfigController](packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/controllers/FastaConfigController.tsx)
