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
  <c:set var="rowStyle" value="odd" />
  <c:forEach items="${sequences}" var="sequence">
    <tr class="sequence ${rowStyle}" length="${sequence.length}">
      <td class="sequence-id" nowrap>${sequence.sourceId}</td>
      <td class="spans" width="100%">
        <div class="ruler"></div>
        <c:forEach items="${sequence.spans}" var="span">
          <c:set var="tooltip" value="${span.sourceId}, starts at: ${span.start}, ends at ${span.end}" />
          <div class="span" start="${span.start}" end="${span.end}" title="${tooltip}">
          </div>
        </c:forEach>
      </td>
    </tr>
    <c:set var="rowStyle">
      <c:choose>
        <c:when test="${rowStyle eq 'odd'}">even</c:when><c:otherwise>odd</c:otherwise>
      </c:choose>
    </c:set>
  </c:forEach>
</table>
