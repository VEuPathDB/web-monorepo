<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="historyId"         required="true"  %>
<%@ attribute name="curFilter"         required="true"  %>
<%@ attribute name="stringOrg"         required="true"  %>

<%-- initialize filter link variables --%>
<c:set var="all_results" value=""/>
<c:set var="all_genes" value=""/>
<c:set var="deprecated_genes" value=""/>
<c:set var="toxo_genes" value=""/>
<c:set var="neospora_genes" value=""/>

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
 <c:when test="${cacheItem.key == 'toxo_genes'}">
        <c:set var="toxo_genes" value="${cacheItem.value}"/>
      </c:when>
 <c:when test="${cacheItem.key == 'neospora_genes'}">
        <c:set var="toxo_genes" value="${cacheItem.value}"/>
      </c:when>
    </c:choose>
    </c:forEach>
  </c:if>
</c:if>



<div class="filter">
<table cellpadding="5" border="1">
  <tr>
    <th>All Results</th>

       <c:if test="${fn:containsIgnoreCase(stringOrg, 'Giardia')}"> 
        <th>Gl</th>
        <th>Gl(depr)</th>
       </c:if>

      <c:if test="${fn:containsIgnoreCase(stringOrg, 'Toxo')}"> 
        <th>Tg(repr)</th>
       </c:if>

       <c:if test="${fn:containsIgnoreCase(stringOrg, 'Neospora')}"> 
         <th>Nc</th>
       </c:if>
 </tr>
  <tr align="center">

<%-- all_results --%>
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


<c:if test="${fn:containsIgnoreCase(stringOrg, 'Giardia')}"> 
      
<%-- all_genes --%>
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


<%-- deprecated_genes --%>
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

</c:if>

      <c:if test="${fn:containsIgnoreCase(stringOrg, 'Toxo')}"> 

<%-- toxo_genes --%>
<c:choose>
      <c:when test="${curFilter eq 'toxo_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${toxo_genes != ''}">
            <td>${toxo_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=toxo_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

       </c:if>

       <c:if test="${fn:containsIgnoreCase(stringOrg, 'Neospora')}"> 

<%-- neospora_genes --%>
<c:choose>
      <c:when test="${curFilter eq 'neospora_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${neospora_genes != ''}">
            <td>${neospora_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=neospora_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

 </c:if>
 
</tr>
</table>
</div>








