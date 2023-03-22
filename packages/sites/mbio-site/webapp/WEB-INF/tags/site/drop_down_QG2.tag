<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="rootCategoriesMap" value="${applicationScope.wdkModel.websiteRootCategories}"/>

<ul>
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
</ul>
