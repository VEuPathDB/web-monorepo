<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>

<!-- get wdkQuestion; setup requestScope HashMap to collect help info for footer -->  
<c:set value="${sessionScope.wdkQuestion}" var="wdkQuestion"/>

<h3>${wdkQuestion.displayName}</h3>

<p><b><jsp:getProperty name="wdkQuestion" property="description"/></b></p>

<hr>

<html:form method="post" action="/processQuestion.do">

<table>

<c:set var="qParams" value="${wdkQuestion.paramsMap}"/>
<c:set var="ppf" value="${qParams['ortholog_pattern']}"/>
<c:set var="ind" value="${qParams['phyletic_indent_map']}"/>
<c:set var="trm" value="${qParams['phyletic_term_map']}"/>

<tr><td colspan="2">

<table border="1" cellpadding="4">
    <c:set var="identMap" value="${ind.vocabMap}"/>
    <c:set var="termMap" value="${trm.vocabMap}"/>

    <c:forEach var="sp" items="${ind.vocab}">
        <c:set var="spDisp" value="${termMap[sp]}"/>
        <c:if test="${spDisp == null}">
            <c:set var="spDisp" value="${sp}"/> 
        </c:if>
        <c:set var="ident" value="${identMap[sp]}"/>

        <tr><td><c:forEach var="i" begin="0" end="${ident}" step="1">
                    &nbsp;&nbsp;&nbsp;&nbsp;
                 </c:forEach><b>${spDisp}</b></td></tr>

    </c:forEach>
</table>

    </td></tr>

<tr><td align="right"><b><jsp:getProperty name="ppf" property="prompt"/></b></td>
    <td><html:text property="myProp(${pNam})"/></td></tr>

<tr><td>&nbsp;</td>
    <td><html:submit property="questionSubmit" value="Get Answer"/></td></tr>
</table>

</html:form>
