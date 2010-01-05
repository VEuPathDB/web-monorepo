<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:sampleStrategies wdkModel="${wdkModel}" wdkUser="${wdkUser}" />
