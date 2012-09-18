package org.apache.jsp.skins.tool;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.jsp.*;

public final class tool_005fskin_jsp extends org.apache.jasper.runtime.HttpJspBase
    implements org.apache.jasper.runtime.JspSourceDependent {

  private static final JspFactory _jspxFactory = JspFactory.getDefaultFactory();

  private static java.util.List _jspx_dependants;

  static {
    _jspx_dependants = new java.util.ArrayList(2);
    _jspx_dependants.add("/skins/tool/../shared/assets.jsp");
    _jspx_dependants.add("/skins/tool/../shared/post_skin_head.jsp");
  }

  private javax.el.ExpressionFactory _el_expressionfactory;
  private org.apache.AnnotationProcessor _jsp_annotationprocessor;

  public Object getDependants() {
    return _jspx_dependants;
  }

  public void _jspInit() {
    _el_expressionfactory = _jspxFactory.getJspApplicationContext(getServletConfig().getServletContext()).getExpressionFactory();
    _jsp_annotationprocessor = (org.apache.AnnotationProcessor) getServletConfig().getServletContext().getAttribute(org.apache.AnnotationProcessor.class.getName());
  }

  public void _jspDestroy() {
  }

  public void _jspService(HttpServletRequest request, HttpServletResponse response)
        throws java.io.IOException, ServletException {

    PageContext pageContext = null;
    HttpSession session = null;
    ServletContext application = null;
    ServletConfig config = null;
    JspWriter out = null;
    Object page = this;
    JspWriter _jspx_out = null;
    PageContext _jspx_page_context = null;


    try {
      response.setContentType("text/html;charset=UTF-8");
      pageContext = _jspxFactory.getPageContext(this, request, response,
      			null, true, 8192, true);
      _jspx_page_context = pageContext;
      application = pageContext.getServletContext();
      config = pageContext.getServletConfig();
      session = pageContext.getSession();
      out = pageContext.getOut();
      _jspx_out = out;

      out.write('\n');

String[] parts = request.getRequestURI().substring(request.getContextPath().length()+1).split("/");
if (parts.length<2) {throw new Exception("No tool provided.");}
String tool = parts[1];

      out.write("\n");
      out.write("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">\n");
      out.write("<html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\" lang=\"en\">\n");
      out.write("\t<head>\n");
      out.write("\t\t<title>Voyant Tools: Reveal Your Texts</title>\n");
      out.write("\t\t<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n");
      out.write("\n");
      out.write("\t\t");
      out.write('	');
      out.write('	');
 String base = request.getContextPath(); 
      out.write("\n");
      out.write("\n");
      out.write("\t\t<!-- EXTJS -->\n");
      out.write("\t\t<link href='");
      out.print( base );
      out.write("/resources/lib/extjs-4.1.1/resources/css/ext-all.css' type='text/css' rel='stylesheet' />\n");
      out.write("\t\t<script type='text/javascript' src='");
      out.print( base );
      out.write("/resources/lib/extjs-4.1.1/ext-all-debug.js'></script>\n");
      out.write("\n");
      out.write("\n");
      out.write("\t\t<script type='text/javascript'>\n");
      out.write("\t\t\tExt.onReady(function() {\n");
      out.write("\t\t\t\tinitTool('");
      out.print( tool );
      out.write("');\n");
      out.write("\t\t\t});\n");
      out.write("\t\t</script>\n");
      out.write("\t\t\n");
      out.write("\t\t<!-- SKIN RESOURCES -->\n");
      out.write("\t\t<script type='text/javascript' src='../skins/tool/tool_skin.js'></script>\n");
      out.write("\n");
      out.write("\t</head>\n");
      out.write("\t<body>\n");
 if (!request.getServerName().equals("localhost")) { 
      out.write("\n");
      out.write("<script type=\"text/javascript\">\n");
      out.write("var gaJsHost = ((\"https:\" == document.location.protocol) ? \"https://ssl.\" : \"http://www.\");\n");
      out.write("document.write(unescape(\"%3Cscript src='\" + gaJsHost + \"google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E\"));\n");
      out.write("</script>\n");
      out.write("<script type=\"text/javascript\">\n");
      out.write("try {\n");
      out.write("var pageTracker = _gat._getTracker(\"UA-957935-3\");\n");
      out.write("pageTracker._trackPageview();\n");
      out.write("} catch(err) {}</script>\n");
 } 
      out.write("\n");
      out.write("\t</body>\n");
      out.write("</html>\n");
    } catch (Throwable t) {
      if (!(t instanceof SkipPageException)){
        out = _jspx_out;
        if (out != null && out.getBufferSize() != 0)
          try { out.clearBuffer(); } catch (java.io.IOException e) {}
        if (_jspx_page_context != null) _jspx_page_context.handlePageException(t);
      }
    } finally {
      _jspxFactory.releasePageContext(_jspx_page_context);
    }
  }
}
