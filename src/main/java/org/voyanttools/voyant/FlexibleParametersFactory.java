package org.voyanttools.voyant;

import static java.security.AccessController.doPrivileged;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.voyanttools.trombone.util.FlexibleParameters;

import sun.security.action.GetPropertyAction;

/**
 * This is a utility class for instantiating {@link FlexibleParameters} from {@link HttpServletRequest}s.
 * @author Stéfan Sinclair, Cyril Briquet
 */
public class FlexibleParametersFactory {

	/**
	 * Get an instance of {@link FlexibleParameters} from the {@link HttpServletRequest}.
	 * 
	 * <p>This method handles simple forms as wells as multipart forms with file uploads.</p>
	 * @param request
	 * @return {@link FlexibleParameters} instance
	 * @throws Exception
	 */
	public FlexibleParameters getInstance(HttpServletRequest request) throws Exception {

		return getInstance(request, false);
	
	}
	
	/**
	 * Get an instance of {@link FlexibleParameters} from the {@link HttpServletRequest}.
	 * 
	 * <p>This method handles simple forms as wells as multipart forms with file uploads.</p>
	 * @param request
	 * @return {@link FlexibleParameters} instance
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public FlexibleParameters getInstance(HttpServletRequest request, boolean allowLocalFileSystemAccess) throws Exception {

		if (request == null) {
			throw new NullPointerException("illegal request");
		}
		
		final FlexibleParameters parameters = new FlexibleParameters();

		final HttpParametersDecoder parametersDecoder = new HttpParametersDecoder(parameters);
		
		if (ServletFileUpload.isMultipartContent(request)) {
			final List<FileItem> items = getRequestItems(request);
			Path tmpPath = Paths.get(Paths.get(doPrivileged(new GetPropertyAction("java.io.tmpdir"))).toString(), "tmp.voyant.uploads");
			if (!Files.exists(tmpPath)) {
				Files.createDirectory(tmpPath);
			}
			
			for (FileItem item : items) {
				if (item.isFormField()) { // normal form field
					parametersDecoder.decodeParameter(item.getFieldName(), item.getString(), allowLocalFileSystemAccess);
				}
				else { // file form field: this is uploaded, therefore the local access check can be bypassed
					Path path = Files.createTempDirectory(tmpPath, "tmp.voyant.uploads");
					File file = new File(path.toFile(), item.getName());
					item.write(file);
					parametersDecoder.decodeParameter("upload", file.toString(), true);
				}
			}
		}
		else {
			for (Map.Entry<String, String[]> param : ((Map<String, String[]>) request.getParameterMap()).entrySet()) {
				parametersDecoder.decodeParameters(param.getKey(), param.getValue(), allowLocalFileSystemAccess);
			}
		}
	
		return parameters;
	
	}
	
	@SuppressWarnings("unchecked")
	private static List<FileItem> getRequestItems(HttpServletRequest request) throws FileUploadException {
		
		if (request == null) {
			throw new NullPointerException("illegal request");
		}
		
		final DiskFileItemFactory factory = new DiskFileItemFactory();
		final ServletFileUpload upload = new ServletFileUpload(factory);
		final List<FileItem> items = upload.parseRequest(request);

		return items;
		
	}

}
