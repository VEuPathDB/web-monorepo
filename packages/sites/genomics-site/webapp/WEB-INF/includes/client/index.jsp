<%@ page contentType="text/html; charset=utf8" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<imp:pageFrameFixed refer="betaApp">
  <style>
    body, h1, h2, h3, h4, h5, h6 {
      font-family: "Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif;
    }
    h1 {
      text-align: left;
      margin: 0;
      padding: 22px 0;
      font-size: 2.5em;
      font-weight: 300;
    }
    h2 {
      font-size: 1.8em;
      font-weight: 400;
      margin: 0;
      padding: 12px 0 8px 0;
    }
    h3 {
      margin: 0;
      padding: 22px 0 8px 0;
    }
    h4 {
      margin: 0;
      padding: 10px 0 8px 0;
    }

    #wdk-container {
      height: calc(100% - 132px);
      position: relative;
    }

    .wdk-RecordSection {
      padding-top: 32px;
      margin-top: -42px;
    }

    .eupathdb-ExpressionGraphContainer {
      overflow: auto;
      position: relative;
    }

    .eupathdb-ExpressionGraphLoading {
      position: absolute;
      top: 1em;
      left: 1em;
    }

    .eupathdb-ExpressionGraph {
      float: left;
    }

    .eupathdb-ExpressionGraphDetails {
      margin-left: 500px;
    }

    .wdk-RecordTable__ExpressionGraphs .wdk-DataTableCell.wdk-DataTableCell__eupathdb_release {
      width: 125px;;
    }

    .wdk-RecordTable__ExpressionGraphs .wdk-DataTableCell.wdk-DataTableCell__display_name {
      max-width: 300px;
    }

    .wdk-RecordTable__ExpressionGraphs .wdk-DataTableCell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      height: 1em;
    }

    .eupathdb-DatasetRecord {
      padding: 0 2em;
    }

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

    .eupathdb-DatasetRecord-GraphImg {
      width: 450px;
    }

    /*
    @media (min-width: 1175px) {
      .eupathdb-DatasetRecord {
        padding: 0 20px;
        max-width: 1350px;
        margin: auto;
      }
      .eupathdb-DatasetRecord-Main {
        float: left;
        max-width: 700px;
      }
      .eupathdb-DatasetRecord-Sidebar {
        max-width: 375px;
        float: right;
        font-size: 95%;
        color: #333333;
      }
      .eupathdb-DatasetRecord-Sidebar ul {
        padding-left: 0;
      }
      .eupathdb-DatasetRecord-Sidebar table {
        width: 100%;
      }
    }
    */

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
    .eupathdb-Beta-Announcement {
      float: right;
      font-style: italic;
      font-size: 1.2em;
      padding: 4px 0;
    }

    .eupathdb-TranscriptRecordNavigationSectionContainer h3 {
      padding-top: 18px;
    }

    .eupathdb-TranscriptRecordNavigationSectionContainer h3:first-child {
      padding-top: 10px;
    }

    .eupathdb-TranscriptListContainer {
      margin-bottom: 6px;
    }

    .eupathdb-TranscriptRecordNavList {
      list-style: none;
      padding: 0;
      margin: 0;
      font-weight: 300;
    }

    .eupathdb-TranscriptRecordNavList > li a {
      padding-left: 1em;
      position: relative;
      display: block;
    }
    .eupathdb-TranscriptRecordNavList > li a:hover,
    .eupathdb-TranscriptRecordNavList > li a.active {
      font-weight: 400;
    }
    .eupathdb-TranscriptRecordNavList > li a:hover:before,
    .eupathdb-TranscriptRecordNavList > li a.active:before {
      font-family: FontAwesome;
      opacity: 0.8;
      position: absolute;
      left: -2px;
      content: '\f178 ';
    }
    .eupathdb-TranscriptSticky {
      background: white;
      padding-top: 1em;
    }
    .eupathdb-TranscriptSticky-fixed {
      z-index: 1;
      border-color: #999;
      position: fixed;
      top: 0;
      width: calc(100vw - 366px);
    }
    #wdk-container .eupathdb-TranscriptHeading {
      float: left;
      margin: 0;
      padding: 0;
      padding-right: 1em;
    }
    .eupathdb-TranscriptTabList {
      border-bottom: 1px solid #aaa;
    }
    .eupathdb-TranscriptTabList:before,
    .eupathdb-TranscriptTabList:after {
      content: "";
      display: table;
      border-collapse: collapse;
    }
    .eupathdb-TranscriptTabList:after {
      clear: both;
    }
    .eupathdb-TranscriptLink {
      display: block;
      float: left;
      padding: .8em;
      font-size: 1.3em;
      font-weight: 400;
      border: 1px solid transparent;
      border-bottom: none;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      margin-right: 2px;
      margin-bottom: -1px;
    }
    .eupathdb-TranscriptLink:hover,
    .eupathdb-TranscriptLink:focus {
      background-color: #ccc;
      z-index: 1;
    }
    .eupathdb-TranscriptLink-active,
    .eupathdb-TranscriptLink-active:hover,
    .eupathdb-TranscriptLink-active:focus {
      background-color: white;
      border-color: #aaa;
    }
    .eupathdb-TranscriptTabContent {
      border: 1px solid #aaa;
      border-top: none;
      padding: 8px;
    }
  </style>

  <!-- We will pass this to WDK as the root element within which the client will render HTML -->
  <div id="wdk-container"><jsp:text/></div>

  <!-- `getApiClientConfig` is created in the global scope, so we can call this
       from other JavaScript code where we initialize the WDK client
       (see wdkCustomization/js/application.js) -->
  <script>
    function getApiClientConfig() {
      return {
        rootUrl: "${pageContext.request.contextPath}/app/",
        endpoint: "${pageContext.request.contextPath}/service",
        rootElement: document.getElementById("wdk-container"),
        // Use an immediately-invoked function expression in case ${model} is empty
        // to prevent a syntax error.
        initialData: (function(initialData) { return initialData; }(${model}))
      };
    }
  </script>
  <imp:script src="wdk/js/wdk.client.js"/>
  <imp:script src="wdkCustomization/js/application.bundle.js"/>
</imp:pageFrameFixed>
