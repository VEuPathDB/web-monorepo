<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<%@ attribute name="title"
              description="Value to appear in page's title"
%>
<%@ attribute name="banner"
              required="true"
              description="Value to appear at top of page"
%>

<%@ attribute name="isBannerImage"
              required="false"
              description="flag to indicate whether banner is referring to graphics"
%>

<%@ attribute name="bannerSuperScript"
              required="false"
              description="additional banner part, e.g. release & release date"
%>

<%@ attribute name="parentDivision"
              required="false"
              description="context of page for parent page in the whole website"
%>

<%@ attribute name="parentUrl"
              required="false"
              description="URL for parent page"
%>

<%@ attribute name="divisionName"
              required="false"
              description="context of page in the whole website"
%>

<%@ attribute name="division"
              required="false"
              description="context of page in the whole website"
%>

<%@ attribute name="summary"
              required="false"
              description="short text description of the page"
%>

<%@ attribute name="headElement"
              required="false"
              description="additional head elements"
%>

<%@ attribute name="bodyElement"
              required="false"
              description="additional body elements"
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>


<head>
  <title>
    <c:out value="${title}" default="${banner}" />
  </title>

 <c:set var="project" value="${wdkModel.name}"/>
<c:if test = "${project == 'PlasmoDB'}">
   <c:set var="stylesheet" value="/misc/plasmodb_style.css"/>
   <c:set var="logo" value="/images/plasmodb_logo.gif"/>
   <c:set var="sidebarBgColor" value="#dfdfef"/>
</c:if>
<c:if test = "${project == 'ToxoDB'}">
   <c:set var="stylesheet" value="/misc/toxodb_style.css"/>
   <c:set var="logo" value="/images/toxodb_logo-rotated.jpg"/>
   <c:set var="sidebarBgColor" value="white"/>
</c:if>
 <link rel="StyleSheet" href="<c:url value="${stylesheet}" />" type="text/css">

  <!--link type="text/css" rel="StyleSheet" href='<c:url value="/slider/css/winclassic.css"/>'-->
  <!--link rel="StyleSheet" href="<c:url value="/misc/custom-slider.css" />" type="text/css"-->

  <!--script type="text/javascript" src='<c:url value="/slider/js/range.js"/>'></script-->
  <!--script type="text/javascript" src='<c:url value="/slider/js/timer.js"/>'></script-->
  <!--script type="text/javascript" src='<c:url value="/slider/js/slider.js"/>'></script-->
  <script type="text/javascript" src='<c:url value="/js/api.js"/>'></script>
<script type='text/javascript' src='<c:url value="/js/overlib.js"/>'></script>
  <script type='text/javascript' src='<c:url value="/js/newwindow.js"/>'></script>

  ${headElement}
</head>

<body ${bodyElement}>

<c:set var="isHome" value="${ division == 'home' }"/>
<c:set var="version" value="${wdkModel.version}"/>






<table width="100%" align="center" cellspacing="0" cellpadding="0" border="0">

<tr valign="middle">

<%-- logo spanning two rows: banner (image or text depending on page) and (if home) intro text  --%>
<%-- logo size could vary when not in home --%>

    <td rowspan="2" width="162" align="center"><a href="<c:url value="/home.jsp" />">
        <c:choose>
          <c:when test="${ division == 'home'}">
            <img src="<c:url value="${logo}" />" border="0" alt="Site logo"/></a>
          </c:when>
          <c:otherwise>
            <img src="<c:url value="${logo}" />" border="0" alt="Site logo"/></a>
          </c:otherwise>
        </c:choose>
    </td>

<%-- banner  --%>
    <td align="center" valign="middle">
    <c:choose>
        <c:when test="${isBannerImage}">
            <img src="<c:url value="${banner}"/>" alt="Page banner"/> 
        </c:when>
        <c:otherwise>
            <c:choose>
               <c:when test="${summary != null}">
                  <h2>${banner}</h2>
               </c:when>
               <c:otherwise>
                  <h1>${banner}</h1>
               </c:otherwise>
             </c:choose>
        </c:otherwise>
    </c:choose>
    </td>



<%-- Release number --%>
    <td align="right" valign="down">
<c:choose>
    <c:when test="${bannerSuperScript != null}">
        ${bannerSuperScript}&nbsp;&nbsp;&nbsp;
    </c:when>
    <%-- for pages other than home which do not use bannersuperscript (bigger font) --%>
    <c:otherwise>
         <b>Release ${version}&nbsp;&nbsp;&nbsp;</b>
    </c:otherwise>
 </c:choose>
    </td>   
 
</tr>

