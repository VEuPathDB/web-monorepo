<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />
<c:set var="used_sites" value="${applicationScope.wdkModel.properties['SITES']}"/>
<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>

<c:set var="headElement">
  <script type="text/javascript" language="Javascript">
     var sites = new Array(${used_sites});
     var query = "geneParams.ms_assay";
  </script>
  <script src="js/prototype.js" type="text/javascript"></script>
  <script src="js/scriptaculous.js" type="text/javascript"></script>
  <script src="js/Top_menu.js" type="text/javascript"></script>
  <script src="js/ApiDB_Ajax_Utils.js" type="text/javascript"></script>
  <script src="js/Colors.js" type="text/javascript"></script>
  <link rel="stylesheet" href="<c:url value='/misc/Top_menu.css' />" type="text/css">
</c:set>

<site:header title="EuPathDB : Mass Spec Evidence"
                 banner="Identify Genes by Mass Spec Evidence"
                 parentDivision="EuPathDB"
                 parentUrl="/home.jsp"
                 divisionName="Queries & Tools"
		 headElement="${headElement}"
                 division="queries_tools"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>


<!-- display wdkModel introduction text, if any -->
<!--<b><jsp:getProperty name="wdkModel" property="introduction"/></b>-->

<!-- show error messages, if any -->
<wdk:errors/>

<table width="100%" cellpadding="4">

<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Query</b></td></tr>

<%-- NOT NEEDED:  Py Mass Spec Evidence: GenesByMassSpec4
     Pb life cycle: GenesByProteomicsProfile 
--%>
<site:queryList questions="GeneQuestions.GenesByMassSpec,GeneQuestions.GenesByProteomicsProfile"/>
</table>

<script type="text/javascript" src='/gbrowse/wz_tooltip.js'></script>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
