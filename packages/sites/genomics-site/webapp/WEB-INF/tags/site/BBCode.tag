<%@ tag import="org.apidb.apicommon.controller.BBCode" %>

<%@ attribute name="content" required="true"
              description="Value to appear in page's title"
%>

<% 
	out.println(BBCode.getInstance().convertBBCodeToHtml(content));
%> 
