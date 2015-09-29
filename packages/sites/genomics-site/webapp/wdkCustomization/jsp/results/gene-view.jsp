<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<!-- Use modified step that always applies representative transcript filter -->
<imp:resultTable step="${requestScope.geneFilteredStep}" />
