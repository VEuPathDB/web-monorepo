# EDA Workspace Core

Exploratory Data Analysis Workspace Core

## Overview

This module contains React utilities that can be used by a React application that uses the EDA Workspace Service. We plan to power both the _EDA Workspace Application_ and the _MapVEu Application_ with this module.

## Description

The concept of an _Exploratory Data Analysis Workspace_ is that, for a given study, a person can browse the data collected for that study, and explore relationships therewithin. Study data is broken out into _variables_ which are categorized according to an ontology and accessed by entity type (e.g., participant, observation, etc.).

The two primiary domain objects of the _EDA Workspace_ are _Study_ and _Session_. A _Study_ represents a structured collection of data. A _Session_ is a configuration of a subset of that data, and a collection of visualizations for that subset.

## Types

The primary types in use by the **EDA Workspace** are:

- `StudyRecordClass` - The WDK `RecordClass` of a **study**.
- `StudyRecord` - The WDK `RecordInstance` of a **study**.
- `StudyMetadata` - The EDA record containing information about entity types, and their variables, collected by the study.
- `Session` - The persisted configuration of an EDA Workspace session. This includes subsetting details and condfiguration of visualizations.

## Session Management

TODO - Describe session management once fully implemented.

## Usage

The following exports can be used to implement an EDA Workspace client.

### Components

- **`EDAWorkspaceContainer`** - Initializes the EDA Workspace by loading the above types and preparing the context value used by hooks. This component must be rendered as a root element of your workspace.
- **`VariableLink`** - Renders a `Link` that will navigate to the variable route of your workspace.

### Hooks

All hooks can only be used in a component that is used as a descendant of `EDAWorkspaceContainer`.

- **`useSession`** - Get and interact with the current state of the workspace session.
- **`useStudyRecordClass`** - Get the active study record class.
- **`useStudyRecord`** - Get the active study record instance.
- **`useStudyMetadata`** - Get the active study metadata.
- **`useSubsettingClient`** - Get the configured subsetting client.
- **`useSessionClient`** - Get the configured session client.
