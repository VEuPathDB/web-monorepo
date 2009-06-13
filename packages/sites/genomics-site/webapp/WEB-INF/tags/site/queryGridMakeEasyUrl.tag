<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="linkid"
              required="true"
              description="unique id for the link for popup"
%>

<%@ attribute name="link"
              required="true"
              description="link url"
%>

<%@ attribute name="linkdesc"
              required="true"
              description="link url"
%>

<%@ attribute name="linktext"
              required="true"
              description="link text"
%>

<%@ attribute name="existsOn"
              required="false"
              description="check site existence"
%>



<c:set var="E_image">
   <c:url value="/images/empty_space.gif" /> 
</c:set>
<c:set var="E" value="<img src='${E_image}' border='0' alt='' />" />
 

<c:set var="P" value="${E}" />
<c:set var="T" value="${E}" />
<c:set var="C" value="${E}" />
<c:set var="A" value="${E}" />
<c:set var="G" value="${E}" />
<c:set var="Tr" value="${E}" />



<c:set var="plasmoRoot" value="http://www.plasmodb.org/plasmo/" />
<c:set var="toxoRoot" value="http://www.toxodb.org/toxo/" />
<c:set var="cryptoRoot" value="http://www.cryptodb.org/cryptodb/" />
<c:set var="apiRoot" value="http://www.eupathdb.org/eupathdb/" />
<c:set var="giardiaRoot" value="http://www.giardiadb.org/giardiadb/" />
<c:set var="trichRoot" value="http://www.trichdb.org/trichdb/" />

<%-- get wdkModel saved in application scope --%>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="modelName" value="${wdkModel.displayName}"/>


<c:set var="API" value="${fn:containsIgnoreCase(modelName, 'api')    }"     />
<c:set var="COMPONENT" value="${ fn:containsIgnoreCase(modelName, 'plasmo') || fn:containsIgnoreCase(modelName, 'toxo') || fn:containsIgnoreCase(modelName, 'crypto') || fn:containsIgnoreCase(modelName, 'giardia') || fn:containsIgnoreCase(modelName, 'trich')    }"     />


<c:set var="linkActive" value="0"/>

<c:set var="array" value="${fn:split(existsOn, ' ')}" />
<c:forEach var="token" items="${array}" >
  
  <c:if test="${token eq 'G'}">
    <c:choose>
      <c:when test="${wdkModel.displayName eq 'GiardiaDB'}">
        <c:set var="linkActive" value="1"/>
      </c:when>        
      <c:otherwise>
        <c:set var="G_image">
          <c:url value="/images/giardiadb_letter.gif" />
        </c:set>
        <c:set var="G" value="<a href='${giardiaRoot}${link}'><img src='${G_image}' border='0' alt='giardiadb' /></a>" />
      </c:otherwise>
    </c:choose>
  </c:if>
<c:if test="${token eq 'Tr'}">
    <c:choose>
      <c:when test="${wdkModel.displayName eq 'TrichDB'}">
        <c:set var="linkActive" value="1"/>
      </c:when>        
      <c:otherwise>
        <c:set var="Tr_image">
            <c:url value="/images/trichdb_letter.gif" />
        </c:set>
        <c:set var="Tr" value="<a href='${trichRoot}${link}'><img src='${Tr_image}' border='0' alt='trichdb' /></a>" />
      </c:otherwise>
    </c:choose>
  </c:if>
