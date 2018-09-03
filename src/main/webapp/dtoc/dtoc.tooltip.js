/**
 * Adds functionality such that the tip will persist if its target is clicked.
 */
Ext.define('Ext.ux.DToCToolTip', {
	extend: 'Ext.ToolTip',
	
	dismissDelay: 1500,
	autoHide: true,
	closable: true,
	
    targetClicked: false, // has the user clicked the target?
    
    offsetX: 15,
    offsetY: 15,
    
    // overwritten
    // need to use dom addEventListener method because of iframes
    setTarget: function(target) {
        var me = this;
        var listeners = {
            mouseover: 'onTargetOver',
            mouseout: 'onTargetOut',
            mousemove: 'onMouseMove',
            click: 'onClick'
        };

        // for (var eventname in me.targetListeners) {
        //     target.dom.removeEventListener(eventname, me[me.targetListeners[eventname]]);
        // }
        // me.targetListeners = null;

        if (target) {
            for (var eventname in listeners) {
                var fn = me[listeners[eventname]];
                target.dom.addEventListener(eventname, fn.bind(me))
            }

            // if (me.config.listeners) {
            //     var scope = me.config.listeners.scope;
            //     for (var eventname in me.config.listeners) {
            //         var fn = me.config.listeners[eventname];
            //         if (Ext.isFunction(fn)) {
            //             target.dom
            //         }
            //     }
            // }

            me.targetListeners = listeners;
        }
    },

	// overwritten
	// setTarget: function(target) {
	// 	var me = this, listeners;

	//     if (me.targetListeners) {
	//         me.targetListeners.destroy();
	//     }
	
	//     if (target) {
    //         console.log('tooltip target', target)
	//         me.target = target = Ext.get(target.el || target);
	//         listeners = {
	//             mouseover: 'onTargetOver',
	//             mouseout: 'onTargetOut',
	//             mousemove: 'onMouseMove',
	//             tap: 'onTargetTap',
	//             click: 'onClick',
	//             scope: me,
	//             destroyable: true
	//         };
	
	//         me.targetListeners = target.on(listeners);
	//     } else {
	//         me.target = null;
	//     }
    // },
    
    getTool: function(type) {
    	for (var i = 0; i < this.tools.length; i++) {
    		var tool = this.tools[i];
    		if (tool.type == type) {
    			return tool;
    		}
    	}
    },
    
    onClick: function(e) {
    	this.stayOpen();
    },
    
    stayOpen: function() {
    	this.getTool('close').show();
    	this.dismissDelay = 0;
    	this.autoHide = false;
    	this.clearTimer('dismiss');
    	this.targetClicked = true;
    },
    
    onMouseMove: function(e) {
        var me = this,
            dismissDelay = me.dismissDelay;
 
        // Always update pointerEvent, so that if there's a delayed show 
        // scheduled, it gets the latest pointer to align to. 
        me.pointerEvent = e;
        if (me.isVisible() && me.currentTarget.contains(e.target)) {
            // If they move the mouse, restart the dismiss delay 
            if (me.targetClicked !== true && dismissDelay && me.autoHide !== false) {
                me.clearTimer('dismiss');
                me.dismissTimer = Ext.defer(me.hide, dismissDelay, me);
            }
 
            if (me.trackMouse)  {
               me.doAlignment(me.getAlignRegion());
            }
        }
    },
    
    onTargetOver: function(e) {
        var me = this,
            myTarget = me.target,
            currentTarget = me.currentTarget,
            myListeners = me.hasListeners,
            newTarget;

        if (me.disabled) {
            return;
        }

        // Moved from outside the target 
        if (!myTarget.contains(e.relatedTarget)) {
            newTarget = myTarget.dom;
        }
        // Moving inside the target 
        else {
            return;
        }

        // If pointer entered the target or a delegate child, then show. 
        if (newTarget) {
            // If users need to see show events on target change, we must hide. 
            if ((myListeners.beforeshow || myListeners.show) && me.isVisible()) {
                me.hide();
            }

            me.targetClicked = false; // custom

            me.pointerEvent = new Ext.event.Event(e);
            currentTarget.attach(newTarget);
            
            me.show();

            var iframeBox = Ext.fly(window.document.querySelector('iframe')).getBox();
            var targetBox = Ext.fly(newTarget).getBox();
            if (iframeBox.x + targetBox.x + me.offsetX + me.getWidth() > window.innerWidth) {
                me.setX(iframeBox.x + targetBox.x - (me.offsetX + me.getWidth()));
            } else {
                me.setX(iframeBox.x + targetBox.x + me.offsetX);
            }
            if (iframeBox.y + targetBox.y + me.offsetY + me.getHeight() > window.innerHeight) {
                me.setY(iframeBox.y + targetBox.y - (me.offsetY + me.getHeight()));
            } else {
                me.setY(iframeBox.y + targetBox.y + me.offsetY);
            }
        }
        // If over a non-delegate child, behave as in target out 
        else if (currentTarget.dom) {
            me.handleTargetOut();
        }
    },
    
    onTargetOut: function(e) {
        // We have exited the current target 
        if (this.targetClicked !== true && this.currentTarget.dom && !this.currentTarget.contains(e.relatedTarget)) {
            this.handleTargetOut();
        }
    },
    
    onShow: function() {
        var me = this;
        me.dismissDelay = 1500;
        me.autoHide = true;
        me.callParent();
        me.mon(Ext.getDoc(), 'mousedown', me.onDocMouseDown, me);
        me.getTool('close').hide();
    }	
});