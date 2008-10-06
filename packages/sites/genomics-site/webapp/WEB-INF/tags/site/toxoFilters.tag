<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%@ attribute name="historyId"         required="true"  %>

<%-- initialize filter link variables --%>
<c:set var="all_results" value=""/>
<c:set var="all_tg_results" value=""/>
<c:set var="toxo_genes" value=""/>
<c:set var="neospora_genes" value=""/>
<c:set var="gt1_genes" value=""/>
<c:set var="gt1_instances" value=""/>
<c:set var="me49_genes" value=""/>
<c:set var="me49_instances" value=""/>
<c:set var="veg_genes" value=""/>
<c:set var="veg_instances" value=""/>
<c:set var="each_tg_instance" value=""/>
<c:set var="all_min_gt1" value=""/>
<c:set var="all_min_me49" value=""/>
<c:set var="all_min_veg" value=""/>
<c:set var="gt1_min_me49" value=""/>
<c:set var="gt1_int_me49" value=""/>
<c:set var="me49_min_gt1" value=""/>
<c:set var="gt1_min_veg" value=""/>
<c:set var="gt1_int_veg" value=""/>
<c:set var="veg_min_gt1" value=""/>
<c:set var="me49_min_veg" value=""/>
<c:set var="me49_int_veg" value=""/>
<c:set var="veg_min_me49" value=""/>

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
      <c:when test="${cacheItem.key == 'all_tg_results'}">
        <c:set var="all_tg_results" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'toxo_genes'}">
        <c:set var="toxo_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'neospora_genes'}">
        <c:set var="neospora_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'gt1_genes'}">
        <c:set var="gt1_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'gt1_instances'}">
        <c:set var="gt1_instances" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'me49_genes'}">
        <c:set var="me49_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'me49_instances'}">
        <c:set var="me49_instances" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'veg_genes'}">
        <c:set var="veg_genes" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'veg_instances'}">
        <c:set var="veg_instances" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'each_tg_instance'}">
        <c:set var="each_tg_instance" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'all_min_gt1'}">
        <c:set var="all_min_gt1" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'all_min_me49'}">
        <c:set var="all_min_me49" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'all_min_veg'}">
        <c:set var="all_min_veg" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'gt1_min_me49'}">
        <c:set var="gt1_min_me49" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'gt1_int_me49'}">
        <c:set var="gt1_int_me49" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'me49_min_gt1'}">
        <c:set var="me49_min_gt1" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'gt1_min_veg'}">
        <c:set var="gt1_min_veg" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'gt1_int_veg'}">
        <c:set var="gt1_int_veg" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'veg_min_gt1'}">
        <c:set var="veg_min_gt1" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'me49_min_veg'}">
        <c:set var="me49_min_veg" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'me49_int_veg'}">
        <c:set var="me49_int_veg" value="${cacheItem.value}"/>
      </c:when>
      <c:when test="${cacheItem.key == 'veg_min_me49'}">
        <c:set var="veg_min_me49" value="${cacheItem.value}"/>
      </c:when>
    </c:choose>
    </c:forEach>
  </c:if>
</c:if>

<!-- display basic filters -->
<div class="filter">
<table cellpadding="5" border="1">
  <tr>
    <th>All Results</th>
    <th>Tg Results</th>
    <th>Tg Genes</th>
    <th>Nc Genes</th>
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
      <c:when test="${curFilter eq 'all_tg_results'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${all_tg_results != ''}">
            <td>${all_tg_results}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=all_tg_results">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
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
  </tr>
</table>
</div>

