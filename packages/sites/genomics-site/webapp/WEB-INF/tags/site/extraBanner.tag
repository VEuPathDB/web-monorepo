<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>

<%@ attribute name="refer"
              required="true"
              description="page calling this tag"
%>
<%@ attribute name="title"
              required="false"
              description="record class"
%>
<c:set var="project" value="${wdkModel.name}"/>

<c:if test="${project == 'PlasmoDB'  &&
           ( refer == 'question' && fn:containsIgnoreCase(title,'pathway') ||
				     refer == 'question' && fn:containsIgnoreCase(title,'compound') ||
             refer == 'recordPage' && fn:containsIgnoreCase(title,'pathway') ||
             refer == 'recordPage' && fn:containsIgnoreCase(title,'compound') ) }">

       This <i>beta-release</i> of Compound and Metabolic Pathways data sets incorporates KEGG pathways and a subset of PubChem records.  Future releases will include compounds for additional metabolites and small molecules, and pathways from other sources such as MPMP, MetaCyc, etc.  

       Please explore the site and 
			 <a class="open-window-contact-us" href='<c:url value='/contact.do'/>'>contact us</a> 
			 with your feedback. 
</c:if>
