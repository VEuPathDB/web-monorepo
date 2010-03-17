<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="modelName" value="${wdkModel.displayName}"/>

<table width="100%" border="0" cellspacing="1" cellpadding="1">
<tr>

        <td width="50%" valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
 <tr>
                    <site:queryGridMakeUrl qset="EstQuestions" qname="EstBySourceId" linktext="EST Accession(s)" existsOn="A Am G C M P T Tr Tt"/>
                </tr>

                <tr>
                   <site:queryGridMakeUrl qset="EstQuestions" qname="EstsWithGeneOverlap" linktext="Extent of Gene Overlap" existsOn="A Am G C M P T Tr Tt"/> 
                </tr>
 <tr>
                    <site:queryGridMakeUrl qset="EstQuestions" qname="EstsByLibrary" linktext="Library" existsOn="A Am G C M P T Tr Tt"/>
                </tr>

            </table>
</div>
        </td>

	<td width="0.5"></td>

        <td valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                 <tr>
                    <site:queryGridMakeUrl qset="EstQuestions" qname="EstsBySimilarity" linktext="BLAST Similarity" type="EST" existsOn="A Am G C M P T Tr Tt"/>
                </tr>
                 <tr>
                    <site:queryGridMakeUrl qset="EstQuestions" qname="ESTsByGeneIDs" linktext="Gene ID" existsOn="A Am G C M P T Tr Tt"/>
                </tr>           
<tr>
                    <site:queryGridMakeUrl qset="EstQuestions" qname="EstsByLocation" linktext="Genomic Location" existsOn="A Am G C M P T Tr Tt"/>
                </tr>

            </table>
</div>
        </td>


</tr>
</table>
