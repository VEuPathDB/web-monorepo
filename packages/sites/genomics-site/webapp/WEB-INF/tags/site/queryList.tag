<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="questions"
              required="true"
              description="list of question full names"
%>
<%@ attribute name="prependDisplayName"
              required="false"
              description="Automatically prepended to display name of question"
%>
<%@ attribute name="prevQuestions"
              required="false"
              description="Automatically prepended to display name of question"
%>

      <c:set var="questionFullNamesArray" value="${fn:split(questions, ',')}" />

      <c:if test="${fn:length(questionFullNamesArray) == 1}">
        <jsp:forward page="/showQuestion.do?questionFullName=${questionFullNamesArray[0]}"/>
      </c:if>

      <c:if test="${prevQuestions == null}">
	<c:set var="prevQuestions" value="0"/>
      </c:if>


      <c:forEach items="${questionFullNamesArray}" var="qFullName">
        <c:set var="i" value="${i+1}"/>
        <c:set var="questionFullNameArray" 
               value="${fn:split(qFullName, '.')}" />
        <c:set var="qSetName" value="${questionFullNameArray[0]}"/>
        <c:set var="qName" value="${questionFullNameArray[1]}"/>
        <c:set var="qSet" value="${wdkModel.questionSetsMap[qSetName]}"/>
        <c:set var="q" value="${qSet.questionsMap[qName]}"/>
        <c:choose>
          <c:when test="${(i+prevQuestions) % 2 == 1}"><tr class="rowLight"></c:when>
          <c:otherwise><tr class="rowMedium"></c:otherwise>
        </c:choose>
  
        <td colspan="3">
            <a href="<c:url value="/showQuestion.do?questionFullName=${q.fullName}"/>">
            <font color="#000066"><b>${prependDisplayName}${q.displayName}</b></font></a>
        </td>
        <td>
            <c:choose>
              <c:when test="${q.summary != null}">
                <c:set var="desc" value="${q.summary}"/>
              </c:when>
              <c:otherwise>
                <c:set var="desc" value="${q.description}"/>
                <c:if test="${fn:length(desc) > 163}">
                  <c:set var="desc" value="${fn:substring(desc, 0, 160)}..."/>
                </c:if>
              </c:otherwise>
            </c:choose>
            ${desc}
        </td>
        </tr>
      </c:forEach> <%-- forEach items=questions --%>
