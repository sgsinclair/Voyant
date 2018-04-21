<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs" version="2.0">
    <xsl:output method="xml" />
    <!-- this stylesheet produces a copy of the xml but includes the tokenids -->
    <xsl:template match="/">
        <xsl:apply-templates select="results/documentTokens/tokens/token"/>
    </xsl:template>
    <xsl:template match="token">
        <xsl:choose>
            <xsl:when test="contains(tokenType,'tag')">
                <xsl:variable name="tags" as="element(tag)*">
                    <xsl:analyze-string select="term" regex="(^./?)(\w+)(\s?.*?)(\s*/?>$)" flags="ms">
                        <xsl:matching-substring>
                            <tag>
                                <start><xsl:value-of select="regex-group(1)"/></start>
                                <tagName><xsl:value-of select="regex-group(2)"/></tagName>
                                <attributes><xsl:value-of select="regex-group(3)"/></attributes>
                                <end><xsl:value-of select="regex-group(4)"/></end>
                            </tag>
                        </xsl:matching-substring>
                    </xsl:analyze-string>
                </xsl:variable>
                <xsl:value-of select="$tags[1]/start" disable-output-escaping="yes"/><xsl:value-of select="$tags[1]/tagName" disable-output-escaping="yes"/>
                <xsl:if test="contains(tokenType, 'close') = false()">
                    <xsl:value-of select="$tags[1]/attributes"/>
                    <xsl:text> tokenid="tag_</xsl:text>
                    <xsl:value-of select="docIndex"/>
                    <xsl:text>.</xsl:text>
                    <xsl:value-of select="startOffset"/>
                    <xsl:text>"</xsl:text>
                </xsl:if>
                <xsl:value-of select="$tags[1]/end" disable-output-escaping="yes"/>
            </xsl:when>
            <xsl:otherwise><xsl:value-of select="term"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
