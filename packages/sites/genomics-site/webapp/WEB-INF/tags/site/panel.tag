<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
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
              description="Dataset ID (from Data Sets) for attribution"
%>


<c:set value="${requestScope.wdkRecord}" var="wdkRecord"/>
<c:set var="attrs" value="${wdkRecord.attributes}"/>
<c:set var="ds_ref_attribute" value="${requestScope.ds_ref_attributes[attribute]}" />
<c:set var="ds_ref_table" value="${requestScope.ds_ref_tables[attribute]}" />
<c:set var="ds_ref_profile_graph" value="${requestScope.ds_ref_profile_graphs[attribute]}" />
<c:set var="wdkRecord" value="${requestScope.wdkRecord}" />
<c:set var="rcName" value="${wdkRecord.recordClass.fullName}" />

<c:forEach items="${attribution}" var="attr" >
  <c:set var="trimmedAttribution" value="${trimmedAttribution},${fn:trim(attr)}" />
</c:forEach>

<table border="0" class="paneltoggle"  
       bgcolor="#DDDDDD" 
       cellpadding="0" 
       cellspacing="1" 
       width="100%">
<tr><td style="padding:3px;"><b>${displayName}</b></td>

<c:choose>
  <c:when test='${trimmedAttribution != null && trimmedAttribution != ""}'>
    <td align="right">
     [<a href="getDataset.do?display=detail&datasets=${trimmedAttribution}&title=${displayName}">Data Sets</a>]
    </td>
  </c:when>
  <c:when test="${attribute != null && attribute !='' && ds_ref_table != null && ds_ref_table != ''}">
        <td align="right">
          [<a href="<c:url value='/getDataset.do?reference=${attribute}&recordClass=${rcName}&display=detail' />">Data Sets</a>]
        </td>
  </c:when>
  <c:when test="${attribute != null && attribute !='' && ds_ref_attribute != null && ds_ref_attribute != ''}">
    <td align="right">
     [<a href="<c:url value='/getDataset.do?reference=${attribute}&recordClass=${rcName}&display=detail' />">Data Sets</a>]
    </td>
  </c:when>
  <c:when test="${attribute != null && attribute !='' && ds_ref_profile_graph != null && ds_ref_profile_graph != ''}">
    <td align="right">
     [<a href="<c:url value='/getDataset.do?reference=${attribute}&display=detail' />">Data Sets</a>]
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

