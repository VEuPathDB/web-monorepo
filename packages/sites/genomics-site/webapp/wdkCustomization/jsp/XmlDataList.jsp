<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>

<!-- get wdkXmlQuestionSets saved in request scope -->
<c:set var="xmlQSets" value="${requestScope.wdkXmlQuestionSets}"/>

<imp:pageFrame banner="Data Contents">

<!-- show all xml question sets -->
<ul>
  <c:forEach items="${xmlQSets}" var="qSet">
    <c:set var="qSetName" value="${qSet.name}"/>
    ${qSet.displayName}:<br>

    <!-- show all xml questions in this set -->
    <c:set var="xqs" value="${qSet.questions}"/>
    <c:forEach items="${xqs}" var="q">
      <c:set var="qName" value="${q.name}"/>
      <li><a href="showXmlDataContent.do?name=${qSetName}.${qName}">${q.displayName}</a></li>
    </c:forEach>
  </c:forEach>
</ul>

</imp:pageFrame>
