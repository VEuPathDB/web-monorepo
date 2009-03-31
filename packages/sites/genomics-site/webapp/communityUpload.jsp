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

<script type="text/javascript" 
    src="/assets/js/lib/jquery-validate/jquery.validate.pack.js"></script>
<script type="text/javascript" src="/assets/js/fileUpload.js"></script>

    <body>
    <wdk:errors/>
    <div id='error'/>
    <html:form method="post" action="/communityUpload.do" 
               styleId='uploadForm'
               enctype="multipart/form-data">

    <h2>Upload Files</h2>
    <br>
    <div id="cirbulletlist">
    Provide a simple title to identify your files. For example,
        <ul><li><i>Cellular localization of P-glycoprotein</i></li></ul>
        
    You may upload more than one file to be associated with your title. 
    Also provide a brief description for each individual file. For example,
        <ol>
            <li><i>fluoroscent micrograph at 1 hrs</i></li>
            <li><i>fluoroscent micrograph at 5 hrs</i></li>
        </ol>
    </div>
    <br>
    The maximum allowed upload size is 10MB total for all files uploaded in a single submission. 
    If the total size of your files exceeds this limit, please contact us via the 'Contact Us' link
    in the above menu and we will provide further assistance.
    <br><br>
    <table>
    <tr><td>Document Title:</td><td><html:text property="title" styleId="title" size="60"/></td></tr>
    <%-- <tr><td>Description:<br>(4000 max characters)</td><td><html:textarea rows="5" cols="80" property="notes"/></td></tr> --%>

    <table id="fileSelTbl">
    </table>

    <table>
    <tr><td><html:button styleId="newfile" property="newfile" value="Add Another File"/></td></tr>
    <tr><td><html:submit property="submit" value="Upload File"/></td></tr>
    </table>
    
    </html:form>

    </c:otherwise>
</c:choose>

<site:footer/>
</body>
