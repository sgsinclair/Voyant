/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.plugins.add( 'stopediting', {
	// jscs:disable maximumLineLength
	lang: 'en,fr', // %REMOVE_LINE_CORE%
	// jscs:enable maximumLineLength
	icons: 'stopediting', // %REMOVE_LINE_CORE%
	hidpi: true, // %REMOVE_LINE_CORE%

	init: function( editor ) {
		// Register the "source" command, which simply opens the "source" dialog.
		editor.addCommand( 'stopediting', {
			exec: function( editor ) {
				editor.fire("blur");
			} 
		});

		// Register the "source" dialog.
//		CKEDITOR.dialog.add( 'stopediting', this.path + 'dialogs/sourcedialog.js' );

		// If the toolbar is available, create the "Source" button.
		if ( editor.ui.addButton ) {
			editor.ui.addButton( 'Stopediting', {
				label: editor.lang.stopediting.toolbar,
				command: 'stopediting',
				toolbar: 'mode,10'
			} );
		}
	}
} );
