<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="modelName" value="${wdkModel.displayName}"/>

<table width="100%" border="0" cellspacing="1" cellpadding="1">
     <tr>

        <td width="50%" >
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                 <tr>
                    <imp:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="SequenceBySourceId" linktext="Sequence ID(s)"  existsOn="A Am G C M Pi P T Tr Tt"/>
                </tr>

                 <tr>
                    <imp:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="SequencesByTaxon" linktext="Taxon/Strain" existsOn="A Am G C M Pi P T Tr Tt"/>
                </tr>
            </table>
</div>
        </td>

<%--	<td width="0.5" class="blueVcalLine"></td> --%>
	<td width="0.5"></td>

        <td >
<div class="innertube2">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
                    <imp:queryGridMakeUrl qset="GenomicSequenceQuestions" qname="SequencesBySimilarity" linktext="BLAST Similarity" type="SEQ" existsOn="A Am G C M Pi P T Tr Tt"  />
                </tr>



            </table>
</div>
        </td>

     </tr>
</table>
