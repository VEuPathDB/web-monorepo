<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>



<!-- get wdkModel saved in application scope -->
<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var="version" value="${wdkModel.version}"/>
<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />

<c:choose>
      <c:when test = "${project == 'ToxoDB'}">
             <c:set var="title" value="ToxoDB: The Toxoplasma gondii genome resource"/>
      </c:when>
      <c:when test = "${project == 'PlasmoDB'}">
             <c:set var="title" value="PlasmoDB : The Plasmodium genome resource"/>
      </c:when>
      <c:when test = "${project == 'CryptoDB'}">
             <c:set var="title" value="CryptoDB: The Cryptosporidium genome resource"/>
      </c:when>
      <c:when test = "${project == 'ApiDB'}">
             <c:set var="title" value="ApiDB: The Apicomplexan genome resource"/>
      </c:when>
  </c:choose>


<site:header title="${title}"
                 banner="${project} Download Files"
                 isBannerImage="${isbannerimage}"
                 bannerSuperScript="<br><b><font size=\"+1\">Release ${version}</font></b>"
                division="downloads"/>


