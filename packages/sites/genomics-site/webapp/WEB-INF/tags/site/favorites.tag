<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="allFavorites" value="${wdkUser.favorites}" /><%-- a map of (RecordClass, List<Favorite>) --%>

<div data-controller="wdk.favorite.init">
  <span class ="h3left">My Favorites</span><br><br>

  <c:choose>
  <c:when test="${fn:length(allFavorites) == 0}">
    <p>Your favorites page is currently empty.  To add items to your favorites simply click on the favorites icon in a record page.</p>
  </c:when>

  <c:otherwise> <%-- has favorites --%>

  <!-- TABS -->
    <ul class="menubar">
      <c:forEach var="fav_item" items="${allFavorites}">
        <c:set var="recordClass" value="${fav_item.key}" />
        <c:set var="favorites" value="${fav_item.value}" /> <%-- a list of favorites of a record type --%>
        <c:set var="idTag" value="${fn:replace(recordClass.fullName, '.', '_')}" />
        <li>
          <a id="tab_${idTag}" href="javascript:void(0)" onclick="wdk.favorite.showFavorites('${idTag}')">${recordClass.displayNamePlural} (${fn:length(favorites)})</a>
        </li>
      </c:forEach>
    </ul>

  <!-- HELP TEXT in RED -->
    <table width="100%">
    <tr>
      <td width="50%" style="padding:0">
        <input class="favorite-refresh-button" style="margin-left:10px;cursor:pointer" title="Reload the page after you click on the star to add/remove IDs." type="button" value="Reload page" onclick="window.location.reload();"/>
      </td>
      <td width="50%" style="text-align:right;padding:0">
        <p class="fav-warning" >
          <b>Note on new releases:</b> IDs sometimes change or are retired. <a  href="#"  class="open-dialog-annot-change"> Why? </a>
          <br>Click on any ID to access the new ID's page. Retired IDs will show a message.
        </p>
      </td>
    </tr>
    <tr>
      <td width="50%" style="padding:0">
        <span style="clear:both;font-style:italic;font-size:90%;padding-left:10px;" >(Mouse over column headings for help)</span>
      </td>
      <td width="50%">
      </td>
    </tr>
    </table>

    <!-- TABLE FOR SPECIFIC RECORD CLASS -->
    <c:forEach var="fav_item" items="${allFavorites}">      <!-- for each record class -->
      <c:set var="recordClass" value="${fav_item.key}" />
      <c:set var="idTag" value="${fn:replace(recordClass.fullName, '.', '_')}" /> 
      <div id="favorites_${idTag}" class="favorites_panel">
        <c:set var="favorites" value="${fav_item.value}" /> <%-- a list of favorites of a record type --%>

        <table class="favorite-list mytableStyle" width="100%">
        <tr>
          <th title="Click on the star to remove an ID from Favorites. It will not be removed from this page until you hit 'Refresh' or reload the page." 
            class="mythStyle clickable">${recordClass.displayNamePlural}</th>
          <th title="Use this column to add notes (click Edit to change this field). Initially it contains the product name associated with the ID."  
            class="mythStyle clickable">Notes</th>
          <th title="Organize your favorites by project names. Click Edit to add/change it; IDs with the same project name will be sorted together once the page is refreshed."  
            class="mythStyle clickable">Project</th>
        </tr>

        <c:forEach var="favorite" items="${favorites}">    <!-- for each favorite ID in the list -->
          <c:set var="basketColor" value="gray"/>
          <c:set var="basketValue" value="0"/>
          <c:set var="primaryKey" value="${favorite.primaryKey}"/>
          <c:set var="pkValues" value="${primaryKey.values}" />
          <c:set value="${pkValues['gene_source_id']}" var="geneid"/>
          <c:set value="${pkValues['source_id']}" var="id"/>
          <c:set value="${pkValues['project_id']}" var="pid"/>

          <tr class="wdk-record" recordClass="${recordClass.fullName}">
 
            <!-- RECORDCLASS NAME -->
            <td width="10%" class="mytdStyle" nowrap>
              <span class="primaryKey">
                <c:forEach var="pk_item" items="${pkValues}">
                  <span key="${pk_item.key}">${pk_item.value}</span>
                </c:forEach>
              </span>
              <imp:image class="clickable" src="wdk/images/favorite_color.gif" 
                title="Click to remove this item from favorites and reload page"
                height="16px" style="vertical-align:text-bottom"
                onClick="wdk.favorite.updateFavorite(this, 'remove')"/>&nbsp;
<c:choose>
<c:when test="${ fn:containsIgnoreCase(idTag, 'Transcript') }"> 
              <c:set var="url" value="/showRecord.do?name=${recordClass.fullName}&gene_source_id=${geneid}" />
              <a title="Click to access this ID's page" href="<c:url value='${url}' />">${geneid}</a>
</c:when>
<c:otherwise>
              <c:set var="url" value="/showRecord.do?name=${recordClass.fullName}&source_id=${id}" />
              <a title="Click to access this ID's page" href="<c:url value='${url}' />">${id}</a>
</c:otherwise>
</c:choose>
            </td>
            <!-- NOTES -->
            <td width="60%"  class="mytdStyle" >
              <c:set var="favNote" value="${favorite.note}"/>
              <span class="favorite-note">${fn:escapeXml(favNote)}</span>
              <textarea class="favorite-note hidden input" rows="2" cols="198" name="favorite-note">${favNote}</textarea>
              <div class="favorite-button-div"><a href="javascript:void(0)" class="favorite-note-button" onClick="wdk.favorite.showInputBox(this, 'note', 'wdk.favorite.updateFavoriteNote(this)')" >edit</a></div>
            </td>
            <!-- PROJECT -->
            <td width="30%"  class="mytdStyle" >
              <c:set var="favGroup" value="${favorite.group}"/>
              <input type="text" class="favorite-group hidden input" name="favorite-group" maxlength="42" value="${favGroup}"/>
              <c:set var="favGroupStyle" value=""/>
              <c:if test="${fn:length(favGroup) == 0}">
                <c:set var="favGroup" value="Click edit to add a project"/>
                <c:set var="favGroupStyle" value="opacity:0.2"/>
              </c:if>
              <span class="favorite-group" style="${favGroupStyle}">${favGroup}</span>
              <a href="javascript:void(0)" class="favorite-group-button" onClick="wdk.favorite.showInputBox(this, 'group', 'wdk.favorite.updateFavoriteGroup(this)')">edit</a>
            </td>
          </tr>
        </c:forEach>
        </table>
      </div>
    </c:forEach>
  </c:otherwise> <%-- END has favorites --%>
</c:choose>

</div>

