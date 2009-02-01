<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="historyId"         required="true"  %>
<%@ attribute name="curFilter"         required="true"  %>

<%-- initialize filter link variables --%>
<c:set var="all_genes" value=""/>
<c:set var="parvum_genes" value=""/>
<c:set var="hominis_genes" value=""/>
<c:set var="muris_genes" value=""/>
<c:set var="parvum_chr6_genes" value=""/>
<c:set var="crypto_distinct_genes" value=""/>

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
      <c:when test="${cacheItem.key == 'all_genes'}">
        <c:set var="all_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'parvum_genes'}">
        <c:set var="parvum_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'hominis_genes'}">
        <c:set var="hominis_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'muris_genes'}">
        <c:set var="muris_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'crypto_distinct_genes'}">
        <c:set var="crypto_distinct_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'parvum_chr6_genes'}">
        <c:set var="parvum_chr6_genes" value="${cacheItem.value}"/>
      </c:when>
    </c:choose>
    </c:forEach>
  </c:if>
</c:if>

<!-- display basic filters -->
<div class="filter">
<table cellpadding="5" border="1">
  <tr>
    <th>All</th>
    <th><i>Distinct Cryptosporidium</i></th>
    <th><i>C. parvum</i></th>
    <th><i>C. hominis</i></th>
    <th><i>C. muris</i></th>
    <th><i>C. parvum (Chr. 6)</i></th>
  </tr>
  <tr align="center">
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
      <c:when test="${curFilter eq 'crypto_distinct_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${crypto_distinct_genes != ''}">
            <td>${crypto_distinct_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=crypto_distinct_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>


    <c:choose>
      <c:when test="${curFilter eq 'parvum_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${parvum_genes != ''}">
            <td>${parvum_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=parvum_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'hominis_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${hominis_genes != ''}">
            <td>${hominis_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=hominis_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'muris_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${muris_genes != ''}">
            <td>${muris_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=muris_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>


    <c:choose>
      <c:when test="${curFilter eq 'parvum_chr6_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${parvum_chr6_genes != ''}">
            <td>${parvum_chr6_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=parvum_chr6_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>



  </tr>
</table>
</div>
