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

<table class="tableWithBorders" style="margin-left: auto; margin-right: auto;" width="90%">

<tr align = "center"><td><b>Type<br>Click to view strategy</b></td><td><b>Description</b></td></tr>
<c:if test="${site == 'CryptoDB'}">
  <tr align = "left"><td>Simple strategy</td><td>Find all protein coding genes that have a signal peptide and evidence for expression based on EST alignments</td><td><a href="<c:url value="/importStrategy.do?strategy=e8a3ba254a30471b456bfa72796352af:1"/>">Protein coding Signal Peptide </a> </td></tr>
  <tr align = "left"><td>Expanded strategy with transform</td><td>Find all kinases that have at least one transmembrane domain and evidence for expression based on EST alignments or proteomics evidence and transform the result to identify all orthologs since not all organisms have expression evidence</td><td><a href="<c:url value="/importStrategy.do?strategy=e8a3ba254a30471b456bfa72796352af:2"/>">kinases, TM, (EST or proteomics), transform</a> </td></tr>
</c:if>
<c:if test="${site == 'TriTrypDB'}">
  <tr align = "left"><td><a href="<c:url value="/importStrategy.do?strategy=e8a3ba254a30471b456bfa72796352af:27"/>">Simple strategy</a> </td><td>Find all protein coding genes that have a signal peptide and evidence for expression based on EST alignments</td></tr>
  <tr align = "left"><td><a href="<c:url value="/importStrategy.do?strategy=e8a3ba254a30471b456bfa72796352af:10"/>">Expanded strategy with transform</a> </td><td>Find all kinases that have at least one transmembrane domain and evidence for expression based on EST alignments or proteomics evidence and transform the result to identify all orthologs since not all organisms have expression evidence</td></tr>
</c:if>

</table>
<hr>
<h1>Help</h1>
The following image shows some of the functionality of the Run Strategies tab.  Mousing over these (and other) elements when you are running strategies will provide context sensitive help. Of particular note, clicking the title for any step shows the details for that step and provides a menu that allows you to modify the step by editing search parameters, deleting or inserting a step, etc.  Clicking the number of records for any step allows you to see and filter the results for that particular step.<br>
<center>
<img src="/images/strategy_help.jpg">
</center>

