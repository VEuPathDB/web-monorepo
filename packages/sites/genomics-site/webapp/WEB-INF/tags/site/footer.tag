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

<%-- create the dialog HTML --%>
<div style="display:none;" id="wdk-dialog-revise-search" title="<imp:verbiage key='dialog.revise-search.title'/>"><imp:verbiage key='dialog.revise-search.content'/></div>

<div style="display:none;" id="wdk-dialog-annot-change" title="<imp:verbiage key='dialog.annot-change.title'/>"><imp:verbiage key='dialog.annot-change.content'/></div>

<div style="display:none;" id="wdk-dialog-update-strat" title="<imp:verbiage key='dialog.update-strat.title'/>">
    <div class="save_as_msg"><imp:verbiage key="dialog.update-strat.content"/></div>
    <form id="wdk-update-strat">
        <input type="hidden" name="strategy" value="">
        <dl>
            <dt class="name_label">Name:</dt>
            <dd class="name_input"><input type="text" name="name"></dd>
            <dt class="desc_label">Description:</dt>
            <dd class="desc_input"><textarea name="description" rows="10"></textarea></dd>
        </dl>
        <div style="text-align: right"><input name="submit" type="submit" value="Save strategy"></div>
    </form>
</div>

<div style="display:none;" id="wdk-dialog-share-strat" title="<imp:verbiage key='dialog.share-strat.title'/>">
    <div class="share_msg"><imp:verbiage key="dialog.share-strat.content"/></div>
    <div class="share_url"></div>
</div>

<%-- instantiate dialogs -- open function triggered in tags/wdk/strategyHistory.tag --%>
<script type="text/javascript">
  $(function() {
    var dialogOpts = {
      autoOpen: false,
      modal: true,
      width: 600
    };
    $("[id^='wdk-dialog-']").dialog(dialogOpts);
  });
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
