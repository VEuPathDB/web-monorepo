<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<c:set var="stratName" value="${requestScope.strat_name}" />
<c:set var="strat_id" value="${requestScope.strat_Id}" />
<c:set var="step" value="${requestScope.step}" />
<c:set var="importId" value="${requestScope.importId}" />

<site:xml_strat first_step="${step}" stratName="${stratName}" stratId="${strat_id}" saved="false" savedName="${stratName}" importId="${importId}"/>
