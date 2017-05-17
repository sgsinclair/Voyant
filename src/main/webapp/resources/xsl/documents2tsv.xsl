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
        <xsl:text>Index&#9;TokensCount&#9;TypesCount&#9;TypesCountMean&#9;TypesCountStdDev&#9;Sentences&#9;Language&#9;Modified&#9;Title&#9;Author&#10;</xsl:text>
        <xsl:for-each select="results/documentsMetadata/documents/document">
            <xsl:value-of select="index"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="tokensCount-lexical"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="typesCount-lexical"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="typesCountMean-lexical"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="typesCountStdDev-lexical"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="sentencesCount"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="language"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="modified"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="normalize-space(title)"/>
            <xsl:text>&#9;</xsl:text>
            <xsl:value-of select="normalize-space(author)"/>
            <xsl:text>&#10;</xsl:text>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>
