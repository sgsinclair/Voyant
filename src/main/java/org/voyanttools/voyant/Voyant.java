package org.voyanttools.voyant;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Calendar;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import javax.xml.transform.TransformerException;

import org.json.simple.JSONObject;
import org.json.simple.JSONValue;
import org.voyanttools.trombone.util.FlexibleParameters;

/**
 * @author Stéfan Sinclair
 */
public class Voyant {
	
	/**
	 * Pre-process the request. At the moment this will look if there's a referer,
	 * and if so but no input or corpus parameters are provided, it will redirect
	 * to the same URL but with the referer as input.
	 * @param request
	 * @param response
	 * @return true if preProcessing has resulted in a redirect
	 * @throws Exception 
	 */
	public static boolean preProcess(HttpServletRequest request, HttpServletResponse response) throws Exception {
		final String method = request.getMethod();
		if (method==null) {return false;}

		final FlexibleParametersFactory flexibleParametersFactory = new FlexibleParametersFactory();
		final FlexibleParameters params = flexibleParametersFactory.getInstance(request);

		// if we have a POST request, we need to create the corpus before redirecting
		if (method.equals("POST") && request.getParameter("noRedirect") == null) {
			return handlePostAndRedirect(request, response, params);
		}

		// if we have a GET request, we need to check for a useReferer parameter
		else if (method.equals("GET")) {
			return handleRefererAndRedirect(request, response, params);
		}
		
		return false;
		
	}
	
		

	/**
	 * The only time we should be here is when we have a post method to Voyant that includes input and that
	 * needs to be processed to create a new corpus, and then redirect to the URL with the corpus.
	 * @param request
	 * @param response
	 * @param params
	 * @return
	 * @throws IOException
	 * @throws TransformerException
	 * @throws ServletException 
	 */
	private static boolean handlePostAndRedirect(HttpServletRequest request,
			HttpServletResponse response, FlexibleParameters params) throws IOException, TransformerException, ServletException {
		
		PostedInputResponseWrapper postedInputResponseWrapper = new PostedInputResponseWrapper(response);
		request.getRequestDispatcher("trombone").include(new PostedInputRequestWrapper(request), postedInputResponseWrapper);

		String responseString = postedInputResponseWrapper.toString();
		JSONObject obj= (JSONObject) JSONValue.parse(responseString);
		JSONObject builder = (JSONObject) obj.get("stepEnabledCorpusCreator");
		String corpusId = (String) builder.get("storedId");
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
			params.addParameter("input", referer);
			final StringBuilder uri = new StringBuilder("./?"); // hoping this works
			uri.append(params.getAsQueryString());
			response.sendRedirect(uri.toString());
			return true;
		}
		return false;
	}
	
	private static class PostedInputRequestWrapper extends HttpServletRequestWrapper {
		private final String TOOL = "corpus.CorpusCreator";
		private PostedInputRequestWrapper(HttpServletRequest request) {
			super(request);
		}
		@Override
		public Map<String,String[]> getParameterMap() {
			Map<String, String[]> map = super.getParameterMap();
			map.put("tool", getParameterValues("tool"));
			return map;
		}
		@Override
		public Enumeration<String> getParameterNames() {
			Set<String> names = new HashSet<String>();
			Enumeration<String> e = super.getParameterNames();
			while (e.hasMoreElements()) {
				names.add(e.nextElement());
			}
			names.add("tool");
			return Collections.enumeration(names);
		}
		@Override
		public String getParameter(String name) {
			return name.equals("tool") ? TOOL : super.getParameter(name);
		}
		@Override
		public String[] getParameterValues(String name) {
			return name.equals("tool") ? new String[]{getParameter("tool")} : super.getParameterValues(name);
		}
	}
	
	private static class PostedInputResponseWrapper extends HttpServletResponseWrapper {
		private StringWriter stringWriter;
		private PrintWriter writer;
		private PostedInputResponseWrapper(HttpServletResponse response) {
			super(response);
			stringWriter = new StringWriter();
			writer = new PrintWriter(stringWriter);
		}
		@Override
		public PrintWriter getWriter() {
			return writer;
		}
		@Override
		public String toString() {
//			writer.flush();
			writer.flush();
			return stringWriter.toString();
		}
	}
}