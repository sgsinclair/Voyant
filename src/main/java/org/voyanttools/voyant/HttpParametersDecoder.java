package org.voyanttools.voyant;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.voyanttools.trombone.util.FlexibleParameters;

/**
 * This is a utility class for decoding HTTP parameters intended to configure the behavior of a Trombone {@link Controller}. 
 * @author Stéfan Sinclair, Cyril Briquet
 */
public class HttpParametersDecoder {
	
	private static final Pattern VALID_URL_PATTERN = Pattern.compile("^((https?|ftp)://|([\\w-]+\\.)+[\\w-]+($|/))");

	private final FlexibleParameters parameters;
	
	public HttpParametersDecoder(FlexibleParameters parameters) {
		
		if (parameters == null) {
			throw new NullPointerException("illegal properties");
		}
		
		this.parameters = parameters;

	}
	
	public synchronized void decodeParameter(String key, String value, boolean allowLocalFileSystemAccess) {

		if (key == null) {
			throw new NullPointerException("illegal key");
		}
		if (value == null) {
			throw new NullPointerException("illegal value");
		}

		decodeParameters(key, new String[] { value }, allowLocalFileSystemAccess);
	
	}

	public synchronized void decodeParameters(String key, String[] values, boolean allowLocalFileSystemAccess) {

		if (key == null) {
			throw new NullPointerException("illegal key");
		}
		if (values == null) {
			throw new NullPointerException("illegal values");
		}

		// let's strip the brackets that indicate an array
		if (key.endsWith("[]") && key.length()>2) {key = key.substring(0, key.length()-2);}

		if (key.equals("uri")) {
			decodeURIParameters(key, values);
		}
		else if (key.equals("input")) {
			decodeInlineParameters(key, values);
		}
		else if (key.equals("file") || key.equals("directory") || key.equals("upload")) {
			if (allowLocalFileSystemAccess) {
				addParameter(key, values);
			}
		}
		else {
			addParameter(key, values);
		}
		
	}

	private synchronized void decodeURIParameters(String key, String[] values) {
		
		if (key == null) {
			throw new NullPointerException("illegal key");
		}
		if (values == null) {
			throw new NullPointerException("illegal values");
		}

		final Set<String> uris = new HashSet<String>();
		
		for (String uri : values) {
			if (uri.trim().startsWith("file:")) {
				throw new IllegalArgumentException("file:// protocol is not supported");
			}
			else {
				uris.add(uri);
			}
		}
		
		if (uris.isEmpty() == false) {
			addParameter(key, uris.toArray(values));
		}

	}

	private synchronized void decodeInlineParameters(String key, String[] values) {

		if (key == null) {
			throw new NullPointerException("illegal key");
		}
		if (values == null) {
			throw new NullPointerException("illegal values");
		}
		
		final List<String> uris = new ArrayList<String>();
		final List<String> strings = new ArrayList<String>();
		
		for (String input : values) {
			input = input.trim();
			if (input.length() == 0) {
				continue;
			}

			if (VALID_URL_PATTERN.matcher(input).find()) { // inline URI or URIs
				for (String uri : input.split("\n+")) {
					uri = uri.trim();
					if (VALID_URL_PATTERN.matcher(uri).find()) {
						if (uri.startsWith("http") || uri.startsWith("ftp")) {
							uris.add(uri);
						}
						else {
							uris.add("http://" + uri); // the protocol is probably http anyways ;)
						}
					}
				}
			}
			else { // inline text chunk
				strings.add(input);
			}
		}
		
		if (uris.isEmpty() == false) {
			addParameter("uri", uris.toArray(new String[0]));
		}
		if (strings.isEmpty() == false) {
			addParameter("string", strings.toArray(new String[0]));
		}

	}

	private synchronized void addParameter(String key, String[] values) {

		if (key == null) {
			throw new NullPointerException("illegal key");
		}
		if (values == null) {
			throw new NullPointerException("illegal values");
		}

		/*
		final String[] decodedValues = new String[values.length];
		for (int y = 0 ; y < decodedValues.length ; ++y) {
			try {
				decodedValues[y] = URLDecoder.decode(values[y], "UTF-8");
			}
			catch (UnsupportedEncodingException e) {
				throw new IllegalStateException(e.getMessage(), e);
			}
		}
		*/

		this.parameters.addParameter(key, values);

	}
	
}
