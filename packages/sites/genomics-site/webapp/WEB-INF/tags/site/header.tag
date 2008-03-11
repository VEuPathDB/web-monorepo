
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="w" uri="http://www.servletsuite.com/servlets/wraptag" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>

<%@ attribute name="title"
              description="Value to appear in page's title"
%>

<%@ attribute name="banner"
              required="false"
              description="Value to appear at top of page"
%>

<%@ attribute name="bannerPreformatted"
              required="false"
              description="Value to appear at top of page"
%>

<%@ attribute name="logo"
              required="false"
              description="relative url for logo to display, or no logo if set to 'none'"
%>

<%@ attribute name="parentDivision"
              required="false"
%>

<%@ attribute name="parentUrl"
              required="false"
%>

<%@ attribute name="divisionName"
              required="false"
%>

<%@ attribute name="division"
              required="false"
%>

<%@ attribute name="isBannerImage"
              required="false"
%>

<%@ attribute name="bannerSuperScript"
              required="false"
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


<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
        "http://www.w3.org/TR/html4/loose.dtd">
<html>

<head>

  <title><c:out value="${title}" default="${banner}" /></title>
 <link rel="stylesheet" href="<c:url value='/misc/style.css' />" type="text/css"> 
  <link rel="stylesheet" href="<c:url value='/misc/sequence.css' />" type="text/css">
  <link rel="stylesheet" href="/assets/css/main.css" type="text/css">
  <link rel="stylesheet" href="/assets/css/main2.css" type="text/css">
  <script type="text/javascript" src='<c:url value="/js/api.js"/>'></script>
  <script type='text/javascript' src='<c:url value="/js/overlib.js"/>'></script>
  <script type='text/javascript' src='<c:url value="/js/overlib_anchor.js"/>'></script>
  <script type='text/javascript' src='<c:url value="/js/newwindow.js"/>'></script>

<%-- unused 
<script language="javascript" src="/js/overlib_crossframe.js"></script>
<script language="javascript" src="/js/overlib_cssstyle.js"></script>
<script language="javascript" src="/js/overlib_exclusive.js"></script>
<script language="javascript" src="/js/overlib_followscroll.js"></script>
<script language="javascript" src="/js/overlib_hideform.js"></script>
<script language="javascript" src="/js/overlib_shadow.js"></script>
<script language="javascript" src="/js/overlib_centerpopup.js"></script>
--%>

  ${headElement}
<script language="JavaScript" type="text/JavaScript">
<!--
function MM_reloadPage(init) {  //reloads the window if Nav4 resized
  if (init==true) with (navigator) {if ((appName=="Netscape")&&(parseInt(appVersion)==4)) {
    document.MM_pgW=innerWidth; document.MM_pgH=innerHeight; onresize=MM_reloadPage; }}
  else if (innerWidth!=document.MM_pgW || innerHeight!=document.MM_pgH) location.reload();
}
MM_reloadPage(true);

function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}
//-->
</script>
</head>

<%--
<body onLoad="MM_preloadImages('/assets/images/menu_home2.gif','/assets/images/menu_queryhist2.gif','/assets/images/menu_data2.gif','/assets/images/menu_dl2.gif','/assets/images/menu_contact2.gif','/assets/images/menu_allqueries2.gif')">
--%>
<body>

<%-- query history count --%>
<c:set var="wdkUser" value="${sessionScope.wdkUser}"/>
<c:choose>
<c:when test="${wdkUser.historyCount == null}">
<c:set var="count" value="0"/>
</c:when>
<c:otherwise>
<c:set var="count" value="${wdkUser.historyCount}"/>
</c:otherwise>
</c:choose>

<%-- added for overLIB --%>
<div id="overDiv" style="position:absolute; visibility:hidden; z-index:1000;"></div>

<%-- NEW LOOK --%> <%-- Closing is in footer.tag --%>
<div align="center">

<%------- DECISION TREE --------%>
<c:choose>
<c:when test="${division eq 'none'}">
</c:when>

<c:otherwise>      <%-- THREE CASES: FRONT PAGE, ALL SITES and REST --%>

<%---------------%>


<c:choose>

