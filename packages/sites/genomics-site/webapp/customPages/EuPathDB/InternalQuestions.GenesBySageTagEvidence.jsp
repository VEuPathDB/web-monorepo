<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<!-- get wdkModel name to display as page header -->
<c:set value="${wdkModel.displayName}" var="wdkModelDispName"/>
<site:header title="GiardiaDB : Queries & Tools"
                 banner="Identify Genes by SAGE Tag Evidence"
                 parentDivision="GiardiaDB"
                 parentUrl="/home.jsp"
                 divisionName="Queries & Tools"
                 division="queries_tools"/>

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<!-- show error messages, if any -->
<wdk:errors/>

<table width="100%" cellpadding="4">

<tr class="headerRow"><td colspan="4" align="center"><b>Choose a Query</b></td></tr>

<site:queryList2 questions="GeneQuestions.GenesBySageTag,GeneQuestions.GenesBySageTagRStat"/>
</table>

<script type="text/javascript" src='/gbrowse/wz_tooltip.js'></script>

<%-- get the attributions of the question --%>
<hr>
<%-- get the property list map of the question --%>
<c:set var="propertyLists" value="${wdkQuestion.propertyLists}"/>

<%-- display the question specific attribution list --%>
<%-- site:attributions attributions="${propertyLists['specificAttribution']}" caption="Data sources" / --%>

  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
