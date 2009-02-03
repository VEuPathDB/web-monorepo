<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkUser saved in session scope -->
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<c:set var="dsCol" value="${param.dataset_column}"/>
<c:set var="dsColVal" value="${param.dataset_column_label}"/>

<site:header refer="customQueryHistory" />

<%-- repurpose this page for complete query history --%>
<h1>All Queries</h1>
<site:completeHistory model="${wdkModel}" user="${wdkUser}" />

<%-- <div id="search_history">
<h1>My Searches</h1>
<site:strategyTable model="${wdkModel}" user="${wdkUser}" />
</div> --%>

<site:footer/>