<%-- FRONT PAGE --%>
<c:when test="${division eq 'home'}">

    <table width="90%"  border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td width="435" rowspan="2" align="left" valign="top">
      <img src="/assets/images/title.jpg" alt="EuPathDB: Eukaryotic Pathogens Database Resource" width="435" height="120" align="left"></td>
      <td height="31" colspan="2" align="left" valign="middle"><div align="right"><site:requestURL/>
		<site:loginRegister  division="${division}"/>&nbsp;</div></td>
    </tr>
    <tr>
    <td colspan="2" align="left" valign="top"><table width="105" height="62"  border="0" align="right" cellpadding="0" cellspacing="0">
    
    <tr>
      <td align="center" valign="middle" background="/assets/images/myquery_box2.jpg"><a href='<c:url value="/showQueryHistory.do"/>' class="white">My<br>Queries:<br>${count}</a></td>
    </tr>
  </table>
    <span class="whitelrg_bld">Version 3.1</span><br>
          <span class="white">December 12, 2007</span></td>
      </tr>
    </table>
    
    
    <%-- OLD HEADER BELOW --%>
    <%-- <table width="90%"  border="0" cellspacing="0" cellpadding="0">
      <tr>
      <td width="693" align="left" valign="top">
          <img src="/assets/images/title.jpg" alt="EuPathDB: Eukaryotic Pathogens Database Resources" width="435" height="120" align="left"> 
          <br><br>
          <span class="whitelrg_bld">Version ${wdkModel.version}</span><br>
          <span class="white">March 15, 2008</span> 
      </td>

      <td align="right" valign="top" >

 	<table width="105" height="93"  border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td height="31" align="center" valign="middle"><site:requestURL/>
		<site:loginRegister  division="${division}"/></td>
        </tr>
        <tr>
          <td height="62" align="center" valign="middle" background="/assets/images/myquery_box2.jpg">
		<a href='<c:url value="/showQueryHistory.do"/>' class="white">My<br>Queries:<br>${count}</a></td>
        </tr>
        </table>

      </td>
      </tr>

      <tr>
        <td height="1"><img src="/assets/images/line.gif" width="693" height="1"></td>
        <td  height="1"></td>
      </tr>
    </table> --%>

<br>

<%-- TOOLBAR --%>

    <table width="80%"  border="0" align="center" cellpadding="0" cellspacing="0">
      <tr>
        <td width="28"><img src="/assets/images/menu_bar_lft.gif" name="Image1" width="28" height="28" id="Image1"></td>
        <td background="/assets/images/menu_bar_cntr.gif">&nbsp;</td>
        <td width="676" background="/assets/images/menu_bar_cntr.gif"><div align="center"><a href="/" onMouseOver="MM_swapImage('home','','/assets/images/menu_home2.gif',1)" onMouseOut="MM_swapImgRestore()"><img src="/assets/images/menu_home1.gif" alt="Home" name="home" width="59" height="28" border="0" id="home"></a><a href="<c:url value='/queries_tools.jsp' />" onMouseOver="MM_swapImage('allqueries','','/assets/images/menu_allqueries2.gif',1)" onMouseOut="MM_swapImgRestore()"><img src="/assets/images/menu_allqueries1.gif" alt="All Queries and Tools" name="allqueries" width="165" height="28" border="0" id="allqueries"></a><a href="<c:url value='/showQueryHistory.do' />" onmouseover="MM_swapImage('queryhist','','/assets/images/menu_queryhist2.gif',1)" onmouseout="MM_swapImgRestore();return nd()"><img src="/assets/images/menu_queryhist1.gif" alt="Query History" name="queryhist" width="117" height="28" border="0" id="queryhist"></a><a href="/static/sources.shtml" onMouseOver="MM_swapImage('data','','/assets/images/menu_data2.gif',1)" onMouseOut="MM_swapImgRestore()"><img src="/assets/images/menu_data1.gif" alt="Data Sources" name="data" width="112" height="28" border="0" id="data"></a><a href="/common/downloads/" onMouseOver="MM_swapImage('dl','','/assets/images/menu_dl2.gif',1)" onMouseOut="MM_swapImgRestore()"><img src="/assets/images/menu_dl1.gif" alt="Download Files" name="dl" width="125" height="28" border="0" id="dl"></a><a href="/a/help.jsp" target="_blank"  onClick="poptastic(this.href); return false;" onMouseOver="MM_swapImage('contact','','/assets/images/menu_contact2.gif',1)" onMouseOut="MM_swapImgRestore()"><img src="/assets/images/menu_contact1.gif" alt="Contact Us" name="contact" width="96" height="28" border="0" id="contact"></a></div>
        </td>
        <td background="/assets/images/menu_bar_cntr.gif">&nbsp;</td>
        <td width="28"><img src="/assets/images/menu_bar_rt.gif" width="28" height="28"></td>
      </tr>
      <tr>
        <td width="28" height="10"></td>
        <td height="10"></td>
        <td width="676" height="10"><img src="/assets/images/line.gif" width="676" height="10"></td>
        <td height="10"></td>
        <td width="28" height="10"></td>
      </tr>
  </table>

