<?xml version="1.0" encoding="UTF-8"?>
<jsp:root version="2.0"
    xmlns:jsp="http://java.sun.com/JSP/Page"
    xmlns:c="http://java.sun.com/jsp/jstl/core"
    xmlns:imp="urn:jsptagdir:/WEB-INF/tags/imp">
  <jsp:directive.page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"/>

  <!-- header.jsp: used by gbrowse and error pages directly, and by community     -->
  <!--   files and download files pages via /html/include/fancy*IndexHeader.shtml -->

  <c:set var="props" value="${applicationScope.wdkModel.properties}" />
  <c:set var="project" value="${props['PROJECT_ID']}" />

  <c:set var="ftype" value="Error Page"/>
  <c:if test="${!empty param.ftype}">
    <c:set var="ftype" value="${param.ftype} Files"/>
  </c:if>

  <jsp:output doctype-root-element="html"
    doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
    doctype-system="http://www.w3c.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/>

  <!-- Must wrap all tags we don't intend to close in this JSP -->
  <![CDATA[<html xmlns="http://www.w3.org/1999/xhtml">]]>
  
  <!-- Contains HTML head tag, meta, and includes for all sites -->
  <imp:head refer="gbrowse" title="${project} ${ftype}"/>

  <![CDATA[<body>]]>
    
  <imp:header refer="${refer}"/>
  
  <![CDATA[
    <div id="contentwrapper">
    <div id="contentcolumn2">
    <div class="innertube">
  ]]>

</jsp:root>
