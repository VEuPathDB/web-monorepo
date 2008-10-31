<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn"  uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="api" uri="http://apidb.org/taglib" %>
<%@ taglib prefix="site" tagdir="/WEB-INF/tags/site" %>

<api:wdkRecord name="UtilityRecordClasses.SiteInfo"/>


<h2>WDK</h2>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
<c:catch var="e">
<c:if test="${!empty wdkRecord.recordClass.attributeFields['cache_count']}">
 <tr><td><b>Cache table count</b>:</td><td class="p">${wdkRecord.attributes['cache_count'].value}</td></tr>
</c:if>
</c:catch>
<c:if test="${e!=null}"> 
    <tr><td><font color="red">Cache tables information not available. Did you run wdkCache?</font></td></tr>
</c:if>
</table>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
<c:if test="${!empty wdkRecord.recordClass.attributeFields['apicomm_global_name']
              && !empty wdkRecord.recordClass.attributeFields['apicommMacro']}">
    <tr><td>
   <b>@USER_DBLINK@ Macro</b> (commonly used to access dataset_values in questions and user comments in records)
    </td></tr><tr><td class="p" valign="bottom"> 
    <c:catch var="e">
        Value<a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'Value of <i>userDbLink</i> as set in model-config.xml and optionally overridden by setting <i>USER_DBLINK</i> in model.prop.<br>' +
         '(<i>cf.</i> the \'Available DBLinks\' table.)'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a>: ${wdkRecord.attributes['apicommMacro'].value}<br>
        Database global_name<a href='javascript:void()' style="text-decoration:none" 
        onmouseover="return overlib(
         'result of <i>select global_name from global_name${wdkRecord.attributes['apicommMacro'].value}</i>'
        )"
        onmouseout = "return nd();"><sup>[?]</sup></a>: ${wdkRecord.attributes['apicomm_global_name'].value}
    </c:catch>
    <c:if test="${e!=null}">
        <font color="#CC0033">${e}</font>
    </c:if>
    </td></tr>
</c:if>

</table>

<api:modelConfig var="modelConfig"/>
<table class='p' border='0' cellpadding='0' cellspacing='0'>
    <tr><td>
      <b><a href="#" style="text-decoration:none" onclick="Effect.toggle('modelconfig','blind'); return false">
  WDK Model Configuration &#8593;&#8595;</a></b>
  <div id="modelconfig" style="padding: 5px; display: none"><div>

        <p>
        The following configurations were obtained from the WDK's running instance of the ModelConfig* classes. These generally represent values defined in 
        the <code>model-config.xml</code> <i>at the time the webapp was loaded</i>,
        although some properties shown may have been added by the WDK's internals. Passwords have been masked in this display.
<pre><c:forEach 
    var="section" items="${modelConfig.props}"
><b>${section.key}</b><blockquote><c:forEach 
    var="cfg" items="${section.value}"
>${cfg.key} = ${fn:escapeXml(cfg.value)}
</c:forEach></blockquote></c:forEach>
</pre>    
      </div></div>
    </td></tr>
</table>

<table class='p' border='0' cellpadding='0' cellspacing='0'>
  <c:catch var="e">
  <api:commentConfig var="commentConfig"/>
    <tr><td>
      <b><a href="#" style="text-decoration:none" onclick="Effect.toggle('commentconfig','blind'); return false">
  User Comments Configuration &#8593;&#8595;</a></b>
  <div id="commentconfig" style="padding: 5px; display: none"><div>

        <p>
The following configurations were obtained from the WDK's running instance of the CommentConfig class. These generally represent values set in 
<code>comment-config.xml</code> although some processing may occur by the WDK parser.
The CommentConfig class is instantiated on the first page access requiring it (e.g. this page or the showAddComment.do action) - not at webapp load time. 
Passwords have been masked in this display.
<pre><c:forEach 
    var="cfg" items="${commentConfig.props}"
>${cfg.key} = ${fn:escapeXml(cfg.value)}
</c:forEach>
</pre>    
      </div></div>
    </td></tr>
</c:catch>
<c:if test="${e!=null}"> 
<tr><td>User Comments Configuration <font color="red">not available</font>
<br><font size='-2'>${e}</font></td></tr>
</c:if>
</table>


<table class='p' border='0' cellpadding='0' cellspacing='0'>
    <tr><td>
      <b><a href="#" style="text-decoration:none" onclick="Effect.toggle('properties','blind'); return false">
  Properties &#8593;&#8595;</a></b>
  <div id="properties" style="padding: 5px; display: none"><div>

        <p>
        WDK built-in properties and properties defined in 
        the <code>model.prop</code> <i>at the time the webapp was loaded</i>.
<pre><c:forEach 
    var="prop" items="${applicationScope.wdkModel.properties}"
>${prop.key} = ${fn:escapeXml(prop.value)}
</c:forEach>
</pre>    
      </div></div>
    </td></tr>
</table>
