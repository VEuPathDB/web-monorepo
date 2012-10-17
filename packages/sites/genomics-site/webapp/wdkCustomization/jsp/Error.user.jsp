<% 
/** 
  By default this page returns a "200 OK" HTTP status which prevents error 
  detection with a HEAD request. So force a 5xx status code.
  Our Apache configuration intercepts 503 codes and redirects to a different
  error page, so we are left with 500.
**/
response.setStatus(500);
%>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>

<imp:pageFrame banner="Unexpected Error" >

<EM>Sorry, an unexpected error has occurred. It is likely caused by an input error
not handled properly. Please read the error message below, if any, and use the browser's
back button to try again.</EM>

<api:errors/>

</imp:pageFrame>
