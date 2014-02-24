<html>


<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.io.InputStreamReader" %>
<%@ page import="java.io.PrintWriter" %>

<%
String type = request.getParameter("type");
        if(type.equals("xgmml")) {
                response.setContentType("text/xml");  
        }
        if(type.equals("png")) {
                response.setContentType("image/png");  
        }
%>


<body>

<%


       BufferedReader in = new BufferedReader(  
        new InputStreamReader(request.getInputStream()));  




        String line = null;  
        while((line = in.readLine()) != null) {  
           out.print(line);
        }  

%>
</body>
</html>
