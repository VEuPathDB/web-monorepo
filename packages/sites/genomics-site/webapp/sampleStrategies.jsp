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

<table align="center" width="90%" border="1" cellpadding="2" cellspacing="2">

<tr align = "center"><td><b>Type</td><td><b>Name</td><td><b>Description</td><td><b>Click to add this strategy in your display</td></tr>
<tr align = "center"><td>Non-linear, Transforms</td><td>genes1-orthologs/td><td>BLABLABLA</td><td><a href="<c:url value="/importStrategy.do?strategy=ca5bc32fb29086d29b778b17f18a97c:1"/>">Sample Strategy 1</a> </td></tr>

</table>

<site:footer/>