<div class="filter">
<table cellpadding="5" border="1">
  <tr>
    <th colspan="2">GT1</th>
    <th colspan="2">ME49</th>
    <th colspan="2">VEG</th>
    <th>All Tg Strains</th>
  </tr>
  <tr align="center">
    <c:choose>
      <c:when test="${curFilter eq 'gt1_instances'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${gt1_instances != ''}">
            <td>${gt1_instances}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=gt1_instances">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'gt1_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${gt1_genes != ''}">
            <td>${gt1_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=gt1_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'me49_instances'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${me49_instances != ''}">
            <td>${me49_instances}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=me49_instances">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'me49_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${me49_genes != ''}">
            <td>${me49_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=me49_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'veg_instances'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${veg_instances != ''}">
            <td>${veg_instances}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=veg_instances">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
    <c:choose>
      <c:when test="${curFilter eq 'veg_genes'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${veg_genes != ''}">
            <td>${veg_genes}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=veg_genes">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>

    <c:choose>
      <c:when test="${curFilter eq 'each_tg_instance'}">
        <td class="selected">${wdkHistory.filterSize}
      </c:when>
      <c:otherwise>
	<c:choose>
          <c:when test="${each_tg_instance != ''}">
            <td>${each_tg_instance}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=each_tg_instance">&nbsp;</a>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose></td>
  </tr>
</table>
</div>
<!-- display "advanced" filters -->
<c:choose>
  <c:when test="${filtersParam == 'Hide'}">
    <div class="clear_all"><span id="toggle_filter">Show</span> comparison of similarities and differences between strains.</div>
    <div id="advanced_filters" class="hidden">
  </c:when>
  <c:otherwise>
    <div class="clear_all"><span id="toggle_filter">Hide</span> comparison of similarities and differences between strains.</div>
    <div id="advanced_filters">
  </c:otherwise>
</c:choose>
   <div class="filter">
      <table cellpadding="5" border="1">
        <tr>
          <td class="rowHeader">Tg genes minus GT1</td>
          <c:choose>
            <c:when test="${curFilter eq 'all_min_gt1'}">
              <td class="selected">${wdkHistory.filterSize}
            </c:when>
            <c:otherwise>
	<c:choose>
          <c:when test="${all_min_gt1 != ''}">
            <td>${all_min_gt1}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=all_min_gt1">&nbsp;</a>
          </c:otherwise>
        </c:choose>
            </c:otherwise>
          </c:choose></td>
        </tr>
        <tr>
          <td class="rowHeader">Tg genes minus ME49</td>
          <c:choose>
            <c:when test="${curFilter eq 'all_min_me49'}">
              <td class="selected">${wdkHistory.filterSize}
            </c:when>
            <c:otherwise>
	<c:choose>
          <c:when test="${all_min_me49 != ''}">
            <td>${all_min_me49}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=all_min_me49">&nbsp;</a>
          </c:otherwise>
        </c:choose>
            </c:otherwise>
          </c:choose></td>
        </tr>
        <tr>
          <td class="rowHeader">Tg genes minus VEG</td>
          <c:choose>
            <c:when test="${curFilter eq 'all_min_veg'}">
              <td class="selected">${wdkHistory.filterSize}
            </c:when>
            <c:otherwise>
	<c:choose>
          <c:when test="${all_min_veg != ''}">
            <td>${all_min_veg}
          </c:when>
          <c:otherwise>
            <td><a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=all_min_veg">&nbsp;</a>
          </c:otherwise>
        </c:choose>
            </c:otherwise>
          </c:choose></td>
        </tr>
      </table>
   </div>
   <div class="filter labels">
     <ul>
       <li class="top_label">GT1</li>
       <li class="bottom_label">ME49</li>
     </ul>
   </div>
   <c:choose>
     <c:when test="${curFilter eq 'gt1_min_me49'}">
       <div class="filter diagram top_selected">
       <%-- <div class="filter diagram gt1_me49 gt1_selected"> --%>
     </c:when>
     <c:when test="${curFilter eq 'gt1_int_me49'}">
       <div class="filter diagram int_selected">
       <%-- <div class="filter diagram gt1_me49 int_selected"> --%>
     </c:when>
     <c:when test="${curFilter eq 'me49_min_gt1'}">
       <div class="filter diagram btm_selected">
       <%-- <div class="filter diagram gt1_me49 me49_selected"> --%>
     </c:when>
     <c:otherwise>
       <div class="filter diagram">
       <%-- <div class="filter diagram gt1_me49"> --%>
     </c:otherwise>
   </c:choose>
     <ul>
       <c:choose>
         <c:when test="${curFilter eq 'gt1_min_me49'}">
           <li class="selected">${wdkHistory.filterSize}
         </c:when>
         <c:otherwise>
         <li>
	<c:choose>
          <c:when test="${gt1_min_me49 != ''}">
            ${gt1_min_me49}
          </c:when>
          <c:otherwise>
           <a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=gt1_min_me49">&nbsp;</a>
          </c:otherwise>
        </c:choose>
         </c:otherwise>
       </c:choose>
       </li>
       <c:choose>
         <c:when test="${curFilter eq 'gt1_int_me49'}">
           <li class="selected">${wdkHistory.filterSize}
         </c:when>
         <c:otherwise>
         <li>
	<c:choose>
          <c:when test="${gt1_int_me49 != ''}">
            ${gt1_int_me49}
          </c:when>
          <c:otherwise>
           <a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=gt1_int_me49">&nbsp;</a>
          </c:otherwise>
        </c:choose>
         </c:otherwise>
       </c:choose>
       </li>
       <c:choose>
         <c:when test="${curFilter eq 'me49_min_gt1'}">
           <li class="selected">${wdkHistory.filterSize}
         </c:when>
         <c:otherwise>
         <li>
	<c:choose>
          <c:when test="${me49_min_gt1 != ''}">
            ${me49_min_gt1}
          </c:when>
          <c:otherwise>
           <a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=me49_min_gt1">&nbsp;</a>
          </c:otherwise>
        </c:choose>
         </c:otherwise>
       </c:choose>
       </li>
     </ul>
   </div>
   <div class="filter labels">
     <ul>
       <li class="top_label">GT1</li>
       <li class="bottom_label">VEG</li>
     </ul>
   </div>
   <c:choose>
     <c:when test="${curFilter eq 'gt1_min_veg'}">
       <div class="filter diagram top_selected">
       <%-- <div class="filter diagram gt1_veg gt1_selected"> --%>
     </c:when>
     <c:when test="${curFilter eq 'gt1_int_veg'}">
       <div class="filter diagram int_selected">
       <%-- <div class="filter diagram gt1_veg int_selected"> --%>
     </c:when>
     <c:when test="${curFilter eq 'veg_min_gt1'}">
       <div class="filter diagram btm_selected">
       <%-- <div class="filter diagram gt1_veg veg_selected"> --%>
     </c:when>
     <c:otherwise>
       <div class="filter diagram">
       <%-- <div class="filter diagram gt1_veg"> --%>
     </c:otherwise>
   </c:choose>
     <ul>
       <c:choose>
         <c:when test="${curFilter eq 'gt1_min_veg'}">
           <li class="selected">${wdkHistory.filterSize}
         </c:when>
         <c:otherwise>
         <li>
	<c:choose>
          <c:when test="${gt1_min_veg != ''}">
            ${gt1_min_veg}
          </c:when>
          <c:otherwise>
           <a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=gt1_min_veg">&nbsp;</a>
          </c:otherwise>
        </c:choose>
         </c:otherwise>
       </c:choose>
       </li>
       <c:choose>
         <c:when test="${curFilter eq 'gt1_int_veg'}">
           <li class="selected">${wdkHistory.filterSize}
         </c:when>
         <c:otherwise>
         <li>
	<c:choose>
          <c:when test="${gt1_int_veg != ''}">
            ${gt1_int_veg}
          </c:when>
          <c:otherwise>
           <a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=gt1_int_veg">&nbsp;</a>
          </c:otherwise>
        </c:choose>
         </c:otherwise>
       </c:choose>
       </li>
       <c:choose>
         <c:when test="${curFilter eq 'veg_min_gt1'}">
           <li class="selected">${wdkHistory.filterSize}
         </c:when>
         <c:otherwise>
         <li>
	<c:choose>
          <c:when test="${veg_min_gt1 != ''}">
            ${veg_min_gt1}
          </c:when>
          <c:otherwise>
           <a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=veg_min_gt1">&nbsp;</a>
          </c:otherwise>
        </c:choose>
         </c:otherwise>
       </c:choose>
       </li>
     </ul>
   </div>
   <div class="filter labels">
     <ul>
       <li class="top_label">ME49</li>
       <li class="bottom_label">VEG</li>
     </ul>
   </div>
   <c:choose>
     <c:when test="${curFilter eq 'me49_min_veg'}">
       <div class="filter diagram top_selected">
       <%-- <div class="filter diagram me49_veg me49_selected"> --%>
     </c:when>
     <c:when test="${curFilter eq 'me49_int_veg'}">
       <div class="filter diagram int_selected">
       <%-- <div class="filter diagram me49_veg int_selected"> --%>
     </c:when>
     <c:when test="${curFilter eq 'veg_min_me49'}">
       <div class="filter diagram btm_selected">
       <%-- <div class="filter diagram me49_veg veg_selected"> --%>
     </c:when>
     <c:otherwise>
       <div class="filter diagram">
       <%-- <div class="filter diagram me49_veg"> --%>
     </c:otherwise>
   </c:choose>
     <ul>
       <c:choose>
         <c:when test="${curFilter eq 'me49_min_veg'}">
           <li class="selected">${wdkHistory.filterSize}
         </c:when>
         <c:otherwise>
         <li>
	<c:choose>
          <c:when test="${me49_min_veg != ''}">
            ${me49_min_veg}
          </c:when>
          <c:otherwise>
           <a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=me49_min_veg">&nbsp;</a>
          </c:otherwise>
        </c:choose>
         </c:otherwise>
       </c:choose>
       </li>
       <c:choose>
         <c:when test="${curFilter eq 'me49_int_veg'}">
           <li class="selected">${wdkHistory.filterSize}
         </c:when>
         <c:otherwise>
         <li>
	<c:choose>
          <c:when test="${me49_int_veg != ''}">
            ${me49_int_veg}
          </c:when>
          <c:otherwise>
           <a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=me49_int_veg">&nbsp;</a>
          </c:otherwise>
        </c:choose>
         </c:otherwise>
       </c:choose>
       </li>
       <c:choose>
         <c:when test="${curFilter eq 'veg_min_me49'}">
           <li class="selected">${wdkHistory.filterSize}
         </c:when>
         <c:otherwise>
         <li>
	<c:choose>
          <c:when test="${veg_min_me49 != ''}">
            ${veg_min_me49}
          </c:when>
          <c:otherwise>
           <a class="filter_link" href="getFilterLink.do?wdk_history_id=${historyId}&filter=veg_min_me49">&nbsp;</a>
          </c:otherwise>
        </c:choose>
         </c:otherwise>
       </c:choose>
       </li>
     </ul>
   </div>
</div>
