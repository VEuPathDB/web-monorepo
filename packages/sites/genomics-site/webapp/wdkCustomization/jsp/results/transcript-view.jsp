<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="checkToggleBox" value="${requestScope.representativeTranscriptOnly ? 'checked=\"checked\"' : '' }"/>

<div style="text-align:right;margin:6px 10px 10px;float:right">
  <input type="checkbox" ${checkToggleBox} data-stepid="${requestScope.wdkStep.stepId}" onclick="javascript:toggleRepresentativeTranscripts(this)">
  Show one transcript per gene
</div>
<imp:resultTable step="${requestScope.wdkStep}" view="transcripts"/>
