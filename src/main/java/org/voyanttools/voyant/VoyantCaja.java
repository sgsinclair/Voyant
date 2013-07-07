// adapted from https://gist.github.com/437660

package org.voyanttools.voyant;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringReader;

import org.apache.commons.io.FileUtils;

import com.google.caja.lexer.FetchedData;
import com.google.caja.lexer.InputSource;
import com.google.caja.reporting.BuildInfo;
import com.google.caja.reporting.EchoingMessageQueue;
import com.google.caja.reporting.MessageContext;
import com.google.caja.service.ContentHandlerArgs;
import com.google.caja.service.JsHandler;
import com.google.caja.service.StrictContentTypeCheck;
import com.google.caja.service.UnsupportedContentTypeException;
import com.google.caja.util.ContentType;

public class VoyantCaja {
	
	public static String sanitize(String jsString, String charsetName) {
        final EchoingMessageQueue mq = new EchoingMessageQueue(new PrintWriter(System.out), new MessageContext(), false);
        BuildInfo.getInstance().addBuildInfo(mq);

        String safeJs = null;
        try {
        	safeJs = cajoleJs(jsString, charsetName, mq);
        } catch (final Exception e) {
            
        }

        return safeJs;
    }

    private static String cajoleJs(String jsString, String charsetName, final EchoingMessageQueue mq) throws IOException, UnsupportedContentTypeException {
        final InputSource inputSource = InputSource.UNKNOWN;
        final String contentType = ContentType.JS.mimeType;

        final FetchedData in = FetchedData.fromReader(new StringReader(jsString), inputSource, contentType, charsetName);
        final JsHandler jsHandler = new JsHandler(BuildInfo.getInstance());

        final ByteArrayOutputStream out = new ByteArrayOutputStream();
        jsHandler.apply(
                inputSource.getUri(),
                null,//Transform.CAJOLE,
                null,//Lists.newArrayList(Directive.CAJITA),
                new NullContentHandlerArgs(),
                contentType, new StrictContentTypeCheck(),
                in, out,
                mq);
        return out.toString(charsetName);
    }
    
    public static void main(String[] args) throws IOException {
        System.out.println(sanitize("2 + 2;", "ISO-8859-1"));
        System.out.println(sanitize(FileUtils.readFileToString(new File("C:/Users/Andrew/git/Voyant/src/main/webapp/resources/app/Application.js")), "ISO-8859-1"));
    }
    
    /** 
     * HtmlHandler only uses it to check arg MODULE_CALLBACK, which we don't care about. Each time this code is maintained, please make sure HtmlHandler didn't start using more args.
     */
    protected static class NullContentHandlerArgs extends ContentHandlerArgs {
        @Override
        public String get(String name) {
            return null;
        }
    }
	
}
