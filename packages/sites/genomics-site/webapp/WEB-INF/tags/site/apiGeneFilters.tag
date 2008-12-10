<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="historyId"         required="true"  %>
<%@ attribute name="curFilter"         required="true"  %>
<%@ attribute name="stringOrg"         required="true"  %>

<%-- initialize filter link variables --%>
<c:set var="all_results" value=""/>
<c:set var="ch_genes" value=""/>
<c:set var="cp_genes" value=""/>
<c:set var="gl_genes" value=""/>
<c:set var="deprecated_genes" value=""/>
<c:set var="pb_genes" value=""/>
<c:set var="pc_genes" value=""/>
<c:set var="pf_genes" value=""/>
<c:set var="pk_genes" value=""/>
<c:set var="pv_genes" value=""/>
<c:set var="py_genes" value=""/>
<c:set var="toxo_genes" value=""/>
<c:set var="toxo_instances" value=""/>
<c:set var="neospora_genes" value=""/>
<c:set var="tv_genes" value=""/>



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
     <c:when test="${cacheItem.key == 'ch_genes'}">
        <c:set var="ch_genes" value="${cacheItem.value}"/>
      </c:when>
       <c:when test="${cacheItem.key == 'cp_genes'}">
        <c:set var="cp_genes" value="${cacheItem.value}"/>
      </c:when>
 <c:when test="${cacheItem.key == 'pb_genes'}">
        <c:set var="pb_genes" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'pc_genes'}">
        <c:set var="pc_genes" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'pf_genes'}">
        <c:set var="pf_genes" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'pk_genes'}">
        <c:set var="pk_genes" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'pv_genes'}">
        <c:set var="pv_genes" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'py_genes'}">
        <c:set var="py_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'gl_genes'}">
        <c:set var="gl_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'deprecated_genes'}">
        <c:set var="deprecated_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'toxo_genes'}">
        <c:set var="toxo_genes" value="${cacheItem.value}"/>
      </c:when>
 <c:when test="${cacheItem.key == 'toxo_instances'}">
        <c:set var="toxo_instances" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'neospora_genes'}">
        <c:set var="neospora_genes" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'tv_genes'}">
        <c:set var="tv_genes" value="${cacheItem.value}"/>
      </c:when>
    </c:choose>
    </c:forEach>
  </c:if>
</c:if>



<div class="filter">
<table cellpadding="5" border="1">
  <tr>
    <th>All Results</th>

       <c:if test="${fn:containsIgnoreCase(stringOrg, 'hominis')}"> 
        <th>Ch</th>
</c:if>
 <c:if test="${fn:containsIgnoreCase(stringOrg, 'parvum')}"> 
        <th>Cp</th>
       </c:if>

  <c:if test="${fn:containsIgnoreCase(stringOrg, 'Giardia')}"> 
        <th>Gl</th>
        <th>Gl(depr)</th>
       </c:if>

 <c:if test="${fn:containsIgnoreCase(stringOrg, 'berghei')}"> 
        <th>Pb</th>
       </c:if>
 <c:if test="${fn:containsIgnoreCase(stringOrg, 'chabaudi')}"> 
        <th>Pc</th>
       </c:if>
 <c:if test="${fn:containsIgnoreCase(stringOrg, 'falciparum')}"> 
        <th>Pf</th>
       </c:if>
 <c:if test="${fn:containsIgnoreCase(stringOrg, 'knowlesi')}"> 
        <th>Pk</th>
       </c:if>
 <c:if test="${fn:containsIgnoreCase(stringOrg, 'vivax')}"> 
        <th>Pv</th>
       </c:if>
 <c:if test="${fn:containsIgnoreCase(stringOrg, 'yoelii')}"> 
        <th>Py</th>
       </c:if>

     

      <c:if test="${fn:containsIgnoreCase(stringOrg, 'Toxo')}"> 
        <th>Tg(red)</th>
        <th>Tg(genes)</th>
       </c:if>

       <c:if test="${fn:containsIgnoreCase(stringOrg, 'Neospora')}"> 
         <th>Nc</th>
       </c:if>

 <c:if test="${fn:containsIgnoreCase(stringOrg, 'Trich')}"> 
        <th>Tv</th>
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


<c:if test="${fn:containsIgnoreCase(stringOrg, 'hominis')}"> 
      
<%-- ch_genes --%>
    <c:choose>
      <c:when test="${curFilter eq 'ch_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${ch_genes != ''}">
            <td>${ch_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=ch_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>
<c:if test="${fn:containsIgnoreCase(stringOrg, 'parvum')}"> 

<%-- cp_genes --%>
    <c:choose>
      <c:when test="${curFilter eq 'cp_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${cp_genes != ''}">
            <td>${cp_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=cp_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>


</c:if>

<c:if test="${fn:containsIgnoreCase(stringOrg, 'Giardia')}"> 
      
<%-- gl_genes --%>
    <c:choose>
      <c:when test="${curFilter eq 'gl_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${gl_genes != ''}">
            <td>${gl_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=gl_genes">&nbsp;</a>
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


<c:if test="${fn:containsIgnoreCase(stringOrg, 'berghei')}"> 

<%-- pb_genes --%>
    <c:choose>
      <c:when test="${curFilter eq 'pb_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${pb_genes != ''}">
            <td>${pb_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=pb_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>

<c:if test="${fn:containsIgnoreCase(stringOrg, 'chabaudi')}"> 

<%-- pc_genes --%>
    <c:choose>
      <c:when test="${curFilter eq 'pc_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${pc_genes != ''}">
            <td>${pc_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=pc_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>
<c:if test="${fn:containsIgnoreCase(stringOrg, 'falciparum')}"> 

<%-- pf_genes --%>
    <c:choose>
      <c:when test="${curFilter eq 'pf_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${pf_genes != ''}">
            <td>${pf_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=pf_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>
<c:if test="${fn:containsIgnoreCase(stringOrg, 'knowlesi')}"> 

<%-- pk_genes --%>
    <c:choose>
      <c:when test="${curFilter eq 'pk_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${pk_genes != ''}">
            <td>${pk_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=pk_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>
<c:if test="${fn:containsIgnoreCase(stringOrg, 'vivax')}"> 

<%-- pv_genes --%>
    <c:choose>
      <c:when test="${curFilter eq 'pv_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${pv_genes != ''}">
            <td>${pv_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=pv_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>
<c:if test="${fn:containsIgnoreCase(stringOrg, 'yoelii')}"> 

<%-- py_genes --%>
    <c:choose>
      <c:when test="${curFilter eq 'py_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${py_genes != ''}">
            <td>${py_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=py_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>



      <c:if test="${fn:containsIgnoreCase(stringOrg, 'Toxo')}"> 

<%-- toxo_instances --%>
<c:choose>
      <c:when test="${curFilter eq 'toxo_instances'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${toxo_instances != ''}">
            <td>${toxo_instances}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=toxo_instances">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

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
 

<c:if test="${fn:containsIgnoreCase(stringOrg, 'Trich')}"> 

<%-- tv_genes --%>
    <c:choose>
      <c:when test="${curFilter eq 'tv_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${tv_genes != ''}">
            <td>${tv_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=tv_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>


</tr>
</table>
</div>

