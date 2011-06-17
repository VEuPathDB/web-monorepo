<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>
<%@ taglib prefix="wdk" tagdir="/WEB-INF/tags/wdk" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="html" uri="http://jakarta.apache.org/struts/tags-html" %>
<%@ taglib prefix="bean" uri="http://jakarta.apache.org/struts/tags-bean" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>


<%@ attribute name="source_id"
              required="true"
              description="source id of the gene record"
%>

<%@ attribute name="project_id"
              required="true"
              description="project id of the gene record"
%>

<%@ attribute name="sequence_id"
              required="true"
              description="id of the sequence where the gene is located"
%>

<%@ attribute name="context_start_range"
              required="true"
              description="start of the gene context"
%>

<%@ attribute name="context_end_range"
              required="true"
              description="end of the gene context"
%>

<%@ attribute name="tracks"
              required="true"
              description="a list of tracks to be displayed on the gbrowse image"
%>

<%@ attribute name="attribution"
              required="true"
              description="The attribution used by GBrowse"
%>

<c:set var="gnCtxUrl">
  /cgi-bin/gbrowse_img/toxodb/?name=${sequence_id}:${context_start_range}..${context_end_range};hmap=gbrowseSyn;type=${tracks};width=640;embed=1;h_feat=${source_id}@yellow;genepage=1
</c:set>

<c:set var="gnCtxDivId" value="gnCtx"/>

<c:set var="gbrowseUrl">
  /cgi-bin/gbrowse/toxodb/?name=${sequence_id}:${context_start_range}..${context_end_range};h_feat=${source_id}@yellow
</c:set>

<c:set var="gnCtxImg">
  <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>

  <center><div id="${gnCtxDivId}"></div></center>

  <a id="gbView" href="${gbrowseUrl}"><font size='-2'>View in Genome Browser</font></a>
</c:set>

<wdk:toggle 
    name="dnaContextSyn" displayName="Genomic Context" 
    dsLink="/cgi-bin/gbrowse/${fn:toLowerCase(project_id)}/?help=citations" 
    content="${gnCtxImg}" isOpen="true" 
    imageMapDivId="${gnCtxDivId}" imageMapSource="${gnCtxUrl}"
    postLoadJS="/gbrowse/apiGBrowsePopups.js,/gbrowse/wz_tooltip.js"
    attribution="${attribution}"
  />
