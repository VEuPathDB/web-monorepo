<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="historyId"         required="true"  %>
<%@ attribute name="curFilter"         required="true"  %>

<%-- initialize filter link variables --%>
<c:set var="all_results" value=""/>
<c:set var="all_genes" value=""/>
<c:set var="deprecated_genes" value=""/>
<c:set var="assemblage_a_genes" value=""/>
<c:set var="assemblage_b_genes" value=""/>
<c:set var="assemblage_e_genes" value=""/>

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
      <c:when test="${cacheItem.key == 'all_genes'}">
        <c:set var="all_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'deprecated_genes'}">
        <c:set var="deprecated_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'assemblage_a_genes'}">
        <c:set var="assemblage_a_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'assemblage_b_genes'}">
        <c:set var="assemblage_b_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'assemblage_e_genes'}">
        <c:set var="assemblage_e_genes" value="${cacheItem.value}"/>
      </c:when>
    </c:choose>
    </c:forEach>
  </c:if>
</c:if>

<!-- display filters -->
<div class="filter">
<table cellpadding="5" border="1">
  <tr>
    <th>All Results</th>
    <th>Assmb. A Genes</th>
    <th>Assmb. B Genes</th>
    <th>Assmb. E Genes</th>
    <th>Genes</th>
    <th>Deprecated Genes</th>
  </tr>
  <tr align="center">
    <c:choose>
      <c:when test="${curFilter eq 'all_results'}">
        <td class="selected">${wdkAnswer.resultSize}
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
      <c:when test="${curFilter eq 'assemblage_a_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
        <c:choose>
          <c:when test="${assemblage_a_genes != ''}">
            <td>${assemblage_a_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=assemblage_a_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'assemblage_b_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
        <c:choose>
          <c:when test="${assemblage_b_genes != ''}">
            <td>${assemblage_b_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=assemblage_b_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'assemblage_e_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
        <c:choose>
          <c:when test="${assemblage_e_genes != ''}">
            <td>${assemblage_e_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=assemblage_e_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'all_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
        <c:choose>
          <c:when test="${all_genes != ''}">
            <td>${all_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=all_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'deprecated_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${deprecated_genes != ''}">
            <td>${deprecated_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=deprecated_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

  </tr>
</table>
</div>

