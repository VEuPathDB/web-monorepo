# EDA Workspace Core

Exploratory Data Analysis Workspace Core

## Overview

This module contains React utilities that can be used by a React application that uses the EDA Workspace Service. We plan to power both the *EDA Workspace Application* and the *MapVEu Application* with this module.

## Description

The concept of an _Exploratory Data Analysis Workspace_ is that, for a given study, a person can browse the data collected for that study, and explore relationships therewithin. Study data is broken out into _variables_ which are categorized according to an ontology and accessed by entity type (e.g., participant, observation, etc.).

The two primiary domain objects of the _EDA Workspace_ are _Study_ and _Analysis_. A _Study_ represents a structured collection of data. An _Analysis_ is a configuration of a subset of that data, and a collection of visualizations for that subset.
