<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<site:header title="${wdkModel.displayName}.org :: Community Upload"
             banner="Community Upload"/>


<c:set value="${requestScope.fileName}" var="fileName"/>


<h2>Files Successfully Received</h2>


<site:footer/>
