<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkXmlQuestionSets saved in request scope -->
<c:set var="xmlQSets" value="${requestScope.wdkXmlQuestionSets}"/>

<site:header banner="Data Contents" />

<!-- show all xml question sets -->
<UL>
<c:forEach items="${xmlQSets}" var="qSet">
    <c:set var="qSetName" value="${qSet.name}"/>
    ${qSet.displayName}:<br>

    <!-- show all xml questions in this set -->
    <c:set var="xqs" value="${qSet.questions}"/>
    <c:forEach items="${xqs}" var="q">
        <c:set var="qName" value="${q.name}"/>
        <LI><a href="showXmlDataContent.do?name=${qSetName}.${qName}">${q.displayName}</a></LI>
    </c:forEach>
</c:forEach>
</UL>

<site:footer/>
