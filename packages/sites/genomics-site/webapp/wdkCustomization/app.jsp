<%@ page contentType="text/html; charset=utf8" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<imp:pageFrame refer="betaApp">
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
      position: absolute;
      top: 136px;
      right: 0;
      z-index: 1;
      padding: 0 2em;
      display: inline-block;
      font-style: italic;
      font-size: 1.2em;
    }
  </style>

  <div class="eupathdb-Beta-Announcement" title="BETA means pre-release; a beta page is given out to a large group of users to try under real conditions. Beta versions have gone through alpha testing inhouse and are generally fairly close in look, feel and function to the final product; however, design changes often occur as a result.">
    <p>
      <%-- <i class="fa fa-lg fa-exclamation-circle" style="color: rgb(25, 89, 200);"></i> --%>
      You are viewing a <strong>BETA</strong> page.
      <a data-name="contact_us" class="new-window" href="contact.do">Feedback and comments</a>
      are welcome!
    </p>
  </div>

  <main
    data-baseUrl="${pageContext.request.contextPath}/app"
    data-serviceUrl="${pageContext.request.contextPath}/service"
  ></main>

  <imp:script src="wdk/js/wdk.flux.js"/>
  <imp:script src="wdkCustomization/js/application.bundle.js"/>
</imp:pageFrame>
