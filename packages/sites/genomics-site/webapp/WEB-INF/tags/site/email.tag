<%@ tag import="sun.net.smtp.SmtpClient, java.io.*" %>

<%@ attribute name="to"         required="true"  %>
<%@ attribute name="from"       required="true"  %>
<%@ attribute name="subject"    required="true"  %>
<%@ attribute name="body"       required="true"  %>
<%@ attribute name="smtpServer" required="false" %>

<%

try{
 String server = (smtpServer != null) ? smtpServer : "localhost";
 SmtpClient client = new SmtpClient(server);
 client.from(from);
 client.to(to);
 PrintStream message = client.startMessage();
 message.println("To: " + to);
 message.println("Subject: " + subject);
 message.println();
 message.println(body);
 message.println();     
 message.println();
 client.closeServer();
}
catch (IOException e){	
  System.out.println("Error " + e);
}

%>
