<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<imp:pageFrame refer="summary">

<imp:dyk />

<script type="text/javascript" language="javascript">
	window.onload = function(){ wdk.addStepPopup.showPanel('help') }
</script>

<div id="help" style="display:none">
        <imp:helpStrategies />
</div>

</imp:pageFrame>
