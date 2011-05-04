<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%@ attribute name="orthomcl_name"
              required="true"
              description="orthomcl group"
%>


<%--  get the first part of the group_name ('OG5' from 'OG5_158246')   ------%>
 <c:set var='release_start' value="${fn:substringBefore(orthomcl_name,'_')}"/>

<%--  extract release number (everything after first 2 chars); will work for any length  ------%>
 <c:set var='release_num' value="${fn:substring(release_start,2,-1)}"/>

<%--  construct link  ------%>
 <c:set var='link' value="http://v${release_num}.orthomcl.org/cgi-bin/OrthoMclWeb.cgi?rm=sequenceList&groupac=${orthomcl_name}"/>


 <c:out value="${link}"/>

