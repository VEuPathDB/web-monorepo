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
                  <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="NgsSnpsByIsolateGroup" linktext="A Group of Isolates" existsOn="Am C P T Tt"/>
                </tr>
                 <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="NgsSnpsByLocation" linktext="Genomic Location (NGS)" existsOn="Am C P T Tt"/>
                </tr>
                <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="NgsSnpsByGeneIds" linktext="Gene ID (NGS)" existsOn="Am C P T Tt"/>
                </tr>
               <tr>
                   <imp:queryGridMakeUrl qset="SnpQuestions" qname="NgsSnpsByTwoIsolateGroups" linktext="Isolate Comparison (2 groups)" existsOn="Am C P T Tt"/>
                </tr>

            </table>
        </td>

<%--
	<td width="1" class="blueVcalLine"></td>
--%>
	<td width="1"></td>

        <td  width="50%" >
            <table width="100%" border="0" cellspacing="0" cellpadding="0">

                <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="SnpsByStrain" linktext="Strain (Sanger)" existsOn="A C P T"/>
                </tr>
                <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="SnpsByGeneId" linktext="Gene ID (Sanger)" existsOn="C P T"/>
                </tr>
                 <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="SnpsByLocation" linktext="Genomic Location (Sanger)" existsOn="A C P T"/>
                </tr>
                <tr>
                   <imp:queryGridMakeUrl qset="SnpQuestions" qname="SnpsByIsolatePattern" linktext="Isolate Comparison" existsOn="A P"/>
                </tr>
                 <tr>
                    <imp:queryGridMakeUrl qset="SnpQuestions" qname="SnpsByIsolateType" linktext="Isolate Assay" existsOn="A P"/>
                </tr>

            </table>
        </td>

</tr>
</table>
