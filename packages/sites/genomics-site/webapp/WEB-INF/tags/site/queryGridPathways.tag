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
                    <imp:queryGridMakeUrl qset="PathwayQuestions" qname="PathwayQuestions.PathwaysByPathwayID" linktext="Pathway Name(s)" existsOn="A"/>
                </tr>

<tr>
	             <imp:queryGridMakeUrl qset="PathwayQuestions" qname="PathwaysByGeneList" linktext="Gene Asssociation" existsOn="A"/>
            	</tr>
<tr>
	             <imp:queryGridMakeUrl qset="PathwayQuestions" qname="PathwaysByCompounds" linktext="Compounds" existsOn="A"/>
            	</tr>
<tr>
	             <imp:queryGridMakeUrl qset="PathwayQuestions" qname="PathwaysByGeneIds" linktext="Compounds" existsOn="A"/>
            	</tr>
            </table>
</div>
        </td>

</tr>
</table>
