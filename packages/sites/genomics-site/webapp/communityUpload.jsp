<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>

<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName}.org :: Community Upload"
             banner="Community Upload"/>

<c:choose>
	<c:when test="${empty wdkUser || wdkUser.guest}">
    <body>
		<p align=center>Please login to upload files.</p>
		<table align='center'><tr><td><site:login/></td></tr></table>
	</c:when>
<c:otherwise>

<script type="text/javascript" src="/assets/js/fileUpload.js"></script>

    <body onload='addFileSelRow();'>
    <wdk:errors/>
    <html:form method="post" action="/communityUpload.do" 
               enctype="multipart/form-data">

    <table>
    <tr><td>Document Title:</td><td><html:text property="title" size="60"/></td></tr>
    <tr><td>Description:<br>(4000 max characters)</td><td><html:textarea rows="5" cols="80" property="notes"/></td></tr>

    <table id="fileSelTbl">
    </table>

    <table>
    <tr><td><html:submit property="submit" value="Upload File"/></td></tr>
    </table>
    
    </html:form>

    </c:otherwise>
</c:choose>

</body>
