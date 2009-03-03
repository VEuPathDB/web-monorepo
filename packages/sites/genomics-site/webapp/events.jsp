<%--
Events are stored in messaging database as xml records.
Separately select non-expired and expired 'Event' messages for all projects.
Transform XML message into Upcoming and Past events tables.
--%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml" %>


<c:set var='currentDataUrl'>
http://${pageContext.request.serverName}/cgi-bin/xmlMessageRead?messageCategory=Event
</c:set>
<c:set var='expiredDataUrl'>
http://${pageContext.request.serverName}/cgi-bin/xmlMessageRead?messageCategory=Event&range=expired&stopDateSort=DESC
</c:set>
<c:set var='xsltUrl'>
http://${pageContext.request.serverName}/assets/xsl/eupathEvents.xsl
</c:set>

<c:catch var='e'>

<c:import var="currentData" url="${currentDataUrl}" />
<c:import var="expiredData" url="${expiredDataUrl}" />

<c:import var="xslt" url="${xsltUrl}" />

<html>
<head>
<title>EuPathDB : Events with an EuPathDB presence</title>
<link rel="stylesheet" type="text/css" href="/a/misc/style.css" />
</head>
<body>

<table width='90%' align='center' cellpadding='2' cellspacing='0' border='0'>
<tr><td ALIGN="left" width="40%">  

  <table align="left" border="0">
  <tr>
     <td valign="top" width="10%" align="center"><a href="/">
  </a></td>
     <td>&nbsp;</td>
  
     <td  valign="top" width="10%" align="right">
        <table align="center" cellspacing=0 cellpadding=0>
        <tr valign="down"><td valign="bottom" align="center"><a href="http://cryptodb.org"><img border=0 src="/images/oocyst_bg.gif" width="55" height="55"></a></td></tr>
        <tr valign="top"><td valign="top" align="center"><a href="http://cryptodb.org"><img border=0 src="/images/cryptobanner.gif" width="60" height="17"></a></td></tr>
        </table>
     </td>
  <td valign="top" align="left"><a href="http://giardiadb.org"><img border=0 src="/assets/images/dbgiardia.jpg"  height="70"></a></td>
     <td valign="top" width="10%" align="center"><a href="http://plasmodb.org"><img border=0 src="/images/plasmoall.jpg" width="70" height="70"></a></td>
     <td valign="top" align="left"><a href="http://toxodb.org"><img border=0 src="/assets/images/dbtoxo.jpg"  height="70"></a></td>
  <td valign="top" align="left"><a href="http://trichdb.org"><img border=0 src="/assets/images/dbtrich.jpg"  height="70"></a></td>
  
  
  </tr>
  </table>


<td  align="center" valign="middle"><b><font face="Arial,Helvetica" color="#003366" size="+3">Events</font></b></td>
<td align="right" width="10%">&nbsp;</td></tr>


<tr><td colspan="3"><hr></td></tr>

<tr><td colspan="3"><font face="Arial,Helvetica">The <a href="/">Eukaryotic Pathogen Bioinformatics Resource Center (BRC)</a> designs, develops and maintains the EuPathDB, CryptoDB, GiardiaDB, PlasmoDB, ToxoDB and TrichDB websites.  The scientists and staff involved in this BRC attend numerous events to explain the resources we are building and to encourage scientists around the world to use them.</font></td></tr>
<tr><td><br></td></tr>
</table>
<table width='90%' align='center' cellpadding='2' cellspacing='0' border='0'>
    <tr><td colspan="3"><font face="Arial,Helvetica" color="#003366" size="+2"><b>Upcoming Events</b></font></td></tr>
    <tr><td>

    <x:transform xml="${currentData}" xslt="${xslt}" />

    </td></tr>
    <tr><td>&nbsp;</td></tr>
    <tr><td colspan="3"><font face="Arial,Helvetica" color="#003366" size="+2"><b>Past Events</b></font></td></tr>
    <tr><td>

    <x:transform xml="${expiredData}" xslt="${xslt}" />
    </td></tr>

</table>
</body>
</html>


</c:catch>
<c:if test="${e != null}">
    oops. this is borken. <br> 
    ${e}
</c:if>
