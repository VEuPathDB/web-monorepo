<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="species"
              description="Restricts output to only this species"
%>

<%@ attribute name="model"
              description="Param used in the cgi (plasmo, tritryp, toxo)"
%>
<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:catch var="tagError">

<c:set value="${wdkRecord.tables['ExpressionGraphs']}" var="tbl"/>
<c:set value="${wdkRecord.tables['ExpressionGraphsData']}" var="dat"/>


<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>

<c:forEach var="row" items="${tbl}">

  <c:if test="${species eq row['species'].value}">

    <c:set var="name" value="${fn:replace(row['module'].value, '::', '')}"/>

    <c:set var="secName" value="${row['module'].value}"/>
    <c:set var="imgId" value="img${secName}"/>
    <c:set var="preImgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${row['project_id'].value}&model=${model}&fmt=png&id=${row['source_id'].value}"/>
    <c:set var="imgSrc" value="${preImgSrc}"/>

    <c:set var="expressionContent">
      <table>

      <FORM NAME="${name}Pick">

        <tr>
        <td>
            <img  id="${imgId}" src="${imgSrc}">

        </td>


      <c:set var="expressionDataTable">
            <table>
              <tr class="headerRow">
               <th style="padding: 10px; align: left">Sample</th>
               <th style="padding: 10px;align: left">Expression Value</th>
               </tr>

            <c:set var="i" value="0"/>

            <c:forEach var="drow" items="${dat}">
              <c:if test="${drow['profile_name'].value eq row['profile_name']}">

        <c:choose>
            <c:when test="${i % 2 == 0}"><tr class="rowLight"></c:when>
            <c:otherwise><tr class="rowMedium"></c:otherwise>
        </c:choose>

                  <td>
                    ${drow['name'].value}
                  </td>
                  <td>
                    ${drow['value'].value}
                  </td>
                </tr>
               <c:set var="i" value="${i +  1}"/>
              </c:if>
            </c:forEach>
            </table>
     </c:set>

        <td class="centered">

<c:if test="${i > 0}">
<wdk:toggle
    name="${row['module'].value}Data"
    displayName="Data Table"
    content="${expressionDataTable}"
    isOpen="false"
    attribution=""/>         

       <br /><br />
</c:if>

       <div class="small">
        <b>Description</b><br />
        ${row['description'].value}<br /><br /><br /> 
        <b>x-axis</b><br />
        ${row['x_axis'].value}<br /><br /><br /> 
        <b>y-axis</b><br />
        ${row['y_axis'].value} 

       <br /><br />
        <b>Choose Graph to Display</b><br />




<SELECT NAME="${name}List"
OnChange="javascript:updateImage('${imgId}', ${name}Pick.${name}List.options[selectedIndex].value)">

<c:forEach var="vp" items="${fn:split(row['visible_parts'].value, ',')}">
<OPTION  VALUE="${preImgSrc}&vp=${vp}">${vp}</OPTION>
</c:forEach>

<OPTION SELECTED="SELECTED" VALUE="${preImgSrc}">ALL</OPTION>

</select>
       </div>
      </td>
     </tr>

      </FORM>
    </table>
  </c:set>


<c:set var="noData" value="false"/>
  <c:if test="${row['has_profile'].value eq '0'}">
    < c:set var="expressionContent" value="none"/>
    <c:set var="noData" value="true"/>
  </c:if>

<wdk:toggle
    name="${row['module'].value}"
    isOpen="true"
    displayName="${row['display_name'].value}"
    content="${expressionContent}"
    noData="${noData}"
    attribution="${row['attribution'].value}"/>

</c:if>

</c:forEach>

</c:catch>
<c:if test="${tagError != null}">
    <c:set var="exception" value="${tagError}" scope="request"/>
    <i>Error. Data is temporarily unavailable</i>
</c:if>


