<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<imp:header banner="Unexpected Error" />

<EM>Sorry, an unexpected error has occurred. It is likely caused by an input error
not handled properly. Please read the error message below, if any, and use the browser's
back button to try again.</EM>

<api:errors/>

<imp:footer/>