<%-- END OF TOOLBAR --%>

<div id="toptext" class="Top_Alert_Red"><img src="/assets/images/Red_Check.gif" width="22" height="22" align="absmiddle"> Welcome to the newly expanded APIDB &mdash; new name, new organisms, same functionality.</div>


<%-- Closing is in footer.tag --%>
<div id="border">


</c:when> <%-- division eq 'home' --%>
<%-- END OF FRONT PAGE --%>

<%------------------------------------------------------------------%>

<c:when test="${divisionName eq 'allSites'}">

<%-- THIS HEADER IS SIMILAR TO THE ONE USED BY STATIC PAGES IN HTML/INCLUDE/TOOLBAR.HTML --%>

<%-- Closing is in footer.tag --%>
<div id="border">

<table width='80%' align='center' cellpadding='2' cellspacing='0' border='0'>
<tr><td ALIGN="left" width="40%">

<table align="left" border="0">
<tr>
   <td valign="top" width="10%" align="center"><a href="/">
	<img SRC="/assets/images/eupathdb_titleonwhite.gif" BORDER=0 height=60 >
        </a>
   </td>
   <td>&nbsp;</td>

 <td valign="top" align="left"><a href="http://cryptodb.org"><img border=0 src="/assets/images/dbcrypto.jpg"  height="70"></a></td>
<td valign="top" align="left"><a href="http://giardiadb.org"><img border=0 src="/assets/images/dbgiardia.jpg"  height="70"></a></td>
   <td valign="top" width="10%" align="center"><a href="http://plasmodb.org"><img border=0 src="/images/plasmoall.jpg" width="70" height="70"></a></td>
   <td valign="top" align="left"><a href="http://toxodb.org"><img border=0 src="/images/toxoall.jpg"  height="70"></a></td>
<td valign="top" align="left"><a href="http://trichdb.org"><img border=0 src="/assets/images/dbtrich.jpg"  height="70"></a></td>


</tr>
</table>


<td  align="center" valign="middle"><b><font face="Arial,Helvetica" color="#003366" size="+3">Gene Metrics</font></b></td>
<td align="right" width="10%">&nbsp;</td></tr>


<tr><td colspan="3"><hr></td></tr>

</table>



 




</c:when> <%-- divisionName eq 'allSites' --%>

<%------------------------------------------------------------------%>

<c:otherwise> <%-- all pages other than home and "static" --%>


<table width="90%"  border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="203" rowspan="2" valign="top"><a href="/"><img src="/assets/images/title_small.jpg" alt="EuPathDB: Eukaryotic Pathogens Database Resource" width="203" height="120" border="0" align="left"></a></td>
        <td height="31" colspan="2" align="center" valign="middle"><div align="right"><site:requestURL/>
		<site:loginRegister  division="${division}"/>&nbsp;</div></td>
      </tr>
      <tr>
        <td align="center" valign="top">
        
        <%-- TITLE --%>
        
        <c:choose>
                  <c:when test="${banner != null && bannerPreformatted == null}">
                    <span class="titlesubpages">
                    ${banner}
                    </span>
                  </c:when>
                  <c:when test="${banner == null && bannerPreformatted != null}">
                    ${bannerPreformatted}
                  </c:when>
                  <c:otherwise>
                  </c:otherwise>
                </c:choose>
        
        </td>
        <td width="203" align="right" valign="top" ><table width="105" height="62"  border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td height="62" align="center" valign="middle" background="/assets/images/myquery_box2.jpg"><a href='<c:url value="/showQueryHistory.do"/>' class="white">My<br>Queries:<br>${count}</a></td>
          </tr>
        </table></td>
      </tr>
    </table>

  <%-- OLD HEADER BELOW --%>

