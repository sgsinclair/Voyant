package org.voyanttools.voyant;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
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
import com.google.javascript.jscomp.Result;
import com.google.javascript.jscomp.SourceFile;
import com.google.javascript.jscomp.SourceMap;
import com.google.javascript.jscomp.SourceMap.PrefixLocationMapping;


/**
 * @author Andrew MacDonald and Stéfan Sinclair
 */
public class JSCacher {

	final static String ENCODING = "UTF-8";
	final static String CACHED_FILENAME = "voyant.js";
	final static String CACHED_FILENAME_MINIFIED = "voyant.min.js";
	final static String SOURCE_MAP_FILENAME = "voyant.min.map.js";
	
	// Closure options
	final static int SUMMARY_DETAIL_LEVEL = 1;
	
	public static void sendCache(HttpServletRequest request, HttpServletResponse response) throws IOException {
		
		response.setCharacterEncoding(ENCODING);
		
		// TODO add config for this?
		boolean doSourceMap = true;
		
		File basePath = new File(request.getSession().getServletContext().getRealPath("/"));
		
		String debug = request.getParameter("debug");
		
		File cachedFile = new File(basePath, "/resources/voyant/current/"+CACHED_FILENAME);
        File cachedFileMinified = new File(basePath, "/resources/voyant/current/"+CACHED_FILENAME_MINIFIED);
        File sourceMapFile = new File(basePath, "/resources/voyant/current/"+SOURCE_MAP_FILENAME);
        
		if (debug!=null && debug.equals("true") && cachedFile.canWrite() && cachedFileMinified.canWrite() && sourceMapFile.canWrite()) {
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
				String footer = doSourceMap ? "\n//# sourceMappingURL=" + SOURCE_MAP_FILENAME : "";
				
				StringBuffer cache = new StringBuffer(header);
				
				for (File file : files) {
					String s = FileUtils.readFileToString(file, Charset.forName(ENCODING));
					cache.append(s).append("\n"); // assuming UTF-8
					sourceFiles.add(SourceFile.fromFile(file.getPath()));
				}
				
				// non-minified version
				FileUtils.writeStringToFile(cachedFile, cache.toString(), Charset.forName(ENCODING));
				
				// minified version
				Compiler compiler = new Compiler();
				CompilerOptions options = new CompilerOptions();
				
				List<String> tags = new ArrayList<String>();
				tags.add("cfg");
				tags.add("exports");
				tags.add("choices");
				tags.add("distinguishingFldsArray");
				tags.add("undistinguishedRoot");
				options.setExtraAnnotationNames(tags);
				
				options.setStrictModeInput(false); // needed to avoid error on "arguments.callee.caller"
				
				options.setSummaryDetailLevel(SUMMARY_DETAIL_LEVEL);
				
				options.setLanguageIn(CompilerOptions.LanguageMode.ECMASCRIPT_2019);
				options.setLanguageOut(CompilerOptions.LanguageMode.ECMASCRIPT5);
				
				if (doSourceMap) {
					options.setSourceMapOutputPath(SOURCE_MAP_FILENAME);
					options.setSourceMapFormat(SourceMap.Format.V3);
					options.setSourceMapIncludeSourcesContent(true);
					
					List<PrefixLocationMapping> prefixes = new ArrayList<>();
					String baseLocation = basePath.toString().replaceAll("\\\\", "/");
	                prefixes.add(new PrefixLocationMapping(baseLocation, ""));
					options.setSourceMapLocationMappings(prefixes);
				}
				
				CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);
                Result result = compiler.compile(new ArrayList<SourceFile>(), sourceFiles, options);
                
                cache.setLength(0);
                cache.append(header);
                cache.append(compiler.toSource());
                cache.append(footer);

                FileUtils.writeStringToFile(cachedFileMinified, cache.toString(), Charset.forName(ENCODING));
                
                // source map
                if (doSourceMap && result.sourceMap != null) {
	                StringBuilder sourceMap = new StringBuilder();	                
	                result.sourceMap.appendTo(sourceMap, SOURCE_MAP_FILENAME);
	                FileUtils.writeStringToFile(sourceMapFile, sourceMap.toString(), Charset.forName(ENCODING));
                }

			}			
			response.sendRedirect(CACHED_FILENAME);
		}
		else {
			response.sendRedirect(CACHED_FILENAME_MINIFIED);
		}

	}

	private static List<File> getCacheableFiles(File basePath) throws IOException {
		InputStream is = org.voyanttools.voyant.JSCacher.class.getResourceAsStream("voyant-js.txt");
		List<String> lines = IOUtils.readLines(is, Charset.forName(ENCODING));
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
