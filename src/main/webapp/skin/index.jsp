<%

String[] parts = request.getRequestURI().substring(request.getContextPath().length()+1).split("/");
if (parts.length<2) {throw new Exception("No skin provided.");}
String skin = parts[1];
String location = "skin/"+skin+"/index.jsp";

%><jsp:include page="<%=location%>" flush="true"/>