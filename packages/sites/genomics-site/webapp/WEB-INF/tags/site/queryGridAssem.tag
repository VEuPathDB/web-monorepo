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
                <site:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesByEstAccession" linktext="EST Accession(s)" existsOn="A G"/>
                </tr>

                <tr>
                   <site:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesWithGeneOverlap" linktext="Extent of Gene Overlap" existsOn="A G"/> 
                </tr>
 <tr>
                    <site:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesByLibrary" linktext="Library" existsOn="A G"/>
                </tr>

            </table>
</div>
        </td>

	<td width="0.5"></td>

        <td valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">

                 <tr>
                    <site:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesByGeneIDs" linktext="Gene ID" existsOn="A G"/>
                </tr>           
<tr>
                    <site:queryGridMakeUrl qset="AssemblyQuestions" qname="AssembliesByLocation" linktext="Chromosomal Location" existsOn="A G"/>
                </tr>

            </table>
</div>
        </td>


</tr>
</table>
