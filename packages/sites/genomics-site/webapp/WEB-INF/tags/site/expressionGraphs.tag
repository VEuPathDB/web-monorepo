<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%@ attribute name="species"
              description="Restricts output to only this species"
%>

<%@ attribute name="model"
              description="Param used in the cgi (plasmo, tritryp, toxo)"
%>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set value="${wdkRecord.tables['ExpressionGraphs']}" var="tbl"/>

<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>

<c:set var="i" value="0"/>
<c:forEach var="row" items="${tbl}">

  <c:if test="${species eq row['species'].value}">

    <c:set var="secName" value="${row['module'].value}"/>
    <c:set var="imgSrc"
    value="${plotBaseUrl}?type=${secName}&project_id=${row['project_id'].value}&model=${model}&fmt=png&id=${row['source_id'].value}"/>

    <c:set var="expressionContent">
      <table>
        <tr valign="top">
          <td>
            <img src="${imgSrc}">
          </td>

        <td style="vertical-align: middle">
       <div class="small">
        <b>Description</b><br />
        ${row['description'].value}<br /><br /><br /> 
        <b>x-axis</b><br />
        ${row['x_axis'].value}<br /><br /><br /> 
        <b>y-axis</b><br />
        ${row['y_axis'].value} 

       </div>
      </td>
     </tr>

    </table>
  </c:set>

  <c:if test="${row['has_profile'].value eq '0'}">
    < c:set var="expressionContent" value="none"/>
  </c:if>





<wdk:toggle
    name="${row['profile_name'].value}"
    isOpen="true"
    displayName="${row['display_name'].value}"
    content="${expressionContent}"
    attribution="${row['attribution'].value}"/>

</c:if>

</c:forEach>



