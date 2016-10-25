<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:fn="http://java.sun.com/jsp/jstl/functions"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
  <c:set var="question" value="${wdkModel.questionSetsMap['SampleQuestions'].questionsMap['MicrobiomeSampleByMetadata']}"/>

  <style>
    .workflow { margin: 1em 0; }
    .workflow tr > td { text-align: center; font-size: small; }
    .workflow tr > td:first-child { text-align: left; }
    .workflow tr > td:last-child { text-align: left; }
    .workflow img { height: 8vw; border: 1px solid #26689c; }
  </style>

  <div id="contentwrapper">
    <div id="contentcolumn">
      <div style="
        padding: 2em 3em;
        margin: 1em 4em;
        font-size: 130%;
        border: 1px solid #26689c;
        border-radius: 20px;
        min-height: 250px;
        display: inline-block;
        overflow: auto;
      ">
        <h1 style="
          text-align: left;
          color: #268f9c;
          font-family: helvetica neue;
          font-size: 2em;
          padding: 0;
          margin: 1rem 0;
        ">
          Welcome to MicrobiomeDB
        </h1>
        <div style="
          float: right;
          padding: 0 20px;
          position: relative;
          top: -3em;
        ">
          <imp:image src="images/18170.png" />
        </div>

        <div style="padding-right: 290px;">

          <div style="margin: 1em 0;">
            <div>
              <strong>MicrobiomeDB</strong> is a data mining website for interrogating microbiome expeirments.
            </div>
            <div style="font-size: small;">
              It currently houses <a href="/mbio/app/search/dataset/AllDatasets/result">nine datasets</a> with 13565 samples.
            </div>
          </div>

          <div style="margin: 2em 0;">
            On this site, you can:
            <table class="workflow">
              <tbody>
                <tr>
                  <td>
                    <imp:image src="images/MicrobiomeDB/filter_by_environment.png" />
                  </td>
                  <td style="vertical-align: middle; width: 30%;">
                    <i class="fa fa-long-arrow-right fa-5x" style="color: #26689c;"></i>
                  </td>
                  <td>
                    <imp:image src="images/MicrobiomeDB/analyze_abundance.png" />
                  </td>
                </tr>
                <td>
                  Use a series of filters to find samples of interest.
                  <strong><a title="Find Microbiomic Samples based on Host and Sample metadata." href="/mbio/showQuestion.do?questionFullName=SampleQuestions.MicrobiomeSampleByMetadata">Get started</a>!
                  </strong>
                </td>
                <td>
                  Then
                </td>
                <td>
                  Graphically analyze your set of samples.
                  <strong><a href="https://docs.google.com/document/u/1/d/1a_9lPf5lV0fTW1VcA48pGsnFAcwhMOWqCTQlyHEVoAQ/pub" target="_blank">Learn how</a></strong>.
                </td>
                <tr/>
              </tbody>
            </table>
          </div>
          <div style="margin: 1em 0; font-size: small;">
            Try one of these examples:
            <ul>
              <li>
                <a href="/mbio/im.do?s=daef3a35685875a1">
                  What is the impact of delivery mode on the infant gut microbiome in the first month of life?
                </a>
              </li>
              <li>
                <a href="/mbio/im.do?s=d7186967e70f3a95">
                  What is the influence of diet on establishment of the infant gut microbiome?
                </a>
              </li>
              <li>
                <a href="/mbio/im.do?s=12ff6d8cf07ba7a1">
                  To what extent is the microbial environment in a home influenced by its inhabitants?
                </a>
              </li>
              <li>
                <a href="/mbio/im.do?s=10b5c57c2e89bfaa">
                  Does having a dog influence the microbial environment in the home?
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

</jsp:root>
