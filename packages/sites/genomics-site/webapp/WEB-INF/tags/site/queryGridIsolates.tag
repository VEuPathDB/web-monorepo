<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<c:set var="modelName" value="${wdkModel.displayName}"/>

<table width="100%" border="0" cellspacing="2" cellpadding="2">
<tr>

<td width="33%" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr> 
        <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByIsolateId" linktext="Isolate ID" existsOn="C"/>
    </tr>
    <tr>
       <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByTaxon" linktext="Taxon" existsOn="C"/> 
    </tr>
    <tr>
      <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByHost" linktext="Host" existsOn="C"/>
    </tr>
    </table>
</td>

<td width="34%" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
       <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByIsolationSource" linktext="Isolatation Source" existsOn="C"/>
    </tr>
    <tr>
      <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByProduct" linktext="Product Name" existsOn="C"/>
    </tr>
    <tr>
      <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByStudy" linktext="Study Name" existsOn="C"/>
    </tr>
    </table>
</td>

<td width="33%" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByCountry" linktext="Country Name" existsOn="C"/>
    </tr>
    <tr>
       <site:queryGridMakeUrl qset="IsolateQuestions" qname="IsolateByAuthor" linktext="Author Name" existsOn="C"/>
    </tr>
<tr>
       <site:queryGridMakeUrl qset="UniversalQuestions" qname="UnifiedBlast" linktext="BLAST Similarity" type="ISOLATE" existsOn="C"  />
    </tr>
    </table>
</td>

</tr>
</table>
