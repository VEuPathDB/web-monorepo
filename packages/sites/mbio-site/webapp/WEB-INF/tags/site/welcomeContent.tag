<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<div id="contentwrapper">
  <div id="contentcolumn">
    <div style="margin:2em;font-size:130%">
      <p>
        <strong>MicrobiomeDB</strong> is a data mining website that provides
        tools for querying microbiomic samples. Microbiomic samples can be
        interrogated in the following ways:
      </p>
      <ul>
        <c:forEach items="${wdkModel.questionSetsMap['SampleQuestions'].questions}" var="question">
          <li>
            <a href="${pageContext.request.contextPath}/showQuestion.do?questionFullName=${question.fullName}">
              ${question.displayName}
            </a> - ${question.description}
          </li>
        </c:forEach>
      </ul>
    </div>
  </div>
</div>
