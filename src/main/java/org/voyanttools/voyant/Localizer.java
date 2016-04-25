package org.voyanttools.voyant;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;

public class Localizer {

	public static void sendCache(HttpServletRequest request, HttpServletResponse response) throws IOException {
		
		response.setCharacterEncoding("UTF-8");
		
		File basePath = new File(request.getSession().getServletContext().getRealPath("/"), "/resources/voyant/current");
		
		String lang = request.getParameter("lang");
		if (lang==null || lang.isEmpty()) {lang="en";}
		
		File cachedFile = new File(basePath, "voyant-locale-"+lang+".js");
		File sourceFile = new File(basePath, "localization.tsv");
		
		if (!cachedFile.exists() || sourceFile.lastModified()>cachedFile.lastModified()) {
			update(lang, sourceFile, cachedFile);
		}
		response.sendRedirect(cachedFile.getName());
	}

	private static void update(String lang, File sourceFile, File cachedFile) throws IOException {
		List<String> lines = FileUtils.readLines(sourceFile);
		String header = lines.get(0);
		int pos = header.indexOf("("+lang+")");
		if (pos==-1) {
			throw new IllegalArgumentException("Unable to find language: "+lang);
		}
		int column = StringUtils.countMatches(header.substring(0, pos), "\t");
		int english = 2;
		lines.remove(0);
		Map<String, Map<String, String>> locationsMap = new HashMap<String, Map<String, String>>();
		for (String line : lines) {
			String[] cells = line.split("\t");
			if (cells.length < 3 || cells[0].isEmpty() || cells[1].isEmpty() || cells[2].isEmpty()) {continue;}
			String location = cells[0];
			if (locationsMap.containsKey(location)==false) {
				locationsMap.put(location, new HashMap<String, String>());
			}
			locationsMap.get(location).put(cells[1], cells.length>=column-1 && cells[column].isEmpty()==false ? cells[column] : cells[english]);
		}
		StringBuilder sb = new StringBuilder();
		for (Map.Entry<String, Map<String, String>> locationEntry : locationsMap.entrySet()) {
			sb.append("Ext.apply(").append(locationEntry.getKey()).append(".i18n, {\n");
			for (Map.Entry<String, String> classEntry : locationEntry.getValue().entrySet()) {
				sb.append("\"").append(classEntry.getKey()).append("\":\"").append(classEntry.getValue().replace("\"", "\\\"")).append("\",\n");
			}
			sb.setLength(sb.length()-2);
			sb.append("});\n");
		}
		FileUtils.writeStringToFile(cachedFile, sb.toString());
	}
}