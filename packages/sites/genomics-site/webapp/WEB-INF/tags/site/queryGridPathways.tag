<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="modelName" value="${wdkModel.displayName}"/>

<table width="100%" border="0" cellspacing="2" cellpadding="2">
<tr>

<td width="50%" >
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr> 
                    <imp:queryGridMakeUrl qset="PathwayQuestions" qname="PathwaysByPathwayID" linktext="Pathway Name(s)" existsOn="Am C G M Pi P T Tt"/>
    </tr>
    <tr> 
	             <imp:queryGridMakeUrl qset="PathwayQuestions" qname="PathwaysByGeneList" linktext="Genes" existsOn="Am C G M Pi P T Tt"/>
    </tr>

    </table>
</td>

<td width="50%" >
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
	             <imp:queryGridMakeUrl qset="PathwayQuestions" qname="PathwaysByCompounds" linktext="Compounds" existsOn="Am C G M Pi P T Tt"/>
    </tr>


    </table>
</td>

</tr>
</table>