<c:if test="${token eq 'P'}">
    <c:choose>
      <c:when test="${wdkModel.displayName eq 'PlasmoDB'}">
        <c:set var="linkActive" value="1"/>
      </c:when>        
      <c:otherwise>
        <c:set var="P_image">
            <c:url value="/images/plasmodb_letter.gif" />
        </c:set>
        <c:set var="P" value="<a href='${plasmoRoot}${link}'><img src='${P_image}' border='0' alt='plasmodb' /></a>" />
      </c:otherwise>
    </c:choose>
  </c:if>
  <c:if test="${token eq 'T'}">
    <c:choose>
      <c:when test="${wdkModel.displayName eq 'ToxoDB'}">
        <c:set var="linkActive" value="1"/>
      </c:when>        
      <c:otherwise>
        <c:set var="T_image">
            <c:url value="/images/toxodb_letter.gif" />
        </c:set>
        <c:set var="T" value="<a href='${toxoRoot}${link}'><img src='${T_image}' border='0' alt='toxodb' /></a>" />
      </c:otherwise>
    </c:choose>
  </c:if>
  <c:if test="${token eq 'C'}">
    <c:choose>
      <c:when test="${wdkModel.displayName eq 'CryptoDB'}">
        <c:set var="linkActive" value="1"/>
      </c:when>        
      <c:otherwise>
        <c:set var="C_image">
            <c:url value="/images/cryptodb_letter.gif" />
        </c:set>
        <c:set var="C" value="<a href='${cryptoRoot}${link}'><img src='${C_image}' border='0' alt='cryptodb' /></a>" />
      </c:otherwise>
    </c:choose>
  </c:if>
  <c:if test="${token eq 'A'}">
    <c:choose>
      <c:when test="${wdkModel.displayName eq 'EuPathDB'}">
        <c:set var="linkActive" value="1"/>
      </c:when>        
      <c:otherwise>
        <c:set var="A_image">/images/eupath_e.gif
        </c:set>
        <c:set var="A" value="<a href='${apiRoot}${link}'><img src='${A_image}' border='0' alt='apidb' /></a>" />
      </c:otherwise>
    </c:choose>
  </c:if>
</c:forEach>

<c:set var="modelName" value="${wdkModel.displayName}"/>
<c:if test="${modelName eq 'CryptoDB'}">
    <c:set var="orgnismName" value="Cryptosporidium"/>
</c:if>
<c:if test="${modelName eq 'PlasmoDB'}">
        <c:set var="orgnismName" value="Plasmodium"/>
</c:if>
<c:if test="${modelName eq 'ToxoDB'}">
        <c:set var="orgnismName" value="Toxoplasma"/>
</c:if>
<c:if test="${modelName eq 'GiardiaDB'}">
        <c:set var="orgnismName" value="Giardia"/>
</c:if>
<c:if test="${modelName eq 'TrichDB'}">
        <c:set var="orgnismName" value="Trichomonas"/>
</c:if>


<c:set var="popup" value="${linkdesc}"/>


    <td width="5" align="left"  valign="top">&nbsp;&#8226;&nbsp; </td>

<%-- LINK ACTIVE --%>
<c:if test="${linkActive == 1}">

<%--
    <td align="left" valign="bottom"><a href='${link}' class='queryGridActive' 
        onmouseover="return overlib('${popup}',
                FGCOLOR, 'white',
                BGCOLOR, '#003366',
                TEXTCOLOR, '#003366',
                TEXTSIZE, '11px',
                WIDTH, 300,
                CELLPAD, 5)"
        onmouseout = "return nd();">
        ${linktext}</a> 
    </td>
--%>

 <td align="left" valign="bottom"><a href='${link}' class='queryGridActive' rel='htmltooltip'>${linktext}</a></td>
     <div class="htmltooltip">${popup}</div>



</c:if>

<%-- LINK INACTIVE --%>
<c:if test="${linkActive == 0}">

<%--
    <td align="left" valign="bottom"><a href="javascript:void(0);" class='queryGridInactive' 
        onmouseover="return overlib('This data type is not available for <i>${orgnismName}</i> (or is not yet in ${modelName}).',
                FGCOLOR, 'white',
                BGCOLOR, '#003366',
                TEXTCOLOR, '#003366',
                TEXTSIZE, '11px',
                WIDTH, 200,
                CELLPAD, 5)"
        onmouseout = "return nd();">
        ${linktext}</a>
    </td>
--%>

<td align="left" valign="bottom"><a href='${link}' class='queryGridInactive' rel='htmltooltip'>${linktext}</a></td>
     <div class="htmltooltip">This data type is not available for <i>${orgnismName}</i> (or is not yet in ${modelName}).</div>


</c:if>

    <td  width="56" nowrap align="right"  valign="bottom">

<c:if test="${API}">

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr nowrap>

	<td width="14">${C}</td>
	<td width="14">${G}</td>	
	<td width="14">${P}</td>	
	<td width="14">${T}</td>
	<td width="14">${Tr}</td>
</tr>
</table>
</c:if>

<c:if test="${COMPONENT}">

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr nowrap>

	<td align="right">${A}</td>

</tr>
</table>
</c:if>

    </td>
