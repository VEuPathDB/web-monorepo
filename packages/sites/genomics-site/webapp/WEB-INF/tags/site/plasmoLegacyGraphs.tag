<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>

<%@ attribute name="organism"
              description="Which graphs to show."
%>


<%@ attribute name="id"
              description="Which gene page are we on"
%>





<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>
<c:set var="projectId" value="PlasmoDB"/>


<c:if test="${organism eq 'Plasmodium falciparum 3D7'}">

  <c:set var="secName" value="Daily::SortedRmaAndPercentiles"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="typeArg" value="patient-number"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}&typeArg=${typeArg}"/>

  <c:set var="isOpen" value="false"/>

<c:set var="preImgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}&typeArg="/>

  <c:set var="expressionContent">

    <table width="95%">
<FORM NAME="DailySort">
      <tr>
        <td rowspan=2 class="centered">
          <c:choose>
          <c:when test="${!async}">
              <img id="${imgId}" src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
         <td  class="centered"  nowrap><b>Sort By:</b>
<SELECT NAME="DailyList"
OnChange="javascript:wdk.api.updateImage('${imgId}', DailySort.DailyList.options[selectedIndex].value)">
<OPTION SELECTED="SELECTED" VALUE="${preImgSrc}patient-number">patient-number</OPTION>
<OPTION VALUE="${preImgSrc}age">age</OPTION>
<OPTION VALUE="${preImgSrc}temperature">temperature</OPTION>
<OPTION VALUE="${preImgSrc}weight">weight</OPTION>
<OPTION VALUE="${preImgSrc}days-ill">days-ill</OPTION>
<OPTION VALUE="${preImgSrc}parasitemia">parasitemia</OPTION>
<OPTION VALUE="${preImgSrc}hct">hct</OPTION>
<OPTION VALUE="${preImgSrc}TNFa">TNFa</OPTION>
<OPTION VALUE="${preImgSrc}TGFa">TGFa</OPTION>
<OPTION VALUE="${preImgSrc}Lymphotactin">Lymphotactin</OPTION>
<OPTION VALUE="${preImgSrc}Tissue-Factor">Tissue-Factor</OPTION>
<OPTION VALUE="${preImgSrc}P-selectin">P-selectin</OPTION>
<OPTION VALUE="${preImgSrc}VCAM1">VCAM1</OPTION>
<OPTION VALUE="${preImgSrc}IL6">IL6</OPTION>
<OPTION VALUE="${preImgSrc}IL10">IL10</OPTION>
<OPTION VALUE="${preImgSrc}IL12p70">IL12p70</OPTION>
<OPTION VALUE="${preImgSrc}IL15">IL15</OPTION>
</select>
    </td></tr>

    <tr>
      <td  class="centered"><div class="small">Correlations between the expressoin level and various measured factors are shown.  The patient samples (x axis) can be ordered based on any factor using the drop down list.  The patient number is always displayed with the factor value. Colors indicate clusters based on Daily et. al. publication (see data source). Blue= cluster1 (starvation response), purple=cluster2 (early ring stage), peach= cluster3 (env. stress). 
      </div>   
   </td>
    </tr>
</FORM>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>
  <c:if test="${attrs['graph_daily'].value == 0}">
    <c:set var="noData" value="true"/>
  </c:if>

  <imp:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Distinct physiological states of <i>Plasmodium falciparum</i> in malaria infected patients"
               attribution="pfal3D7_microarrayExpression_Daily_Patients_RSRC"/>


</c:if>
