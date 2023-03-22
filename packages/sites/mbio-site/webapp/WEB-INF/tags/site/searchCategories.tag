<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
  xmlns:jsp="http://java.sun.com/JSP/Page"
  xmlns:c="http://java.sun.com/jsp/jstl/core"
  xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">

  <jsp:directive.attribute name="refer" required="false"
    description="Page calling this tag"/>

  <c:set var="rootCategoriesMap" value="${applicationScope.wdkModel.websiteRootCategories}"/>

  <c:forEach items="${rootCategoriesMap}" var="rootCategoryEntry">
    <!-- [DEBUG] rootCategoryEntry.key: ${rootCategoryEntry.key} -->
    <c:forEach items="${rootCategoryEntry.value.websiteChildren}" var="childEntry">
      <c:forEach items="${childEntry.value.websiteQuestions}" var="question">
        <!-- [DEBUG] question.name: ${question.name} -->
        <li>
          <a
            title="${question.summary}"
            href="${pageContext.request.contextPath}/showQuestion.do?questionFullName=${question.fullName}"
            >${question.displayName}</a>
        </li>
      </c:forEach>
    </c:forEach>
  </c:forEach>

</jsp:root>
