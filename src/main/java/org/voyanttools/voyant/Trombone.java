package org.voyanttools.voyant;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.text.DateFormat;
import java.util.Calendar;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.voyanttools.trombone.results.ResultsOutputFormat;
import org.voyanttools.trombone.storage.Storage;
import org.voyanttools.trombone.storage.file.FileStorage;
import org.voyanttools.trombone.Controller;
import org.voyanttools.trombone.util.FlexibleParameters;

/**
 * @author Stéfan Sinclair, Cyril Briquet
 */
public class Trombone extends HttpServlet {

	private static final long serialVersionUID = 392155275393370320L;

	private static final String ALCHEMY_API_KEY_LABEL = "alchemyApiKey";
	private static final String ALCHEMY_API_KEY_FILE_LABEL = "alchemyApiKeyFile";	
	private String alchemyApiKey = null;
	private final Set<String> hiddenParameters = new HashSet<String>();
	private Storage storage;

	private FlexibleParametersFactory flexibleParametersFactory;
	
	public Trombone() {
		
		this.hiddenParameters.add(ALCHEMY_API_KEY_LABEL);
		this.flexibleParametersFactory = new FlexibleParametersFactory();
		this.storage = new FileStorage();
	}
	
	@Override
	public void init() {

		loadAlchemiApiKey(getServletContext().getInitParameter(ALCHEMY_API_KEY_FILE_LABEL));
		
	}
	
