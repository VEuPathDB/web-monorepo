<%@ taglib prefix="c"   uri="http://java.sun.com/jsp/jstl/core" %>

<%@ page import="java.util.*,org.apache.log4j.LogManager,org.apache.log4j.Logger,org.apache.log4j.Level"%>
<%
/**
 * Title:        logger.jsp
 * Description:  This code is proprietary to Guhesan Technologies, Inc. and under license to RewardsPlus.
 * Copyright:    Copyright (c) 2005
 * Company:      Guhesan.com
 * @author Venkatt Guhesan
 * @version 1.0
 */
 
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>

<%
boolean displayLoggerList = true;
String namesOption = "";
String outputMessage = "";
String thisLevel = "NONE";

if ("POST".equals(request.getMethod()))
{
	//Perform the operation to the logger
	displayLoggerList = false;
	String[] names = request.getParameterValues("loggerName");
	thisLevel = request.getParameter("loggerLevel");
	if ( (names != null) && (thisLevel != null) )
	{
		for (int i=0; i<names.length; i++)
		{
			Logger logger = Logger.getLogger(names[i]);
			Level lev = Level.toLevel(thisLevel);
			logger.setLevel(lev);
			outputMessage += names[i] + "<BR>";
		}		
	}
}
else
{
	//Generate a list of all the loggers and levels
	ArrayList al = new ArrayList();
	HashMap hm = new HashMap();
	
	//GetRootLogger
	Logger rootLogger = LogManager.getRootLogger();
	String rootLoggerName = rootLogger.getName();
	al.add(rootLoggerName);
	hm.put(rootLoggerName, rootLogger);
	
	//All Other Loggers
	Enumeration e = LogManager.getCurrentLoggers();	
	while (e.hasMoreElements())
	{				
		Logger t1Logger = (Logger) e.nextElement();
		String loggerName = t1Logger.getName();
		al.add(loggerName);
		hm.put(loggerName, t1Logger);		
	}
	
	String[] alLoggerStr = ((String[]) al.toArray(new String[0]));
	Arrays.sort(alLoggerStr);
	for (int i=0; i<alLoggerStr.length; i++)
	{
		Logger t2Logger = (Logger) hm.get(alLoggerStr[i]);
		String t2LoggerName = t2Logger.getName();
		String t2LoggerLevel = t2Logger.getEffectiveLevel().toString();
		String thisParent = "";
		if (t2Logger.getParent() != null)
		{
			thisParent = t2Logger.getParent().getName();
		}
		namesOption += "<OPTION VALUE='" + t2LoggerName + "'>"+t2LoggerName+ " [" + t2LoggerLevel + "] -> " + thisParent + "</OPTION>";
	}
	
	namesOption = "<SELECT NAME='loggerName' MULTIPLE SIZE='8'>"+namesOption+"</SELECT>";
	
	
	
}
%>

<%
if (displayLoggerList)
{
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <base href="<%=basePath%>">
    
    <title>Logger Setup</title>
    
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">
    
  </head>
  
  <body>
    Please choose the logger and the level:
    <FORM METHOD="Post">
    <TABLE CELLPADDING="5" CELLSPACING="0" BORDER="1">
    <TR>
    	<TD COLSPAN="2"><H2>Enable Disable Logger</H2></TD>
    </TR>
    <TR>
    	<TD>Choose Logger:<BR>Format: LoggerClass [Current Level] -> Parent Logger<BR><%=namesOption%></TD>
    	<TD>Choose Level:<BR>
    	<SELECT NAME='loggerLevel'>
    	<OPTION VALUE="ALL">All</OPTION>
    	<OPTION VALUE="DEBUG">Debug</OPTION>
    	<OPTION VALUE="ERROR">Error</OPTION>
    	<OPTION VALUE="FATAL">Fatal</OPTION>
    	<OPTION VALUE="INFO">Info</OPTION>
    	<OPTION VALUE="OFF">Off</OPTION>
    	<OPTION VALUE="WARN">Warn</OPTION>
    	</SELECT>
    	</TD>
    </TR>
    <TR>
    	<TD COLSPAN="2"><INPUT TYPE="Submit" NAME='Submit' VALUE='Apply Changes'><BR>
    	(If you wish to disable all logging then find "root" in the list below and apply a level)
    	</TD>
    </TR>
    </TABLE>
    </FORM>
  </body>
</html>
<%
}
else
{
%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <base href="<%=basePath%>">
    
    <title>Logger Setup - Results</title>
    
    <meta http-equiv="pragma" content="no-cache">
    <meta http-equiv="cache-control" content="no-cache">
    <meta http-equiv="expires" content="0">

  </head>
  
  <body>
    Please choose the logger and the level:
    <FORM METHOD="Post">
    <TABLE CELLPADDING="0" CELLSPACING="0" BORDER="0">
    <TR>
    	<TD COLSPAN="2"><H2>Enable Disable Logger</H2></TD>
    </TR>
    <TR>
    	<TD>
    	The following Logger's were set to <%=thisLevel%> level:<BR>
    	<%=outputMessage%>
    	</TD>    	
    </TR>
    <TR>
    	<TD><A HREF="<c:url value="/admin/logger.jsp"/>">Return to list</A></TD>
    </TR>
    <TR>
    	<TD><A HREF="/siteinfo?p=Tomcat">Return to the Site Info page</A></TD>
    </TR>
    </TABLE>
    </FORM>
  </body>
</html>

<%
}
%>