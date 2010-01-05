<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="projectId" value="${applicationScope.wdkModel.projectId}" />

<jsp:include page="/wdkCustomization/jsp/${projectId}/GeneRecordClasses.GeneRecordClass.jsp"/>

