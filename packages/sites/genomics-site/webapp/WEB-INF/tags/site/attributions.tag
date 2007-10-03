<%-- 

display the attributions.

--%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<%@ attribute name="caption"
              required="true"
              description="the caption for the attribution section"
%>

<%@ attribute name="attributions"
              required="true"
              type="java.lang.String[]"
              description="an array of attribution objects"
%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="xqSet" value="${wdkModel.xmlQuestionSetsMap['XmlQuestions']}"/>
<c:set var="dataSourcesQuestion" value="${xqSet.questionsMap['DataSources']}"/>
<c:set var="dsRecords" value="${dataSourcesQuestion.fullAnswer.recordInstanceMap}"/>

<c:set var="attributionKey" value="" />
<c:set var="hasItem" value="${false}" />
<c:forEach var="attribution" items="${attributions}">
    <c:choose>
        <c:when test="${hasItem == false}">
            <c:set var="hasItem" value="${true}" />
        </c:when>
        <c:otherwise>
            <c:set var="attributionKey" value="${attributionKey}," />
        </c:otherwise>
    </c:choose>
    <c:set var="dsRecord" value="${dsRecords[attribution]}"/>
    <c:set var="attributionKey" value="${attributionKey}${attribution}" />
    <c:set var="attributionDisplay" value="${attributionDisplay}${dsRecord.attributesMap['resource']}" />
</c:forEach>
<c:if test="${hasItem}">
    <div><b>${caption}:</b></div>
    <div>
        <ul>
            <c:forEach var="attribution" items="${attributions}">
                <li>
                    <c:set var="dataSourceUrl">
                        <c:url value="/showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=${attributionKey}&title=${caption}#" />
                    </c:set>
                    <c:set var="dsRecord" value="${dsRecords[attribution]}"/>
                    <a href="${dataSourceUrl}${attribution}">
                        ${dsRecord.attributesMap['resource']}
                    </a>
                </li>
            </c:forEach>
        </ul>
    </div>
</c:if>

