# EDA Workspace Core

Exploratory Data Analysis Workspace Core

## Overview

This module contains React utilities that can be used by a React application that uses the EDA Workspace Service. We plan to power both the *EDA Workspace Application* and the *MapVEu Application* with this module.

## Description

The concept of an _Exploratory Data Analysis Workspace_ is that, for a given study, a person can browse the data collected for that study, and explore relationships therewithin. Study data is broken out into _variables_ which are categorized according to an ontology and accessed by entity type (e.g., participant, observation, etc.).

The two primiary domain objects of the _EDA Workspace_ are _Study_ and _Session_. A _Study_ represents a structured collection of data. A _Session_ is a configuration of a subset of that data, and a collection of visualizations for that subset.

## Types

The primary types in use by the **EDA Workspace** are:

* `StudyRecordClass` - The WDK `RecordClass` of a **study**.
* `StudyRecord` - The WDK `RecordInstance` of a **study**.
* `StudyMetadata` - The EDA record containing information about entity types, and their variables, collected by the study.
* `Session` - The persisted configuration of an EDA Workspace session. This includes subsetting details and condfiguration of visualizations.

## Usage

The following exports can be used to implement an EDA Workspace client:

* `EDAWorkspaceContainer` - A React Component that loads the above types.
* `useSession` - A React hook that can be used to access and interact with the current state of the workspace session.
* `useStudy` - A React hook that can be used to access the study record types defined above.
