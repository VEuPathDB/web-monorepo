<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

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
    ">
      <h2 style="color: #268f9c; font-weight: 500; font-family: helvetica neue;">
        Welcome to MicrobiomeDB
      </h2>
      <p>
        <strong>MicrobiomeDB</strong> is a data mining website for microbiomic samples.
      </p>

      <p>You can interrogate microbiomic samples by:</p>

      <ul>
        <c:forEach items="${wdkModel.questionSetsMap['SampleQuestions'].questions}" var="question">
          <li>
            <a href="${pageContext.request.contextPath}/showQuestion.do?questionFullName=${question.fullName}">
              ${question.displayName}
            </a>
          </li>
        </c:forEach>
      </ul>
    </div>
  </div>
</div>
