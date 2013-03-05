<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="question"
              required="true"
              type="org.gusdb.wdk.model.jspwrap.QuestionBean"
              description="The question to be rendered"
%>
<%@ attribute name="refer" 
 			  type="java.lang.String"
			  required="false" 
			  description="Page calling this tag"
%>

<c:choose>
	<c:when test="${refer == 'questionPage'}">
		<c:set var="beta-icon" value="<c:url value='/wdk/images/beta2-40.png'/>" />
  </c:when>
  <c:otherwise>
		<c:set var="beta-icon" value="<c:url value='/wdk/images/beta2-30.png'/>" />
  </c:otherwise>
</c:choose>


<c:choose>

	<c:when test="${fn:containsIgnoreCase(question.questionSetName,'PathwayQuestions') || fn:containsIgnoreCase(question.questionSetName,'CompoundQuestions')}">
		<c:choose>
		<c:when test="${refer == 'questionPage'}">
 			<img alt="Beta feature icon" title="This search is new and under revision, please provide feedback using the Contact Us link on the top header." src="<c:url value='/wdk/images/beta2-40.png'/>" />
 		</c:when>
  	<c:otherwise>
			<img alt="Beta feature icon" title="This search is new and under revision, please provide feedback using the Contact Us link on the top header." src="<c:url value='/wdk/images/beta2-30.png'/>" />
  	</c:otherwise>
		</c:choose>
	</c:when>

	<c:otherwise>
		<c:choose>
  		<c:when test="${question.new}">
    		<img alt="New feature icon" title="This is a new search!" 
        	src="<c:url value='/wdk/images/new-feature.png' />" />
  		</c:when>
  		<c:when test="${question.revised}">
    		<img alt="Revised feature icon" title="This search has been revised. Changes might include new or changed parameters, upgrades to the underlying search logic, or new or updated data." 
         	src="<c:url value='/wdk/images/revised-small.png' />" />
  		</c:when>
		</c:choose>
	</c:otherwise>

</c:choose>

