<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="pg" uri="http://jsptags.com/tags/navigation/pager" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="nested" uri="http://jakarta.apache.org/struts/tags-nested" %>

<!-- get wdkXmlAnswer saved in request scope -->
<c:set var="xmlAnswer" value="${requestScope.wdkXmlAnswer}"/>

<c:set var="banner" value="${xmlAnswer.question.displayName}"/>

<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>

<site:header title="${wdkModel.displayName} : Gene Metrics"
                 banner="${banner}"
                 parentDivision="${wdkModel.displayName}"
                 parentUrl="/home.jsp"
                 divisionName="GeneMetrics"
                 division="genemetrics"
                 headElement="${headElement}" />

<table border=0 width=100% cellpadding=3 cellspacing=0 bgcolor=white class=thinTopBottomBorders> 

 <tr>
  <td bgcolor=white valign=top>

<%-- handle empty result set situation --%>
<c:choose>
  <c:when test='${xmlAnswer.resultSize == 0}'>
    Not available.
  </c:when>
  <c:otherwise>

<!-- main body start -->

<c:set var="i" value="1"/>

<table border="1" cellpadding="2" cellspacing="0" width="100%">
<th><td>GeneCount<br>Total</td><td>Protein<br>coding</td><td>Other<br>categories</td><td>Pseudo</td><td>EuPathsvn update<br>curated</td><td>Community<br>entries</td><td>Orthologs</td><td>GO<br>terms</td><td>EC<br>numbers</td><td>SNPs</td><td>Expression<br>Total</td><td>Microarray</td><td>ESTs</td><td>SAGE<br>tags</td><td>Proteomics</td></th>

<c:forEach items="${xmlAnswer.recordInstances}" var="record">
   <c:set var="Organism" value="${record.attributesMap['Organism']}"/>
   <c:set var="Gene_Count_Total" value="${record.attributesMap['Gene_Count_Total']}"/>
   <c:set var="Protein_coding" value="${record.attributesMap['Protein_coding']}"/>
   <c:set var="Other_categories" value="${record.attributesMap['Other_categories']}"/>
   <c:set var="Pseudogenes" value="${record.attributesMap['Pseudogenes']}"/>
   <c:set var="ApiDB_curated" value="${record.attributesMap['ApiDB_curated']}"/>
   <c:set var="Community_entries" value="${record.attributesMap['Community_entries']}"/>
   <c:set var="Orthologs" value="${record.attributesMap['Orthologs']}"/>
   <c:set var="GO_terms" value="${record.attributesMap['GO_terms']}"/>
   <c:set var="EC_numbers" value="${record.attributesMap['EC_numbers']}"/>
   <c:set var="SNPs" value="${record.attributesMap['SNPs']}"/>
   <c:set var="Expression_Total" value="${record.attributesMap['Expression_Total']}"/>
   <c:set var="Microarray" value="${record.attributesMap['Microarray']}"/>
   <c:set var="ESTs" value="${record.attributesMap['ESTs']}"/>
   <c:set var="SAGE_tags" value="${record.attributesMap['SAGE_tags']}"/>
   <c:set var="Proteomics" value="${record.attributesMap['Proteomics']}"/>


   
  <tr><td>${Organism}</td><td>${Gene_Count_Total}</td><td>${Protein_coding}</td><td>${Other_categories}</td><td>${Pseudogenes}</td><td>${ApiDB_curated}</td><td>${Community_entries}</td><td>${Orthologs}</td><td>${GO_terms}</td><td>${EC_numbers}</td><td>${SNPs}</td><td>${Expression_Total}</td><td>${Microarray}</td><td>${ESTs}</td><td>${SAGE_tags}</td><td>${Proteomics}</td></tr>

</c:forEach>
</table>


<p>
<!-- main body end -->

  </c:otherwise>
</c:choose>


  </td>
  <td valign=top class=dottedLeftBorder></td> 
</tr>
</table> 

<site:footer/>
