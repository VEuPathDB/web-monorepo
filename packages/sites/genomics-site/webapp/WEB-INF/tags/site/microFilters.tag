<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="historyId"         required="true"  %>
<%@ attribute name="curFilter"         required="true"  %>

<%-- initialize filter link variables --%>
<c:set var="all_results" value=""/>
<c:set var="ecun_genes" value=""/>
<c:set var="eint_genes" value=""/>
<c:set var="micro_distinct_genes" value=""/>

<%-- check for filter link cache --%>
<c:set var="answerCache" value="${sessionScope.answer_cache}"/>

<c:if test="${answerCache != null}">
  <c:set var="linkCache" value=""/>
  <c:forEach var="cacheItem" items="${answerCache}">
    <c:if test="${cacheItem.key == wdkAnswer.checksum}">
      <c:set var="linkCache" value="${cacheItem.value}"/>
    </c:if>
  </c:forEach>
  <c:if test="${linkCache != ''}">
    <c:forEach var="cacheItem" items="${linkCache}">
    <c:choose>
      <c:when test="${cacheItem.key == 'all_results'}">
        <c:set var="all_results" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'micro_distinct_genes'}">
        <c:set var="micro_distinct_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'ecun_genes'}">
        <c:set var="ecun_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'eint_genes'}">
        <c:set var="eint_genes" value="${cacheItem.value}"/>
      </c:when>
    </c:choose>
    </c:forEach>
  </c:if>
</c:if>

<!-- display basic filters -->
<div class="filter">
<table border="1">
  <tr>
    <th align="center">All Results</th>
    <th align="center"><i>Encephalitozoon cuniculi </i></th>
    <th align="center"><i>Encephalitozoon intestinalis</i></th>
  </tr>
  <tr align="center">
    <c:choose>
      <c:when test="${curFilter eq 'all_results'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${all_results != ''}">
            <td>${all_results}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=all_results">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

    <c:choose>
      <c:when test="${curFilter eq 'ecun_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${ecun_genes != ''}">
            <td>${ecun_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=ecun_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>


    <c:choose>
      <c:when test="${curFilter eq 'eint_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${eint_genes != ''}">
            <td>${eint_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=eint_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>


  </tr>
</table>
</div>
