<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="random" uri="http://jakarta.apache.org/taglibs/random-1.0" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<c:set var="props" value="${applicationScope.wdkModel.properties}" />
<c:set var="project" value="${props['PROJECT_ID']}" />


 <c:choose>
      <c:when test = "${project == 'CryptoDB'}">
             <c:set var="title" value="CryptoDB title....."/>
<!-- previous header attributes
             <c:set var="banner" value="<font size=\"+6\" face='Trebuchet MS,Arial,GillSans Ultra Bold,Trebuchet MS,Arial,Verdana,Sans-serif'>ToxoDB</font>"/>
             <c:set var="isbannerimage" value="false"/>
             <c:set var="gbrowsepath" value="/gbrowse/toxodb"/>
             <c:set var="cycname" value="ToxoCyc"/>
             <c:set var="cycpath" value="TOXO"/>
             <c:set var="organismlist" value="Toxoplasma gondii"/>
-->

      </c:when>
      <c:when test = "${project == 'TriTrypDB'}">
             <c:set var="title" value="TriTrypDB title..."/>
<!--
             <c:set var="banner" value="/images/plasmodbBanner.jpg"/>
             <c:set var="isbannerimage" value="true"/>
             <c:set var="gbrowsepath" value="/gbrowse/plasmodb"/>
             <c:set var="cycname" value="PlasmoCyc"/>
             <c:set var="cycpath" value="PLASMO"/>
             <c:set var="organismlist" value="Plasmodium falciparum,Plasmodium vivax,Plasmodium yoelii,Plasmodium berghei,Plasmodium chabaudi,Plasmodium knowlesi"/>
-->

      </c:when>
  </c:choose>



 <!--         banner="${banner}"
                 isBannerImage="${isbannerimage}"
                 bannerSuperScript="<br><b><font size=\"+1\">Release ${version}</font></b>"
                division="home"  -->

<site:home_header title="${title}" 
             refer="home"/>

<site:menubar />
<site:DQG />
<site:sidebar />
<site:footer />
