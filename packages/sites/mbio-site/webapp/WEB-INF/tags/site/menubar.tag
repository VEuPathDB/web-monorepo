<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>

<%@ attribute name="refer" 
         type="java.lang.String"
        required="false" 
        description="Page calling this tag"
%>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="userPrefs" value="${wdkUser.user.projectPreferences}"/>
<c:set var="baseUrl" value="${pageContext.request.contextPath}"/>
<c:set var="basketCount" value="${wdkUser.basketCount}"/>

<span class="onload-function" data-function="eupath.setup.configureMenuBar"><jsp:text/></span>
<div id="menu" class="ui-helper-clearfix">

  <ul class="sf-menu">
    <li><a href="${baseUrl}/">Home</a></li>

    <li><a title="START a NEW search strategy. Searches are organized by the genomic feature they return." >New Search</a>
      <imp:drop_down_QG2 /></li>

    <li><a id="mysearch" href="${baseUrl}/showApplication.do" title="Access your Search Strategies Workspace">
      My Strategies</a></li>

    <c:choose>
      <c:when test="${wdkUser == null || wdkUser.guest}">
        <li><a id="mybasket" onclick="wdk.stratTabCookie.setCurrentTabCookie('application', 'basket');wdk.user.login('use baskets', wdk.webappUrl('/showApplication.do'));" href="javascript:void(0)"  title="Group IDs together to work with them. You can add IDs from a result, or from a details page.">My Basket <span class="subscriptCount" style="vertical-align:top">(0)</span></a></li>
      </c:when>
      <c:otherwise>
        <c:choose>
          <c:when test="${refer == 'summary'}">
          <li><a id="mybasket" onclick="wdk.addStepPopup.showPanel('basket');" href="javascript:void(0)" title="Group IDs together to later make a step in a strategy.">My Basket <span class="subscriptCount" style="vertical-align:top">(${basketCount})</span></a></li>
          </c:when>
          <c:otherwise>
          <li><a id="mybasket" onclick="wdk.stratTabCookie.setCurrentTabCookie('application', 'basket');" href="${baseUrl}/showApplication.do" title="Group IDs together to later make a step in a strategy.">My Basket <span class="subscriptCount" style="vertical-align:top">(${basketCount})</span></a></li>
          </c:otherwise>
        </c:choose>
      </c:otherwise>
    </c:choose>


    <c:choose>
      <c:when test="${wdkUser == null || wdkUser.guest}">
        <li id="favorite-menu"><a id="mybasket" onclick="wdk.user.login('use favorites', wdk.webappUrl('/showFavorite.do'));" href="javascript:void(0)">
            <imp:image style="vertical-align:middle" height="20" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time." src="wdk/images/favorite_color.gif"/>&nbsp;
            <span style="vertical-align:middle" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time.">My Favorites</span></a></li>
      </c:when>
      <c:otherwise>
        <li id="favorite-menu"><a href="${baseUrl}/showFavorite.do">
          <imp:image style="vertical-align:middle" height="20" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time." src="wdk/images/favorite_color.gif"/>&nbsp;
          <span style="vertical-align:middle" title="Store IDs for easy access to their details page. You can add IDs *only* from the details page, one at a time.">My Favorites</span></a></li>
      </c:otherwise>
    </c:choose>
  </ul>

</div>

<a name="skip" id="skip"></a>
