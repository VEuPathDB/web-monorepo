<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="modelName" value="${wdkModel.displayName}"/>

<table width="100%" border="0" cellspacing="2" cellpadding="2">
<tr>

<td width="33%" >
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr> 
        <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByIsolateId" linktext="Isolate ID(s)" existsOn="A C P T G"/>
    </tr>
    <tr>
       <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByTaxon" linktext="Taxon/Strain" existsOn="A C P T G"/> 
    </tr>
    <tr>
      <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByHost" linktext="Host" existsOn="A C T G P"/>
    </tr>
    <tr>
      <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByIsolationSource" linktext="Isolation Source" existsOn="A C T G P"/>
    </tr>
    </table>
</td>

<td width="34%" >
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByProduct" linktext="Locus Sequence" existsOn="A C T G P"/>
    </tr>
     <tr>
      <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByGenotypeNumber" linktext="RFLP Genotype Number" existsOn="A T"/>
     </tr>
    <tr>
      <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByRFLPGenotype" linktext="RFLP Genotype" existsOn="A T"/>
    </tr>
    <tr>
	<imp:queryGridMakeUrl qset="IsolateInternalQuestions" qname="IsolatesByRFLP" linktext="Reference RFLP Gel Images" existsOn="C"/>
    </tr>

    </table>
</td>

<td width="33%" >
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByCountry" linktext="Geographic Location" existsOn="A C P T G"/>
    </tr>
     <tr>
       <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolatesBySimilarity" linktext="BLAST/Reference Typing Tool" type="ISOLATE" existsOn="A C P T G"  />
     </tr>
    <tr>
       <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolatesByTextSearch" linktext="Text" existsOn="A C T G P"/>
    </tr>
<%--
     <tr>
       <imp:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateBySubmitter" linktext="Submitter" existsOn="A P"  />
     </tr>
--%>

     <tr>
         <imp:queryGridMakeUrl qset="IsolateInternalQuestions" qname="IsolatesByClustering" linktext="Isolate Clustering" existsOn="P"  />
    </tr>

    
    </table>
</td>

</tr>
</table>
