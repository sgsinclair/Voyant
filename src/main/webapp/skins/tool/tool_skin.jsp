<%@ page contentType="text/html;charset=UTF-8" %>
<%
String[] parts = request.getRequestURI().substring(request.getContextPath().length()+1).split("/");
if (parts.length<2) {throw new Exception("No tool provided.");}
String tool = parts[1];
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<title>Voyant Tools: Reveal Your Texts</title>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

		<%@ include file="../shared/assets.jsp" %>

		<script type='text/javascript'>
		var Voyant = {};
		Voyant.TROMBONE_URL = "http://localhost:8080/voyant/trombone"

		Ext.Loader.setConfig({
//			disableCaching: false,
			enabled: true,
			paths: {
				'Voyant': '../../resources/app'
			}
		});
		Ext.require('Voyant.Application');
		Ext.require('Voyant.utils.Show');
		Ext.require('Voyant.utils.DeferredManager');
		Ext.require('Voyant.utils.Documenter');
		//Ext.require('Voyant.utils.Localization');

				Ext.onReady(function() {
					Voyant.application = Ext.create('Voyant.Application', {
						// ext specific properties
						name: 'Voyant',
						appFolder: 'resources/app',
						session: Ext.data.IdGenerator.get('uuid').generate(),
						
						launch: function(profile) {
							widget = this.getApplication().getWidget(widget);
							config = config || {};
							Ext.applyIf(config, {renderTo: this.getRenderTo(), store: this, width: 400, height: 400})
							if (widget) {Ext.create(widget, config)}

							debugger
/* 							Ext.create('Ext.container.Viewport', {
								layout: 'fit',
								items: toolConfig
							});
 */						}
					})
				});
		
		</script>
		
<%@ include file="../shared/post_skin_head.jsp" %>