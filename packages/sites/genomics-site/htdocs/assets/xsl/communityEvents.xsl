<?xml version="1.0"?>
<xsl:stylesheet version="2.0" 
     xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="html"/>
<xsl:strip-space elements="*"/>

<xsl:param name="tag"/>

<xsl:variable name="recCount" select="count(/records/record)"/>

<xsl:template match="records">
      <xsl:apply-templates/>
</xsl:template>

<xsl:template match="record">
  <xsl:apply-templates/>
  <xsl:if test="$tag=''">
    <xsl:if test="position() &lt; $recCount"><hr/></xsl:if>
  </xsl:if>
</xsl:template>

<xsl:template match="event">
  <xsl:if test="$tag='' or $tag=../recid">
    <xsl:variable name="projCount" select="count(presence/projects/project)"/>
    <p>
    <b class="title">
    <a>
    <xsl:attribute name="href">
      <xsl:text>communityEvents.jsp?tag=</xsl:text>
      <xsl:value-of select="../recid" />
    </xsl:attribute>
    <xsl:value-of select="name"/>
    </a>
    </b>
    <br/>
    <i>
    <xsl:value-of select="date"/>&#160;&#160;|&#160;&#160;
    <xsl:value-of select="location"/>
    </i>
    <xsl:if test="url/text()">
      <br/>
      <b>
      <a>
      <xsl:attribute name="href">
        <xsl:value-of select="normalize-space(url)" />
      </xsl:attribute>
      Event Website
      </a>
      </b>
    </xsl:if>
    <p>
    <xsl:value-of select="description" disable-output-escaping="yes"/>
    <xsl:if test="description/text()"><br/></xsl:if>
    <xsl:if test="$projCount &gt; 0">
      <p>
      <xsl:for-each select="presence/projects/project">
        <xsl:if test="string-length(.) &gt; 0">
        <img>
         <xsl:attribute name="src">/a/images/<xsl:value-of select="normalize-space(.)"/>/favicon.jpg</xsl:attribute>
        </img>
        </xsl:if>
      </xsl:for-each>
      <br/>
      Participation by EuPathDB: 
      <xsl:value-of select="presence/type"/>
      </p>
    </xsl:if>
    </p>
    </p>
  </xsl:if>
</xsl:template>

<xsl:template match="recid"/>
<xsl:template match="displayStartDate"/>
<xsl:template match="displayStopDate"/>
<xsl:template match="submissionDate"/>

</xsl:stylesheet>
