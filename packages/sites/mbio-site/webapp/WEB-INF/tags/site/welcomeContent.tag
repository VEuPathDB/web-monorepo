<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:fn="http://java.sun.com/jsp/jstl/functions"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

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
            <strong>MicrobiomeDB</strong> is a data mining website for microbiomic samples.
          </p>

          <p>You can interrogate microbiomic samples by:</p>

          <ul class="fa-ul">
            <c:forEach items="${wdkModel.questionSetsMap['SampleQuestions'].questions}" var="question">
              <c:set
                var="iconClass"
                value="${fn:containsIgnoreCase(question.displayName, 'metadata') ? 'fa-sitemap' : 'fa-barcode'}"
              />
              <li style="margin: .5em 0;">
                <a
                  href="${pageContext.request.contextPath}/showQuestion.do?questionFullName=${question.fullName}"
                  title="${question.summary}"
                >
                  <i class="fa-li fa ${iconClass}"><jsp:text/></i>
                  ${question.displayName}
                </a>
              </li>
            </c:forEach>
          </ul>
        </div>
      </div>
    </div>
  </div>

</jsp:root>
