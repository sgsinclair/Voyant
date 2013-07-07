package org.voyanttools.voyant;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Calendar;

import org.voyanttools.trombone.Controller;
import org.voyanttools.trombone.results.Results;
import org.voyanttools.trombone.util.FlexibleParameters;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.transform.Source;
import javax.xml.transform.TransformerException;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.fileupload.servlet.ServletFileUpload;

/**
 * @author Stéfan Sinclair
 */
public class Voyeur {
	
	/**
	 * Pre-process the request. At the moment this will look if there's a referer,
	 * and if so but no input or corpus parameters are provided, it will redirect
	 * to the same URL but with the referer as input.
	 * @param request
	 * @param response
	 * @return true if preProcessing has resulted in a redirect
	 * @throws Exception 
	 */
	public static boolean preProcess(ServletContext servletContext, HttpServletRequest request, HttpServletResponse response) throws Exception {

		final String method = request.getMethod();
		if (method==null) {return false;}

		final FlexibleParametersFactory flexibleParametersFactory = new FlexibleParametersFactory();
		final FlexibleParameters params = flexibleParametersFactory.getInstance(request);

		// if we have a POST request, we need to create the corpus before redirecting
		if (method.equals("POST") && request.getParameter("noRedirect") == null) {
			return handlePostAndRedirect(servletContext, request, response, params);
		}

		// if we have a GET request, we need to check for a useReferer parameter
		else if (method.equals("GET")) {
			return handleRefererAndRedirect(request, response, params);
		}
		
		return false;
		
	}
	
		

	private static boolean handlePostAndRedirect(ServletContext servletContext, HttpServletRequest request,
			HttpServletResponse response, FlexibleParameters params) throws IOException, TransformerException {
		
		// run the controller and then redirect to the current URL with a corpusID
		Writer writer = new StringWriter();
		Controller controller = new Controller(params, writer);
		controller.run();

		Writer xslWriter = new StringWriter();
		
		XslTransformer xslTransformer = new XslTransformer();
		Source xml = new StreamSource(new StringReader(writer.toString()));
		Source xsl = XslTransformer.getTemplateSource(params.getParameterValue("template"), servletContext);
		xslTransformer.transform(xml, xsl, xslWriter);
		String corpusId = xslWriter.toString();
		final StringBuilder uri = new StringBuilder("./?corpus=").append(corpusId);
		response.sendRedirect(uri.toString());
		return true;
	}



	private static boolean handleRefererAndRedirect(HttpServletRequest request,
			HttpServletResponse response, FlexibleParameters params) throws IOException {
		
		// only do this if we have a referer
		String referer = request.getHeader("referer");
		if ((referer == null) || (referer.isEmpty() == true)) {
			return false;
		}
		
		// only continue if we have useReferer parameter
		if (params.getParameterBooleanValue("useReferer") == false) {return false;}

		if ((params.containsKey("input") == false) && (params.containsKey("corpus") == false)) {
			params.removeParameter("useReferer");
			if (params.getParameterBooleanValue("forceUpdate") == true) {
				referer = referer + String.valueOf(Calendar.getInstance().getTimeInMillis());
			}
			params.addParameter("archive", referer);
			params.addParameter("corpus", referer.replaceAll("\\W+", "_"));
			final StringBuilder uri = new StringBuilder("./?"); // hoping this works
			uri.append(params.getAsQueryString());
			response.sendRedirect(uri.toString());
			return true;
		}
		return false;
	}
}