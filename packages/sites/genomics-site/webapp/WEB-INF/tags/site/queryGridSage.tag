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
                    <site:queryGridMakeUrl qset="SageTagQuestions" qname="SageTagBySequence" linktext="Sequence" existsOn="A G"/>
                </tr>

<tr>
	             <site:queryGridMakeUrl qset="SageTagQuestions" qname="SageTagByGeneSourceId" linktext="Gene Source Id" existsOn="A G"/>
            	</tr>

 
<tr>
                    <site:queryGridMakeUrl qset="SageTagQuestions" qname="SageTagByExpressionLevel" linktext="Expression Level" existsOn="A G"/>
                </tr>  
             

                
            </table>
        </td>

<%--	<td width="1" class="blueVcalLine"></td> --%>
	<td width="1"></td>

        <td  width="50%" valign="top">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">


 <tr>
                    <site:queryGridMakeUrl qset="SageTagQuestions" qname="SageTagByRadSourceId" linktext="Sage Tag ID" existsOn="A G"/>
                </tr>
 <tr>
                    <site:queryGridMakeUrl qset="SageTagQuestions" qname="SageTagByLocation" linktext="Chromosomal Location" existsOn="A G"/>
                </tr>

 <tr>
                    <site:queryGridMakeUrl qset="SageTagQuestions" qname="SageTagByRStat" linktext="Differential Expression" existsOn="A G"/>
                </tr>
        	

            </table>
    	</td>


</tr>
</table>
