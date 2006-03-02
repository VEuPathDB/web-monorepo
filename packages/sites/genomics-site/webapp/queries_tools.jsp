<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>
<site:header title="PlasmoDB : Queries & Tools"
                 banner="${wdkModelDispName} Queries and Tools"
                 parentDivision="PlasmoDB"
                 parentUrl="/home.jsp"
                 divisionName="Queries & Tools"
                 division="queries_tools"/>

<c:set var="CGI_URL" value="${wdkModel.properties['CGI_URL']}"/>
<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>


<!-- display wdkModel introduction text, if any -->
<b><jsp:getProperty name="wdkModel" property="introduction"/></b>

<!-- show error messages, if any -->
<wdk:errors/>

<wdk:queryList/>

<table width="100%" cellpadding="4">

<tr><td colspan="4">&nbsp;</td></tr>
<tr bgcolor="#bbaacc"><td colspan="4" align="center"><b>Tools</b></td></tr>

<tr class="rowLight">
  <td><b>Genome browser</b></td>
  <td><a href="${CGI_URL}/gbrowse/plasmodb"><img src="<c:url value="/images/go.gif"/>" border="0"></td>
  <td>&nbsp;&nbsp;</td>
  <td>A <a  href="http://www.gmod.org/gbrowse">GBrowse</a> based genome browser of PlasmoDB data tracks such as annotated genes and synteny information.</td>
</tr>

<tr class="rowMedium">
  <td><b>Gene sequences</b></td>
  <td><a href="<c:url value="/srt.jsp"/>"><img src="<c:url value="/images/go.gif"/>" border="0"></td>
  <td>&nbsp;&nbsp;</td>
  <td>Given a list of genes, retrieve all or a section their protein, CDS, transcript, or genomic sequences. Upstream or downstream genomic flanking sequences can also be retrieved using this tool.</td>
</tr>

</table>


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
