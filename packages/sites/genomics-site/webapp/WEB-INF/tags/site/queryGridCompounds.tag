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
        <imp:queryGridMakeUrl qset="CompoundQuestions" qname="CompoundsByCompoundID" linktext="Compound ID" existsOn="Am C G M Pi P T Tt"/>
    </tr>
    <tr> 
        <imp:queryGridMakeUrl qset="CompoundQuestions" qname="CompoundsByTextSearch" linktext="Text (synonym, InChI, etc.)" existsOn="Am C G M Pi P T Tt"/>
    </tr>
    <tr>
       <imp:queryGridMakeUrl qset="CompoundQuestions" qname="CompoundsByEcReaction" linktext="Gene ID" existsOn="Am C G M Pi P T Tt"/> 
    </tr>
    </table>
</td>

<td width="50%" >
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <imp:queryGridMakeUrl qset="CompoundQuestions" qname="CompoundsByPathway" linktext="Metabolic Pathway" existsOn="Am C G M Pi P T Tt"/>
    </tr>

     <tr>
      <imp:queryGridMakeUrl qset="CompoundQuestions" qname="CompoundsByMolecularFormula" linktext="Molecular Formula" existsOn="Am C G M Pi P T Tt"/>
    </tr>

     <tr>
      <imp:queryGridMakeUrl qset="CompoundQuestions" qname="CompoundsByMolecularWeight" linktext="Molecular Weight" existsOn="Am C G M Pi P T Tt"/>
    </tr>

     <tr>
      <imp:queryGridMakeUrl qset="CompoundQuestions" qname="CompoundsByFoldChange" linktext="Fold Change" existsOn="Am C G M Pi P T Tt"/>
     </tr>

    </table>
</td>

</tr>
</table>
