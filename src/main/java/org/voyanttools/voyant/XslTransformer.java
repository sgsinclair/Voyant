package org.voyanttools.voyant;

import java.io.File;
import java.io.Writer;

import javax.servlet.ServletContext;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.voyanttools.trombone.util.FlexibleParameters;

/**
 * @author Stéfan Sinclair, Cyril Briquet
 */
public class XslTransformer {

	static void transform(Source xml, Source xslt, Writer writer) throws TransformerException {
		transform(new FlexibleParameters(), xml, xslt, writer);
	}
	
	static void transform(FlexibleParameters parameters, Source xml, Source xslt, Writer writer) throws TransformerException {
		System.setProperty("javax.xml.transform.TransformerFactory", "net.sf.saxon.TransformerFactoryImpl");
		final TransformerFactory transformerFactory = TransformerFactory.newInstance();
		final Transformer transformer = transformerFactory.newTransformer(xslt);
		for (String key : parameters.getKeys()) {
			final String[] vals = parameters.getParameterValues(key);				
			transformer.setParameter(key, vals.length == 1 ? vals[0] : vals);
		}
		transformer.transform(xml, new StreamResult(writer));
	}

	static Source getTemplatePath(String template, File defaultDirectory) {

		String templatePath = template;

		if (templatePath.contains("/") == false) {
			templatePath = new File(defaultDirectory, templatePath).toString();
		}
		if (templatePath.endsWith(".xsl") == false) {
			templatePath += ".xsl";
		}

		return new StreamSource(templatePath);
		
	}

	public static Source getTemplateSource(String template, ServletContext servletContext) {
		String path = servletContext.getRealPath("/resources/xsl");
		return getTemplatePath(template, new File(path));
	}
}
