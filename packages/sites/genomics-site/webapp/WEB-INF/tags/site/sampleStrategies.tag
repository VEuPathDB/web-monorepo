<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<%@ attribute name="wdkModel"
             type="org.gusdb.wdk.model.jspwrap.WdkModelBean"
             required="false"
             description="Wdk Model Object for this site"
%>

<%@ attribute name="wdkUser"
    type="org.gusdb.wdk.model.jspwrap.UserBean"
    required="true"
    description="Currently active user object"
%>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="version" value="${wdkModel.version}"/>
<c:set var="site" value="${wdkModel.displayName}"/>

<h1>Sample Strategies</h1>

<%-------------  Set sample strategy signatures in all sites  ----------------%>
<c:choose>
   <c:when test="${fn:containsIgnoreCase(site, 'CryptoDB')}">
      <c:set var="simple" value="e8a3ba254a30471b456bfa72796352af:1" />
      <c:set var="expanded" value="e8a3ba254a30471b456bfa72796352af:2" />
   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'GiardiaDB')}">

   </c:when>

 <c:when test="${fn:containsIgnoreCase(site, 'PlasmoDB')}">
      <c:set var="simple" value="e8a3ba254a30471b456bfa72796352af:8" />
      <c:set var="expressed" value="e8a3ba254a30471b456bfa72796352af:9" />
      <c:set var="expressedPknowlesi" value="e8a3ba254a30471b456bfa72796352af:10" />
   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'ToxoDB')}">

   </c:when>

<c:when test="${fn:containsIgnoreCase(site, 'TrichDB')}">

   </c:when>

 <c:when test="${fn:containsIgnoreCase(site, 'TriTrypDB')}">
      <c:set var="simple" value="e8a3ba254a30471b456bfa72796352af:93" />
      <c:set var="expanded" value="e8a3ba254a30471b456bfa72796352af:97" />
      <c:set var="expressed" value="e8a3ba254a30471b456bfa72796352af:98" />
      <c:set var="expressedTbrucei" value="e8a3ba254a30471b456bfa72796352af:99" />
   </c:when>


<c:when test="${fn:containsIgnoreCase(site, 'ApiDB')}">
 
   </c:when>

</c:choose>


<table class="tableWithBorders" style="margin-left: auto; margin-right: auto;" width="90%">

<tr align = "center"><td><b>Click to import strategy in your workspace</b></td><td><b>Description</b></td></tr>

<c:if test="${simple != null}">
<tr align = "left"><td><a href="<c:url value="/importStrategy.do?strategy=${simple}"/>">Simple strategy</a> </td><td>Find all protein coding genes that have a signal peptide and evidence for expression based on EST alignments</td></tr>
</c:if>
<c:if test="${expanded != null}">
  <tr align = "left"><td><a href="<c:url value="/importStrategy.do?strategy=${expanded}"/>">With nested strategy and transform</a> </td><td>Find all kinases that have at least one transmembrane domain and evidence for expression based on EST alignments or proteomics evidence and transform the result to identify all orthologs since not all organisms have expression evidence</td></tr>
</c:if>
<c:if test="${expressed != null}">
<tr align = "left"><td><a href="<c:url value="/importStrategy.do?strategy=${expressed}"/>">Genes with evidence of expression</a> </td><td>Find all genes in the database that have any direct evidence for expression</td></tr>
</c:if>
<c:if test="${expressedTbrucei != null}">
<tr align = "left"><td><a href="<c:url value="/importStrategy.do?strategy=${expressedTbrucei}"/>"><i>T. brucei</i> genes with any evidence of expression</a> </td><td>Find all genes from <i>T. brucei</i> that have any evidence for expression based on direct evidence or using orthology</td></tr>
</c:if>
<c:if test="${expressedPknowlesi != null}">
<tr align = "left"><td><a href="<c:url value="/importStrategy.do?strategy=${expressedPknowlesi}"/>"><i>P. knowlesi</i> genes with any evidence of expression</a> </td><td>Find all genes from <i>P. knowlesi</i> that have any evidence for expression based on orthology to other <i>Plasmodium</i> species</td></tr>
</c:if>

</table>

<hr>

<h1>Help (<a href="http://eupathdb.org/tutorials/New_Strat/New_Strat_viewlet_swf.html">Tutorial</a>)</h1>
The following image shows some of the functionality of the Run Strategies tab.  Mousing over these (and other) elements when you are running strategies will provide context sensitive help. Of particular note, clicking the title for any step shows the details for that step and provides a menu that allows you to modify the step by editing search parameters, deleting or inserting a step, etc.  Clicking the number of records for any step allows you to see and filter the results for that particular step.<br>
<center>
<img src="/images/strategy_help.jpg">
</center>

