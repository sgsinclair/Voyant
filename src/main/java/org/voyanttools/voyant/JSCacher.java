package org.voyanttools.voyant;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.SourceFile;


/**
 * @author Andrew MacDonald
 */
public class JSCacher {

	final static String ENCODING = "UTF-8";
	final static String CACHED_FILENAME = "voyant.js";
	
	// Closure options
	final static int SUMMARY_DETAIL_LEVEL = 1;
	
	static long lastCache;
	static File cachedFile;

	public static String getCache(HttpServletRequest request, HttpServletResponse response, boolean forceRecache, boolean preserveWhitespace) throws MalformedURLException {
		
		response.setCharacterEncoding(ENCODING);
		
		// check parameters
		if (!forceRecache) {
			String fr = request.getParameter("forceRecache");
			if (fr!=null && fr.equals("true")) {forceRecache=true;}
		}
		
		if (!preserveWhitespace) {
			String pw = request.getParameter("preserveWhitespace");
			if (pw!=null && pw.equals("true")) {preserveWhitespace=true;}
		}
		
		String skipJsCacheCheck = request.getSession().getServletContext().getInitParameter("skipJsCacheCheck");
		if (!forceRecache && skipJsCacheCheck != null && skipJsCacheCheck.equals("true")) {
			return redirectToCache(response);
		}
		
		String appPath = request.getSession().getServletContext().getRealPath("/app");

		cachedFile = new File(request.getSession().getServletContext().getRealPath("/resources/voyant/current")+File.separator+"voyant.js");
		lastCache = cachedFile.lastModified();
		
		if (forceRecache) {
			// allow recache even if skipJsCacheChecking is true
			return doCache(appPath, preserveWhitespace);
		}
		else if (!isCacheCurrent(appPath)) {
			// check again in a synchronized way – there's overhead to rechecking,
			// but we help to avoid the cache being written several times needlessly
			synchronized(JSCacher.class) {
				if (!isCacheCurrent(appPath)) {
					return doCache(appPath, preserveWhitespace);
				}
				else {
					return redirectToCache(response);
				}
			}
		} else {
			return redirectToCache(response);
		}
	}

	private static String redirectToCache(HttpServletResponse response) {
		try {
			response.sendRedirect(CACHED_FILENAME);
		} catch (IOException e) {
			e.printStackTrace();
			return "alert('Unable to load cached Voyeur scripts');";
		}
		return "";
	}

	private static boolean isCacheCurrent(String resourcesPath) {
		File scriptsDir = new File(resourcesPath+File.separator+"scripts");
		File toolsDir = new File(resourcesPath+File.separator+"tools");

		DateCheckerAction dc = new DateCheckerAction();

		visitAllJSFiles(scriptsDir, dc);
		visitAllJSFiles(toolsDir, dc);

		return dc.current;
	}
	
	private synchronized static String doCache(String resourcesPath, boolean preserveWhitespace) {
		
		CachingAction ca;
		if (preserveWhitespace) {
			ca = new ConcatenatingAction();
		} else {
			ca = new CompressingAction();
		}
		
		visitAllJSFiles(new File(resourcesPath), ca);

		String cache = ca.getStringBuffer().toString();
		Writer out = null;
		try {
			out = new OutputStreamWriter(new FileOutputStream(cachedFile), ENCODING);
			out.write(cache);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			try {
				out.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		return cache;
	}

	public interface FileAction {
		public abstract void execute(File file);
	}
	
	public interface CachingAction extends FileAction {
		public abstract StringBuffer getStringBuffer();
	}

	private static class DateCheckerAction implements FileAction {

		public boolean current;

		DateCheckerAction() {
			current = true;
		}

		public void execute(File file) {
			if (file.lastModified() > lastCache) {
				current = false;
			}
		}
	}

	private static class CompressingAction implements CachingAction {

		private StringBuffer cache;
		
		private List<SourceFile> jsFiles = new ArrayList<SourceFile>();
		private List<SourceFile> externalFiles = new ArrayList<SourceFile>();

		CompressingAction() {
			cache = new StringBuffer("/* This file created by JSCacher. Last modified: "+new Date().toString()+" */\n");
		}

		public void execute(File file) {
			System.out.println("compressing: "+file.getName());
			
			SourceFile jsFile = SourceFile.fromFile(file);
			jsFiles.add(jsFile);
		}

		public StringBuffer getStringBuffer() {
			try {
				Compiler compiler = new Compiler();
				CompilerOptions options = new CompilerOptions();
				options.setSummaryDetailLevel(SUMMARY_DETAIL_LEVEL);
				
				CompilationLevel.SIMPLE_OPTIMIZATIONS.setOptionsForCompilationLevel(options);                
                compiler.compile(externalFiles, jsFiles, options);
                cache.append(compiler.toSource());
			} catch (Exception e) {
				e.printStackTrace();
			}
			return cache;
		}
	}
	
	private static class ConcatenatingAction implements CachingAction {
		
		private StringBuffer cache;

		ConcatenatingAction() {
			cache = new StringBuffer("/* This file created by JSCacher. Last modified: "+new Date().toString()+" */\n");
		}

		public void execute(File file) {
			System.out.println("concatenating: "+file.getName());
			try {
				cache.append("\n").append(readFileAsString(file));
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		public StringBuffer getStringBuffer() {
			return cache;
		}
	}

	private static void visitAllJSFiles(File dir, FileAction action) {
		if (dir.isDirectory()) {
			String[] children = dir.list();
			for (int i=0; i<children.length; i++) {
				visitAllJSFiles(new File(dir, children[i]), action);
			}
		} else {
			if (dir.getName().endsWith(".js")) {
				action.execute(dir);
			}
		}
	}

	private static String readFileAsString(File file) throws java.io.IOException{
		byte[] buffer = new byte[(int) file.length()];
		BufferedInputStream f = null;
		try {
			f = new BufferedInputStream(new FileInputStream(file));
			f.read(buffer);
		} finally {
			if (f != null) try { f.close(); } catch (IOException ignored) { }
		}
		return new String(buffer);
	}
}
