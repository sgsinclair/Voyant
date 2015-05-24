/**
 * Adds functionality such that the tip will persist if its target is clicked.
 */
Ext.define('Ext.ux.DToCToolTip', {
	extend: 'Ext.ToolTip',
	
	dismissDelay: 0,
	autoHide: true,
	closable: true,
	
	targetClicked: false, // has the user clicked the target?
	
	// overwritten
	setTarget: function(target) {
        var me = this,
            t = Ext.get(target),
            tg;

        if (me.target) {
            tg = Ext.get(me.target);
            if (Ext.supports.Touch) {
                me.mun(tg, 'tap', me.onTargetOver, me);
            } else {
                me.mun(tg, {
                    mouseover: me.onTargetOver,
                    mouseout: me.onTargetOut,
                    mousemove: me.onMouseMove,
                    click: me.onClick,
                    scope: me
                });
            }
        }

        me.target = t;
        if (t) {
            if (Ext.supports.Touch) {
                me.mon(t, {
                    tap: me.onTargetOver,
                    scope: me
                });
            } else {
                me.mon(t, {
                    mouseover: me.onTargetOver,
                    mouseout: me.onTargetOut,
                    mousemove: me.onMouseMove,
                    click: me.onClick,
                    scope: me
                });
            }
        }
        if (me.anchor) {
            me.anchorTarget = me.target;
        }
    },
    
    getTool: function(type) {
    	for (var i = 0; i < this.tools.length; i++) {
    		var tool = this.tools[i];
    		if (tool.type == type) {
    			return tool;
    		}
    	}
    },
    
    onClick: function(e) {
    	this.showCloseButton();
    },
    
    showCloseButton: function() {
    	this.getTool('close').show();
    	this.targetClicked = true;
    },
    
    onMouseMove: function(e) {
        var me = this,
            t,
            xy;

        // If the event target is no longer in this tip's target (possibly due to rapidly churning content in target), ignore it.
        if (!me.target || me.target.contains(e.target)) {
            t = me.delegate ? e.getTarget(me.delegate) : me.triggerElement = true;
            if (t) {
                me.targetXY = e.getXY();
                if (t === me.triggerElement) {
                    if (!me.hidden && me.trackMouse) {
                        xy = me.getTargetXY();
                        if (me.constrainPosition) {
                            xy = me.el.adjustForConstraints(xy, me.el.parent());
                        }
                        me.setPagePosition(xy);
                    }
                } else if (me.targetClicked !== true) {
                    me.hide();
                    me.lastActive = new Date(0);
                    me.onTargetOver(e);
                }
            } else if (me.targetClicked !== true && (!me.closable && me.isVisible()) && me.autoHide !== false) {
                me.delayHide();
            }
        }
    },

    onTargetOver: function(e) {
        var me = this,
            delegate = me.delegate,
            t;

        if (me.disabled || e.within(me.target.dom, true)) {
            return;
        }
        t = delegate ? e.getTarget(delegate) : true;
        if (t && me.hidden) {
        	me.targetClicked = false;
            me.triggerElement = t;
            me.triggerEvent = e;
            me.clearTimer('hide');
            me.targetXY = e.getXY();
            me.delayShow();
        }
    },
    
    onTargetOut: function(e) {
        var me = this,
            triggerEl = me.triggerElement,
            // If we don't have a delegate, then the target is set
            // to true, so set it to the main target.
            target = triggerEl === true ? me.target : triggerEl;

        // If disabled, moving within the current target, ignore the mouseout
        // e.within is the only correct way to determine this.
        if (me.disabled || !triggerEl || e.within(target, true)) {
            return;
        }
        if (me.showTimer) {
            me.clearTimer('show');
            me.triggerElement = null;
        }
        if (me.targetClicked !== true) {
            me.delayHide();
        }
    },
    
    onShow: function() {
        var me = this;
        me.callParent();
        me.mon(Ext.getDoc(), 'mousedown', me.onDocMouseDown, me);
        me.getTool('close').hide();
    }	
});