<%-- intro text in home page, summary in record pages, or nothing in other pages --%>
<c:choose>

<c:when test="${ division == 'home'}">
<tr>
<td align="left" colspan="2">

<c:if test = "${project == 'PlasmoDB'}">
          <div class="small">
          PlasmoDB.org hosts genomic and proteomic data (and more) for different species of the 
	  parasitic eukaryote Plasmodium, the cause of Malaria. It brings together data provided by numerous laboratories worldwide (see the <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.DataSources"/>">Data Sources</a> page), and adds its own data analysis.  Publications relying on  
	  PlasmoDB should please <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#citing"/>">acknowledge</a>
          the database developers
          and the scientists who have made their data available. PlasmoDB is part of an NIH/NIAID
          funded <a href="http://www.niaid.nih.gov/dmid/genomes/brc/default.htm">Bioinformatics Resource Center</a>
          to provide <a href="http://apidb.org/">Apicomplexan Database Resources</a>.

	  <br><br>
Features not yet available in PlasmoDB&nbsp;${version} may still be accessed via <a href="http://v4-4.plasmodb.org">PlasmoDB&nbsp;4.4</a>, and the results of PlasmoDB&nbsp;4.4 queries may be exported to PlasmoDB&nbsp;${version} (see <a href="http://v4-4.plasmodb.org/plasmodb/servlet/sv?page=history">PlasmoDB&nbsp;4.4 Query History</a>).
          </div>

         
</c:if> 
<c:if test = "${project == 'ToxoDB'}">

        <div class="small" bgcolor="#aa0000">Welcome to ToxoDB!
	 ToxoDB, the Toxoplasma gondii Genome resource, provides access to the  draft genome sequence of 
	 the apicomplexan parasite <i>T. gondii</i> &nbsp; (ME49, GT1, VEG and RH (only Chr Ia and Chr Ib) strains).
	 The whole genome shotgun sequence is generated by TIGR. 
	 Publications exploiting ToxoDB should provide appropriate
	 <a href="<c:url value="/showXmlDataContent.do?name=XmlQuestions.About#citing"/>">acknowledgment</a>
	 to the database developers and those scientists who have made their data available on this site.
 	 ToxoDB is part of an NIH/NIAID funded  Bioinformatics Resource Center 
	 to provide <a href="http://apidb.org/">Apicomplexan Database Resources</a>.</div>

	  
          <div class="small" bgcolor="#aa0000">
	   Features not yet available in ToxoDB ${version} may still be accessed via
	    <a href="http://v3-0.toxodb.org/ToxoDB.shtml">ToxoDB 3.0</a>). </div>

     	  
          <div class="small" bgcolor="#aa0000">Here is an 
	  <a href="http://roos-compbio2.bio.upenn.edu/toxo/cgi-bin/gbrowse/gbtoxo_amit/" target='new'> 
 	  <b>Ancillary GBrowse Site for <i>T. gondii</i></b></a>. 
	  <b>Please NOTE</b>: This site is outside of ToxoDB; it includes  additional data sets that will be 
	   incorporated in ToxoDB eventually.</div>
	


</c:if> 

<%-- colored box -- warnings and notices go here --%>
<div class="smallApiBlue">
<font face="Arial,Helvetica" size="-1"  color="blue">
&nbsp;&nbsp;As part of our ongoing education efforts we are proud to announce the third of four, annual, <b>apicomplexan database workshops</b>, next June. &nbsp;&nbsp;Please click <a href="http://apidb.org/workshop/2008/"><b>here</b></a> for further information.
</font>
</div>


</td>
</tr>
</c:when>

<c:otherwise>
<tr>
       <td align="left" colspan="2">
         <c:if test="${summary != null}">
           ${summary}
         </c:if>         
       </td>

<%-- saves some space setting Release above as in home page
       <td align="right" valign="bottom" width="100">
          <c:if test="${division != 'home'}">
            <b>Release ${version}&nbsp;&nbsp;</b>
          </c:if>
        </td>
--%>
</tr>
</c:otherwise>

</c:choose>

</table>


<%-- TABLE WITH sidebar and main page defined in the specific jsp --%>
<table width="100%" align="center" border="0" cellpadding="0" cellspacing="0" >
<tr>

<%-- sidebar space --%>
<c:choose>
          <c:when test="${ division != 'help'}">
             <td rowspan="8" width="162" valign="top" bgcolor="${sidebarBgColor}"><site:sideNavBar division="${division}"/></td>
          </c:when>
          <c:otherwise>
            <td rowspan="8"></td>
          </c:otherwise>
</c:choose>


<%-- page itself, closed at footer.tag --%>
<td valign="top">
