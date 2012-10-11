<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>


<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="model" value="${applicationScope.wdkModel}" />
<c:set var="modelName" value="${applicationScope.wdkModel.name}" />

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<c:set var="showHist" value="${requestScope.showHistory}" />
<c:set var="strategies" value="${requestScope.wdkActiveStrategies}"/>

<c:set var="dsCol" value="${param.dataset_column}"/>
<c:set var="dsColVal" value="${param.dataset_column_label}"/>

<c:set var="commandUrl">
    <c:url value="/processSummary.do?${wdk_query_string}" />
</c:set>

<imp:pageFrame refer="summary">

<imp:strategyWorkspace includeDYK="true" />

</imp:pageFrame>
