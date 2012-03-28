<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>

<c:set var="wdkStep" value="${requestScope.wdkStep}" />
<c:set var="sequences" value="${requestScope.isolates}" />
<c:set var="recordClass" value="${wdkStep.question.recordClass}" />

<script type="text/javascript" src="/assets/js/google_map.js"></script>

<table id="isolate-view" class="datatables">
<thead>
 <th>Country</th>
 <th>Number of Isolates</th>
 <th>Isolate Type</th>
 <th>Latitude</th>
 <th>Longitude</th>

</thead>
<tbody>
  <c:forEach items="${sequences}" var="sequence">
  <tr>
<td>${sequence.country}</td><td> ${sequence.total} </td><td>${sequence.type}</td><td>${sequence.lat}</td><td>${sequence.lng}</td>
</tr>
  </c:forEach>

</tbody>
</table>

<div id="map_canvas" style="width: 1080px; height: 420px"></div>
