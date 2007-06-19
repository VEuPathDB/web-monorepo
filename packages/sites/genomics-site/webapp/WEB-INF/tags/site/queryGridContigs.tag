<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="modelName" value="${wdkModel.displayName}"/>

<table width="100%" border="0" cellspacing="1" cellpadding="1">
     <tr>

        <td width="50%" valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                 <tr>
                    <site:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="SequenceBySourceId" linktext="Sequence ID"  existsOn="A C P T"/>
                </tr>

                 <tr>
                    <site:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="SequencesByTaxon" linktext="Species" existsOn="A C P T"/>
                </tr>
            </table>
        </td>

<%--	<td width="0.5" class="blueVcalLine"></td> --%>
	<td width="0.5"></td>

        <td valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
                    <site:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="SequencesBySimilarity" linktext="BLAST Similarity" existsOn="A C P T"  />
                </tr>


                 <tr>
                     <site:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="NA" linktext="DNA Motif" existsOn=""/>
                </tr>
            </table>
        </td>

     </tr>
</table>
