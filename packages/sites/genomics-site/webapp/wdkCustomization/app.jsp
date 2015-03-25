<%@ page contentType="text/html; charset=utf8" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<imp:pageFrame>
  <style>
    .eupathdb-DatasetRecord h2,
    .eupathdb-DatasetRecord h3 {
      margin: 22px 0 11px;
      color: #333333;
      font-family: Arial, Helvetica, sans-serif;
    }
    .eupathdb-DatasetRecord-summary {
      font-size: 1.2em;
    }
    .eupathdb-DatasetRecord ul {
      line-height: 1.6;
      list-style: none;
      padding-left: 1em;
      margin: 0;
    }
    .eupathdb-DatasetRecord-title {
      color: black;
    }
    .eupathdb-DatasetRecord-headerTable tr th {
      white-space: nowrap;
      padding-right: 1em;
      vertical-align: top;
      text-align: right;
      border: none;
    }

    @media (min-width: 1150px) {
      .eupathdb-DatasetRecord-GraphMeta {
        width: 58%;
        float: right;
      }
      .eupathdb-DatasetRecord-GraphData {
        width: 450px;
      }
    }
    @media (min-width: 1300px) {
      .eupathdb-DatasetRecord-GraphMeta {
        width: 65%;
      }
    }
  </style>
  <main></main>
  <imp:script src="wdk/js/wdk-3.0.js"/>
  <imp:script src="wdkCustomization/js/records/DatasetRecordClasses.DatasetRecordClass.js"/>
  <script>
    (function() {
      Wdk.createApplication({
        baseUrl: '${pageContext.request.contextPath}/app',
        serviceUrl: '${pageContext.request.contextPath}/service',
        rootElement: document.getElementsByTagName('main')[0],
        recordComponentResolver: recordComponentResolver,
        cellRendererResolver: cellRendererResolver
      });

      // This is called when rendering the record page. `DefaultComponent` is
      // passed as a child to the component returned by this function. This
      // makes it possible to decorate the default component, or to replace it.
      function recordComponentResolver(recordClassName, DefaultComponent) {
        switch (recordClassName) {
          case "DatasetRecordClasses.DatasetRecordClass":
            return eupathdb.records.DatasetRecord;
          default:
            return DefaultComponent;
        }
      }

      // This is called when rendering a table cell. `defaultRenderer` is passed
      // as an argument to the function returned by this function. This makes it
      // possible to decorate the default renderer, or to replace it.
      function cellRendererResolver(recordClassName, defaultRenderer) {
        switch (recordClassName) {
          case "DatasetRecordClasses.DatasetRecordClass":
            return eupathdb.records.datasetCellRenderer;
          default:
            return defaultRenderer;
        }
      }
    }());
  </script>
</imp:pageFrame>
