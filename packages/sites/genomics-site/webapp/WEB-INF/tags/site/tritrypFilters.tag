<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="historyId"         required="true"  %>
<%@ attribute name="curFilter"         required="true"  %>

<%-- initialize filter link variables --%>
<c:set var="all_results" value=""/>
<c:set var="lbr_genes" value=""/>
<c:set var="lin_genes" value=""/>
<c:set var="lma_genes" value=""/>
<c:set var="tbr927_genes" value=""/>
<c:set var="tbrgamb_genes" value=""/>
<c:set var="tce_genes" value=""/>
<c:set var="tcne_genes" value=""/>
<c:set var="tcu_genes" value=""/>
<c:set var="tc_distinct_genes" value=""/>
<c:set var="tritryp_distinct_genes" value=""/>

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
      <c:when test="${cacheItem.key == 'tritryp_distinct_genes'}">
        <c:set var="tritryp_distinct_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'lbr_genes'}">
        <c:set var="lbr_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'lin_genes'}">
        <c:set var="lin_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'lma_genes'}">
        <c:set var="lma_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'tbr927_genes'}">
        <c:set var="tbr927_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'tbrgamb_genes'}">
        <c:set var="tbrgamb_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'tce_genes'}">
        <c:set var="tce_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'tcne_genes'}">
        <c:set var="tcne_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'tcu_genes'}">
        <c:set var="tcu_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'tc_distinct_genes'}">
        <c:set var="tc_distinct_genes" value="${cacheItem.value}"/>
      </c:when>
    </c:choose>
    </c:forEach>
  </c:if>
</c:if>

<!-- display basic filters -->
<div class="filter">
<table border="1">
  <tr>
    <th rowspan=2 align="center">All<br>Results</th>
    <th rowspan=2 align="center">Ortholog<br>Groups</th>
    <th colspan=3 align="center"><i>Leishmania </i></th>
    <th colspan=2 align="center"><i>Trypanosoma<br>brucei</i></th>
    <th colspan=4 align="center"><i>Trypanosoma cruzi</i></th>
  </tr>
  <tr>
    <th><i>braziliensis</i></th>
    <th><i>infantum</i></th>
    <th><i>major</i></th>
    <th><i>TREU927</i></th>
    <th><i>gambiense</i></th>
    <th>Distinct genes</th>
    <th>esmeraldo</th>
    <th>non-esmeraldo</th>
    <th>unassigned</th>
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
      <c:when test="${curFilter eq 'tritryp_distinct_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${tritryp_distinct_genes != ''}">
            <td>${tritryp_distinct_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=tritryp_distinct_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

    <c:choose>
      <c:when test="${curFilter eq 'lbr_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${lbr_genes != ''}">
            <td>${lbr_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=lbr_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>


    <c:choose>
      <c:when test="${curFilter eq 'lin_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${lin_genes != ''}">
            <td>${lin_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=lin_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

    <c:choose>
      <c:when test="${curFilter eq 'lma_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${lma_genes != ''}">
            <td>${lma_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=lma_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

    <c:choose>
      <c:when test="${curFilter eq 'tbr927_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${tbr927_genes != ''}">
            <td>${tbr927_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=tbr927_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

    <c:choose>
      <c:when test="${curFilter eq 'tbrgamb_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${tbrgamb_genes != ''}">
            <td>${tbrgamb_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=tbrgamb_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

    <c:choose>
      <c:when test="${curFilter eq 'tc_distinct_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${tc_distinct_genes != ''}">
            <td>${tc_distinct_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=tc_distinct_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

    <c:choose>
      <c:when test="${curFilter eq 'tce_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${tce_genes != ''}">
            <td>${tce_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=tce_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

    <c:choose>
      <c:when test="${curFilter eq 'tcne_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${tcne_genes != ''}">
            <td>${tcne_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=tcne_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

    <c:choose>
      <c:when test="${curFilter eq 'tcu_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${tcu_genes != ''}">
            <td>${tcu_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=tcu_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>




  </tr>
</table>
</div>
