<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="species"
              description="Restricts output to only this species"
%>

<%@ attribute name="model"
              description="Param used in the cgi (plasmo, tritryp, toxo, giardia)"
%>

        <c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<c:set value="${wdkRecord.tables['ExpressionGraphs']}" var="tbl"/>

<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>

<c:forEach var="row" items="${tbl}">

  <c:if test="${species eq row['species'].value}">

    <c:set var="name" value="${fn:replace(row['module'].value, '::', '')}"/>

    <c:set var="secName" value="${row['module'].value}"/>
    <c:set var="imgId" value="img${secName}"/>
    <c:set var="preImgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${row['project_id'].value}&model=${model}&fmt=png&id=${row['source_id'].value}"/>
    <c:set var="imgSrc" value="${preImgSrc}"/>

    <c:set var="selectList">
        <SELECT NAME="${name}List"
        OnChange="javascript:updateImage('${imgId}', ${name}Pick.${name}List.options[selectedIndex].value)">

        <c:set var="vp_i" value="0"/>
        <c:set var="defaultVp" value=""/>
        <c:forEach var="vp" items="${fn:split(row['visible_parts'].value, ',')}">

          <c:choose>
            <c:when test="${vp_i == 0}">
              <OPTION SELECTED="SELECTED" VALUE="${preImgSrc}&vp=_LEGEND,${vp}">${vp}</OPTION>
              <c:set var="imgSrc" value="${imgSrc}&vp=_LEGEND,${vp}"/>
              <c:set var="defaultVp" value="${vp}"/>
            </c:when>
            <c:otherwise>
              <OPTION  VALUE="${preImgSrc}&vp=_LEGEND,${vp}">${vp}</OPTION>
            </c:otherwise>
          </c:choose>


          <c:set var="vp_i" value="${vp_i +  1}"/>
        </c:forEach>

          <OPTION VALUE="${preImgSrc}">ALL</OPTION>

        </select>
    </c:set>


    <c:set var="expressionContent">
      <table>

      <FORM NAME="${name}Pick">

        <tr>
        <td>

            <img  id="${imgId}" src="${imgSrc}">

        </td>

                 <c:set var="noExpressionDataTable">false</c:set>


        <td class="centered">



         <c:set var="expressionDataTable">
           <c:set var="prefix" value="<%= request.getRequestURL() %>" />
           <c:set var="tableSrc" value="${plotBaseUrl}?type=${secName}&project_id=${row['project_id'].value}&model=${model}&fmt=table&id=${row['source_id'].value}&vp=${defaultVp}"/>
           <c:import url="${prefix}/../../../../../${tableSrc}"  />  
         </c:set>


<wdk:toggle
    name="${row['profile_name'].value}Data"
    displayName="Data Table"
    content="${expressionDataTable}"
    isOpen="${row['dataOpen'].value}"
    noData="${noExpressionDataTable}"
    attribution=""/>   










       <br /><br />



       <div class="small">
        <b>Description</b><br />
        ${row['description'].value}<br /><br /><br /> 
        <b>x-axis</b><br />
        ${row['x_axis'].value}<br /><br /><br /> 
        <b>y-axis</b><br />
        ${row['y_axis'].value} 

       <br /><br />
        <b>Choose Graph to Display</b><br />



        ${selectList}

       </div>
      </td>
     </tr>

      </FORM>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${row['has_profile'].value eq '0'}">
    <c:set var="expressionContent" value="none"/>
    <c:set var="noData" value="true"/>

    <c:if test="${row['profile_name'] eq 'Expression profiling of Tbrucei five life cycle stages'}">
        <c:set var="expressionContent" value="<i>None</i>  NOTE: For this experiment, in the cases where the probe set mapped to near-identical genes, data was assigned to a single representative gene."/>
        <c:set var="noData" value="false"/>
    </c:if>


  </c:if>

<wdk:toggle
    name="${row['profile_name'].value}"
    isOpen="${row['mainOpen'].value}"
    noData="${noData}"
    displayName="${row['display_name'].value}"
    content="${expressionContent}"
    attribution="${row['attribution'].value}"/>

</c:if>

</c:forEach>



