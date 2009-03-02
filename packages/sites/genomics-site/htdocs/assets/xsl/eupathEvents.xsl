<?xml version="1.0"?>
<xsl:stylesheet version="2.0" 
     xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:strip-space elements="*"/>

<xsl:template match="records">
  <center>  	      
  <table width="100%" border="0" cellpadding="2" cellspacing="2">
  
    <thead> 
      <tr valign="top" align="center" class="primary2">
        <td valign="middle" width="33%">
          <font face="Arial,Helvetica" size="+1">Name of Event</font>
        </td>
        <td valign="middle" width="34%">
          <font face="Arial,Helvetica" size="+1">Type of Presence</font>
        </td>
        <td valign="middle" width="33%">
          <font face="Arial,Helvetica" size="+1">Location/Date</font>
        </td>
        <td valign="middle" width="33%">
          <font face="Arial,Helvetica" size="+1">Projects</font>
        </td>
      </tr>
    </thead>
    
    <tbody>
      <xsl:apply-templates/>
    </tbody>
  
  </table>
  </center>
</xsl:template>



<xsl:template match="event">
  <xsl:variable name="projCount" select="count(presence/projects/project)"/>
  <xsl:if test="$projCount &gt; 0">
    <tr valign="top" align="left">
        <td valign="top" bgcolor="#efefef">
          <font face="Arial,Helvetica">
            <xsl:choose>
              <xsl:when test="url/text()">
                <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="normalize-space(url)" />
                </xsl:attribute>
                <xsl:value-of select="name"/>
                </a>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="name"/>
              </xsl:otherwise>
            </xsl:choose>
          </font>
        </td>
        <td valign="top" bgcolor="#efefef">
            <font face="Arial,Helvetica"><xsl:value-of select="presence/type"/></font>
        </td>
        <td valign="top" bgcolor="#efefef">
            <font face="Arial,Helvetica"><xsl:value-of select="location"/><br />
            <xsl:value-of select="date"/></font>
        </td>
        <td valign="top" bgcolor="#efefef">
           <xsl:for-each select="presence/projects/project">         
               <img>
               <xsl:attribute name="src">/assets/images/<xsl:value-of select="normalize-space(.)"/>/favicon.jpg</xsl:attribute>
               </img>
               <xsl:value-of select="normalize-space(.)"/>
               <xsl:if test="position() &lt; $projCount"><br/> </xsl:if>
           </xsl:for-each>
        </td>
    </tr>
  </xsl:if>
</xsl:template>

</xsl:stylesheet>