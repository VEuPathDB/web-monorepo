# Overview

This repository houses React Components that produce plots. These will be used
as building blocks for data visualizations. The plots use
[React Plotly.js](https://plotly.com/javascript/react) to draw the plots.
[Storybook](https://storybook.js.org/) is used as a development aide in creating
test cases for different plots, and for showcasing plot features.

# Steps for Development

First, you must have [Node.js](https://nodejs.org) and
[Yarn](https://classic.yarnpkg.com) installed on your development environment.
Follow the installation instructions on their websites if needed.

Next, clone this repository:

    git clone git@github.com:VEuPathDB/plot-components.git

Once the above command has completed, change to the new directory location and
install the yarn dependencies:

    yarn install

At this point, you are ready to run the development server and start updating or
adding code.

To run the development server, run the following command:

    yarn storybook

This will compile the code and start a local web server. In most settings, it
will also open a new tab in your default web browser pointing to the local web
server. This process will continue to run until you stop it. On most unix-like
machines, you can stop it by pressing `CTRL-C` in the terminal window where you
typed the above command.

Now, when you update or add code, the above process will recompile the code, and
the web page will reload automatically. Any errors you encounter will be
displayed in the terminal window where you typed the above command. In some
cases, errors will also appear in the webpage.

# Contributing

When contributing to this repository, you must first create a branch for the
feature or bugfix you are working on, and create a [pull
request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests)
when you are ready to merge your branch into the main branch.
