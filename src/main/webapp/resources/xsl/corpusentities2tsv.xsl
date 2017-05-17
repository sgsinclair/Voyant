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
        <xsl:text>Term&#9;Type&#9;Frequency&#9;DocumentsCount&#10;</xsl:text>
        <xsl:for-each select="results/corpusEntities/corpusEntities/entity">
            <xsl:value-of select="term"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="type"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="rawFreq"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="inDocumentsCount"/>
            <xsl:text>&#10;</xsl:text>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>