	private void loadAlchemiApiKey(String alchemyApiKeyFilePath) {

		if ((alchemyApiKeyFilePath == null) || (alchemyApiKeyFilePath.isEmpty() == true)) {
			this.log("WARNING: No AlchemyAPI set. Check web.xml for the '"+ALCHEMY_API_KEY_FILE_LABEL+"' context param.");
		}
		else {
			final File file = new File(alchemyApiKeyFilePath);
            if (((file.exists() == false) || (file.canRead() == false)) && (this.alchemyApiKey == null)) {
                this.log("ERROR: Unable to load AlchemyAPI key from "+alchemyApiKeyFilePath+". Check web.xml for the '"+ALCHEMY_API_KEY_FILE_LABEL+"' context param.");
            }

            try {	
	        	this.alchemyApiKey = FileUtils.readFileToString(file).replaceAll("\\n", "").replaceAll("\\r", "");
	        }
			catch (IOException e) {
				this.log("ERROR: Unable to load AlchemyAPI key from "+alchemyApiKeyFilePath+". Check web.xml for the '"+ALCHEMY_API_KEY_FILE_LABEL+"' context param.", e);
			}
		}
		
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
		
		doRequest(req, resp);
	
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {

		doRequest(req, resp);
	
	}
	
	private void doRequest(HttpServletRequest req, HttpServletResponse resp) {

		if (req == null) {
			throw new NullPointerException("illegal servlet request");
		}
		if (resp == null) {
			throw new NullPointerException("illegal servlet response");
		}

		final FlexibleParameters parameters = getFlexibleParameters(req);
		if (parameters == null) {
			return;
		}

		try {
			doRequest(parameters, req, resp);
			this.log(generateLogMessageForSuccessfulRequest(parameters, req));
		}
		catch (Exception e) {
			this.log("ERROR: "+e.getLocalizedMessage(), e);
			this.log(generateLogMessageForFailedRequest(parameters, this.hiddenParameters));
			resp.setStatus(500);
			try {
				final PrintWriter writer = resp.getWriter();
				String message = e.getMessage();
				if (message!=null && message.isEmpty()==false) {
					writer.write(e.getMessage()+"\n");
				}
				e.printStackTrace(writer);
			}
			catch (IOException ioe) {
				this.log("ERROR: Unable to write results", ioe);
			}
		}
		
	}

	private FlexibleParameters getFlexibleParameters(HttpServletRequest req) {

		if (req == null) {
			throw new NullPointerException("illegal servlet request");
		}

		try {
			final FlexibleParameters parameters = this.flexibleParametersFactory.getInstance(req);
			
			if ((this.alchemyApiKey != null) && (this.alchemyApiKey.isEmpty() == false)) {
				parameters.setParameter(ALCHEMY_API_KEY_LABEL, this.alchemyApiKey);
			}
			
			return parameters;
		}
		catch (Exception e) {
			this.log("ERROR: Unable to create parameters", e);
			this.log(generateLogMessageForUnprocessableParameters(((Map<String, String[]>) req.getParameterMap()).entrySet(), this.hiddenParameters));
			return null;
		}
		
	}
	
	private void doRequest(FlexibleParameters parameters, HttpServletRequest req, HttpServletResponse resp) throws IOException, TransformerException {

		if (parameters == null) {
			throw new NullPointerException("illegal parameters");
		}
		if (req == null) {
			throw new NullPointerException("illegal servlet request");
		}
		if (resp == null) {
			throw new NullPointerException("illegal servlet response");
		}

		resp.setContentType(ResultsOutputFormat.getResultsOutputFormat(parameters.getParameterValue("outputFormat", "json")).getContentType());


		if (parameters.containsKey("fetchJSON")) {
			URL url;
			URLConnection c;
			try {
				url = new URL(parameters.getParameterValue("fetchJSON").replaceAll(" ", "+"));
				c = url.openConnection();
			}
			catch (MalformedURLException e) {
				throw new IllegalArgumentException("Attempt to use a malformed URL: "+parameters.getParameterValue("fetchJSON"), e);
			}
			c.addRequestProperty("User-Agent", "Mozilla/4.0 (compatible; Trombone)");
//	        c.setReadTimeout(readTimeoutMilliseconds); 
//	        c.setConnectTimeout(connectTimeoutMilliseconds);
			InputStream is = null;
			try {
				is = c.getInputStream();
				//application/json
				resp.setContentType("application/json;charset=UTF-8");
				IOUtils.copy(is, resp.getWriter());
			}
			finally {
				if (is!=null) {
					is.close();
				}
			}
			
		}
		else if (parameters.containsKey("template")) {
			parameters.setParameter("outputFormat", "xml"); // we need xml for transformation
			final Writer xmlResultsWriter = new StringWriter();
			runTromboneController(parameters, xmlResultsWriter);

			Source xml = new StreamSource(new StringReader(xmlResultsWriter.toString()));
			Source xslt = XslTransformer.getTemplateSource(parameters.getParameterValue("template"), this.getServletConfig().getServletContext());

			FlexibleParameters xslParameters = new FlexibleParameters();
			xslParameters.setParameter("tromboneUrl", req.getRequestURL().toString());
			for (Map.Entry<String, String[]> param : ((Map<String, String[]>) req.getParameterMap()).entrySet()) {
				if (this.hiddenParameters.contains(param.getKey()) == true) { // skip hidden parameter
					continue;
				}
				xslParameters.setParameter(param.getKey(), param.getValue());
			}

			XslTransformer.transform(xslParameters, xml, xslt, resp.getWriter());
		}
		else {
			Writer writer = resp.getWriter();
			runTromboneController(parameters, resp.getWriter());
			writer.flush();
			writer.close();
		}
		
	}

	private void runTromboneController(FlexibleParameters parameters, Writer writer) throws IOException {

		if (parameters == null) {
			throw new NullPointerException("illegal parameters");
		}
		if (writer == null) {
			throw new NullPointerException("illegal writer");
		}
		
		// intercept to see if we have a notebook in resources
		if (parameters.getParameterValue("tool", "").equals("notebook.NotebookManager") && parameters.containsKey("notebook")) {
			File file = new File(getServletContext().getRealPath("/resources/notebook"), parameters.getParameterValue("notebook"));
			if (!file.exists()) {
				file = new File(getServletContext().getRealPath("/resources/notebook"), parameters.getParameterValue("notebook")+".json");
			}
			if (file.exists()) {
				String string = FileUtils.readFileToString(file);
				writer.write(string);
				return;
			}
		}
		final Controller controller = new Controller(storage, parameters, writer);
		controller.run();

	}
	
	private String getTemplatePath(FlexibleParameters parameters) {

		if (parameters == null) {
			throw new NullPointerException("illegal parameters");
		}

		String templatePath = parameters.getParameterValue("template");

		if (templatePath.contains("/") == false) {
			templatePath = getServletContext().getRealPath("/resources/xsl/"+templatePath);
		}
		if (templatePath.endsWith(".xsl") == false) {
			templatePath += ".xsl";
		}

		return templatePath;
		
	}
	
	private static String generateLogMessageForUnprocessableParameters(Set<Map.Entry<String, String[]>> rawParameters, Set<String> hiddenParameters) {

		if (rawParameters == null) {
			throw new NullPointerException("illegal parameters");
		}
		
		if (rawParameters.isEmpty()) {
			return "(No parameters specified.)";
		}
		else {
			final StringBuilder sb = new StringBuilder("Parameters:\n");
			for (Map.Entry<String, String[]> param : rawParameters) {
				appendRequestParameter(sb.append("\t"), param.getKey(), param.getValue(), hiddenParameters);
			}
			return sb.toString();
		}
		
	}

	private static String generateLogMessageForSuccessfulRequest(FlexibleParameters parameters, HttpServletRequest req) {

		if (parameters == null) {
			throw new NullPointerException("illegal parameters");
		}
		if (req == null) {
			throw new NullPointerException("illegal servlet request");
		}

		final StringBuilder sb = new StringBuilder("TOOL: ");
		if (parameters.containsKey("tool") == true) {
			final String[] tools = parameters.getParameterValues("tool");
			for (int i=0, len=tools.length ; i < len ; i++) {
				sb.append("tool");
				if (i+1 < len) {
					sb.append(",");
				}
			}
		}
		else {
			sb.append("CorpusSummary");
		}
		
		if (parameters.containsKey("corpus")) {
			sb.append("; CORPUS: ").append(parameters.getParameterValue("corpus"));
		}
		
		final Calendar now = Calendar.getInstance();
		sb.append("; TIME: ").append(DateFormat.getInstance().format(now.getTime())).append(" (").append(now.getTimeInMillis()).append(")");
		sb.append("; REQUEST: ").append(req.getRemoteHost()).append(" (").append(req.getRemoteAddr()).append(")");
		
		return sb.toString();
		
	}

	private static String generateLogMessageForFailedRequest(FlexibleParameters parameters, Set<String> hiddenParameters) {

		if (parameters == null) {
			throw new NullPointerException("illegal parameters");
		}

		final StringBuilder sb = new StringBuilder("Parameters:\n");
		
		for (String key : parameters.getKeys()) {
			appendRequestParameter(sb.append("\t"), key, parameters.getParameterValues(key), hiddenParameters);
		}
		
		return sb.toString();
	
	}

	private static void appendRequestParameter(StringBuilder sb, String key, String[] values, Set<String> hiddenParameters) {

		if (sb == null) {
			throw new NullPointerException("illegal StringBuilder");
		}
		if (key == null) {
			throw new NullPointerException("illegal key");
		}
		if (values == null) {
			throw new NullPointerException("illegal values");
		}
		if (hiddenParameters == null) {
			throw new NullPointerException("illegal hidden parameters");
		}

		sb.append(key).append(": ");
		
		if (hiddenParameters.contains(key) == true) { // bail if we shouldn't show this
			sb.append(" (hidden)");
		}
		else if (values.length == 1) { // 1 key, 1 value
			sb.append(cleanParameterValue(values[0]));
		}
		else { // 1 key, multiple values
			sb.append("[");
			for (int i=0, len=values.length, mlen=values.length-1 ; i < len ; i++) {
				sb.append(cleanParameterValue(values[i]));
				if (i < mlen) {
					sb.append("; ");
				}
			}
			sb.append("]");
		}
		
		sb.append("\n");
		
	}
	
	private static String cleanParameterValue(String parameterValue) {
	
		if (parameterValue == null) {
			throw new NullPointerException("illegal value");
		}
		
		parameterValue = parameterValue.replaceAll("\\s+", " ");

		if (parameterValue.length() > 100) {
			parameterValue = parameterValue.substring(0, 100) + "…";
		}
		
		return parameterValue;
		
	}

}
