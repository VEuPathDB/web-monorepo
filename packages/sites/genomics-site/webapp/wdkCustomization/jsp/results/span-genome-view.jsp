<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>

<c:set var="sequences" value="${requestScope.sequences}" />


<script type="text/javascript">
<!--
initializeSpanGenomeView();
-->
</script>

<table id="genome-view">
  <tr>
    <th>Sequence</th>
    <th>Length</th>
    <th>#Segments</th>
    <th>Segment Locations</th>
  </tr>

  <c:set var="rowStyle" value="odd" />
  <c:forEach items="${sequences}" var="sequence">
    <tr class="sequence ${rowStyle}" length="${sequence.length}">
      <c:set var="tooltip" value="${sequence.sourceId}, length: ${sequence.length}" />
      <td class="sequence-id" nowrap title="${tooltip}">${sequence.sourceId}</td>
      <td class="length" nowrap>${sequence.length}</td>
      <td class="span-count" nowrap>${fn:length(sequence.spans)}</td>
      <td width="100%">
        <div class="spans">
          <div class="ruler"> </div>
          <c:forEach items="${sequence.spans}" var="span">
            <c:set var="spanStyle" value="${span.forward ? 'forward' : 'reverse'}" />
            <c:set var="tooltip" value="${span.sourceId}, starts at: ${span.start}, ends at ${span.end}" />
            <div class="span ${spanStyle}" start="${span.start}" end="${span.end}" forward="${span.forward}" title="${tooltip}"></div>
          </c:forEach>
        </div>
      </td>
    </tr>
    <c:set var="rowStyle" value="${(rowStyle eq 'odd') ? 'even' : 'odd'}" />
  </c:forEach>
</table>
