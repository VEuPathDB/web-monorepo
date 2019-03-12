<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ attribute name="question"
              required="true"
              type="org.gusdb.wdk.model.question.Question"
              description="The Question"
%>
<div class="analysis-menu-tab-pane">
        <h3>Analyze all study ${question.recordClass.displayName}s (with the option to stratify on your selected ${question.recordClass.displayName} results) with a tool below.</h3>
        <div class="analysis-selector-container">
          <c:forEach items="${question.stepAnalyses}" var="analysisEntry">
            <c:set var="analysis" value="${analysisEntry.value}"/>
            <imp:stepAnalysisTile analysis="${analysis}" recordClassName="${question.recordClass.fullName}" />
          </c:forEach>
        </div>
</div>
