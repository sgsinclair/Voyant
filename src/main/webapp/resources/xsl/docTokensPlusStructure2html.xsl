<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs" version="2.0">
    <xsl:output method="xml" />
    <!--<xsl:strip-space elements="*" /> -->
    <xd:doc xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> April 1, 2015</xd:p>
            <xd:p><xd:b>Author:</xd:b> Stéfan Sinclair</xd:p>
            <xd:p/>
        </xd:desc>
    </xd:doc>
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
            	<!-- xsl:value-of select="@token" disable-output-escaping="yes"/ -->
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
            	<xsl:variable name="tagName">
            		<xsl:choose>
            			<!-- can't use head element outside html, in html -->
            			<xsl:when test="$tags[1]/tagName='head'">
            				<xsl:text>xmlHead</xsl:text>
            			</xsl:when>
            			<!-- can't use title element outside head, in html -->
            			<xsl:when test="$tags[1]/tagName='title'">
            				<xsl:text>xmlTitle</xsl:text>
            			</xsl:when>
            			<!-- convert table elements -->
            			<xsl:when test="$tags[1]/tagName='row'">
                            <xsl:text>tr</xsl:text>
                        </xsl:when>
                        <xsl:when test="$tags[1]/tagName='cell'">
                            <xsl:text>td</xsl:text>
                        </xsl:when>
            			<xsl:otherwise>
            				<xsl:value-of select="$tags[1]/tagName"/>
            			</xsl:otherwise>
            		</xsl:choose>
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
            <xsl:when test="tokenType='processinginstruction'"></xsl:when>
            <xsl:otherwise><xsl:value-of select="term"/></xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
