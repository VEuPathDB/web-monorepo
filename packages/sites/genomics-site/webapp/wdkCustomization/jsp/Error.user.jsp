<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<site:header banner="Unexpected Error" />

<EM>Sorry, an unexpected error has occurred. It is likely caused by an input error
not handled properly. Please read the error message below, if any, and use the browser's
back button to try again.</EM>

<api:errors/>

<site:footer/>
