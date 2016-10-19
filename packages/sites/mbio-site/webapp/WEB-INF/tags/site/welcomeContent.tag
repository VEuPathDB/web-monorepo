<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:fn="http://java.sun.com/jsp/jstl/functions"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
  <c:set var="question" value="${wdkModel.questionSetsMap['SampleQuestions'].questionsMap['MicrobiomeSampleByMetadata']}"/>

  <div id="contentwrapper">
    <div id="contentcolumn">
      <div style="
        padding: 2em 3em;
        margin: 1em 4em;
        font-size: 130%;
        border: 1px
        solid #26689c;
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
          <imp:image src="images/18170.png"/>
        </div>
        <div style="padding-right: 290px;">
          <p>
            <strong>MicrobiomeDB</strong> is a data mining website for interrogating microbiome expeirments.
          </p>

          <p>To begin, please select samples based on
            <a href="${pageContext.request.contextPath}/showQuestion.do?questionFullName=${question.fullName}"
              title="${question.summary}"><i class="fa fa-sitemap"><jsp:text/></i> ${question.displayName}</a>.
          </p>
          <p>
            Or try one of these canned searches:
            <ul>
              <li>
                <a href="${pageContext.request.contextPath}/im.do?s=daef3a35685875a1">
                  What is the impact of delivery mode on the infant gut microbiome in the first month of life?
                </a>
              </li>
              <li>
                <a href="${pageContext.request.contextPath}/im.do?s=d7186967e70f3a95">
                  What is the influence of diet on establishment of the infant gut microbiome?
                </a>
              </li>
              <li>
                <a href="${pageContext.request.contextPath}/im.do?s=12ff6d8cf07ba7a1">
                  To what extent is the microbial environment in a home influenced by its inhabitants?
                </a>
              </li>
              <li>
                <a href="${pageContext.request.contextPath}/im.do?s=10b5c57c2e89bfaa">
                  Does having a dog influence the microbial environment in the home?
                </a>
              </li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  </div>

</jsp:root>
