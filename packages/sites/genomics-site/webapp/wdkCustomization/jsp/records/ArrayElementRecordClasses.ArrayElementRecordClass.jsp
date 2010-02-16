<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>

<c:set var="attrs" value="${wdkRecord.attributes}"/>

<c:set var="primaryKey" value="${wdkRecord.primaryKey}"/>
<c:set var="pkValues" value="${primaryKey.values}" />
<c:set var="projectId" value="${pkValues['project_id']}" />
<c:set var="id" value="${pkValues['source_id']}" />

<c:catch var="err">

  <c:set var="organism" value="${attrs['organism'].value}"/>
  <c:set var="provider" value="${attrs['provider'].value}"/>
  <c:set var="sequence" value="${attrs['sequence'].value}"/>
  <c:set var="async" value="${param.sync != '1'}"/>

  <c:choose>
    <c:when test="${fn:contains(organism,'vivax')}">
      <c:set var="species" value="vivax"/>
    </c:when>
    <c:when test="${fn:contains(organism,'yoelii')}">
      <c:set var="species" value="yoelii"/>
    </c:when>
    <c:when test="${fn:contains(organism,'falciparum')}">
      <c:set var="species" value="falciparum"/>
    </c:when>
    <c:when test="${fn:contains(organism,'berghei')}">
      <c:set var="species" value="berghei"/>
    </c:when>
    <c:when test="${fn:contains(organism,'chabaudi')}">
      <c:set var="species" value="chabaudi"/>
    </c:when>
    <c:when test="${fn:contains(organism,'knowlesi')}">
      <c:set var="species" value="knowlesi"/>
    </c:when>
    <c:otherwise>
      <c:set var="species_error">
        <b>ERROR: setting species for organism "${organism}"</b>
      </c:set>
    </c:otherwise>
  </c:choose>
  
</c:catch>


<site:header title="PlasmoDB : Array element ${id}"
             banner="${organism}<br>Array element<br>${provider}: ${id}"
             divisionName="Array Element Record"
             division="queries_tools"
             summary=""/>

<c:choose>
<c:when test="${!wdkRecord.validRecord}">
  <h2 style="text-align:center;color:#CC0000;">The Array Element '${id}' was not found.</h2>
</c:when>
<c:otherwise>

<c:if test="${species_error != null}">${species_error}</c:if>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white
       class=thinTopBottomBorders>

 <tr>
  <td bgcolor=white valign=top>

<c:set var="plotBaseUrl" value="/cgi-bin/dataPlotter.pl"/>

<c:if test="${species eq 'falciparum'}">
<br>
Also see <a href="http://malaria.ucsf.edu/comparison/comp_oligolink.php?OLIGO=${id}">${id}</a> at the DeRisi Lab

<br>
<br>
</c:if>

  <table border="0" width="100%">
  <tr><td><b>Sequence</b></td>
  <td><font size="-1">${sequence}</font></td></tr>
  </table>

  <wdk:wdkTable tblName="GenomicLocations" isOpen="true"
                 attribution=""/>

  <wdk:wdkTable tblName="Genes" isOpen="true"
                 attribution=""/>

<c:if test="${species eq 'falciparum'}">


  <c:set var="secName" value="DeRisiByOligo::3D7"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      <td><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
      <td>
        <div class="small">
          <b>x-axis (all graphs)</b><br>
          Time in hours after adding synchronized culture of <B>3D7</B> parasites
          to fresh blood

          <br><br>
          <b>graph #1</b><br>
          <font color="#4343ff"><b>blue plot:</b></font><br>
          averaged smoothed normalized log (base 2) of cy5/cy3 for ${id}<br>
          <font color="#bbbbbb"><b>gray plot:</b></font><br>
          averaged normalized log (base 2) of cy5/cy3 for ${id}
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
      <td>
        <div class="small">
          <b>y-axis (graph #2)</b><br>
          Expression intensity percentile<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
      <td>
        <div class="small">
          <b>y-axis (graph #3)</b><br>
          Lifecycle stage<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Developmental series 3D7 (glass slide oligo array)"
               attribution="derisi_3D7_time_series,DeRisi_oligos"/>

  <c:set var="secName" value="DeRisiByOligo::Dd2"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      <td><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
      <td>
        <div class="small">
          <b>x-axis (all graphs)</b><br>
          Time in hours after adding synchronized culture of
          <b>DD2</b> parasites
          to fresh blood

          <br><br>
          <b>graph #1</b><br>
          <font color="#4343ff"><b>blue plot:</b></font><br>
          averaged smoothed normalized log (base 2) of cy5/cy3 for ${id}<br>
          <font color="#bbbbbb"><b>gray plot:</b></font><br>
          averaged normalized log (base 2) of cy5/cy3 for ${id}
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
      <td>
        <div class="small">
          <b>y-axis (graph #2)</b><br>
          Expression intensity percentile<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
      <td>
        <div class="small">
          <b>y-axis (graph #3)</b><br>
          Lifecycle stage<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Developmental series Dd2 (glass slide oligo array)"
               attribution="derisi_Dd2_time_series,DeRisi_oligos"/>

  <c:set var="secName" value="DeRisiByOligo::HB3"/>
  <c:set var="imgId" value="img${secName}"/>
  <c:set var="imgSrc" value="${plotBaseUrl}?type=${secName}&project_id=${projectId}&model=plasmo&fmt=png&id=${id}"/>
  <c:set var="isOpen" value="false"/>

  <c:set var="expressionContent">
    <table>
      <tr>
        <td rowspan="3">
          <c:choose>
          <c:when test="${!async}">
              <img src="${imgSrc}">
          </c:when>
          <c:otherwise>
              <img id="${imgId}" src="<c:url value="/images/spacer.gif"/>">
          </c:otherwise>
          </c:choose>
        </td>
      <td><image src="<c:url value="/images/spacer.gif"/>" height="230" width="1"></td>
      <td>
        <div class="small">
          <b>x-axis (all graphs)</b><br>
          Time in hours after adding synchronized culture of
          <b>HB3</b> parasites
          to fresh blood

          <br><br>
          <b>graph #1</b><br>
          <font color="#4343ff"><b>blue plot:</b></font><br>
          averaged smoothed normalized log (base 2) of cy5/cy3 for ${id}<br>
          <font color="#bbbbbb"><b>gray plot:</b></font><br>
          averaged normalized log (base 2) of cy5/cy3 for ${id}
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td><image src="<c:url value="/images/spacer.gif"/>" height="120" width="1"></td>
      <td>
        <div class="small">
          <b>y-axis (graph #2)</b><br>
          Expression intensity percentile<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    <tr valign="middle">
      <td><image src="<c:url value="/images/spacer.gif"/>" height="130" width="1"></td>
      <td>
        <div class="small">
          <b>y-axis (graph #3)</b><br>
          Lifecycle stage<br>
          <a href="<c:url value="/derisiExpressionDoc.jsp"/>">Learn more</a>
        </div>
      </td>
    </tr>
    </table>
  </c:set>

  <c:set var="noData" value="false"/>

  <wdk:toggle name="${secName}" isOpen="${isOpen}"
               content="${expressionContent}" noData="${noData}"
               imageId="${imgId}" imageSource="${imgSrc}"
               displayName="Developmental series HB3 (glass slide oligo array)"
               attribution="derisi_HB3_time_series,DeRisi_oligos"/>

</c:if>

</c:otherwise>
</c:choose>

<site:footer/>
