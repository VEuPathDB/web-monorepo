<?xml version="1.0"?>
<xsl:stylesheet version="2.0" 
     xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="html"/>

<xsl:template match="records">
      <xsl:apply-templates/>
</xsl:template>


<xsl:template match="event">
  <xsl:variable name="projCount" select="count(presence/projects/project)"/>

  <p>
  <a>
  <xsl:attribute name="href">
    <xsl:value-of select="normalize-space(url)" />
  </xsl:attribute>
  <xsl:value-of select="name"/>
  </a>
  <br/>
  <xsl:value-of select="date"/>&#160;&#160;|&#160;&#160;
  <xsl:value-of select="location"/>
  <br/>
  <xsl:value-of select="description" disable-output-escaping="yes"/>
  <xsl:if test="$projCount &gt; 0">
    <br/>
    <xsl:for-each select="presence/projects/project">         
      <img>
       <xsl:attribute name="src">/assets/images/<xsl:value-of select="normalize-space(.)"/>/favicon.jpg</xsl:attribute>
      </img>
    </xsl:for-each>
    Participation by EuPathDB: 
    <xsl:value-of select="presence/type"/>
  </xsl:if>
  </p>

</xsl:template>



</xsl:stylesheet>