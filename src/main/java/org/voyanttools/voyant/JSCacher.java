package org.voyanttools.voyant;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;

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
	
	private static String[] jsFiles = new String[]{
		
		"resources/bubblelines/Bubblelines.js",
		
		"resources/cirrus/html5/Cirrus.js",
		"resources/cirrus/html5/Word.js",
		"resources/cirrus/html5/WordController.js",

		"app/util/Api.js",
		"app/util/Localization.js",
		"app/util/Deferrable.js",
		"app/util/DetailedError.js",
		"app/util/ResponseError.js",
		"app/util/SparkLine.js",
		"app/util/Toolable.js",
		"app/util/Transferable.js",
		"app/util/Variants.js",

		"app/data/model/AnalysisToken.js",
		"app/data/model/Context.js",
		"app/data/model/CorpusCollocate.js",
		"app/data/model/CorpusTerm.js",
		"app/data/model/CorpusNgram.js",
		"app/data/model/Dimension.js",
		"app/data/model/Document.js",
		"app/data/model/DocumentQueryMatch.js",
		"app/data/model/DocumentTerm.js",
		"app/data/model/PrincipalComponent.js",
		"app/data/model/StatisticalAnalysis.js",
		"app/data/model/Token.js",

		"app/data/store/CAAnalysis.js",
		"app/data/store/Contexts.js",
		"app/data/store/CorpusCollocates.js",
		"app/data/store/CorpusNgrams.js",
		"app/data/store/CorpusTerms.js",
		"app/data/store/DocumentQueryMatches.js",
		"app/data/store/DocumentTerms.js",
		"app/data/store/Documents.js",
		"app/data/store/PCAAnalysis.js",
		"app/data/store/Tokens.js",

		"app/data/model/Corpus.js",

		"app/widget/StopListOption.js",
		"app/widget/QuerySearchField.js",

		"app/panel/Panel.js",
		"app/panel/Bubblelines.js",
		"app/panel/Cirrus.js",
		"app/panel/CollocatesGraph.js",
		"app/panel/Contexts.js",
		"app/panel/CorpusCollocates.js",
		"app/panel/CorpusCreator.js",
		"app/panel/CorpusNgrams.js",
		"app/panel/CorpusTerms.js",
		"app/panel/DocumentTerms.js",
		"app/panel/Documents.js",
		"app/panel/DocumentsFinder.js",
		"app/panel/Dummy.js",
		"app/panel/Reader.js",
		"app/panel/ScatterPlot.js",
		"app/panel/Summary.js",
		"app/panel/TopicContexts.js",
		"app/panel/Trends.js",
		"app/panel/VoyantFooter.js",
		"app/panel/VoyantHeader.js",
		"app/panel/CorpusSet.js",
		"app/panel/VoyantTabPanel.js",

		"app/VoyantApp.js",
		"app/VoyantCorpusApp.js",
		"app/VoyantDefaultApp.js"};
	
	// Closure options
	final static int SUMMARY_DETAIL_LEVEL = 1;
	
	public static void sendCache(HttpServletRequest request, HttpServletResponse response) throws IOException {
		
		response.setCharacterEncoding(ENCODING);
		
		File basePath = new File(request.getSession().getServletContext().getRealPath("/"));
		
		String debug = request.getParameter("debug");
		
		File cachedFile = new File(basePath, "/resources/voyant/current/"+CACHED_FILENAME);
        File cachedFileMinified = new File(basePath, "/resources/voyant/current/"+CACHED_FILENAME_MINIFIED);
		if (debug!=null && debug.equals("true")) {
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
		List<File> files = new ArrayList<File>();
		for (String jsFile : jsFiles) {
			File f = new File(basePath, jsFile);
			if (f.exists()) {files.add(f);}
			else {
				throw new IOException("File does not exist:"+f);
			}
		}
		return files;
	}

}
