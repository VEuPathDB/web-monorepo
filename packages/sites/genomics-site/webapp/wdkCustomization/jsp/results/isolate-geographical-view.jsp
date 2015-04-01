<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="wdkStep" value="${requestScope.wdkStep}" />
<c:set var="sequences" value="${requestScope.isolates}" />
<c:set var="recordClass" value="${wdkStep.question.recordClass}" />

<imp:script src="js/google_map.js"/>


<div id="map_canvas" style="width: 1024px; height: 380px"></div>

<table id="pins">
<tr>
  <td valign=center>
    <imp:image src="images/isolate/1.png"/>
    <imp:image src="images/isolate/2.png"/>
    <imp:image src="images/isolate/3.png"/>
    <imp:image src="images/isolate/4.png"/>
    <imp:image src="images/isolate/5.png"/>
    <imp:image src="images/isolate/6.png"/>
    <imp:image src="images/isolate/7.png"/>
    <imp:image src="images/isolate/8.png"/>
    <imp:image src="images/isolate/9.png"/>
    <imp:image src="images/isolate/10.png"/>
  Indicates the number of isolates from each location
  </td>
</tr>
</table>

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

