<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>

<!-- display page header with recordClass type in banner -->
<site:header refer="recordPage" banner="Favorite page"/>

<c:set var="allFavorites" value="${wdkUser.favorites}" /><%-- a map of (RecordClass, List<Favorite>) --%>
<c:choose>
    <c:when test="${fn:length(allFavorites) == 0}">
        <p>You don't have any favorite IDs. You can add IDs to Favorites from the ID record page.</p>
    </c:when>
    <c:otherwise> <%-- has favorites --%>
        <input type="button" value="Refresh" onclick="window.location.reload();"/>
		<div id="favorites">
            <c:forEach var="fav_item" items="${allFavorites}">
                <c:set var="favorites" value="${fav_item.value}" /> <%-- a list of favorites of a record type --%>
                <c:set var="recordClass" value="${fav_item.key}" />
                <span class ="h4left">My Favorite ${recordClass.type}s (${fn:length(favorites)} ${recordClass.type}s)</span><br><br>

                <table class="favorite-list mytableStyle" width="93%">
                    <tr>
			<th  class="mythStyle">${recordClass.type}s</th><th  class="mythStyle">Notes</th><th  class="mythStyle">Project</th>
		    </tr>
                    <c:forEach var="favorite" items="${favorites}">
                        <c:set var="record" value="${favorite.recordInstance}" />
                        <c:set var="basketColor" value="gray"/>
						<c:set var="basketValue" value="0"/>
						<c:if test="${record.inBasket}">
							<c:set var="basketColor" value="color"/>
							<c:set var="basketValue" value="1"/>
						</c:if>
						<c:set var="primaryKey" value="${record.primaryKey}"/>
                        <c:set var="pkValues" value="${primaryKey.values}" />
                        <c:set value="${pkValues['source_id']}" var="id"/>
                        <c:set value="${pkValues['project_id']}" var="pid"/>
                        <tr class="wdk-record" recordClass="${recordClass.fullName}">
                            <td width="10%" class="mytdStyle" nowrap>
                                <span class="primaryKey">
                                    <c:forEach var="pk_item" items="${pkValues}">
                                        <span key="${pk_item.key}">${pk_item.value}</span>
                                    </c:forEach>
                                </span>
                                <img class="clickable" src="<c:url value='/wdk/images/favorite_color.gif'/>" 
                                     title="Click to remove this item from the Favorite."
				     height="16px" style="vertical-align:text-bottom"
                                     onClick="updateFavorite(this, 'remove')"/>&nbsp;
                                <img class="clickable" src="<c:url value='/wdk/images/basket_${basketColor}.png'/>" 
                                     title="Click to add/remove this item from the Basket."
				     height="16px"  style="vertical-align:text-bottom"
                                     onClick="updateBasket(this,'recordPage', '${id}', '${pid}', '${recordClass.fullName}')" value="${basketValue}"/>&nbsp;

                            <%--</td>
                            <td>--%>
                                <c:set var="url" value="/showRecord.do?name=${recordClass.fullName}" />
                                <c:forEach var="pk_item" items="${pkValues}">
                                    <c:set var="url" value="${url}&${pk_item.key}=${pk_item.value}" />
                                </c:forEach>
                                <a href="<c:url value='${url}' />">${primaryKey.value}</a>
                            </td>
                            <td width="60%"  class="mytdStyle" >
								<c:set var="favNote" value="${favorite.note}"/>
                                <span class="favorite-note">${favNote}</span>
                                <div class="favorite-button-div"><a href="javascript:void(0)" class="favorite-note-button" onClick="showInputBox(this, 'note', 'updateFavoriteNote(this)')" >edit</a></div>
                            </td>
                            <td width="30%"  class="mytdStyle" >
								<c:set var="favGroup" value="${favorite.group}"/>
								<c:set var="favGroupStyle" value=""/>
								<c:if test="${fn:length(favGroup) == 0}">
									<c:set var="favGroup" value="Click edit to add a project"/>
									<c:set var="favGroupStyle" value="opacity:0.2"/>
								</c:if>
                                <span class="favorite-group" style="${favGroupStyle}">${favGroup}</span>
                                <a href="javascript:void(0)" class="favorite-group-button" onClick="showInputBox(this, 'group', 'updateFavoriteGroup(this)')">edit</a>
                            </td>
                        </tr>
                    </c:forEach>
                </table>
             </c:forEach>
        </div>
		<div id="groups-list" style="display:none">
			<ul>	
			</ul>
		</div>
    </c:otherwise> <%-- END has favorites --%>
</c:choose>

<site:footer/>
