<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="modelName" value="${wdkModel.displayName}"/>

<table width="100%" border="0" cellspacing="1" cellpadding="1">
<tr>


        <td  width="50%" >
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="SnpBySourceId" linktext="SNP ID(s)" existsOn="A Am C P T Tt"/>
                </tr>

                
<c:choose>
<c:when test="${fn:containsIgnoreCase(modelName,'eupath')||fn:containsIgnoreCase(modelName,'toxo')||fn:containsIgnoreCase(modelName,'crypto')||fn:containsIgnoreCase(modelName,'plasmo') }">
                <tr>
                    <imp:queryGridMakeUrl qset="InternalSnpQuestions" qname="SnpsByGeneId" linktext="Gene ID" existsOn="A Am C P T Tt"/>
                </tr>
</c:when>
<c:otherwise>
                <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="HtsSnpsByGeneId" linktext="Gene ID" existsOn="A Am C P T Tt"/>
                </tr>
</c:otherwise>
</c:choose>

<c:choose>
<c:when test="${fn:containsIgnoreCase(modelName,'eupath')||fn:containsIgnoreCase(modelName,'toxo')||fn:containsIgnoreCase(modelName,'crypto')||fn:containsIgnoreCase(modelName,'plasmo') }">
                <tr>
                    <imp:queryGridMakeUrl qset="InternalSnpQuestions" qname="SnpsByLocation" linktext="Genomic Location" existsOn="A Am C P T Tt"/>
                </tr>
</c:when>
<c:otherwise>
                <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="HtsSnpsByLocation" linktext="Genomic Location" existsOn="A Am C P T Tt"/>
                </tr>
</c:otherwise>
</c:choose>

                <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="SnpsByIsolatesGroup" linktext="Isolate Group" existsOn="P"/>
                </tr>

            </table>
        </td>

<%--
	<td width="1" class="blueVcalLine"></td>
--%>
	<td width="1"></td>

        <td  width="50%" >
            <table width="100%" border="0" cellspacing="0" cellpadding="0">

<c:choose>
<c:when test="${fn:containsIgnoreCase(modelName,'eupath')||fn:containsIgnoreCase(modelName,'plasmo') }">
                <tr>
                   <imp:queryGridMakeUrl qset="InternalSnpQuestions" qname="SnpsByIsolateComparison" linktext="Isolate Comparison" existsOn="A Am C P T Tt"/>
                </tr>
</c:when>
<c:otherwise>
                 <tr>
                   <imp:queryGridMakeUrl qset="SnpQuestions" qname="HtsSnpsByIsolateComparison" linktext="Isolate Comparison" existsOn="A Am C P T Tt"/>
                </tr>
</c:otherwise>
</c:choose>
                <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="HTSSnpsByAlleleFrequency" linktext="Allele Frequency" existsOn="A Am C P T Tt"/>
                </tr>
              
                 <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="SnpsByIsolateType" linktext="Isolate Assay" existsOn="A P"/>
                </tr>

<c:choose>
<c:when test="${fn:containsIgnoreCase(modelName,'eupath')||fn:containsIgnoreCase(modelName,'toxo')||fn:containsIgnoreCase(modelName,'crypto')||fn:containsIgnoreCase(modelName,'plasmo') }">
                <tr>
                    <imp:queryGridMakeUrl qset="InternalSnpQuestions" qname="SnpsByStrain" linktext="Strain" existsOn="A Am C P T Tt"/>
                </tr>
</c:when>
<c:otherwise>
                <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="HtsSnpsByStrain" linktext="Strain" existsOn="A Am C P T Tt"/>
                </tr>
</c:otherwise>
</c:choose>

            </table>
        </td>

</tr>
</table>
