package org.voyanttools.voyant;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;

public class SpyralAuth extends HttpServlet {

	private static final long serialVersionUID = 1048044723303994604L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
		doRequest(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
		doRequest(req, resp);
	}

	private void doRequest(HttpServletRequest req, HttpServletResponse resp) throws IOException {

		Properties oauthprops = new Properties();
		String propfile = this.getInitParameter("oauthprops");
		oauthprops.load(getClass().getClassLoader().getResourceAsStream(propfile));
		
		String clientId = (String) oauthprops.get("clientId");
		String clientSecret = (String) oauthprops.get("clientSecret");
		String oauthCallbackRedirect = (String) oauthprops.get("oauthCallbackRedirect");
		
		String code = req.getParameter("code");
		
		String charset = StandardCharsets.UTF_8.name();

		String tokenURL = "https://github.com/login/oauth/access_token?code="+code+"&client_id="+clientId+"&client_secret="+clientSecret;
		
		URL url = new URL(tokenURL);
		
		URLConnection connection = url.openConnection();
		connection.setDoOutput(true);
		connection.setRequestProperty("Accept-Charset", charset);
		
		InputStream is = null;
		try {
			is = connection.getInputStream();
			String respString = IOUtils.toString(is, charset);
			Pattern pattern = Pattern.compile("(access_token=)(\\w+)");
			Matcher matcher = pattern.matcher(respString);
			if (matcher.find()) {
				String accessToken = matcher.group(2);
				Cookie cookie = new Cookie("access-token", accessToken);
				cookie.setPath("/");
				resp.addCookie(cookie);
				resp.sendRedirect(oauthCallbackRedirect);
			}
		} finally {
			if (is != null) {
				is.close();
			}
		}
	}

}