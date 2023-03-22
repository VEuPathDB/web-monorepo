<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:fn="http://java.sun.com/jsp/jstl/functions"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <c:set var="baseUrl" value="${pageContext.request.contextPath}"/>
  <c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
  <c:set var="question" value="${wdkModel.questionSetsMap['SampleQuestions'].questionsMap['MicrobiomeSampleByMetadata']}"/>
  <c:set var="helpUrl" value="https://docs.google.com/document/u/1/d/1a_9lPf5lV0fTW1VcA48pGsnFAcwhMOWqCTQlyHEVoAQ/pub"/>
  <c:set var="getStartedUrl" value="${baseUrl}/showQuestion.do?questionFullName=SampleQuestions.MicrobiomeSampleByMetadata"/>

  <style>
    .workflow { margin: 2em 0; }
    .workflow tr > td { text-align: center; }
    .workflow tr > td:first-child { text-align: left; }
    .workflow tr > td:last-child { text-align: left; width: 155px; }
    .workflow img { height: 8vw; border: 1px solid #26689c; }
  </style>

  <imp:sidebar/>

  <div style="
    padding: 2em 0 3em 2em;
    margin: 0 0 0 16em;
    font-size: 130%;
    border: 1px solid #26689c;
    border-radius: 20px;
    min-height: 250px;
    overflow: auto;
  ">
    <h1 style="
      text-align: left;
      color: #268f9c;
      font-family: helvetica neue;
      font-size: 2em;
      padding: 0;
    ">
      Welcome to MicrobiomeDB
    </h1>
    <div style="
      float: right;
      position: relative;
      top: -3em;
    ">
      <imp:image src="images/18170.png" />
    </div>

    <div style="padding-right: 255px;">
      <div style="margin: 1em 0;">
        <p>
          <strong>MicrobiomeDB</strong> provides a web-based data-mining platform for interrogating microbiome experiments.
        </p>
        <p>
          This resource currently houses 13565 samples, from <a href="${baseUrl}/app/search/dataset/AllDatasets/result"><b>9 data sets</b></a>.
        </p>
      </div>

      <div style="margin: 2em 0;">
      <b>On this site, you can:</b> 
        <table class="workflow">
          <tbody>
            <tr>
              <td width="30%">
                <a title="${question.description}" href="${getStartedUrl}">
                  <imp:image src="images/MicrobiomeDB/filter_by_environment.png" />
                </a>
              </td>
              <td style="vertical-align: middle; width: 7em;">
                <i class="fa fa-long-arrow-right fa-4x" style="color: #26689c;"></i>
              </td>
              <td>
                <a title="Learn how" href="${helpUrl}" target="_blank">
                  <imp:image src="images/MicrobiomeDB/analyze_abundance.png" />
                </a>
              </td>
            </tr>
            <td>
              <b>Identify samples of interest to you, filtering as desired,</b>
            </td>
            <td>
              ... then ...
            </td>
            <td>
             <b>graphically analyze your selected samples.</b>
            </td>
            <tr/>
          </tbody>
        </table>
        <a style="font-weight:bold" title="${question.description}" href="${getStartedUrl}">Get started</a> right away ...  or ... <a style="font-weight:bold" href="${helpUrl}" target="_blank">Learn how</a> (tutorial).
      </div>


      <div>
        <p><b>... or try one of these example searches:</b></p>
        <ul>
          <li>
            <a href="${baseUrl}/im.do?s=a633d9e350dd39ca">Which sites show the lowest alpha diversity across the human body?
            </a>
          </li>
          <li>
            <a href="${baseUrl}/im.do?s=df1de7c256128d62">How does community composition in the gut change with age?
            </a>
          </li>
          <li>
            <a href="${baseUrl}/im.do?s=999c590e0b19b4ca">How does the region of 16S sequenced influence composition of the skin microbiome?
            </a>
          </li>
          <li>
            <a href="${baseUrl}/im.do?s=740aadd817540719">How do the oral communities of dogs and humans differ?
            </a>
          </li>
          <li>
            <a href="${baseUrl}/im.do?s=2b12c0907798ed74">What is the impact of delivery mode and diet on the infant gut microbiome?
            </a>
          </li>
        </ul>
      </div>

    </div>
  </div>

</jsp:root>
