<?xml version="1.0" encoding="UTF-8"?>
<!-- produces a copy of the original document, but with tokenized terms. not intended for multi-document output. -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs" version="2.0">
    <xsl:output method="xml" />
    <xsl:template match="/">
		<!-- here we add an empty stylesheet so that we can programmatically add rules to it later -->
		<xsl:processing-instruction name="xml-stylesheet"> type="text/css" href="dtoc/css/custom.css" </xsl:processing-instruction>
        <xsl:apply-templates select="results/documentTokens/tokens/token"/>
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
            	<xsl:variable name="tagName">
            		<xsl:value-of select="$tags[1]/tagName"/>
            	</xsl:variable>
            	<xsl:value-of select="$tags[1]/start" disable-output-escaping="yes"/><xsl:value-of select="$tagName" disable-output-escaping="yes"/>
            	<xsl:value-of select="$tags[1]/attributes"/>
            	<xsl:if test="contains(tokenType, 'open')">
            		<xsl:text> tokenid="tag_</xsl:text>
            		<xsl:value-of select="docIndex"/>
            		<xsl:text>.</xsl:text>
            		<xsl:value-of select="startOffset"/>
            		<xsl:text>"</xsl:text>
            	</xsl:if>
            	<xsl:value-of select="$tags[1]/end" disable-output-escaping="yes"/>
            </xsl:when>
            <xsl:when test="tokenType='processinginstruction'"><xsl:value-of disable-output-escaping="yes" select="term"/></xsl:when>
            <xsl:otherwise><xsl:value-of select="term"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
