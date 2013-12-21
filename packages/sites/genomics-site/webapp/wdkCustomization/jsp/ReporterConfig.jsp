<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%-- get wdkAnswer from requestScope --%>
<c:set value="${requestScope.wdkAnswer}" var="wdkAnswer"/>

<imp:pageFrame>

<imp:reporter/>

<c:if test='${wdkAnswer.resultSize == 0}'>
    No results for your query
</c:if>

</imp:pageFrame>
