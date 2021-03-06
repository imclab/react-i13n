/**
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
/*global window, require */
'use strict';

var React = require('react/addons');

var MsgMixin = require('./MessageMixin');

if (typeof window !== 'undefined') {
    require('./scroll');
    require('./visibility');
}

/* Viewport mixin assumes you are on browser and already have the scroll lib */
var Viewport = {
    mixins: [MsgMixin],

    propTypes: {
        viewport: React.PropTypes.shape({
            margins: React.PropTypes.shape({
                usePercent: React.PropTypes.bool,
                top: React.PropTypes.number,
                bottom: React.PropTypes.number
            })
        })
    },

    enterViewportCallback: null,

    exitViewportCallback: null,

    _detectElement: function (i13nNode, enterViewportCallback, exitViewportCallback) {
        
        var element = i13nNode && i13nNode.getDOMNode();
        if (!element) {
            return;
        }
        var rect = element.getBoundingClientRect();
        var viewportMargins = this.props.viewport.margins;
        var margins;
        if (viewportMargins.usePercent) {
            margins = {
                top: viewportMargins.top * window.innerHeight,
                bottom: viewportMargins.bottom * window.innerHeight
            };
        } else {
            margins = viewportMargins;
        }
        
        // Detect Screen Bottom                           // Detect Screen Top
        if ((rect.top < window.innerHeight + margins.top) && (rect.bottom > 0  - margins.bottom)) {
            if (!i13nNode.isInViewport()) {
                enterViewportCallback && enterViewportCallback();
                i13nNode.setIsInViewport(true);
            }
        } else {
            if (i13nNode.isInViewport()) {
                exitViewportCallback && exitViewportCallback();
                i13nNode.setIsInViewport(false);
            }
        }
    },

    _detectViewport: function () {
        var self = this;
        if (!self.isMounted()) {
            return;
        }
        self._detectElement(self._i13nNode, self.enterViewportCallback, self.exitViewportCallback);
        self._subComponentsViewportDetection && self._subComponentsViewportDetection();
    },

    _detectHidden: function (hidden) {
        var self = this;
        if (!hidden) {
            this._detectViewport();
        } else {
            self.exitViewportCallback && self.exitViewportCallback();
            self.isOnViewport = false;
        }
    },

    getDefaultProps: function () {
        return {
            viewport: {
                margins: {
                    usePercent: false,
                    top: 20,
                    bottom: 20
                }
            }
        };
    },

    subscribeViewportEvents: function () {
        this.subscribe('scroll', this._detectViewport);
        this.subscribe('visibilitychange', this._detectHidden);
    },

    unsubscribeViewportEvents: function () {
        this.unsubscribe('scroll');
        this.unsubscribe('visibilitychange');
    },

    onEnterViewport: function (callback) {
        this.enterViewportCallback = callback;
    },

    onExitViewport: function (callback) {
        this.exitViewportCallback = callback;
    }
};

module.exports = Viewport;
