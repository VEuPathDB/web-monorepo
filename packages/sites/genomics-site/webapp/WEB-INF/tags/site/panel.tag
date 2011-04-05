<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%@ attribute name="attribute"
              required="false"
              description="attribtue name"
%>

<%@ attribute name="displayName"
              required="true"
              description="panel header"
%>

<%@ attribute name="content"
              required="true"
              description="content of panel"
%>
<%@ attribute name="attribution"
              required="false"
              description="Dataset ID (from Data Sources) for attribution"
%>


<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="ds_ref_attribute" value="${requestScope.ds_ref_attributes[attribute]}" />

<c:forEach items="${attribution}" var="attr" >
  <c:set var="trimmedAttribution" value="${trimmedAttribution},${fn:trim(attr)}" />
</c:forEach>

<table border="0" class="paneltoggle"  
       bgcolor="#DDDDDD" 
       cellpadding="0" 
       cellspacing="1" 
       width="100%">
<tr><td style="padding:3px;"><font size="-2" face="Arial,Helvetica">
    <b>${displayName}</b></font>
</td>

<c:choose>
  <c:when test='${trimmedAttribution != null && trimmedAttribution != ""}'>
    <td align="right">
     <font size="-2" face="Arial,Helvetica">
     [<a href="showXmlDataContent.do?name=XmlQuestions.DataSources&datasets=${trimmedAttribution}&title=${displayName}">
     Data Sources</a>]
     </font>
    </td>
  </c:when>
  <c:when test="${attribute != null && attribute !='' && ds_ref_attribute != null && ds_ref_attribute != ''}">
    <td align="right">
     <font size="-2" face="Arial,Helvetica">
     [<a href="<c:url value='/getDataSource.do?recordClass=${wdkRecord.recordClass.fullName}&display=detail&target=${attribute}' />">
     Data Sources</a>]
     </font>
    </td>
  </c:when>
</c:choose>
</tr>
</table>
<table border="0" 
       cellpadding="5" 
       width="100%" 
       bgcolor="#FFFFFF">
    <tr><td style="padding:3px;font-size:14px;">${content}</td>
    </tr>
</table>

