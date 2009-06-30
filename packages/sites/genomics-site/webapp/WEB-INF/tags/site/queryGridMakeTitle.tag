<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%@ attribute name="qcat"
              required="true"
              description="category name in model file"
%>

<%@ attribute name="qtype"
              required="true"
              description="type of queries"
%>


<c:set value="${wdkModel.rootCategoryMap['GeneRecordClasses.GeneRecordClass']}" var="rootCat"/>

<c:set var="found" value="false"/>
<c:forEach items="${rootCat.children}" var="catEntry">
        <c:if test="${qcat eq catEntry.key}">
            <c:set var="found" value="true"/>
        </c:if>
</c:forEach>

<c:if test="${found eq 'true'}">
    <td colspan="2"><a href="#${fn:replace(qcat, ' ', '%20')}">${rootCat.children[qcat]}</a></td>
</c:if>

<c:if test="${found eq 'false'}">
        <td colspan="2">${qcat}</td>
</c:if>
