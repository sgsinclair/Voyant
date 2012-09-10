<%


String skin = request.getParameter("skin");
if (skin==null) skin = "notebook";

%>
<%= skin %>
<jsp:forward page='<%= "skins/"+skin+"/"+skin+"_skin.jsp" %>' />
