<%@ page contentType="text/html; charset=utf8" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<imp:pageFrame>
  <imp:stylesheet rel="stylesheet" href="wdk/css/wdk3.css"/>
  <style>
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
        recordComponentResolver: recordComponentResolver
      });

      function recordComponentResolver(recordClassName, DefaultComponent) {
        switch (recordClassName) {
          case "DatasetRecordClasses.DatasetRecordClass": return eupathdb.records.DatasetRecord;
          default: return DefaultComponent;
        }
      }
    }());
  </script>
</imp:pageFrame>
