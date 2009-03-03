<?xml version="1.0"?>
<xsl:stylesheet version="2.0" 
     xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="html"/>
<xsl:strip-space elements="*"/>

<xsl:variable name="recCount" select="count(/records/event)"/>

<xsl:template match="records">
      <xsl:apply-templates/>
</xsl:template>


<xsl:template match="event">
  <xsl:variable name="projCount" select="count(presence/projects/project)"/>

  <p>
  <b class="title">
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
  </b>
  <br/>
  <i>
  <xsl:value-of select="date"/>&#160;&#160;|&#160;&#160;
  <xsl:value-of select="location"/>
  </i>
  <p>
  <xsl:value-of select="description" disable-output-escaping="yes"/>
  <xsl:if test="description/text()"><br/></xsl:if>
  <xsl:if test="$projCount &gt; 0">
    <p>
    <xsl:for-each select="presence/projects/project">         
      <img>
       <xsl:attribute name="src">/assets/images/<xsl:value-of select="normalize-space(.)"/>/favicon.jpg</xsl:attribute>
      </img>
    </xsl:for-each>
    <br/>
    Participation by EuPathDB: 
    <xsl:value-of select="presence/type"/>
    </p>
  </xsl:if>
  </p>
  </p>
  <xsl:if test="position() &lt; $recCount"><hr/></xsl:if>
</xsl:template>



</xsl:stylesheet>