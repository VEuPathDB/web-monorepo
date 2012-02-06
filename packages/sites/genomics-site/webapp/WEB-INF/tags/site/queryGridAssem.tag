<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="modelName" value="${wdkModel.displayName}"/>

<table width="100%" border="0" cellspacing="1" cellpadding="1">
<tr>

        <td width="50%" >
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
 <tr>
                <imp:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesByEstAccession" linktext="EST Accession(s)" existsOn="A Am G M P T Tt"/>
                </tr>

                <tr>
                   <imp:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesWithGeneOverlap" linktext="Extent of Gene Overlap" existsOn="A Am G M P T Tt"/> 
                </tr>
 <tr>
                    <imp:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesByLibrary" linktext="Library" existsOn="A Am G M P T Tt"/>
                </tr>

            </table>
        </td>

	<td width="0.5"></td>

        <td >
            <table width="100%" border="0" cellspacing="0" cellpadding="0">

                 <tr>
                    <imp:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesByGeneIDs" linktext="Gene IDs" existsOn="A Am G M P T Tt"/>
                </tr>           
<tr>
                    <imp:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesByLocation" linktext="Genomic Location" existsOn="A Am G M P T Tt"/>
                </tr>

                <tr>
                    <imp:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesBySimilarity" linktext="BLAST similarity" type="ASSEMBLIES" existsOn="A Am G M P T Tt"/>
                </tr>
            </table>
        </td>


</tr>
</table>
