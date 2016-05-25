<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="wdkStep" value="${requestScope.wdkStep}" />

<%-- <imp:isolateResults  strategy="${wdkStrategy}"/> --%>
<imp:isolateResults step="${wdkStep}" />
