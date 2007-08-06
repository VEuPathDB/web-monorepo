<%--
    Receives a username (as email addr) and password for authentication against
    WDK's login system.
    
    It returns an XML message with a status of 'OK', 'FAIL' or 'ERROR' and 
    a 'message' tag.
    
    An 'OK' status indicates successful authN. The message includes user attributes.

        <authrecord status='OK'>
          <message>
            <email>ralso@mailbucket.org</email>
            <firstname>Richard</firstname>
            <lastname>Also</lastname>
          </message>
        </authrecord>

    A 'FAIL' status indicates unsuccessful authN. The message includes 
    the return value from the WDK.

        <authrecord status='FAIL'>
          <message>  
          [CryptoDB] Invalid email or password.
          </message>
        </authrecord>


    An 'ERROR' status indicates a Java exception returned from the WDK. The 
    exeception is included in the message tag.

        <authrecord status='ERROR'>
        <message>java.lang.NullPointerException: </message>
        </authrecord>
         
    Whitespace preceeding the xml message may break some xml parsers so
    the syntax of this file is formated without whitespace between directives 
    to avoid this.

--%><%@
    page contentType="text/xml" 
%><%@ 
    page import="
    javax.servlet.http.HttpServletRequest,
    org.gusdb.wdk.model.jspwrap.UserFactoryBean,
    org.gusdb.wdk.model.jspwrap.UserBean,
    org.gusdb.wdk.model.WdkUserException,
    org.gusdb.wdk.model.jspwrap.WdkModelBean,
    org.gusdb.wdk.controller.CConstants
"%><%= 

authrecord(application,request ) 

%> 


<%!
public String authrecord(ServletContext application,HttpServletRequest request) {

  String authrecord = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  
  /** lifted from ProcessLoginAction **/
  try {
      WdkModelBean wdkModel = (WdkModelBean) application.getAttribute(
                  CConstants.WDK_MODEL_KEY);
  
      UserFactoryBean factory = wdkModel.getUserFactory();
  
      UserBean guest  = factory.getGuestUser();
      String email    = request.getParameter(CConstants.WDK_EMAIL_KEY);
      String password = request.getParameter(CConstants.WDK_PASSWORD_KEY);
  
      UserBean user = factory.login(guest, email, password);

      authrecord = authrecord +
        "<authrecord status='OK'>\n" +
        "  <message>\n" +
        "    <email>"+user.getEmail()+"</email>\n" +
        "    <firstname>"+user.getFirstName()+"</firstname>\n" +
        "    <lastname>"+user.getLastName()+"</lastname>\n" +
        "    <userid>"+user.getUserId()+"</userid>\n" +
        "  </message>\n";

  } catch (WdkUserException ex) {
      
      authrecord = authrecord + 
        "<authrecord status='FAIL'>\n" +
        "  <message>  " + ex.getMessage() + "  </message>\n";

  } catch (Exception e) {

      authrecord = authrecord + 
        "<authrecord status='ERROR'>\n" +
        "<message>" + e + "</message>\n";

  } finally {

     return authrecord + "</authrecord>\n";

  }
}
%>

