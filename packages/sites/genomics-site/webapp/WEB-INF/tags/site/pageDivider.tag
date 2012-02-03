<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="name"
              description="name of page section"
%>
<c:set var="project" value="${applicationScope.wdkModel.name}" />

<br><br>
<a name="${name}"></a>

<%-- class secondary3 does not seem to exist --%>
<table border='0' width='100%' style="background-image: url(/assets/images/${project}/footer.png);">
<tr class="secondary3">
  <th align="center" width='85%' style="font-size:150%;padding:6px;">
     ${name}
  </th>
  <th align="right" width='15%'>
      <a HREF="#top">Back to the Top</a>
  </th>
</tr></table>
<br>

