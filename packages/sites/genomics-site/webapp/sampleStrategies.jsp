<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="version" value="${wdkModel.version}"/>
<c:set var="site" value="${wdkModel.displayName}"/>

<site:header     title = "${site}: Sample Strategies"
                 refer= "sampleStrategies" />

<h1>Sample Strategies</h1>

<table align="center" width="90%">

<tr align = "center"><td><b>Type</td><td><b>Description</td><td><b>Click to add this strategy in your display</td></tr>
<c:if test="${site == 'CryptoDB'}">
  <tr align = "center"><td>Non-linear, Transforms</td><td>BLABLABLA</td><td><a href="<c:url value="/importStrategy.do?strategy=ca5bc32fb29086d29b778b17f18a97c:1"/>">Sample Strategy 1</a> </td></tr>
</c:if>
<c:if test="${site == 'TriTrypDB'}">
  <tr align = "center"><td>Simple strategy</td><td>Find all protein coding genes that have a signal peptide and evidence for expression based on EST alignments</td><td><a href="<c:url value="/importStrategy.do?strategy=e8a3ba254a30471b456bfa72796352af:3"/>">Protein coding Signal Peptide </a> </td></tr>
  <tr align = "center"><td>Expanded strategy with transform</td><td>Find all kinases that have at least one transmembrane domain and evidence for expression based on EST alignments or proteomics evidence and transform the result to identify all orthologs since not all organisms have expression evidence</td><td><a href="<c:url value="/importStrategy.do?strategy=e8a3ba254a30471b456bfa72796352af:9"/>">kinases, TM,  (EST or proteomics) transform</a> </td></tr>
</c:if>

</table>
<hr>
<h1>Help</h1>
The following image shows some of the functionality of the Run Strategies tab.  Mousing over these (and other) elements when you are running strategies will provide context sensitive help. Of particular note, clicking the title for any step shows the details for that step and provides a menu that allows you to modify the step by editing search parameters, deleting or inserting a step, etc.  Clicking the number of records for any step allows you to see and filter the results for that particular step.<br>
<center>
<img src="/images/strategy_help.png">
</center>

<site:footer/>
