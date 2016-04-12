<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<!-- on tab load, execute custom JS -->
<div data-controller="initializeGeneView" data-transcript-step-id="${requestScope.wdkStep.stepId}"></div>

<!-- Use modified step that always applies representative transcript filter -->
<imp:resultTable step="${requestScope.modifiedStep}" view="genes" />
