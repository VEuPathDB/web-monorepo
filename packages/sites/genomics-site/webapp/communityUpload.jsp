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
<script>

var fCount = 0;
var fileTableName = 'fileSelTbl';

function addFileSelRow() {
  
  var fileSelTbl = document.getElementById(fileTableName);
  
  var selLabel = document.createTextNode('Select File:');

  var delEl = document.createElement('a');
  delEl.href = 'javascript:void(0)';
  delEl.onclick = function(){removeRow(this)};
  
  delImg = document.createElement('img');
  delImg.src = 'images/remove.gif';
  delImg.border = '0';
  
  delEl.appendChild(delImg);
  
  var fSelEl = document.createElement('input');
  fSelEl.type = "file";
  fSelEl.name = "file[" +  fCount +  "]";
  fSelEl.onchange = function(){addFileSelRow()};

  var newRow = fileSelTbl.insertRow(0);

  var cell0 = newRow.insertCell(0);
  cell0.appendChild(selLabel);

  var cell1 = newRow.insertCell(1);
  cell1.appendChild(fSelEl);
  cell1.style.align="center";

  var cell2 = newRow.insertCell(2);
  cell2.appendChild(document.createTextNode('\u00A0'));

  var lastCell = fileSelTbl.rows[0].cells.length - 1;  
  
  if (fileSelTbl.rows.length > 1) {
    var nCell = document.createElement('td');
        nCell.appendChild(delEl);
  
    fileSelTbl.rows[1].
          replaceChild(nCell,fileSelTbl.rows[1].cells[lastCell]);
  }  
  
  fCount++;
}

function removeRow(row) {
  var i = row.parentNode.parentNode.rowIndex;
  document.getElementById('fileSelTbl').deleteRow(i);
}

</script>
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