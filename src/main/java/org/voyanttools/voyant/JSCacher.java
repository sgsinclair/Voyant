package org.voyanttools.voyant;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.SourceFile;


/**
 * @author Andrew MacDonald and Stéfan Sinclair
 */
public class JSCacher {

	final static String ENCODING = "UTF-8";
	final static String CACHED_FILENAME = "voyant.js";
	final static String CACHED_FILENAME_MINIFIED = "voyant.min.js";
	
	// Closure options
	final static int SUMMARY_DETAIL_LEVEL = 1;
	
	public static void sendCache(HttpServletRequest request, HttpServletResponse response) throws IOException {
		
		response.setCharacterEncoding(ENCODING);
		
		File basePath = new File(request.getSession().getServletContext().getRealPath("/"));
		
		String debug = request.getParameter("debug");
		
		File cachedFile = new File(basePath, "/resources/voyant/current/"+CACHED_FILENAME);
        File cachedFileMinified = new File(basePath, "/resources/voyant/current/"+CACHED_FILENAME_MINIFIED);
		if (debug!=null && debug.equals("true") && cachedFile.canWrite() && cachedFileMinified.canWrite()) {
			long lastModifiedCachedFile = cachedFile.lastModified();
			List<File> files = getCacheableFiles(basePath);

			// look for any file that's been updated since last cache
			boolean needsUpdate = false;
			for (File file : files) {
				if (file.lastModified() > lastModifiedCachedFile) {
					needsUpdate = true;
					break;
				}
			}
			
			if (needsUpdate) {
				
				List<SourceFile> sourceFiles = new ArrayList<SourceFile>();
				
				String header = "/* This file created by JSCacher. Last modified: "+new Date().toString()+" */\n";
				StringBuffer cache = new StringBuffer(header);
				for (File file : files) {
					String s = FileUtils.readFileToString(file);
					cache.append(s).append("\n"); // assuming UTF-8
					sourceFiles.add(SourceFile.fromFile(file));
				}
				
				// write out concatenated file
				FileUtils.writeStringToFile(cachedFile, cache.toString());
				
				// compile and write minified version
				Compiler compiler = new Compiler();
				CompilerOptions options = new CompilerOptions();
				options.setSummaryDetailLevel(SUMMARY_DETAIL_LEVEL);
				
				CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);                
                compiler.compile(new ArrayList<SourceFile>(), sourceFiles, options);
                
                cache.setLength(0);
                cache.append(header);
                cache.append(compiler.toSource());

				// write out minified file
                FileUtils.writeStringToFile(cachedFileMinified, cache.toString());		

			}			
			response.sendRedirect(CACHED_FILENAME);
		}
		else {
			response.sendRedirect(CACHED_FILENAME_MINIFIED);
		}

	}

	private static List<File> getCacheableFiles(File basePath) throws IOException {
		InputStream is = org.voyanttools.voyant.JSCacher.class.getResourceAsStream("voyant-js.txt");
		List<String> lines = IOUtils.readLines(is);
		is.close();
		List<File> files = new ArrayList<File>();
		for (String jsFile : lines) {
			if (jsFile.trim().startsWith("#") || jsFile.trim().isEmpty()) {continue;}
			File f = new File(basePath, jsFile);
			if (f.exists()) {files.add(f);}
			else {
				throw new IOException("File does not exist:"+f);
			}
		}
		return files;
	}

}
