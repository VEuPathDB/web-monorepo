<%--
Events are stored in messaging database as xml records.
Separately select non-expired and expired 'Event' messages for all projects.
Transform XML message into Upcoming and Past events tables.
--%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="x" uri="http://java.sun.com/jsp/jstl/xml" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib"%>

<%-- obsolete method to fetch data via cgi
<c:set var='currentDataUrl'>
http://${pageContext.request.serverName}/cgi-bin/xmlMessageRead?messageCategory=Event
</c:set>
<c:set var='expiredDataUrl'>
http://${pageContext.request.serverName}/cgi-bin/xmlMessageRead?messageCategory=Event&range=expired&stopDateSort=DESC
</c:set>
--%>


<c:set var="wdkModel" value="${applicationScope.wdkModel}"/>
<c:set var='projectName' value='${applicationScope.wdkModel.name}'/>



<c:set var='xsltUrl'>
http://${pageContext.request.serverName}/assets/xsl/eupathEvents.xsl
</c:set>

<c:catch var='e'>

<api:xmlMessages var="currentEvents" 
    messageCategory="Event"
    stopDateSort="DESC"
/>

<api:xmlMessages var="expiredEvents" 
    messageCategory="Event"
    stopDateSort="DESC"
    range="expired"
/>

<c:import var="xslt" url="${xsltUrl}" />

<html>
<head>
<title>EuPathDB : Events with an EuPathDB presence</title>
<link rel="stylesheet" type="text/css" href="/a/misc/style.css" />
</head>
<body>

<table width='90%' align='center'>
<tr><td ALIGN="left" width="40%">  

  <table align="left" border="0">
  <tr>
     <td><a href="/"><imp:image src="images/eupathdb_titleonwhite.gif" border="0"></a></td> 
	<td>&nbsp;</td> 
    <td><a href="http://amoebadb.org"><imp:image border="0" src="images/AmoebaDB/amoebadb_w50.png"  height="25" width="25"/></a></td>
	<td>&nbsp;</td>
    <td><a href="http://cryptodb.org"><imp:image border="0" src="images/CryptoDB/cryptodb_w50.png"  height="25" width="25"/></a></td>
	<td>&nbsp;</td> 
    <td><a href="http://giardiadb.org"><imp:image border="0" src="images/GiardiaDB/giardiadb_w50.png"  height="25" width="25"/></a></td>	
	<td>&nbsp;</td> 
    <td><a href="http://microsporidiadb.org"><imp:image border="0" src="images/MicrosporidiaDB/microdb_w50.png"  height="25" width="25"/></a></td>	
	<td>&nbsp;</td> 
    <td><a href="http://plasmodb.org"><imp:image border="0" src="images/PlasmoDB/plasmodb_w50.png"  height="25" width="25"/></a></td>
	<td>&nbsp;</td> 
    <td><a href="http://toxodb.org"><imp:image border="0" src="images/ToxoDB/toxodb_w50.png"  height="25" width="25"/></a></td>
	<td>&nbsp;</td> 
    <td><a href="http://trichdb.org"><imp:image border="0" src="images/TrichDB/trichdb_w65.png"  height=25 width=30></a></td>
	<td>&nbsp;</td> 
    <td><a href="http://tritrypdb.org"><imp:image border="0" src="images/TriTrypDB/tritrypdb_w40.png"  height="25" width="25"/></a></td>
  </tr>
  </table>


<td  align="center" valign="middle"><b><font face="Arial,Helvetica" color="#003366" size="+3">Events 
	<a style="font-size:50%" target=":blank" href="/Meetings-sorted.pdf">(pdf)</a>
</font></b></td>
<td align="right" width="10%">&nbsp;</td></tr>


<tr><td colspan="3"><hr></td></tr>

<tr><td colspan="3"><font face="Arial,Helvetica">The <a href="http://pathogenportal.org">Eukaryotic Pathogen Bioinformatics Resource Center (BRC)</a> designs, develops and maintains the EuPathDB, CryptoDB, GiardiaDB, PlasmoDB, ToxoDB, TrichDB and TriTrypDB websites.  The scientists and staff involved in this BRC attend numerous events to explain the resources we are building and to encourage scientists around the world to use them.</font></td></tr>
<tr><td><br></td></tr>
</table>
<table width='90%' align='center' cellpadding='2' cellspacing='0' border='0'>
    <tr><td colspan="3"><font face="Arial,Helvetica" color="#003366" size="+2"><b>Upcoming Events</b></font></td></tr>
    <tr><td>

    <x:transform xml="${currentEvents}" xslt="${xslt}" />

    </td></tr>
    <tr><td>&nbsp;</td></tr>
    <tr><td colspan="3"><font face="Arial,Helvetica" color="#003366" size="+2"><b>Past Events</b></font></td></tr>
    <tr><td>

    <x:transform xml="${expiredEvents}" xslt="${xslt}" />
    </td></tr>

</table>
</body>
</html>


</c:catch>
<c:if test="${e != null}">
    oops. this is broken. <br> 
    ${e}
</c:if>

