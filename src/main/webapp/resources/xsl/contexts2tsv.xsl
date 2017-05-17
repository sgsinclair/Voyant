<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs" version="2.0">
    <xsl:output method="text" />
    <!--<xsl:strip-space elements="*" /> -->
    <xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> May 17, 2017</xd:p>
            <xd:p><xd:b>Author:</xd:b> Stéfan Sinclair</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    <xsl:template match="/">
        <xsl:text>DocIndex&#9;Position&#9;Left&#9;Middle&#9;Right&#10;</xsl:text>
        <xsl:for-each select="results/documentContexts/contexts/kwic">          
            <xsl:value-of select="docIndex"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="position"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="normalize-space(left)"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="normalize-space(middle)"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="normalize-space(right)"/>
            <xsl:text>&#10;</xsl:text>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>
