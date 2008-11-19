<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkAnswer" value="${requestScope.wdkAnswer}" />
<c:set var="history" value="${requestScope.wdkHistory}" />
<c:set var="model" value="${applicationScope.wdkModel}" />
<c:set var="strategy" value="${requestScope.wdkStrategy}" />
<c:set var="step" value="${requestScope.wdkStep}"/>
<div id="containerDiv">
<site:BreadCrumbs strategy="${strategy}" strat_step="${step}"/>
</div>
