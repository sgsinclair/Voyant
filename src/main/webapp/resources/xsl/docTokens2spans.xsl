<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs" version="2.0">
    <xsl:output method="xml" />
    <!-- this stylesheet produces an html version of xml, where all tags are spans and their original tag is stored as an attribute -->
    <xsl:template match="/">
        <div class="tokens">
            <xsl:for-each-group select="results/documentTokens/tokens/token" group-by="docIndex">
                <div class="document">
                    <xsl:attribute name="docIndex">
                        <xsl:value-of select="docIndex"/>
                    </xsl:attribute>
                    <xsl:attribute name="docId">
                        <xsl:value-of select="docId"/>
                    </xsl:attribute>
                    <xsl:apply-templates select="current-group()"/>
                </div>
            </xsl:for-each-group>
        </div>
    </xsl:template>
    <xsl:template match="token">
        <xsl:choose>
            <xsl:when test="tokenType='lexical'">
                <xsl:element name="span">
                    <xsl:attribute name="class">
                        <xsl:text>word</xsl:text>
                    </xsl:attribute>
                    <xsl:attribute name="tokenid">
                        <text>word_</text>
                        <xsl:value-of select="docIndex"/>
                        <text>.</text>
                        <xsl:value-of select="position"/>
                    </xsl:attribute>
                    <xsl:attribute name="data-qtip">
                        <xsl:text>Frequency: </xsl:text>
                        <xsl:value-of select="rawFreq"/>
                    </xsl:attribute>
                    <xsl:value-of select="term"/>
                </xsl:element>
            </xsl:when>
            <xsl:when test="contains(tokenType,'tag')">
                <xsl:variable name="tags" as="element(tag)*">
                    <xsl:analyze-string select="term" regex="(^./?)([:\w]+)(\s?.*?)(\s*/?>$)" flags="ms">
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
                <xsl:value-of select="$tags[1]/start" disable-output-escaping="yes"/><xsl:text>span</xsl:text>
                <xsl:if test="contains(tokenType, 'close') = false()">
                    <xsl:text> data-tag="</xsl:text><xsl:value-of select="$tags[1]/tagName"/><xsl:text>"</xsl:text>
                    <xsl:value-of select="$tags[1]/attributes"/>
                    <xsl:text> tokenid="tag_</xsl:text>
                    <xsl:value-of select="docIndex"/>
                    <xsl:text>.</xsl:text>
                    <xsl:value-of select="startOffset"/>
                    <xsl:text>"</xsl:text>
                </xsl:if>
                <xsl:choose>
                   <!--  convert empty tags because of how html handles them -->
                   <xsl:when test="contains(tokenType, 'empty')"><xsl:text disable-output-escaping="yes">&gt;&lt;/span&gt;</xsl:text></xsl:when>
                   <xsl:otherwise>
                       <xsl:value-of select="$tags[1]/end" disable-output-escaping="yes"/>
                   </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:when test="tokenType='processinginstruction'"></xsl:when>
            <xsl:otherwise><xsl:value-of select="term"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
