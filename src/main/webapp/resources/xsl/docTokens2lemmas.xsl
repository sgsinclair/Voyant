<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs" version="2.0">
    <xsl:output method="text" />
    <!--<xsl:strip-space elements="*" /> -->
    <xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> April 1, 2015</xd:p>
            <xd:p><xd:b>Author:</xd:b> Stéfan Sinclair</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
    <xsl:template match="/">
        <xsl:apply-templates select="results/documentTokens/tokens/token"/>
    </xsl:template>
    <xsl:template match="token">
        <xsl:if test="lemma">
            <xsl:value-of select="lemma"/>
            <xsl:if test="pos">
               <xsl:text>/</xsl:text><xsl:value-of select="pos"></xsl:value-of>
            </xsl:if>
            <xsl:text> </xsl:text>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>