<%-- <table width="90%"  border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="203" valign="top">
		<a href="/"><img src="/assets/images/title_small.jpg" alt="EuPathDB: Eukaryotic Pathogens Database Resources" width="203" height="120" border="0" align="left"></a>
        </td>
        <td align="center" valign="middle"> 

		<c:choose>
                  <c:when test="${banner != null && bannerPreformatted == null}">
                    <b><font face="Arial,Helvetica" size="+3" color="#ffffff">
                    ${banner}
                    </font></b>
                  </c:when>
                  <c:when test="${banner == null && bannerPreformatted != null}">
                    ${bannerPreformatted}
                  </c:when>
                  <c:otherwise>
                  </c:otherwise>
                </c:choose>

        </td>
        <td width="203" align="right" valign="top" >

        <table width="105" height="93"  border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td height="31" align="center" valign="middle"><site:requestURL/>
		<site:loginRegister  division="${division}"/></td>
        </tr>
        <tr>
          <td height="62" align="center" valign="middle" background="/assets/images/myquery_box2.jpg">
		<a href='<c:url value="/showQueryHistory.do"/>' class="white">My<br>Queries:<br>${count}</a></td>
        </tr>
        </table>

        </td>
      </tr>

      <tr>
        <td height="1"><img src="/assets/images/line.gif" width="203" height="1"></td>
        <td></td>
        <td height="1"><img src="/assets/images/line.gif" width="203" height="1"></td>
      </tr>
</table> --%>


<br>

  <%-- TOOLBAR --%>

    <table width="80%"  border="0" align="center" cellpadding="0" cellspacing="0">
      <tr>
        <td width="28"><img src="/assets/images/menu_bar_lft.gif" name="Image1" width="28" height="28" id="Image1"></td>
        <td background="/assets/images/menu_bar_cntr.gif">&nbsp;</td>

 <td width="676" background="/assets/images/menu_bar_cntr.gif"><div align="center"><a href="/" onMouseOver="MM_swapImage('home','','/assets/images/menu_home2.gif',1)" onMouseOut="MM_swapImgRestore()"><img src="/assets/images/menu_home1.gif" alt="Home" name="home" width="59" height="28" border="0" id="home"></a><a href="<c:url value='/queries_tools.jsp' />" onMouseOver="MM_swapImage('allqueries','','/assets/images/menu_allqueries2.gif',1)" onMouseOut="MM_swapImgRestore()"><img src="/assets/images/menu_allqueries1.gif" alt="All Queries and Tools" name="allqueries" width="165" height="28" border="0" id="allqueries"></a><a href="<c:url value='/showQueryHistory.do' />" onmouseover="MM_swapImage('queryhist','','/assets/images/menu_queryhist2.gif',1)" onmouseout="MM_swapImgRestore();return nd()"><img src="/assets/images/menu_queryhist1.gif" alt="Query History" name="queryhist" width="117" height="28" border="0" id="queryhist"></a><a href="/static/sources.shtml" onMouseOver="MM_swapImage('data','','/assets/images/menu_data2.gif',1)" onMouseOut="MM_swapImgRestore()"><img src="/assets/images/menu_data1.gif" alt="Data Sources" name="data" width="112" height="28" border="0" id="data"></a><a href="/common/downloads/" onMouseOver="MM_swapImage('dl','','/assets/images/menu_dl2.gif',1)" onMouseOut="MM_swapImgRestore()"><img src="/assets/images/menu_dl1.gif" alt="Download Files" name="dl" width="125" height="28" border="0" id="dl"></a><a href="/a/help.jsp" target="_blank"  onClick="poptastic(this.href); return false;" onMouseOver="MM_swapImage('contact','','/assets/images/menu_contact2.gif',1)" onMouseOut="MM_swapImgRestore()"><img src="/assets/images/menu_contact1.gif" alt="Contact Us" name="contact" width="96" height="28" border="0" id="contact"></a></div>
         </td>
        <td background="/assets/images/menu_bar_cntr.gif">&nbsp;</td>
        <td width="28"><img src="/assets/images/menu_bar_rt.gif" width="28" height="28"></td>
      </tr>
      <tr>
        <td width="28" height="10"></td>
        <td height="10"></td>
        <td width="676" height="10"><img src="/assets/images/line.gif" width="676" height="10"></td>
        <td height="10"></td>
        <td width="28" height="10"></td>
      </tr>
  </table>

<%-- END OF TOOLBAR --%>


<%-- Closing is in footer.tag --%>
<div id="border">


</c:otherwise>  <%-- division is NOT home NEITHER divisionName is allsites --%>
</c:choose>

<%------------------------------------------------------------------%>



</c:otherwise>  <%-- division is NOT none --%>
</c:choose>  



