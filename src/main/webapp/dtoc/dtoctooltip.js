/**
 * Adds functionality such that the tip will persist if its target is clicked.
 */
Ext.define('Ext.ux.DToCToolTip', {
	extend: 'Ext.ToolTip',
	
	dismissDelay: 0,
	autoHide: true,
	closable: true,
	
	targetClicked: false, // has the user clicked the target?
	
	initTarget : function(target){
        var t;
        if((t = Ext.get(target))){
            if(this.target){
                var tg = Ext.get(this.target);
                this.mun(tg, 'mouseover', this.onTargetOver, this);
                this.mun(tg, 'mouseout', this.onTargetOut, this);
                this.mun(tg, 'mousemove', this.onMouseMove, this);
                this.mun(tg, 'click', this.onClick, this);
            }
            this.mon(t, {
                mouseover: this.onTargetOver,
                mouseout: this.onTargetOut,
                mousemove: this.onMouseMove,
                click: this.onClick,
                scope: this
            });
            this.target = t;
        }
        if(this.anchor){
            this.anchorTarget = this.target;
        }
    },
    
    onClick : function(e) {
    	this.showCloseButton();
    },
    
    showCloseButton: function() {
    	this.getTool('close').show();
    	this.targetClicked = true;
    },
    
    onMouseMove : function(e){
        var t = this.delegate ? e.getTarget(this.delegate) : this.triggerElement = true;
        if (t) {
            this.targetXY = e.getXY();
            if (t === this.triggerElement) {
                if(!this.hidden && this.trackMouse){
                    this.setPagePosition(this.getTargetXY());
                }
            } else if (this.targetClicked !== true) {
                this.hide();
                this.lastActive = new Date(0);
                this.onTargetOver(e);
            }
        } else if (this.targetClicked !== true && !this.closable && this.isVisible()) {
            this.hide();
        }
    },

    onTargetOver : function(e){
        if(this.disabled || e.within(this.target.dom, true)){
            return;
        }
        var t = e.getTarget(this.delegate);
        if (t && this.hidden) {
        	this.targetClicked = false;
            this.triggerElement = t;
            this.clearTimer('hide');
            this.targetXY = e.getXY();
            this.delayShow();
        }
    },
    
    onTargetOut : function(e){
        if(this.disabled || e.within(this.target.dom, true)){
            return;
        }
        this.clearTimer('show');
        if(this.targetClicked !== true){
            this.delayHide();
        }
    },
    
    onShow : function(){
        Ext.ToolTip.superclass.onShow.call(this);
        Ext.getDoc().on('mousedown', this.onDocMouseDown, this);
        this.getTool('close').hide();
    }

	
});