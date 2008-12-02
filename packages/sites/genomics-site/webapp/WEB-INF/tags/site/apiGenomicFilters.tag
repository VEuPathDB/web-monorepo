<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="historyId"         required="true"  %>
<%@ attribute name="curFilter"         required="true"  %>
<%@ attribute name="stringOrg"         required="true"  %>

<%-- initialize filter link variables --%>
<c:set var="all_results" value=""/>
<c:set var="ch_genomics" value=""/>
<c:set var="cp_genomics" value=""/>
<c:set var="gl_genomics" value=""/>
<c:set var="pb_genomics" value=""/>
<c:set var="pc_genomics" value=""/>
<c:set var="pf_genomics" value=""/>
<c:set var="pk_genomics" value=""/>
<c:set var="pv_genomics" value=""/>
<c:set var="py_genomics" value=""/>
<c:set var="toxo_genomics" value=""/>
<c:set var="neospora_genomics" value=""/>
<c:set var="tv_genomics" value=""/>



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
     <c:when test="${cacheItem.key == 'ch_genomics'}">
        <c:set var="ch_genomics" value="${cacheItem.value}"/>
      </c:when>
       <c:when test="${cacheItem.key == 'cp_genomics'}">
        <c:set var="cp_genomics" value="${cacheItem.value}"/>
      </c:when>
 <c:when test="${cacheItem.key == 'pb_genomics'}">
        <c:set var="pb_genomics" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'pc_genomics'}">
        <c:set var="pc_genomics" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'pf_genomics'}">
        <c:set var="pf_genomics" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'pk_genomics'}">
        <c:set var="pk_genomics" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'pv_genomics'}">
        <c:set var="pv_genomics" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'py_genomics'}">
        <c:set var="py_genomics" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'gl_genomics'}">
        <c:set var="gl_genomics" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'deprecated_genomics'}">
        <c:set var="deprecated_genomics" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'toxo_genomics'}">
        <c:set var="toxo_genomics" value="${cacheItem.value}"/>
      </c:when>
 <c:when test="${cacheItem.key == 'toxo_instances'}">
        <c:set var="toxo_instances" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'neospora_genomics'}">
        <c:set var="neospora_genomics" value="${cacheItem.value}"/>
      </c:when>
<c:when test="${cacheItem.key == 'tv_genomics'}">
        <c:set var="tv_genomics" value="${cacheItem.value}"/>
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
        <th>Tg</th>
    
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
      
<%-- ch_genomics --%>
    <c:choose>
      <c:when test="${curFilter eq 'ch_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${ch_genomics != ''}">
            <td>${ch_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=ch_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>
<c:if test="${fn:containsIgnoreCase(stringOrg, 'parvum')}"> 

<%-- cp_genomics --%>
    <c:choose>
      <c:when test="${curFilter eq 'cp_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${cp_genomics != ''}">
            <td>${cp_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=cp_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>


</c:if>

<c:if test="${fn:containsIgnoreCase(stringOrg, 'Giardia')}"> 
      
<%-- gl_genomics --%>
    <c:choose>
      <c:when test="${curFilter eq 'gl_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${gl_genomics != ''}">
            <td>${gl_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=gl_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>


</c:if>


<c:if test="${fn:containsIgnoreCase(stringOrg, 'berghei')}"> 

<%-- pb_genomics --%>
    <c:choose>
      <c:when test="${curFilter eq 'pb_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${pb_genomics != ''}">
            <td>${pb_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=pb_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>

<c:if test="${fn:containsIgnoreCase(stringOrg, 'chabaudi')}"> 

<%-- pc_genomics --%>
    <c:choose>
      <c:when test="${curFilter eq 'pc_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${pc_genomics != ''}">
            <td>${pc_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=pc_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>
<c:if test="${fn:containsIgnoreCase(stringOrg, 'falciparum')}"> 

<%-- pf_genomics --%>
    <c:choose>
      <c:when test="${curFilter eq 'pf_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${pf_genomics != ''}">
            <td>${pf_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=pf_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>
<c:if test="${fn:containsIgnoreCase(stringOrg, 'knowlesi')}"> 

<%-- pk_genomics --%>
    <c:choose>
      <c:when test="${curFilter eq 'pk_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${pk_genomics != ''}">
            <td>${pk_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=pk_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>
<c:if test="${fn:containsIgnoreCase(stringOrg, 'vivax')}"> 

<%-- pv_genomics --%>
    <c:choose>
      <c:when test="${curFilter eq 'pv_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${pv_genomics != ''}">
            <td>${pv_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=pv_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>
<c:if test="${fn:containsIgnoreCase(stringOrg, 'yoelii')}"> 

<%-- py_genomics --%>
    <c:choose>
      <c:when test="${curFilter eq 'py_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${py_genomics != ''}">
            <td>${py_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=py_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>



      <c:if test="${fn:containsIgnoreCase(stringOrg, 'Toxo')}"> 


<%-- toxo_genomics --%>
<c:choose>
      <c:when test="${curFilter eq 'toxo_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${toxo_genomics != ''}">
            <td>${toxo_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=toxo_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>


       </c:if>

       <c:if test="${fn:containsIgnoreCase(stringOrg, 'Neospora')}"> 

<%-- neospora_genomics --%>
<c:choose>
      <c:when test="${curFilter eq 'neospora_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${neospora_genomics != ''}">
            <td>${neospora_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=neospora_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

 </c:if>
 

<c:if test="${fn:containsIgnoreCase(stringOrg, 'Trich')}"> 

<%-- tv_genomics --%>
    <c:choose>
      <c:when test="${curFilter eq 'tv_genomics'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${tv_genomics != ''}">
            <td>${tv_genomics}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=tv_genomics">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

</c:if>


</tr>
</table>
</div>

