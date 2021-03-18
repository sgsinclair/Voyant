<%
String base_js = (String) request.getAttribute("base");
String lang_js = (String) request.getAttribute("lang");
String rtl_js = (String) request.getAttribute("rtl");
%>

<!-- EXTJS CLASSIC -->
<script type="text/javascript" src="<%= base_js %>/resources/ext/6.2.0/ext-all<%= rtl_js %>.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/ext/6.2.0/charts.js"></script>

<script type="text/javascript" src="<%= base_js %>/resources/ext/6.2.0/theme-crisp/theme-crisp.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/ext/6.2.0/ux.js"></script>

<!-- jQuery -->
<script type="text/javascript" src="<%= base_js %>/resources/jquery/current/jquery.min.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/jquery/current/jquery-ui.min.js"></script>

<!-- D3 -->
<script type="text/javascript" src="<%= base_js %>/resources/d3/current/d3.min.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/d3/fisheye.js"></script>
<script type="text/javascript" src="<%= base_js %>/resources/cirrus/html5/d3.layout.cloud.js"></script>

<!-- vis.js -->
<script type="text/javascript" src="<%= base_js %>/resources/visjs/vis.min.js"></script>

<!-- ACE Editor (used by Spyral and the widget.codeeditor -->
<script src="<%= base_js %>/resources/ace/1.4.12/src-min-noconflict/ace.js"></script>

<!-- spectrum -->
<script type="text/javascript" src="<%=base_js %>/resources/spectrum/spectrum.js"></script>

<!-- spyral -->
<script type="text/javascript" src="<%= base_js %>/resources/spyral/build/spyral.js"></script>

<script type="text/javascript" src="<%= base_js %>/resources/voyant/current/voyant<%= (request.getParameter("debug")!=null ? ".jsp?debug=true" : ".min.js") %>"></script>
<script type="text/javascript" src="<%= base_js %>/resources/voyant/current/voyant-locale-<%= lang_js %>.js"></script>