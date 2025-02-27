# Architecture

> [!NOTE]
> This document is intended to be prescriptive, and any deviation from
> implementation should be treated as a bug in the implementation. That is not
> to say that this document will not contain any errors. Please use your best
> judgement, when encountering any said deviations!

This document is intended to provide an architectural overview of the
single-page applications that this repository produces. The goal is to
familiarize the reader with the code base, and how various packages and
dependencies come together to in a final product.

Efforts will be made to be general, providing specific examples as warranted
Generally speaking, specific examples should be avoided when possible, since
they can deviate from what is described in this document.

## Single-page Application

This repository produces the javascript and css code that is use by all
VEuPathDB websites: genomics-site, clinepi-site, mbio-site, and ortho-site. All
of these sites follow the same architecture, which is based on the React
library.

In order to use the code in a website, the top-level javascript file and css
file must be included on a web page. Because the application is a single-page
application, routing is done client-side. It is standard practice to serve the
html for the web page in such a way that requests for URLs that start with a
specific path are all routed to the HTML file. The javascript code will
dynamically determine what to display on the screen, based on the URL.

For example, you might have an Apache mod_rewrite rule that looks like this:

```
RewriteEngine On
RewriteBase "/app"
RewriteRule "." "/index.html" [L]
```

This rule tells the Apache web server to serve the file `index.html` for _any_
URL that starts with `/app`. This makes it possible to link to a subpage of the
website, and have the browser load the "skeleton" html defined in `index.html`,
which will then load the javascript and css code.

When running a local dev site (using a command like `yarn nx start @veupathdb/genomics-site`), a local webpack-dev server starts up and does
something similar, in terms of routing.

## Layering

VEuPathDB websites use a layering approach to enable customizations on a
per-website basis. The base layer provides a basic set of functionality, and
initializes the single-page application; it also provides hooks for adding
additional features and customizations. Each subsequent layer can expose
additional hooks that enable further customizations.

The base layer is the `wdk-client` package, which provides the core
implementation of the single-page application. This includes routing via
react-router, state management via redux and rxjs, and a collection of features,
such as wdk strategies and record pages, and core styling. An `initialize`
function is exposed as a top-level export. The function takes many options that
are used to initialize the single-page application, including things like the
base URL, the root DOM node to render, the URL for the WDK REST service, etc. It
also provides some hooks for adding additional features and customizations, such
as wrapping components, extending the WdkService module, adding addition slots
to the redux store, adding additional routes, etc.

The second layer is the `web-common` package. It exposes its own `initialize`
function, which ultimately calls the `wdk-client` `initialize` function. The
`web-common` package handles some business logic that is specific to our
websites and various staging environments, provides more styling rules, and adds
additional features and utilities.

The final layer is the `*-site` package. This is where the final set of
customizations and features are added to the single-page application. This
typically includes things related to specific record types or business logic
that may vary between sites.

Modules from other packages in `packages/libs` can be included in any of these
layers. This includes larger features, such as `eda` and `user-datasets`, and
small and medium sized libraries, such as `http-utils` or `components`.

> [!NOTE]
> Both `wdk-client` and `web-common` also contain utilities and components that
> may be imported and used by other layers. In that sense, these packages also
> serve as libraries. In a perfect world, with infinite time, these pieces would
> extracted into their own packages, to minimize confusion. But, alas, the world
> is not perfect, and time remains finite... wait... that can't be right...

## Routing

Client side routing is handled by the library [react-router
v5](https://v5.reactrouter.com/). The library is configured in the `Root.tsx`
component in `packages/lib/wdk-client`. It takes an array of `RouteEntry`
objects, which can be extended by each "layer" (see section
[layering](#layering) above). This array constitutes the "top-level routes" of
the application. Each `RouteEntry` will declare what route path it matches, and
what component to render when it's path is matched. When the URL of the page is
updated, the router will look for the _first_ route that matches the path, and
use that to render content on the screen. A `RouteEntry` can declare other
options, such as if login is required.

In addition to the array of `RouteEntry` objects, the router also takes a
`History` object, which is configured to prepend a path to all routes. In
practice, this is `{tomcatWebappUrl}/app`. So, for example, `/plasmo/app`.

## Controller and View Components

A `RouteEntry` will typically reference a "Controller" component. In other parts
of the React ecosystem, these are referred to as "smart" or "container"
components. The basic idea is that these are top-level components that are aware
of application-level libraries, such as redux, react-router, etc. They know how
to take a set of props, translate that into requests for data (e.g., from a
back end service, from a redux store, etc.).

Some examples of Controller components are:

- `RecordController`
- `QuestionController`

In contrast, "View" components should not make assumptions about where its data
is coming from, nor how it is persisted. They primarily encapsulate a collection
of components used for a particular feature, such as a Record page or a Question
page.

> [!NOTE]
> Use of the "Controller" suffix is not consistent. For example, the components
> used for EDA routes do not include the suffix "Controller". The idea was to
> distinguish these components from those that use redux. In hindsight, it may
> only lead to confusion. If one gets lost, it is probably a good idea to start
> by finding the `RouteEntry` for the page you are working on, and go from
> there. The browser dev tools is also a great way to figure out where things
> are.

## Redux and RxJS

TODO
