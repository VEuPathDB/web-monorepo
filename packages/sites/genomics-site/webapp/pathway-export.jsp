<html>


<%
String type = request.getParameter("type");
        if("xgmml".equals(type)) {
                response.setContentType("text/xml");  
        }
        if("png".equals(type)) {
                response.setContentType("image/png");  
        }
%>


<body>

<%


ServletInputStream is = request.getInputStream();
ServletOutputStream os = response.getOutputStream();

byte[] b = new byte[16384];

int i = 0;
while ((i = is.read(b)) != -1) {
        os.write(b, 0, i);
}

os.flush();
os.close();

%>
</body>
</html>
