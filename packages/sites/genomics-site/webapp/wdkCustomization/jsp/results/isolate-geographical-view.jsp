<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>

<c:set var="wdkStep" value="${requestScope.wdkStep}" />
<c:set var="sequences" value="${requestScope.isolates}" />

<c:set var="recordClass" value="${wdkStep.question.recordClass}" />

<c:set var="project" value="CryptoDB" />

<%--- Google keys to access the maps for Isolate questions (check with Haiming) ---%>
<c:set var="gkey" value="AIzaSyBD4YDJLqvZWsXRpPP8u9dJGj3gMFXCg6s" /> 

<script type="text/javascript" src='http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js'></script>
<script type="text/javascript" src='http://maps.googleapis.com/maps/api/js?key=${gkey}&sensor=false'></script>
<script type="text/javascript" src="/assets/js/google_map.js"></script>

<table id="isolate-view" class="datatables">
<thead>
 <th>Country</th>
 <th>Number of Isolates</th>
 <th>Isolate Type</th>

</thead>
<tbody>
  <c:forEach items="${sequences}" var="sequence">
  <tr>
<td>${sequence.country}</td><td> ${sequence.total} </td><td>${sequence.type}</td>
</tr>
  </c:forEach>

</tbody>
</table>

<div id="map_canvas" style="width: 1080px; height: 420px"></div>
