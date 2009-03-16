<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkModel" value="${applicationScope.wdkModel}" />
<c:set var="wdkUser" value="${sessionScope.wdkUser}" />

<site:strategyHistory model="${wdkModel}" user="${wdkUser}" />
