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
                    <site:queryGridMakeUrl qset="OrfQuestions" qname="OrfByOrfId" linktext="ORF ID(s)" existsOn="A G C P T Tr Tt"/>
                </tr>

<tr>
	             <site:queryGridMakeUrl qset="OrfQuestions" qname="OrfsByMassSpec" linktext="Mass Spec. Evidence" existsOn="A C T G"/>
            	</tr>
            </table>
</div>
        </td>

<%--	<td width="1" class="blueVcalLine"></td> --%>
	<td width="1"></td>

        <td  width="50%" valign="top">
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">

<tr>
                    <site:queryGridMakeUrl qset="UniversalQuestions" qname="UnifiedBlast" linktext="BLAST Similarity" type="ORF" existsOn="A G C P T Tr Tt"/>
                </tr>  
 <tr>
                    <site:queryGridMakeUrl qset="OrfQuestions" qname="OrfsByMotifSearch" linktext="Protein Motif" existsOn="A G C P T Tr Tt"/>
                </tr>
 <tr>
                    <site:queryGridMakeUrl qset="OrfQuestions" qname="OrfsByLocation" linktext="Chromosomal Location" existsOn="A G C P T Tr Tt"/>
                </tr>
            </table>
</div>
    	</td>


</tr>
</table>
