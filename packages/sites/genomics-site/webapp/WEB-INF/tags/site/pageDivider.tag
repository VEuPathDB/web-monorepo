<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<%@ attribute name="name"
              description="name of page section"
%>

<br><br>
<a name="${name}">

<table border='0' width='100%'><tr class="secondary3">
  <th align="center" width='85%'><font face="Arial,Helvetica" size="+1">
     ${name}
</font></th>
  <th align="right" width='15%'>
      <a HREF="#top">Back to the Top</a>
  </th></tr></table>
<br>
