<%-- 
FYI, don't set a status code. Let it be the default 200 because
our current ajax code is written for a 200 status.
response.setStatus(500);
--%>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<imp:pageFrame banner="Unexpected Error" >

<EM>Sorry, an unexpected error has occurred. It is likely caused by an input error
not handled properly. Please read the error message below, if any, and use the browser's
back button to try again.</EM>

<api:errors/>

</imp:pageFrame>
