<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="imp" tagdir="/WEB-INF/tags/imp" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%--  if we want to have footer spanning only under buckets --%>
<%@ attribute name="refer" 
 			  type="java.lang.String"
			  required="false" 
			  description="Page calling this tag"
%>

<c:set var="siteName" value="${applicationScope.wdkModel.name}" />
<c:set var="version" value="${applicationScope.wdkModel.version}" />

<c:set var="releaseDate" value="${applicationScope.wdkModel.releaseDate}" />
<c:set var="inputDateFormat" value="dd MMMM yyyy HH:mm"/>
<fmt:setLocale value="en-US"/><%-- req. for date parsing when client browser (e.g. curl) doesn't send locale --%>
<fmt:parseDate pattern="${inputDateFormat}" var="rlsDate" value="${releaseDate}"/> 
<fmt:formatDate var="releaseDate_formatted" value="${rlsDate}" pattern="MMMM d, yyyy"/>
<%-- http://java.sun.com/j2se/1.5.0/docs/api/java/text/SimpleDateFormat.html --%>
<fmt:formatDate var="copyrightYear" value="${rlsDate}" pattern="yyyy"/>


<%------------ divs defined in header.tag for all pages but home/home2  -----------%>
<c:if test="${refer != 'home' && refer != 'home2' && refer != 'customSummary'}">
</div> <%-- class="innertube"   --%>
</div> <%-- id="contentcolumn2" --%>
</div> <%-- id="contentwrapper" --%>

</c:if>

<%--------------------------------------------%>

<c:if test="${refer == 'home'}" >
<style type="text/css">
#footer {
	min-width: 756px;
	width:75%;
	position:relative;
	left:200px;
}

</style>
</c:if>


<%-- ========dialogs that need to appear in various pages========= --%>

<!-- Annotation Change dialog -->
<div id="dialog-annot-change" title="Annotation changes">
<ul class="cirbulletlist">
<li>Genome annotations are constantly updated to reflect new biological information concerning the sequences.
<br><br>
<li>When annotations are updated during a new release of our websites, some IDs may change or be retired.
</ul>
</div>

<!-- Revised searches dialog -->
<div id="dialog-revise-search"  title="Redesigned searches">
<ul class="cirbulletlist">
<li>Searches are sometimes 'redesigned' if database revisions lead to new parameters and/or new parameter choices. 
<br><br><br>
<li>When parameters have been modified and we cannot easily map your old choices into the new search, the search will be covered with a <span style="font-size:140%;color:darkred;font-family:sans-serif">X</span>. It means it needs to be revised.
<br><br><br>
<li>Please open strategies marked with <img style="vertical-align:bottom" src="<c:url value="wdk/images/invalidIcon.png"/>" width="12"/> and click each search that needs revision.
<br><br><br>
<!-- maybe too much info
<li>In some rare cases, the search name you had in your history, does not exist in the new release and cannot be mapped to a new search. Your only choice will be to delete the search from the strategy.
--> 
</ul>
</div>


<script type="text/javascript">

// generate jquery dialogs of divs with these id values
	$(function() {
		$( "#dialog-annot-change" ).dialog({ autoOpen: false });
	});
	$(function() {
		$( "#dialog-revise-search" ).dialog({ autoOpen: false });
	});

// used in onclicks() in All tab, basket and favorites pages
	function openWhyAnnotChanges(element){
		$( "#dialog-annot-change" ).dialog('open');
	}
	function openWhyRevise(element){
		$( "#dialog-revise-search" ).dialog('open');
	}
</script>

<%-- ======== END OF   dialogs that need to appear in various pages========= --%>


<div id="footer" >
	<div style="float:left;padding-left:9px;padding-top:9px;">
 	 	<a href="http://${fn:toLowerCase(siteName)}.org">${siteName}</a> ${version}&nbsp;&nbsp;&nbsp;&nbsp;${releaseDate_formatted}
		<br>&copy;${copyrightYear} The EuPathDB Project Team
	</div>

	<div style="float:right;padding-right:9px;font-size:1.4em;line-height:2;">
		Please <a href="<c:url value="/help.jsp"/>" target="_blank" onClick="poptastic(this.href); return false;">Contact Us</a> with any questions or comments<br>
	<a href="http://code.google.com/p/strategies-wdk/">
	<img border=0 style="position:relative;top:-9px;left:103px" src="<c:url value='/wdk/images/stratWDKlogo.png'/>"  width="120">
	</a>
	</div>


	<span style="position: relative; top: -9px;">
		<a href="http://www.eupathdb.org"><br><img src="/assets/images/eupathdblink.png" alt="Link to EuPathDB homepage"/></a>&nbsp;&nbsp;
<br>
</span>
	<span style="position: relative; top: -13px;left:80px">
		<a href="http://amoebadb.org"><img border=0 src="/assets/images/AmoebaDB/amoebadb_w30.png"      	width=25></a>&nbsp;
		<a href="http://cryptodb.org"><img border=0 src="/assets/images/CryptoDB/cryptodb_w50.png"     		width=25></a>&nbsp;
       		<a href="http://giardiadb.org"><img border=0 src="/assets/images/GiardiaDB/giardiadb_w50.png"  		width=25></a>&nbsp;&nbsp;
        	<a href="http://microsporidiadb.org"><img border=0 src="/assets/images/MicrosporidiaDB/microdb_w30.png"  width=25></a>&nbsp;&nbsp;
        	<a href="http://piroplasmadb.org"><img border=0 src="/assets/images/newSite.png" 			width=30 ></a>&nbsp;&nbsp;
        	<a href="http://plasmodb.org"><img border=0 src="/assets/images/PlasmoDB/plasmodb_w50.png"     		width=25></a>&nbsp;&nbsp;
        	<a href="http://toxodb.org"><img border=0 src="/assets/images/ToxoDB/toxodb_w50.png"           		width=25></a>&nbsp;&nbsp;
        	<a href="http://trichdb.org"><img border=0 src="/assets/images/TrichDB/trichdb_w65.png"        		height=25></a>&nbsp;&nbsp;
        	<a href="http://tritrypdb.org"><img border=0 src="/assets/images/TriTrypDB/tritrypdb_w40.png"		width=20></a>
	</span>

</div>

</body>
</html>
