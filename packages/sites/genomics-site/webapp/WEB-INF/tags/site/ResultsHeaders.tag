<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<c:set var="td_width" value="${100/(wdkAnswer.attributeLength - 1)}" />
<tr class="headerrow">
  <c:set var="atCount" value ="0" />
  <c:forEach items="${wdkAnswer.summaryAttributes}" var="sumAttrib">
    <c:choose><c:when test="${atCount == 0}"></c:when>
    <c:otherwise>
    <th align="left" valign="middle" width="${td_width}%">
      ${sumAttrib.displayName}
    </th>
    </c:otherwise>
    </c:choose>
   <c:set var="atCount" value ="${atCount+1}" /> 
  </c:forEach>
</tr>

<tr class="subheaderrow">

    <c:set var="sortingAttrNames" value="${wdkAnswer.sortingAttributeNames}" />
    <c:set var="sortingAttrOrders" value="${wdkAnswer.sortingAttributeOrders}" />

    <c:set var="j" value="0"/>

    <c:forEach items="${wdkAnswer.summaryAttributes}" var="sumAttrib">
      <c:if test="${j != 0}">  
	<th align="left" valign="middle">
            <c:set var="attrName" value="${sumAttrib.name}" />
      
            <table border="0" cellspacing="2" cellpadding="0">
                <tr class="headerInternalRow">
                    <td valign="middle">
                        <c:choose>
                            <c:when test="${j != 0 && j != 1}">
                                <%-- display arrange attribute buttons --%>
                                <a href="${commandUrl}&command=arrange&attribute=${attrName}&left=true" 
                                   title="Move ${sumAttrib} left">
                                    <img src="<c:url value='/images/move_left.gif' />" alt="Move left" border="0" /></a>
                            </c:when>
                            <c:otherwise>
                                <img src="<c:url value='/images/move_left_g.gif' />" alt="Move left" border="0" />
                            </c:otherwise>
                        </c:choose>
                    </td>
                    <td valign="middle">
                    <div>
                        <c:choose>
                            <c:when test="${!sumAttrib.sortable}">
                                <img src="<c:url value='/images/sort_up_g.gif' />" alt="Sort up" border="0" />
                            </c:when>
                            <c:when test="${attrName == sortingAttrNames[0] && sortingAttrOrders[0]}">
                                <img src="<c:url value='images/sort_up_h.gif' />"  alt=""
                                    title="Result is sorted by ${sumAttrib}" />
                            </c:when>
                            <c:otherwise>
                                <%-- display sorting buttons --%>
                                <a href="${commandUrl}&command=sort&attribute=${attrName}&sortOrder=asc"
                                    title="Sort by ${sumAttrib}">
                                    <img src="<c:url value='/images/sort_up.gif' />" alt="Sort up" border="0" /></a>
                            </c:otherwise>
                        </c:choose>
                    </div>
                    <div>
                        <c:choose>
                            <c:when test="${!sumAttrib.sortable}">
                                <img src="<c:url value='/images/sort_down_g.gif' />" alt="Sort down" border="0" />
                            </c:when>
                            <c:when test="${attrName == sortingAttrNames[0] && !sortingAttrOrders[0]}">
                                <img src="<c:url value='images/sort_down_h.gif' />"  alt=""
                                    title="Result is reverse sorted by ${sumAttrib}" />
                            </c:when>
                            <c:otherwise>
                                <%-- display sorting buttons --%>
                                <a href="${commandUrl}&command=sort&attribute=${attrName}&sortOrder=desc"
                                    title="Reverse sort by ${sumAttrib}">
                                    <img src="<c:url value='/images/sort_down.gif' />" alt="Sort down" border="0" /></a>
                            </c:otherwise>
                        </c:choose>
                    </div>
                    </td>
                    <td valign="middle">
                        <c:choose>
                            <c:when test="${j != 0 && j != fn:length(wdkAnswer.summaryAttributes) - 1}">
                                <a href="${commandUrl}&command=arrange&attribute=${attrName}&left=false"
                                   title="Move ${sumAttrib} right">
                                    <img src="<c:url value='/images/move_right.gif' />" alt="Move right" border="0" /></a>
                            </c:when>
                            <c:otherwise>
                                <img src="<c:url value='/images/move_right_g.gif' />" alt="Move right" border="0" />
                            </c:otherwise>
                        </c:choose>
                    </td>
                    <td valign="middle">
                        <c:choose>
                            <c:when test="${j != 0}">
                                <%-- display remove attribute buttons --%>
                                <a href="${commandUrl}&command=remove&attribute=${attrName}"
                                    title="Remove ${sumAttrib} column">
                                    <img src="<c:url value='/images/remove.gif' />" alt="remove" border="0" /></a>
                            </c:when>
                            <c:otherwise>
                                <img src="<c:url value='/images/remove_g.gif' />" alt="remove" border="0" />
                            </c:otherwise>
                        </c:choose>
                    </td>
                </tr>
            </table>
        </th>
      </c:if>
      <c:set var="j" value="${j+1}"/>
    </c:forEach>
</tr>
