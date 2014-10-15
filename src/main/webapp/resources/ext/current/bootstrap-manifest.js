var Ext = Ext || { }; Ext.manifest = {
  "paths": {
    "Ext": "src",
    "Ext-more": "overrides/Ext-more.js",
    "Ext.AbstractManager": "packages/sencha-core/src/AbstractManager.js",
    "Ext.Ajax": "packages/sencha-core/src/Ajax.js",
    "Ext.AnimationQueue": "packages/sencha-core/src/AnimationQueue.js",
    "Ext.Array": "packages/sencha-core/src/lang/Array.js",
    "Ext.Assert": "packages/sencha-core/src/lang/Assert.js",
    "Ext.Base": "packages/sencha-core/src/class/Base.js",
    "Ext.Class": "packages/sencha-core/src/class/Class.js",
    "Ext.ClassManager": "packages/sencha-core/src/class/ClassManager.js",
    "Ext.ComponentManager": "packages/sencha-core/src/ComponentManager.js",
    "Ext.ComponentQuery": "packages/sencha-core/src/ComponentQuery.js",
    "Ext.Config": "packages/sencha-core/src/class/Config.js",
    "Ext.Configurator": "packages/sencha-core/src/class/Configurator.js",
    "Ext.Date": "packages/sencha-core/src/lang/Date.js",
    "Ext.Error": "packages/sencha-core/src/lang/Error.js",
    "Ext.Evented": "packages/sencha-core/src/Evented.js",
    "Ext.Factory": "packages/sencha-core/src/mixin/Factoryable.js",
    "Ext.Function": "packages/sencha-core/src/lang/Function.js",
    "Ext.GlobalEvents": "packages/sencha-core/src/GlobalEvents.js",
    "Ext.Inventory": "packages/sencha-core/src/class/Inventory.js",
    "Ext.JSON": "packages/sencha-core/src/JSON.js",
    "Ext.Loader": "packages/sencha-core/src/class/Loader.js",
    "Ext.Mixin": "packages/sencha-core/src/class/Mixin.js",
    "Ext.Msg": "src/window/MessageBox.js",
    "Ext.Number": "packages/sencha-core/src/lang/Number.js",
    "Ext.Object": "packages/sencha-core/src/lang/Object.js",
    "Ext.Script": "packages/sencha-core/src/class/Inventory.js",
    "Ext.String": "packages/sencha-core/src/lang/String.js",
    "Ext.String.format": "packages/sencha-core/src/Template.js",
    "Ext.TaskQueue": "packages/sencha-core/src/TaskQueue.js",
    "Ext.Template": "packages/sencha-core/src/Template.js",
    "Ext.Util": "packages/sencha-core/src/Util.js",
    "Ext.Version": "packages/sencha-core/src/util/Version.js",
    "Ext.Widget": "packages/sencha-core/src/Widget.js",
    "Ext.XTemplate": "packages/sencha-core/src/XTemplate.js",
    "Ext.app.ViewModel": "packages/sencha-core/src/app/ViewModel.js",
    "Ext.app.bind": "packages/sencha-core/src/app/bind",
    "Ext.browser": "packages/sencha-core/src/env/Browser.js",
    "Ext.class": "packages/sencha-core/src/class",
    "Ext.data": "packages/sencha-core/src/data",
    "Ext.direct": "packages/sencha-core/src/direct",
    "Ext.dom": "packages/sencha-core/src/dom",
    "Ext.dom.ButtonElement": "src/dom/ButtonElement.js",
    "Ext.dom.Layer": "src/dom/Layer.js",
    "Ext.env": "packages/sencha-core/src/env",
    "Ext.event": "packages/sencha-core/src/event",
    "Ext.feature": "packages/sencha-core/src/env/Feature.js",
    "Ext.fx.Animation": "packages/sencha-core/src/fx/Animation.js",
    "Ext.fx.Runner": "packages/sencha-core/src/fx/Runner.js",
    "Ext.fx.State": "packages/sencha-core/src/fx/State.js",
    "Ext.fx.animation": "packages/sencha-core/src/fx/animation",
    "Ext.fx.easing": "packages/sencha-core/src/fx/easing",
    "Ext.fx.layout": "packages/sencha-core/src/fx/layout",
    "Ext.fx.runner": "packages/sencha-core/src/fx/runner",
    "Ext.lang": "packages/sencha-core/src/lang",
    "Ext.mixin": "packages/sencha-core/src/mixin",
    "Ext.os": "packages/sencha-core/src/env/OS.js",
    "Ext.overrides": "overrides",
    "Ext.overrides.util.Positionable": "overrides/Positionable.js",
    "Ext.perf": "packages/sencha-core/src/perf",
    "Ext.scroll": "packages/sencha-core/src/scroll",
    "Ext.scroll.Indicator": "src/scroll/Indicator.js",
    "Ext.scroll.Manager": "src/scroll/Manager.js",
    "Ext.supports": "packages/sencha-core/src/env/Feature.js",
    "Ext.util": "packages/sencha-core/src/util",
    "Ext.util.Animate": "src/util/Animate.js",
    "Ext.util.CSS": "src/util/CSS.js",
    "Ext.util.ClickRepeater": "src/util/ClickRepeater.js",
    "Ext.util.ComponentDragger": "src/util/ComponentDragger.js",
    "Ext.util.Cookies": "src/util/Cookies.js",
    "Ext.util.ElementContainer": "src/util/ElementContainer.js",
    "Ext.util.Floating": "src/util/Floating.js",
    "Ext.util.Focusable": "src/util/Focusable.js",
    "Ext.util.FocusableContainer": "src/util/FocusableContainer.js",
    "Ext.util.Format.format": "packages/sencha-core/src/Template.js",
    "Ext.util.History": "src/util/History.js",
    "Ext.util.KeyMap": "src/util/KeyMap.js",
    "Ext.util.KeyNav": "src/util/KeyNav.js",
    "Ext.util.Memento": "src/util/Memento.js",
    "Ext.util.ProtoElement": "src/util/ProtoElement.js",
    "Ext.util.Queue": "src/util/Queue.js",
    "Ext.util.Renderable": "src/util/Renderable.js",
    "Ext.util.StoreHolder": "src/util/StoreHolder.js"
  },
  "loadOrder": [
    {
      "path": "packages/sencha-core/src/event/ListenerStack.js",
      "requires": [],
      "uses": [],
      "idx": 0
    },
    {
      "path": "packages/sencha-core/src/event/Controller.js",
      "requires": [],
      "uses": [],
      "idx": 1
    },
    {
      "path": "packages/sencha-core/src/event/Dispatcher.js",
      "requires": [
        0,
        1
      ],
      "uses": [],
      "idx": 2
    },
    {
      "path": "packages/sencha-core/src/class/Mixin.js",
      "requires": [],
      "uses": [],
      "idx": 3
    },
    {
      "path": "packages/sencha-core/src/mixin/Identifiable.js",
      "requires": [],
      "uses": [],
      "idx": 4
    },
    {
      "path": "packages/sencha-core/src/mixin/Observable.js",
      "requires": [
        2,
        3,
        4
      ],
      "uses": [],
      "idx": 5
    },
    {
      "path": "packages/sencha-core/src/util/HashMap.js",
      "requires": [
        5
      ],
      "uses": [],
      "idx": 6
    },
    {
      "path": "packages/sencha-core/src/AbstractManager.js",
      "requires": [
        6
      ],
      "uses": [],
      "idx": 7
    },
    {
      "path": "packages/sencha-core/src/data/flash/BinaryXhr.js",
      "requires": [],
      "uses": [
        51
      ],
      "idx": 8
    },
    {
      "path": "packages/sencha-core/src/data/Connection.js",
      "requires": [
        5,
        8
      ],
      "uses": [
        19,
        51
      ],
      "idx": 9
    },
    {
      "path": "packages/sencha-core/src/Ajax.js",
      "requires": [
        9
      ],
      "uses": [],
      "idx": 10
    },
    {
      "path": "packages/sencha-core/src/AnimationQueue.js",
      "requires": [],
      "uses": [],
      "idx": 11
    },
    {
      "path": "packages/sencha-core/src/ComponentManager.js",
      "requires": [],
      "uses": [],
      "idx": 12
    },
    {
      "path": "packages/sencha-core/src/util/Operators.js",
      "requires": [],
      "uses": [],
      "idx": 13
    },
    {
      "path": "packages/sencha-core/src/util/LruCache.js",
      "requires": [
        6
      ],
      "uses": [],
      "idx": 14
    },
    {
      "path": "packages/sencha-core/src/ComponentQuery.js",
      "requires": [
        12,
        13,
        14
      ],
      "uses": [
        56
      ],
      "idx": 15
    },
    {
      "path": "packages/sencha-core/src/Evented.js",
      "requires": [
        5
      ],
      "uses": [],
      "idx": 16
    },
    {
      "path": "packages/sencha-core/src/util/Positionable.js",
      "requires": [
        18
      ],
      "uses": [
        19,
        87
      ],
      "idx": 17
    },
    {
      "path": "overrides/Positionable.js",
      "requires": [],
      "uses": [],
      "idx": 18
    },
    {
      "path": "packages/sencha-core/src/dom/Element.js",
      "requires": [
        5,
        17,
        50
      ],
      "uses": [
        20,
        21,
        51,
        56,
        61,
        87,
        194
      ],
      "idx": 19
    },
    {
      "path": "packages/sencha-core/src/dom/Fly.js",
      "requires": [
        19
      ],
      "uses": [],
      "idx": 20
    },
    {
      "path": "packages/sencha-core/src/dom/CompositeElementLite.js",
      "requires": [
        20
      ],
      "uses": [
        19
      ],
      "idx": 21
    },
    {
      "path": "src/rtl/dom/Element.js",
      "requires": [
        21
      ],
      "uses": [
        19
      ],
      "idx": 22
    },
    {
      "path": "packages/sencha-core/src/util/Filter.js",
      "requires": [],
      "uses": [],
      "idx": 23
    },
    {
      "path": "packages/sencha-core/src/util/DelayedTask.js",
      "requires": [],
      "uses": [
        51
      ],
      "idx": 24
    },
    {
      "path": "packages/sencha-core/src/util/Event.js",
      "requires": [
        24
      ],
      "uses": [],
      "idx": 25
    },
    {
      "path": "packages/sencha-core/src/util/Observable.js",
      "requires": [
        25
      ],
      "uses": [],
      "idx": 26
    },
    {
      "path": "packages/sencha-core/src/util/AbstractMixedCollection.js",
      "requires": [
        23,
        26
      ],
      "uses": [],
      "idx": 27
    },
    {
      "path": "packages/sencha-core/src/util/Sorter.js",
      "requires": [],
      "uses": [],
      "idx": 28
    },
    {
      "path": "packages/sencha-core/src/util/Sortable.js",
      "requires": [
        28
      ],
      "uses": [
        30
      ],
      "idx": 29
    },
    {
      "path": "packages/sencha-core/src/util/MixedCollection.js",
      "requires": [
        27,
        29
      ],
      "uses": [],
      "idx": 30
    },
    {
      "path": "packages/sencha-core/src/util/TaskRunner.js",
      "requires": [],
      "uses": [
        51
      ],
      "idx": 31
    },
    {
      "path": "src/fx/target/Target.js",
      "requires": [],
      "uses": [],
      "idx": 32
    },
    {
      "path": "src/fx/target/Element.js",
      "requires": [
        32
      ],
      "uses": [],
      "idx": 33
    },
    {
      "path": "src/fx/target/ElementCSS.js",
      "requires": [
        33
      ],
      "uses": [],
      "idx": 34
    },
    {
      "path": "src/fx/target/CompositeElement.js",
      "requires": [
        33
      ],
      "uses": [],
      "idx": 35
    },
    {
      "path": "src/fx/target/CompositeElementCSS.js",
      "requires": [
        34,
        35
      ],
      "uses": [],
      "idx": 36
    },
    {
      "path": "src/fx/target/Sprite.js",
      "requires": [
        32
      ],
      "uses": [],
      "idx": 37
    },
    {
      "path": "src/fx/target/CompositeSprite.js",
      "requires": [
        37
      ],
      "uses": [],
      "idx": 38
    },
    {
      "path": "src/fx/target/Component.js",
      "requires": [
        32
      ],
      "uses": [
        51
      ],
      "idx": 39
    },
    {
      "path": "src/fx/Queue.js",
      "requires": [
        6
      ],
      "uses": [],
      "idx": 40
    },
    {
      "path": "src/fx/Manager.js",
      "requires": [
        30,
        31,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40
      ],
      "uses": [],
      "idx": 41
    },
    {
      "path": "src/fx/Animator.js",
      "requires": [
        26,
        41
      ],
      "uses": [
        47
      ],
      "idx": 42
    },
    {
      "path": "src/fx/CubicBezier.js",
      "requires": [],
      "uses": [],
      "idx": 43
    },
    {
      "path": "src/fx/Easing.js",
      "requires": [
        43
      ],
      "uses": [],
      "idx": 44
    },
    {
      "path": "src/fx/DrawPath.js",
      "requires": [],
      "uses": [],
      "idx": 45
    },
    {
      "path": "src/fx/PropertyHandler.js",
      "requires": [
        45
      ],
      "uses": [],
      "idx": 46
    },
    {
      "path": "src/fx/Anim.js",
      "requires": [
        26,
        41,
        42,
        43,
        44,
        46
      ],
      "uses": [],
      "idx": 47
    },
    {
      "path": "src/util/Animate.js",
      "requires": [
        41,
        47
      ],
      "uses": [],
      "idx": 48
    },
    {
      "path": "packages/sencha-core/src/dom/GarbageCollector.js",
      "requires": [],
      "uses": [],
      "idx": 49
    },
    {
      "path": "overrides/dom/Element.js",
      "requires": [
        19,
        20,
        21,
        48,
        49
      ],
      "uses": [
        41,
        42,
        47,
        56,
        194,
        296,
        307,
        364,
        366,
        423
      ],
      "idx": 50
    },
    {
      "path": "packages/sencha-core/src/GlobalEvents.js",
      "requires": [
        5,
        19,
        52
      ],
      "uses": [],
      "idx": 51
    },
    {
      "path": "overrides/GlobalEvents.js",
      "requires": [],
      "uses": [],
      "idx": 52
    },
    {
      "path": "packages/sencha-core/src/JSON.js",
      "requires": [],
      "uses": [],
      "idx": 53
    },
    {
      "path": "packages/sencha-core/src/TaskQueue.js",
      "requires": [
        11
      ],
      "uses": [],
      "idx": 54
    },
    {
      "path": "packages/sencha-core/src/util/Format.js",
      "requires": [],
      "uses": [
        56,
        194
      ],
      "idx": 55
    },
    {
      "path": "packages/sencha-core/src/Template.js",
      "requires": [
        55
      ],
      "uses": [
        194
      ],
      "idx": 56
    },
    {
      "path": "packages/sencha-core/src/mixin/Inheritable.js",
      "requires": [
        3
      ],
      "uses": [],
      "idx": 57
    },
    {
      "path": "packages/sencha-core/src/mixin/Bindable.js",
      "requires": [],
      "uses": [
        102
      ],
      "idx": 58
    },
    {
      "path": "packages/sencha-core/src/Widget.js",
      "requires": [
        16,
        57,
        58,
        98
      ],
      "uses": [
        12,
        15,
        19
      ],
      "idx": 59
    },
    {
      "path": "src/util/ProtoElement.js",
      "requires": [],
      "uses": [
        19,
        194
      ],
      "idx": 60
    },
    {
      "path": "packages/sencha-core/src/dom/CompositeElement.js",
      "requires": [
        21
      ],
      "uses": [],
      "idx": 61
    },
    {
      "path": "src/util/ElementContainer.js",
      "requires": [],
      "uses": [],
      "idx": 62
    },
    {
      "path": "src/util/Renderable.js",
      "requires": [
        19
      ],
      "uses": [
        71,
        101,
        194
      ],
      "idx": 63
    },
    {
      "path": "src/rtl/util/Renderable.js",
      "requires": [],
      "uses": [],
      "idx": 64
    },
    {
      "path": "src/state/Provider.js",
      "requires": [
        26
      ],
      "uses": [],
      "idx": 65
    },
    {
      "path": "src/state/Manager.js",
      "requires": [
        65
      ],
      "uses": [],
      "idx": 66
    },
    {
      "path": "src/state/Stateful.js",
      "requires": [
        66
      ],
      "uses": [
        31
      ],
      "idx": 67
    },
    {
      "path": "src/util/Floating.js",
      "requires": [],
      "uses": [
        19,
        51,
        302,
        485
      ],
      "idx": 68
    },
    {
      "path": "src/rtl/util/Floating.js",
      "requires": [],
      "uses": [],
      "idx": 69
    },
    {
      "path": "src/util/Focusable.js",
      "requires": [
        24
      ],
      "uses": [
        71
      ],
      "idx": 70
    },
    {
      "path": "src/Component.js",
      "requires": [
        12,
        15,
        17,
        26,
        48,
        51,
        57,
        58,
        60,
        61,
        62,
        63,
        67,
        68,
        70
      ],
      "uses": [
        18,
        19,
        24,
        41,
        50,
        52,
        91,
        93,
        95,
        97,
        98,
        101,
        123,
        194,
        195,
        297,
        298,
        299,
        302,
        312,
        314,
        383,
        457,
        485,
        593,
        605,
        611,
        613
      ],
      "idx": 71
    },
    {
      "path": "src/layout/container/border/Region.js",
      "requires": [],
      "uses": [],
      "idx": 72
    },
    {
      "path": "src/rtl/Component.js",
      "requires": [],
      "uses": [
        19
      ],
      "idx": 73
    },
    {
      "path": "packages/sencha-core/src/event/gesture/Recognizer.js",
      "requires": [
        4
      ],
      "uses": [],
      "idx": 74
    },
    {
      "path": "packages/sencha-core/src/event/gesture/SingleTouch.js",
      "requires": [
        74
      ],
      "uses": [],
      "idx": 75
    },
    {
      "path": "packages/sencha-core/src/event/gesture/DoubleTap.js",
      "requires": [
        75
      ],
      "uses": [],
      "idx": 76
    },
    {
      "path": "packages/sencha-core/src/event/gesture/Drag.js",
      "requires": [
        75
      ],
      "uses": [],
      "idx": 77
    },
    {
      "path": "packages/sencha-core/src/event/gesture/Swipe.js",
      "requires": [
        75
      ],
      "uses": [],
      "idx": 78
    },
    {
      "path": "packages/sencha-core/src/event/gesture/EdgeSwipe.js",
      "requires": [
        78
      ],
      "uses": [
        19
      ],
      "idx": 79
    },
    {
      "path": "packages/sencha-core/src/event/gesture/LongPress.js",
      "requires": [
        75
      ],
      "uses": [],
      "idx": 80
    },
    {
      "path": "packages/sencha-core/src/event/gesture/MultiTouch.js",
      "requires": [
        74
      ],
      "uses": [],
      "idx": 81
    },
    {
      "path": "packages/sencha-core/src/event/gesture/Pinch.js",
      "requires": [
        81
      ],
      "uses": [],
      "idx": 82
    },
    {
      "path": "packages/sencha-core/src/event/gesture/Rotate.js",
      "requires": [
        81
      ],
      "uses": [],
      "idx": 83
    },
    {
      "path": "packages/sencha-core/src/event/gesture/Tap.js",
      "requires": [
        75
      ],
      "uses": [],
      "idx": 84
    },
    {
      "path": "packages/sencha-core/src/event/publisher/Publisher.js",
      "requires": [],
      "uses": [],
      "idx": 85
    },
    {
      "path": "packages/sencha-core/src/util/Offset.js",
      "requires": [],
      "uses": [],
      "idx": 86
    },
    {
      "path": "packages/sencha-core/src/util/Region.js",
      "requires": [
        86
      ],
      "uses": [],
      "idx": 87
    },
    {
      "path": "packages/sencha-core/src/util/Point.js",
      "requires": [
        87
      ],
      "uses": [],
      "idx": 88
    },
    {
      "path": "packages/sencha-core/src/event/Event.js",
      "requires": [
        88,
        91
      ],
      "uses": [],
      "idx": 89
    },
    {
      "path": "src/rtl/event/Event.js",
      "requires": [],
      "uses": [
        19
      ],
      "idx": 90
    },
    {
      "path": "overrides/event/Event.js",
      "requires": [],
      "uses": [
        51
      ],
      "idx": 91
    },
    {
      "path": "packages/sencha-core/src/event/publisher/Dom.js",
      "requires": [
        51,
        85,
        89,
        93
      ],
      "uses": [],
      "idx": 92
    },
    {
      "path": "overrides/event/publisher/Dom.js",
      "requires": [
        92
      ],
      "uses": [],
      "idx": 93
    },
    {
      "path": "packages/sencha-core/src/event/publisher/Gesture.js",
      "requires": [
        11,
        88,
        92,
        95
      ],
      "uses": [
        49,
        89
      ],
      "idx": 94
    },
    {
      "path": "overrides/event/publisher/Gesture.js",
      "requires": [],
      "uses": [
        89
      ],
      "idx": 95
    },
    {
      "path": "packages/sencha-core/src/event/publisher/Focus.js",
      "requires": [
        92
      ],
      "uses": [
        89
      ],
      "idx": 96
    },
    {
      "path": "overrides/Ext-more.js",
      "requires": [
        2,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        82,
        83,
        84,
        92,
        94,
        96
      ],
      "uses": [],
      "idx": 97
    },
    {
      "path": "overrides/Widget.js",
      "requires": [
        59,
        71
      ],
      "uses": [
        19,
        314
      ],
      "idx": 98
    },
    {
      "path": "packages/sencha-core/src/util/XTemplateParser.js",
      "requires": [],
      "uses": [],
      "idx": 99
    },
    {
      "path": "packages/sencha-core/src/util/XTemplateCompiler.js",
      "requires": [
        99
      ],
      "uses": [],
      "idx": 100
    },
    {
      "path": "packages/sencha-core/src/XTemplate.js",
      "requires": [
        56,
        100
      ],
      "uses": [],
      "idx": 101
    },
    {
      "path": "packages/sencha-core/src/mixin/Factoryable.js",
      "requires": [],
      "uses": [],
      "idx": 102
    },
    {
      "path": "packages/sencha-core/src/util/CollectionKey.js",
      "requires": [
        4
      ],
      "uses": [],
      "idx": 103
    },
    {
      "path": "packages/sencha-core/src/util/Grouper.js",
      "requires": [
        28
      ],
      "uses": [],
      "idx": 104
    },
    {
      "path": "packages/sencha-core/src/util/Collection.js",
      "requires": [
        5,
        23,
        28,
        103,
        104
      ],
      "uses": [
        169,
        170,
        171
      ],
      "idx": 105
    },
    {
      "path": "packages/sencha-core/src/util/Scheduler.js",
      "requires": [
        5,
        105
      ],
      "uses": [],
      "idx": 106
    },
    {
      "path": "packages/sencha-core/src/util/ObjectTemplate.js",
      "requires": [
        101
      ],
      "uses": [],
      "idx": 107
    },
    {
      "path": "packages/sencha-core/src/data/schema/Role.js",
      "requires": [],
      "uses": [
        102
      ],
      "idx": 108
    },
    {
      "path": "packages/sencha-core/src/data/schema/Association.js",
      "requires": [
        108
      ],
      "uses": [],
      "idx": 109
    },
    {
      "path": "packages/sencha-core/src/data/schema/OneToOne.js",
      "requires": [
        109
      ],
      "uses": [],
      "idx": 110
    },
    {
      "path": "packages/sencha-core/src/data/schema/ManyToOne.js",
      "requires": [
        109
      ],
      "uses": [],
      "idx": 111
    },
    {
      "path": "packages/sencha-core/src/data/schema/ManyToMany.js",
      "requires": [
        109
      ],
      "uses": [],
      "idx": 112
    },
    {
      "path": "packages/sencha-core/src/util/Inflector.js",
      "requires": [],
      "uses": [],
      "idx": 113
    },
    {
      "path": "packages/sencha-core/src/data/schema/Namer.js",
      "requires": [
        102,
        113
      ],
      "uses": [],
      "idx": 114
    },
    {
      "path": "packages/sencha-core/src/data/schema/Schema.js",
      "requires": [
        102,
        107,
        110,
        111,
        112,
        114
      ],
      "uses": [],
      "idx": 115
    },
    {
      "path": "packages/sencha-core/src/data/Batch.js",
      "requires": [
        5
      ],
      "uses": [],
      "idx": 116
    },
    {
      "path": "packages/sencha-core/src/data/matrix/Slice.js",
      "requires": [],
      "uses": [],
      "idx": 117
    },
    {
      "path": "packages/sencha-core/src/data/matrix/Side.js",
      "requires": [
        117
      ],
      "uses": [],
      "idx": 118
    },
    {
      "path": "packages/sencha-core/src/data/matrix/Matrix.js",
      "requires": [
        118
      ],
      "uses": [],
      "idx": 119
    },
    {
      "path": "packages/sencha-core/src/data/session/ChangesVisitor.js",
      "requires": [],
      "uses": [],
      "idx": 120
    },
    {
      "path": "packages/sencha-core/src/data/session/ChildChangesVisitor.js",
      "requires": [
        120
      ],
      "uses": [],
      "idx": 121
    },
    {
      "path": "packages/sencha-core/src/data/session/BatchVisitor.js",
      "requires": [],
      "uses": [
        116
      ],
      "idx": 122
    },
    {
      "path": "packages/sencha-core/src/data/Session.js",
      "requires": [
        115,
        116,
        119,
        120,
        121,
        122
      ],
      "uses": [],
      "idx": 123
    },
    {
      "path": "packages/sencha-core/src/util/Schedulable.js",
      "requires": [],
      "uses": [],
      "idx": 124
    },
    {
      "path": "packages/sencha-core/src/app/bind/BaseBinding.js",
      "requires": [
        124
      ],
      "uses": [],
      "idx": 125
    },
    {
      "path": "packages/sencha-core/src/app/bind/Binding.js",
      "requires": [
        125
      ],
      "uses": [],
      "idx": 126
    },
    {
      "path": "packages/sencha-core/src/app/bind/AbstractStub.js",
      "requires": [
        124,
        126
      ],
      "uses": [],
      "idx": 127
    },
    {
      "path": "packages/sencha-core/src/app/bind/Stub.js",
      "requires": [
        126,
        127
      ],
      "uses": [
        132
      ],
      "idx": 128
    },
    {
      "path": "packages/sencha-core/src/app/bind/LinkStub.js",
      "requires": [
        128
      ],
      "uses": [],
      "idx": 129
    },
    {
      "path": "packages/sencha-core/src/app/bind/RootStub.js",
      "requires": [
        127,
        128,
        129
      ],
      "uses": [],
      "idx": 130
    },
    {
      "path": "packages/sencha-core/src/app/bind/Multi.js",
      "requires": [
        125
      ],
      "uses": [],
      "idx": 131
    },
    {
      "path": "packages/sencha-core/src/app/bind/Formula.js",
      "requires": [
        14,
        124
      ],
      "uses": [],
      "idx": 132
    },
    {
      "path": "packages/sencha-core/src/app/bind/Template.js",
      "requires": [
        55
      ],
      "uses": [],
      "idx": 133
    },
    {
      "path": "packages/sencha-core/src/app/bind/TemplateBinding.js",
      "requires": [
        125,
        131,
        133
      ],
      "uses": [],
      "idx": 134
    },
    {
      "path": "packages/sencha-core/src/data/AbstractStore.js",
      "requires": [
        5,
        23,
        102,
        105,
        115
      ],
      "uses": [
        188
      ],
      "idx": 135
    },
    {
      "path": "packages/sencha-core/src/data/LocalStore.js",
      "requires": [
        3
      ],
      "uses": [
        105
      ],
      "idx": 136
    },
    {
      "path": "packages/sencha-core/src/data/ChainedStore.js",
      "requires": [
        135,
        136
      ],
      "uses": [
        188
      ],
      "idx": 137
    },
    {
      "path": "packages/sencha-core/src/app/ViewModel.js",
      "requires": [
        4,
        102,
        106,
        123,
        129,
        130,
        131,
        132,
        134,
        137
      ],
      "uses": [
        24,
        115
      ],
      "idx": 138
    },
    {
      "path": "packages/sencha-core/src/data/Error.js",
      "requires": [],
      "uses": [],
      "idx": 139
    },
    {
      "path": "packages/sencha-core/src/data/ErrorCollection.js",
      "requires": [
        30,
        139
      ],
      "uses": [
        148
      ],
      "idx": 140
    },
    {
      "path": "packages/sencha-core/src/data/operation/Operation.js",
      "requires": [],
      "uses": [],
      "idx": 141
    },
    {
      "path": "packages/sencha-core/src/data/operation/Create.js",
      "requires": [
        141
      ],
      "uses": [],
      "idx": 142
    },
    {
      "path": "packages/sencha-core/src/data/operation/Destroy.js",
      "requires": [
        141
      ],
      "uses": [],
      "idx": 143
    },
    {
      "path": "packages/sencha-core/src/data/operation/Read.js",
      "requires": [
        141
      ],
      "uses": [],
      "idx": 144
    },
    {
      "path": "packages/sencha-core/src/data/operation/Update.js",
      "requires": [
        141
      ],
      "uses": [],
      "idx": 145
    },
    {
      "path": "packages/sencha-core/src/data/SortTypes.js",
      "requires": [],
      "uses": [],
      "idx": 146
    },
    {
      "path": "packages/sencha-core/src/data/validator/Validator.js",
      "requires": [
        102
      ],
      "uses": [],
      "idx": 147
    },
    {
      "path": "packages/sencha-core/src/data/field/Field.js",
      "requires": [
        102,
        146,
        147
      ],
      "uses": [],
      "idx": 148
    },
    {
      "path": "packages/sencha-core/src/data/field/Boolean.js",
      "requires": [
        148
      ],
      "uses": [],
      "idx": 149
    },
    {
      "path": "packages/sencha-core/src/data/field/Date.js",
      "requires": [
        148
      ],
      "uses": [],
      "idx": 150
    },
    {
      "path": "packages/sencha-core/src/data/field/Integer.js",
      "requires": [
        148
      ],
      "uses": [],
      "idx": 151
    },
    {
      "path": "packages/sencha-core/src/data/field/Number.js",
      "requires": [
        148
      ],
      "uses": [],
      "idx": 152
    },
    {
      "path": "packages/sencha-core/src/data/field/String.js",
      "requires": [
        148
      ],
      "uses": [],
      "idx": 153
    },
    {
      "path": "packages/sencha-core/src/data/identifier/Generator.js",
      "requires": [
        102
      ],
      "uses": [],
      "idx": 154
    },
    {
      "path": "packages/sencha-core/src/data/identifier/Sequential.js",
      "requires": [
        154
      ],
      "uses": [],
      "idx": 155
    },
    {
      "path": "packages/sencha-core/src/data/Model.js",
      "requires": [
        115,
        140,
        141,
        142,
        143,
        144,
        145,
        147,
        148,
        149,
        150,
        151,
        152,
        153,
        154,
        155
      ],
      "uses": [
        102,
        158,
        193
      ],
      "idx": 156
    },
    {
      "path": "packages/sencha-core/src/data/ResultSet.js",
      "requires": [],
      "uses": [],
      "idx": 157
    },
    {
      "path": "packages/sencha-core/src/data/reader/Reader.js",
      "requires": [
        5,
        101,
        102,
        157
      ],
      "uses": [
        115
      ],
      "idx": 158
    },
    {
      "path": "packages/sencha-core/src/data/writer/Writer.js",
      "requires": [
        102
      ],
      "uses": [],
      "idx": 159
    },
    {
      "path": "packages/sencha-core/src/data/proxy/Proxy.js",
      "requires": [
        5,
        102,
        115,
        158,
        159
      ],
      "uses": [
        116,
        141,
        142,
        143,
        144,
        145,
        156
      ],
      "idx": 160
    },
    {
      "path": "packages/sencha-core/src/data/proxy/Client.js",
      "requires": [
        160
      ],
      "uses": [],
      "idx": 161
    },
    {
      "path": "packages/sencha-core/src/data/proxy/Memory.js",
      "requires": [
        161
      ],
      "uses": [
        23,
        29
      ],
      "idx": 162
    },
    {
      "path": "packages/sencha-core/src/data/ProxyStore.js",
      "requires": [
        135,
        141,
        142,
        143,
        144,
        145,
        156,
        160,
        162
      ],
      "uses": [
        24,
        115
      ],
      "idx": 163
    },
    {
      "path": "packages/sencha-core/src/data/proxy/Server.js",
      "requires": [
        160
      ],
      "uses": [
        56,
        187
      ],
      "idx": 164
    },
    {
      "path": "packages/sencha-core/src/data/proxy/Ajax.js",
      "requires": [
        10,
        164
      ],
      "uses": [],
      "idx": 165
    },
    {
      "path": "packages/sencha-core/src/data/reader/Json.js",
      "requires": [
        53,
        158
      ],
      "uses": [],
      "idx": 166
    },
    {
      "path": "packages/sencha-core/src/data/writer/Json.js",
      "requires": [
        159
      ],
      "uses": [],
      "idx": 167
    },
    {
      "path": "packages/sencha-core/src/util/Group.js",
      "requires": [
        105
      ],
      "uses": [],
      "idx": 168
    },
    {
      "path": "packages/sencha-core/src/util/SorterCollection.js",
      "requires": [
        28,
        105
      ],
      "uses": [],
      "idx": 169
    },
    {
      "path": "packages/sencha-core/src/util/FilterCollection.js",
      "requires": [
        23,
        105
      ],
      "uses": [],
      "idx": 170
    },
    {
      "path": "packages/sencha-core/src/util/GroupCollection.js",
      "requires": [
        105,
        168,
        169,
        170
      ],
      "uses": [],
      "idx": 171
    },
    {
      "path": "packages/sencha-core/src/data/Store.js",
      "requires": [
        24,
        136,
        156,
        163,
        165,
        166,
        167,
        171
      ],
      "uses": [
        104,
        176,
        188
      ],
      "idx": 172
    },
    {
      "path": "packages/sencha-core/src/data/reader/Array.js",
      "requires": [
        166
      ],
      "uses": [],
      "idx": 173
    },
    {
      "path": "packages/sencha-core/src/data/ArrayStore.js",
      "requires": [
        162,
        172,
        173
      ],
      "uses": [],
      "idx": 174
    },
    {
      "path": "packages/sencha-core/src/data/PageMap.js",
      "requires": [
        14
      ],
      "uses": [],
      "idx": 175
    },
    {
      "path": "packages/sencha-core/src/data/BufferedStore.js",
      "requires": [
        23,
        28,
        104,
        163,
        175
      ],
      "uses": [
        169,
        170,
        171
      ],
      "idx": 176
    },
    {
      "path": "packages/sencha-core/src/direct/Manager.js",
      "requires": [
        26,
        30
      ],
      "uses": [],
      "idx": 177
    },
    {
      "path": "packages/sencha-core/src/data/proxy/Direct.js",
      "requires": [
        164,
        177
      ],
      "uses": [],
      "idx": 178
    },
    {
      "path": "packages/sencha-core/src/data/DirectStore.js",
      "requires": [
        172,
        178
      ],
      "uses": [],
      "idx": 179
    },
    {
      "path": "packages/sencha-core/src/data/JsonP.js",
      "requires": [],
      "uses": [
        51
      ],
      "idx": 180
    },
    {
      "path": "packages/sencha-core/src/data/proxy/JsonP.js",
      "requires": [
        164,
        180
      ],
      "uses": [],
      "idx": 181
    },
    {
      "path": "packages/sencha-core/src/data/JsonPStore.js",
      "requires": [
        166,
        172,
        181
      ],
      "uses": [],
      "idx": 182
    },
    {
      "path": "packages/sencha-core/src/data/JsonStore.js",
      "requires": [
        165,
        166,
        167,
        172
      ],
      "uses": [],
      "idx": 183
    },
    {
      "path": "packages/sencha-core/src/data/ModelManager.js",
      "requires": [
        115
      ],
      "uses": [
        156
      ],
      "idx": 184
    },
    {
      "path": "packages/sencha-core/src/data/NodeInterface.js",
      "requires": [
        5,
        149,
        151,
        153,
        167
      ],
      "uses": [
        115
      ],
      "idx": 185
    },
    {
      "path": "packages/sencha-core/src/data/NodeStore.js",
      "requires": [
        172,
        185
      ],
      "uses": [
        156
      ],
      "idx": 186
    },
    {
      "path": "packages/sencha-core/src/data/Request.js",
      "requires": [],
      "uses": [],
      "idx": 187
    },
    {
      "path": "packages/sencha-core/src/data/StoreManager.js",
      "requires": [
        30,
        174
      ],
      "uses": [
        102,
        162,
        167,
        172,
        173
      ],
      "idx": 188
    },
    {
      "path": "packages/sencha-core/src/mixin/Queryable.js",
      "requires": [],
      "uses": [
        15
      ],
      "idx": 189
    },
    {
      "path": "packages/sencha-core/src/data/TreeModel.js",
      "requires": [
        156,
        185,
        189
      ],
      "uses": [],
      "idx": 190
    },
    {
      "path": "packages/sencha-core/src/data/TreeStore.js",
      "requires": [
        28,
        185,
        186,
        190
      ],
      "uses": [],
      "idx": 191
    },
    {
      "path": "packages/sencha-core/src/data/Types.js",
      "requires": [
        146
      ],
      "uses": [],
      "idx": 192
    },
    {
      "path": "packages/sencha-core/src/data/Validation.js",
      "requires": [
        156
      ],
      "uses": [],
      "idx": 193
    },
    {
      "path": "packages/sencha-core/src/dom/Helper.js",
      "requires": [
        195
      ],
      "uses": [
        56
      ],
      "idx": 194
    },
    {
      "path": "overrides/dom/Helper.js",
      "requires": [],
      "uses": [],
      "idx": 195
    },
    {
      "path": "packages/sencha-core/src/dom/Query.js",
      "requires": [
        13,
        194
      ],
      "uses": [
        14
      ],
      "idx": 196
    },
    {
      "path": "packages/sencha-core/src/data/reader/Xml.js",
      "requires": [
        158,
        196
      ],
      "uses": [],
      "idx": 197
    },
    {
      "path": "packages/sencha-core/src/data/writer/Xml.js",
      "requires": [
        159
      ],
      "uses": [],
      "idx": 198
    },
    {
      "path": "packages/sencha-core/src/data/XmlStore.js",
      "requires": [
        165,
        172,
        197,
        198
      ],
      "uses": [],
      "idx": 199
    },
    {
      "path": "packages/sencha-core/src/data/identifier/Negative.js",
      "requires": [
        155
      ],
      "uses": [],
      "idx": 200
    },
    {
      "path": "packages/sencha-core/src/data/identifier/Uuid.js",
      "requires": [
        154
      ],
      "uses": [],
      "idx": 201
    },
    {
      "path": "packages/sencha-core/src/data/proxy/WebStorage.js",
      "requires": [
        155,
        161
      ],
      "uses": [
        28,
        56,
        157
      ],
      "idx": 202
    },
    {
      "path": "packages/sencha-core/src/data/proxy/LocalStorage.js",
      "requires": [
        202
      ],
      "uses": [],
      "idx": 203
    },
    {
      "path": "packages/sencha-core/src/data/proxy/Rest.js",
      "requires": [
        165
      ],
      "uses": [],
      "idx": 204
    },
    {
      "path": "packages/sencha-core/src/data/proxy/SessionStorage.js",
      "requires": [
        202
      ],
      "uses": [],
      "idx": 205
    },
    {
      "path": "packages/sencha-core/src/data/proxy/Sql.js",
      "requires": [
        161
      ],
      "uses": [
        105,
        157
      ],
      "idx": 206
    },
    {
      "path": "packages/sencha-core/src/data/validator/Bound.js",
      "requires": [
        147
      ],
      "uses": [
        56
      ],
      "idx": 207
    },
    {
      "path": "packages/sencha-core/src/data/validator/Format.js",
      "requires": [
        147
      ],
      "uses": [],
      "idx": 208
    },
    {
      "path": "packages/sencha-core/src/data/validator/Email.js",
      "requires": [
        208
      ],
      "uses": [],
      "idx": 209
    },
    {
      "path": "packages/sencha-core/src/data/validator/List.js",
      "requires": [
        147
      ],
      "uses": [],
      "idx": 210
    },
    {
      "path": "packages/sencha-core/src/data/validator/Exclusion.js",
      "requires": [
        210
      ],
      "uses": [],
      "idx": 211
    },
    {
      "path": "packages/sencha-core/src/data/validator/Inclusion.js",
      "requires": [
        210
      ],
      "uses": [],
      "idx": 212
    },
    {
      "path": "packages/sencha-core/src/data/validator/Length.js",
      "requires": [
        207
      ],
      "uses": [],
      "idx": 213
    },
    {
      "path": "packages/sencha-core/src/data/validator/Presence.js",
      "requires": [
        147
      ],
      "uses": [],
      "idx": 214
    },
    {
      "path": "packages/sencha-core/src/data/validator/Range.js",
      "requires": [
        207
      ],
      "uses": [],
      "idx": 215
    },
    {
      "path": "packages/sencha-core/src/direct/Event.js",
      "requires": [],
      "uses": [],
      "idx": 216
    },
    {
      "path": "packages/sencha-core/src/direct/RemotingEvent.js",
      "requires": [
        216
      ],
      "uses": [
        177
      ],
      "idx": 217
    },
    {
      "path": "packages/sencha-core/src/direct/ExceptionEvent.js",
      "requires": [
        217
      ],
      "uses": [],
      "idx": 218
    },
    {
      "path": "packages/sencha-core/src/direct/Provider.js",
      "requires": [
        26
      ],
      "uses": [],
      "idx": 219
    },
    {
      "path": "packages/sencha-core/src/direct/JsonProvider.js",
      "requires": [
        219
      ],
      "uses": [
        177,
        218
      ],
      "idx": 220
    },
    {
      "path": "packages/sencha-core/src/direct/PollingProvider.js",
      "requires": [
        10,
        24,
        220
      ],
      "uses": [
        177,
        218,
        293
      ],
      "idx": 221
    },
    {
      "path": "packages/sencha-core/src/direct/RemotingMethod.js",
      "requires": [],
      "uses": [],
      "idx": 222
    },
    {
      "path": "packages/sencha-core/src/direct/Transaction.js",
      "requires": [],
      "uses": [],
      "idx": 223
    },
    {
      "path": "packages/sencha-core/src/direct/RemotingProvider.js",
      "requires": [
        24,
        30,
        220,
        222,
        223
      ],
      "uses": [
        10,
        177,
        218
      ],
      "idx": 224
    },
    {
      "path": "packages/sencha-core/src/util/paintmonitor/Abstract.js",
      "requires": [],
      "uses": [
        19
      ],
      "idx": 225
    },
    {
      "path": "packages/sencha-core/src/util/paintmonitor/CssAnimation.js",
      "requires": [
        225
      ],
      "uses": [],
      "idx": 226
    },
    {
      "path": "packages/sencha-core/src/util/paintmonitor/OverflowChange.js",
      "requires": [
        225
      ],
      "uses": [],
      "idx": 227
    },
    {
      "path": "packages/sencha-core/src/util/PaintMonitor.js",
      "requires": [
        226,
        227
      ],
      "uses": [],
      "idx": 228
    },
    {
      "path": "packages/sencha-core/src/event/publisher/ElementPaint.js",
      "requires": [
        54,
        85,
        228
      ],
      "uses": [],
      "idx": 229
    },
    {
      "path": "packages/sencha-core/src/mixin/Templatable.js",
      "requires": [
        3
      ],
      "uses": [
        19
      ],
      "idx": 230
    },
    {
      "path": "packages/sencha-core/src/util/sizemonitor/Abstract.js",
      "requires": [
        54,
        230
      ],
      "uses": [],
      "idx": 231
    },
    {
      "path": "packages/sencha-core/src/util/sizemonitor/Default.js",
      "requires": [
        231
      ],
      "uses": [],
      "idx": 232
    },
    {
      "path": "packages/sencha-core/src/util/sizemonitor/Scroll.js",
      "requires": [
        231
      ],
      "uses": [
        54
      ],
      "idx": 233
    },
    {
      "path": "packages/sencha-core/src/util/sizemonitor/OverflowChange.js",
      "requires": [
        231
      ],
      "uses": [
        54
      ],
      "idx": 234
    },
    {
      "path": "packages/sencha-core/src/util/SizeMonitor.js",
      "requires": [
        232,
        233,
        234
      ],
      "uses": [],
      "idx": 235
    },
    {
      "path": "packages/sencha-core/src/event/publisher/ElementSize.js",
      "requires": [
        85,
        235
      ],
      "uses": [
        54
      ],
      "idx": 236
    },
    {
      "path": "packages/sencha-core/src/fx/State.js",
      "requires": [],
      "uses": [],
      "idx": 237
    },
    {
      "path": "packages/sencha-core/src/fx/animation/Abstract.js",
      "requires": [
        16,
        237
      ],
      "uses": [],
      "idx": 238
    },
    {
      "path": "packages/sencha-core/src/fx/animation/Slide.js",
      "requires": [
        238
      ],
      "uses": [],
      "idx": 239
    },
    {
      "path": "packages/sencha-core/src/fx/animation/SlideOut.js",
      "requires": [
        239
      ],
      "uses": [],
      "idx": 240
    },
    {
      "path": "packages/sencha-core/src/fx/animation/Fade.js",
      "requires": [
        238
      ],
      "uses": [],
      "idx": 241
    },
    {
      "path": "packages/sencha-core/src/fx/animation/FadeOut.js",
      "requires": [
        241
      ],
      "uses": [],
      "idx": 242
    },
    {
      "path": "packages/sencha-core/src/fx/animation/Flip.js",
      "requires": [
        238
      ],
      "uses": [],
      "idx": 243
    },
    {
      "path": "packages/sencha-core/src/fx/animation/Pop.js",
      "requires": [
        238
      ],
      "uses": [],
      "idx": 244
    },
    {
      "path": "packages/sencha-core/src/fx/animation/PopOut.js",
      "requires": [
        244
      ],
      "uses": [],
      "idx": 245
    },
    {
      "path": "packages/sencha-core/src/fx/Animation.js",
      "requires": [
        239,
        240,
        241,
        242,
        243,
        244,
        245
      ],
      "uses": [
        238
      ],
      "idx": 246
    },
    {
      "path": "packages/sencha-core/src/fx/runner/Css.js",
      "requires": [
        16,
        246
      ],
      "uses": [],
      "idx": 247
    },
    {
      "path": "packages/sencha-core/src/fx/runner/CssTransition.js",
      "requires": [
        11,
        247
      ],
      "uses": [
        246
      ],
      "idx": 248
    },
    {
      "path": "packages/sencha-core/src/fx/Runner.js",
      "requires": [
        248
      ],
      "uses": [],
      "idx": 249
    },
    {
      "path": "packages/sencha-core/src/fx/animation/Cube.js",
      "requires": [
        238
      ],
      "uses": [],
      "idx": 250
    },
    {
      "path": "packages/sencha-core/src/fx/animation/Wipe.js",
      "requires": [
        246
      ],
      "uses": [],
      "idx": 251
    },
    {
      "path": "packages/sencha-core/src/fx/animation/WipeOut.js",
      "requires": [
        251
      ],
      "uses": [],
      "idx": 252
    },
    {
      "path": "packages/sencha-core/src/fx/easing/Abstract.js",
      "requires": [],
      "uses": [],
      "idx": 253
    },
    {
      "path": "packages/sencha-core/src/fx/easing/Bounce.js",
      "requires": [
        253
      ],
      "uses": [],
      "idx": 254
    },
    {
      "path": "packages/sencha-core/src/fx/easing/Momentum.js",
      "requires": [
        253
      ],
      "uses": [],
      "idx": 255
    },
    {
      "path": "packages/sencha-core/src/fx/easing/BoundMomentum.js",
      "requires": [
        253,
        254,
        255
      ],
      "uses": [],
      "idx": 256
    },
    {
      "path": "packages/sencha-core/src/fx/easing/Linear.js",
      "requires": [
        253
      ],
      "uses": [],
      "idx": 257
    },
    {
      "path": "packages/sencha-core/src/fx/easing/EaseIn.js",
      "requires": [
        257
      ],
      "uses": [],
      "idx": 258
    },
    {
      "path": "packages/sencha-core/src/fx/easing/EaseOut.js",
      "requires": [
        257
      ],
      "uses": [],
      "idx": 259
    },
    {
      "path": "packages/sencha-core/src/fx/easing/Easing.js",
      "requires": [
        257
      ],
      "uses": [],
      "idx": 260
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/Abstract.js",
      "requires": [
        16
      ],
      "uses": [],
      "idx": 261
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/Style.js",
      "requires": [
        246,
        261
      ],
      "uses": [],
      "idx": 262
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/Slide.js",
      "requires": [
        262
      ],
      "uses": [],
      "idx": 263
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/Cover.js",
      "requires": [
        262
      ],
      "uses": [],
      "idx": 264
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/Reveal.js",
      "requires": [
        262
      ],
      "uses": [],
      "idx": 265
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/Fade.js",
      "requires": [
        262
      ],
      "uses": [],
      "idx": 266
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/Flip.js",
      "requires": [
        262
      ],
      "uses": [],
      "idx": 267
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/Pop.js",
      "requires": [
        262
      ],
      "uses": [],
      "idx": 268
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/Scroll.js",
      "requires": [
        257,
        261
      ],
      "uses": [
        11
      ],
      "idx": 269
    },
    {
      "path": "packages/sencha-core/src/fx/layout/Card.js",
      "requires": [
        263,
        264,
        265,
        266,
        267,
        268,
        269
      ],
      "uses": [
        261
      ],
      "idx": 270
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/Cube.js",
      "requires": [
        262
      ],
      "uses": [],
      "idx": 271
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/ScrollCover.js",
      "requires": [
        269
      ],
      "uses": [],
      "idx": 272
    },
    {
      "path": "packages/sencha-core/src/fx/layout/card/ScrollReveal.js",
      "requires": [
        269
      ],
      "uses": [],
      "idx": 273
    },
    {
      "path": "packages/sencha-core/src/fx/runner/CssAnimation.js",
      "requires": [
        247
      ],
      "uses": [
        246
      ],
      "idx": 274
    },
    {
      "path": "packages/sencha-core/src/mixin/Hookable.js",
      "requires": [
        3
      ],
      "uses": [],
      "idx": 275
    },
    {
      "path": "packages/sencha-core/src/mixin/Mashup.js",
      "requires": [
        3
      ],
      "uses": [],
      "idx": 276
    },
    {
      "path": "packages/sencha-core/src/mixin/Responsive.js",
      "requires": [
        3,
        51
      ],
      "uses": [
        19
      ],
      "idx": 277
    },
    {
      "path": "packages/sencha-core/src/mixin/Selectable.js",
      "requires": [
        3
      ],
      "uses": [
        30
      ],
      "idx": 278
    },
    {
      "path": "packages/sencha-core/src/mixin/Traversable.js",
      "requires": [
        3
      ],
      "uses": [],
      "idx": 279
    },
    {
      "path": "packages/sencha-core/src/perf/Accumulator.js",
      "requires": [
        101
      ],
      "uses": [],
      "idx": 280
    },
    {
      "path": "packages/sencha-core/src/perf/Monitor.js",
      "requires": [
        280
      ],
      "uses": [],
      "idx": 281
    },
    {
      "path": "packages/sencha-core/src/util/translatable/Abstract.js",
      "requires": [
        16,
        257
      ],
      "uses": [
        11
      ],
      "idx": 282
    },
    {
      "path": "packages/sencha-core/src/util/translatable/Dom.js",
      "requires": [
        282
      ],
      "uses": [],
      "idx": 283
    },
    {
      "path": "packages/sencha-core/src/util/translatable/CssTransform.js",
      "requires": [
        283
      ],
      "uses": [],
      "idx": 284
    },
    {
      "path": "packages/sencha-core/src/util/translatable/ScrollPosition.js",
      "requires": [
        283
      ],
      "uses": [],
      "idx": 285
    },
    {
      "path": "packages/sencha-core/src/util/translatable/ScrollParent.js",
      "requires": [
        283
      ],
      "uses": [],
      "idx": 286
    },
    {
      "path": "packages/sencha-core/src/util/translatable/CssPosition.js",
      "requires": [
        283
      ],
      "uses": [],
      "idx": 287
    },
    {
      "path": "packages/sencha-core/src/util/Translatable.js",
      "requires": [
        284,
        285,
        286,
        287
      ],
      "uses": [],
      "idx": 288
    },
    {
      "path": "packages/sencha-core/src/scroll/Scroller.js",
      "requires": [
        16,
        256,
        259,
        288
      ],
      "uses": [],
      "idx": 289
    },
    {
      "path": "src/rtl/scroll/Scroller.js",
      "requires": [],
      "uses": [],
      "idx": 290
    },
    {
      "path": "packages/sencha-core/src/util/Base64.js",
      "requires": [],
      "uses": [],
      "idx": 291
    },
    {
      "path": "packages/sencha-core/src/util/LocalStorage.js",
      "requires": [],
      "uses": [],
      "idx": 292
    },
    {
      "path": "packages/sencha-core/src/util/TaskManager.js",
      "requires": [
        31
      ],
      "uses": [],
      "idx": 293
    },
    {
      "path": "packages/sencha-core/src/util/TextMetrics.js",
      "requires": [
        19
      ],
      "uses": [],
      "idx": 294
    },
    {
      "path": "src/Action.js",
      "requires": [],
      "uses": [],
      "idx": 295
    },
    {
      "path": "src/ElementLoader.js",
      "requires": [
        26
      ],
      "uses": [
        9,
        10
      ],
      "idx": 296
    },
    {
      "path": "src/ComponentLoader.js",
      "requires": [
        296
      ],
      "uses": [],
      "idx": 297
    },
    {
      "path": "src/layout/SizeModel.js",
      "requires": [],
      "uses": [],
      "idx": 298
    },
    {
      "path": "src/layout/Layout.js",
      "requires": [
        101,
        102,
        298
      ],
      "uses": [
        593
      ],
      "idx": 299
    },
    {
      "path": "src/layout/container/Container.js",
      "requires": [
        62,
        101,
        299
      ],
      "uses": [
        194
      ],
      "idx": 300
    },
    {
      "path": "src/layout/container/Auto.js",
      "requires": [
        300
      ],
      "uses": [
        101
      ],
      "idx": 301
    },
    {
      "path": "src/ZIndexManager.js",
      "requires": [
        169,
        170
      ],
      "uses": [
        19,
        51,
        105
      ],
      "idx": 302
    },
    {
      "path": "src/container/Container.js",
      "requires": [
        30,
        71,
        189,
        301,
        302
      ],
      "uses": [
        12,
        15,
        27,
        102
      ],
      "idx": 303
    },
    {
      "path": "src/layout/container/Editor.js",
      "requires": [
        300
      ],
      "uses": [],
      "idx": 304
    },
    {
      "path": "src/Editor.js",
      "requires": [
        303,
        304
      ],
      "uses": [
        12,
        19
      ],
      "idx": 305
    },
    {
      "path": "src/EventManager.js",
      "requires": [],
      "uses": [
        51
      ],
      "idx": 306
    },
    {
      "path": "src/util/KeyMap.js",
      "requires": [],
      "uses": [],
      "idx": 307
    },
    {
      "path": "src/util/KeyNav.js",
      "requires": [
        307
      ],
      "uses": [],
      "idx": 308
    },
    {
      "path": "src/FocusManager.js",
      "requires": [
        6,
        12,
        15,
        26,
        71,
        308
      ],
      "uses": [
        19,
        24
      ],
      "idx": 309
    },
    {
      "path": "src/Img.js",
      "requires": [
        71
      ],
      "uses": [],
      "idx": 310
    },
    {
      "path": "src/util/StoreHolder.js",
      "requires": [],
      "uses": [
        188
      ],
      "idx": 311
    },
    {
      "path": "src/LoadMask.js",
      "requires": [
        71,
        311
      ],
      "uses": [
        51,
        188
      ],
      "idx": 312
    },
    {
      "path": "src/layout/component/Component.js",
      "requires": [
        299
      ],
      "uses": [],
      "idx": 313
    },
    {
      "path": "src/layout/component/Auto.js",
      "requires": [
        313
      ],
      "uses": [],
      "idx": 314
    },
    {
      "path": "src/layout/component/ProgressBar.js",
      "requires": [
        314
      ],
      "uses": [],
      "idx": 315
    },
    {
      "path": "src/ProgressBar.js",
      "requires": [
        56,
        61,
        71,
        293,
        315
      ],
      "uses": [
        47,
        101
      ],
      "idx": 316
    },
    {
      "path": "src/ProgressBarWidget.js",
      "requires": [
        59,
        316
      ],
      "uses": [
        101
      ],
      "idx": 317
    },
    {
      "path": "src/ShadowPool.js",
      "requires": [
        194
      ],
      "uses": [
        56
      ],
      "idx": 318
    },
    {
      "path": "src/Shadow.js",
      "requires": [
        318
      ],
      "uses": [],
      "idx": 319
    },
    {
      "path": "src/app/EventDomain.js",
      "requires": [
        25
      ],
      "uses": [],
      "idx": 320
    },
    {
      "path": "src/app/domain/Component.js",
      "requires": [
        59,
        71,
        320
      ],
      "uses": [],
      "idx": 321
    },
    {
      "path": "src/app/EventBus.js",
      "requires": [
        321
      ],
      "uses": [
        320
      ],
      "idx": 322
    },
    {
      "path": "src/app/domain/Global.js",
      "requires": [
        320
      ],
      "uses": [],
      "idx": 323
    },
    {
      "path": "src/app/BaseController.js",
      "requires": [
        26,
        322,
        323
      ],
      "uses": [
        329,
        330,
        460
      ],
      "idx": 324
    },
    {
      "path": "src/app/Util.js",
      "requires": [],
      "uses": [],
      "idx": 325
    },
    {
      "path": "src/app/domain/Store.js",
      "requires": [
        135,
        320
      ],
      "uses": [],
      "idx": 326
    },
    {
      "path": "src/app/route/Queue.js",
      "requires": [],
      "uses": [
        30
      ],
      "idx": 327
    },
    {
      "path": "src/app/route/Route.js",
      "requires": [],
      "uses": [
        56
      ],
      "idx": 328
    },
    {
      "path": "src/util/History.js",
      "requires": [
        26
      ],
      "uses": [
        293
      ],
      "idx": 329
    },
    {
      "path": "src/app/route/Router.js",
      "requires": [
        327,
        328,
        329
      ],
      "uses": [],
      "idx": 330
    },
    {
      "path": "src/app/Controller.js",
      "requires": [
        12,
        188,
        321,
        324,
        325,
        326,
        330
      ],
      "uses": [
        15,
        115
      ],
      "idx": 331
    },
    {
      "path": "src/panel/Bar.js",
      "requires": [
        303
      ],
      "uses": [],
      "idx": 332
    },
    {
      "path": "src/rtl/panel/Bar.js",
      "requires": [],
      "uses": [],
      "idx": 333
    },
    {
      "path": "src/panel/Title.js",
      "requires": [
        71
      ],
      "uses": [],
      "idx": 334
    },
    {
      "path": "src/rtl/panel/Title.js",
      "requires": [],
      "uses": [],
      "idx": 335
    },
    {
      "path": "src/panel/Tool.js",
      "requires": [
        71
      ],
      "uses": [
        380
      ],
      "idx": 336
    },
    {
      "path": "src/panel/Header.js",
      "requires": [
        123,
        314,
        332,
        334,
        336
      ],
      "uses": [
        12
      ],
      "idx": 337
    },
    {
      "path": "src/toolbar/Fill.js",
      "requires": [
        71
      ],
      "uses": [],
      "idx": 338
    },
    {
      "path": "src/layout/container/boxOverflow/None.js",
      "requires": [
        102
      ],
      "uses": [],
      "idx": 339
    },
    {
      "path": "src/toolbar/Item.js",
      "requires": [
        71
      ],
      "uses": [],
      "idx": 340
    },
    {
      "path": "src/toolbar/Separator.js",
      "requires": [
        340
      ],
      "uses": [],
      "idx": 341
    },
    {
      "path": "src/dom/ButtonElement.js",
      "requires": [
        19
      ],
      "uses": [],
      "idx": 342
    },
    {
      "path": "src/button/Manager.js",
      "requires": [],
      "uses": [],
      "idx": 343
    },
    {
      "path": "src/menu/Manager.js",
      "requires": [
        30,
        307
      ],
      "uses": [
        12,
        564
      ],
      "idx": 344
    },
    {
      "path": "src/util/ClickRepeater.js",
      "requires": [
        26
      ],
      "uses": [],
      "idx": 345
    },
    {
      "path": "src/button/Button.js",
      "requires": [
        71,
        189,
        294,
        307,
        342,
        343,
        344,
        345
      ],
      "uses": [
        89,
        380
      ],
      "idx": 346
    },
    {
      "path": "src/rtl/button/Button.js",
      "requires": [],
      "uses": [],
      "idx": 347
    },
    {
      "path": "src/layout/container/boxOverflow/Menu.js",
      "requires": [
        339,
        341,
        346
      ],
      "uses": [
        123,
        314,
        338,
        358,
        371,
        564
      ],
      "idx": 348
    },
    {
      "path": "src/rtl/layout/container/boxOverflow/Menu.js",
      "requires": [],
      "uses": [],
      "idx": 349
    },
    {
      "path": "src/layout/container/boxOverflow/Scroller.js",
      "requires": [
        5,
        19,
        339,
        345
      ],
      "uses": [],
      "idx": 350
    },
    {
      "path": "src/rtl/layout/container/boxOverflow/Scroller.js",
      "requires": [],
      "uses": [],
      "idx": 351
    },
    {
      "path": "src/dd/DragDropManager.js",
      "requires": [
        87
      ],
      "uses": [
        380,
        423
      ],
      "idx": 352
    },
    {
      "path": "src/resizer/Splitter.js",
      "requires": [
        71,
        101
      ],
      "uses": [
        477
      ],
      "idx": 353
    },
    {
      "path": "src/layout/container/Box.js",
      "requires": [
        55,
        300,
        339,
        348,
        350,
        352,
        353
      ],
      "uses": [
        102,
        123,
        298,
        314
      ],
      "idx": 354
    },
    {
      "path": "src/rtl/layout/container/Box.js",
      "requires": [],
      "uses": [],
      "idx": 355
    },
    {
      "path": "src/layout/container/HBox.js",
      "requires": [
        354
      ],
      "uses": [],
      "idx": 356
    },
    {
      "path": "src/rtl/layout/container/HBox.js",
      "requires": [],
      "uses": [],
      "idx": 357
    },
    {
      "path": "src/layout/container/VBox.js",
      "requires": [
        354
      ],
      "uses": [],
      "idx": 358
    },
    {
      "path": "src/rtl/layout/container/VBox.js",
      "requires": [],
      "uses": [],
      "idx": 359
    },
    {
      "path": "src/util/FocusableContainer.js",
      "requires": [
        3,
        308
      ],
      "uses": [
        71
      ],
      "idx": 360
    },
    {
      "path": "src/rtl/util/FocusableContainer.js",
      "requires": [],
      "uses": [],
      "idx": 361
    },
    {
      "path": "src/toolbar/Toolbar.js",
      "requires": [
        123,
        303,
        314,
        338,
        356,
        358,
        360
      ],
      "uses": [
        341,
        511
      ],
      "idx": 362
    },
    {
      "path": "src/dd/DragDrop.js",
      "requires": [
        352
      ],
      "uses": [
        19
      ],
      "idx": 363
    },
    {
      "path": "src/dd/DD.js",
      "requires": [
        352,
        363
      ],
      "uses": [
        19
      ],
      "idx": 364
    },
    {
      "path": "src/rtl/dd/DD.js",
      "requires": [],
      "uses": [],
      "idx": 365
    },
    {
      "path": "src/dd/DDProxy.js",
      "requires": [
        364
      ],
      "uses": [
        352
      ],
      "idx": 366
    },
    {
      "path": "src/dd/StatusProxy.js",
      "requires": [
        71
      ],
      "uses": [],
      "idx": 367
    },
    {
      "path": "src/dd/DragSource.js",
      "requires": [
        352,
        366,
        367
      ],
      "uses": [
        123,
        314
      ],
      "idx": 368
    },
    {
      "path": "src/panel/Proxy.js",
      "requires": [],
      "uses": [
        19
      ],
      "idx": 369
    },
    {
      "path": "src/panel/DD.js",
      "requires": [
        368,
        369
      ],
      "uses": [],
      "idx": 370
    },
    {
      "path": "src/layout/component/Dock.js",
      "requires": [
        313
      ],
      "uses": [
        15,
        19,
        298
      ],
      "idx": 371
    },
    {
      "path": "src/rtl/layout/component/Dock.js",
      "requires": [],
      "uses": [
        371
      ],
      "idx": 372
    },
    {
      "path": "src/util/Memento.js",
      "requires": [],
      "uses": [],
      "idx": 373
    },
    {
      "path": "src/container/DockingContainer.js",
      "requires": [
        19,
        30
      ],
      "uses": [
        15,
        27,
        194
      ],
      "idx": 374
    },
    {
      "path": "src/panel/Panel.js",
      "requires": [
        19,
        30,
        47,
        101,
        303,
        307,
        337,
        362,
        370,
        371,
        373,
        374
      ],
      "uses": [
        24,
        60,
        61,
        71,
        123,
        301,
        314,
        336,
        457
      ],
      "idx": 375
    },
    {
      "path": "src/rtl/panel/Panel.js",
      "requires": [],
      "uses": [],
      "idx": 376
    },
    {
      "path": "src/tip/Tip.js",
      "requires": [
        375
      ],
      "uses": [
        71
      ],
      "idx": 377
    },
    {
      "path": "src/tip/ToolTip.js",
      "requires": [
        377
      ],
      "uses": [
        19
      ],
      "idx": 378
    },
    {
      "path": "src/tip/QuickTip.js",
      "requires": [
        378
      ],
      "uses": [],
      "idx": 379
    },
    {
      "path": "src/tip/QuickTipManager.js",
      "requires": [
        379
      ],
      "uses": [],
      "idx": 380
    },
    {
      "path": "src/rtl/tip/QuickTipManager.js",
      "requires": [],
      "uses": [],
      "idx": 381
    },
    {
      "path": "src/app/Application.js",
      "requires": [
        30,
        329,
        331,
        380,
        383
      ],
      "uses": [
        330
      ],
      "idx": 382
    },
    {
      "path": "overrides/app/Application.js",
      "requires": [],
      "uses": [
        382
      ],
      "idx": 383
    },
    {
      "path": "src/app/domain/View.js",
      "requires": [
        320
      ],
      "uses": [
        71
      ],
      "idx": 384
    },
    {
      "path": "src/app/ViewController.js",
      "requires": [
        102,
        324,
        384
      ],
      "uses": [],
      "idx": 385
    },
    {
      "path": "src/form/Labelable.js",
      "requires": [
        3,
        50,
        101
      ],
      "uses": [
        19,
        379
      ],
      "idx": 386
    },
    {
      "path": "src/rtl/form/Labelable.js",
      "requires": [],
      "uses": [],
      "idx": 387
    },
    {
      "path": "src/form/field/Field.js",
      "requires": [],
      "uses": [],
      "idx": 388
    },
    {
      "path": "src/form/field/Base.js",
      "requires": [
        24,
        71,
        101,
        386,
        388
      ],
      "uses": [
        194
      ],
      "idx": 389
    },
    {
      "path": "src/form/field/Display.js",
      "requires": [
        55,
        101,
        389
      ],
      "uses": [],
      "idx": 390
    },
    {
      "path": "src/layout/container/Fit.js",
      "requires": [
        300
      ],
      "uses": [],
      "idx": 391
    },
    {
      "path": "src/panel/Table.js",
      "requires": [
        375,
        391
      ],
      "uses": [
        24,
        188,
        194,
        399,
        412,
        430,
        436,
        576,
        577,
        615,
        621
      ],
      "idx": 392
    },
    {
      "path": "src/selection/Model.js",
      "requires": [
        26,
        188,
        311
      ],
      "uses": [
        30
      ],
      "idx": 393
    },
    {
      "path": "src/selection/DataViewModel.js",
      "requires": [
        308,
        393
      ],
      "uses": [],
      "idx": 394
    },
    {
      "path": "src/view/NavigationModel.js",
      "requires": [
        26,
        102
      ],
      "uses": [
        308
      ],
      "idx": 395
    },
    {
      "path": "src/rtl/view/NavigationModel.js",
      "requires": [],
      "uses": [],
      "idx": 396
    },
    {
      "path": "src/view/AbstractView.js",
      "requires": [
        21,
        71,
        188,
        311,
        312,
        394,
        395
      ],
      "uses": [
        11,
        56,
        101,
        102,
        194,
        293
      ],
      "idx": 397
    },
    {
      "path": "src/view/View.js",
      "requires": [
        397
      ],
      "uses": [],
      "idx": 398
    },
    {
      "path": "src/grid/CellContext.js",
      "requires": [],
      "uses": [],
      "idx": 399
    },
    {
      "path": "src/util/CSS.js",
      "requires": [],
      "uses": [
        19
      ],
      "idx": 400
    },
    {
      "path": "src/view/TableLayout.js",
      "requires": [
        314,
        400
      ],
      "uses": [],
      "idx": 401
    },
    {
      "path": "src/view/NodeCache.js",
      "requires": [
        21
      ],
      "uses": [
        19,
        20
      ],
      "idx": 402
    },
    {
      "path": "src/view/Table.js",
      "requires": [
        24,
        30,
        398,
        399,
        401,
        402
      ],
      "uses": [
        20,
        101,
        430
      ],
      "idx": 403
    },
    {
      "path": "src/rtl/view/Table.js",
      "requires": [],
      "uses": [],
      "idx": 404
    },
    {
      "path": "src/grid/View.js",
      "requires": [
        403
      ],
      "uses": [],
      "idx": 405
    },
    {
      "path": "src/grid/Panel.js",
      "requires": [
        392,
        405
      ],
      "uses": [],
      "idx": 406
    },
    {
      "path": "src/form/CheckboxManager.js",
      "requires": [
        30
      ],
      "uses": [],
      "idx": 407
    },
    {
      "path": "src/form/field/Checkbox.js",
      "requires": [
        101,
        389,
        407
      ],
      "uses": [],
      "idx": 408
    },
    {
      "path": "src/app/bindinspector/Util.js",
      "requires": [],
      "uses": [
        56
      ],
      "idx": 409
    },
    {
      "path": "src/app/bindinspector/ComponentDetail.js",
      "requires": [
        71,
        123,
        303,
        314,
        356,
        358,
        375,
        390,
        406,
        408,
        409
      ],
      "uses": [
        56,
        338,
        346,
        362,
        371,
        391,
        454
      ],
      "idx": 410
    },
    {
      "path": "src/tree/View.js",
      "requires": [
        186,
        403
      ],
      "uses": [
        101
      ],
      "idx": 411
    },
    {
      "path": "src/selection/RowModel.js",
      "requires": [
        394,
        399
      ],
      "uses": [],
      "idx": 412
    },
    {
      "path": "src/selection/TreeModel.js",
      "requires": [
        412
      ],
      "uses": [],
      "idx": 413
    },
    {
      "path": "src/rtl/selection/TreeModel.js",
      "requires": [],
      "uses": [],
      "idx": 414
    },
    {
      "path": "src/grid/ColumnLayout.js",
      "requires": [
        356,
        392
      ],
      "uses": [],
      "idx": 415
    },
    {
      "path": "src/rtl/grid/ColumnLayout.js",
      "requires": [],
      "uses": [],
      "idx": 416
    },
    {
      "path": "src/plugin/Abstract.js",
      "requires": [],
      "uses": [],
      "idx": 417
    },
    {
      "path": "src/dd/DragTracker.js",
      "requires": [
        26
      ],
      "uses": [
        87
      ],
      "idx": 418
    },
    {
      "path": "src/grid/plugin/HeaderResizer.js",
      "requires": [
        87,
        417,
        418
      ],
      "uses": [
        432
      ],
      "idx": 419
    },
    {
      "path": "src/rtl/grid/plugin/HeaderResizer.js",
      "requires": [],
      "uses": [],
      "idx": 420
    },
    {
      "path": "src/dd/DragZone.js",
      "requires": [
        368
      ],
      "uses": [
        424,
        426
      ],
      "idx": 421
    },
    {
      "path": "src/grid/header/DragZone.js",
      "requires": [
        421
      ],
      "uses": [],
      "idx": 422
    },
    {
      "path": "src/dd/DDTarget.js",
      "requires": [
        363
      ],
      "uses": [],
      "idx": 423
    },
    {
      "path": "src/dd/ScrollManager.js",
      "requires": [
        352
      ],
      "uses": [],
      "idx": 424
    },
    {
      "path": "src/dd/DropTarget.js",
      "requires": [
        423,
        424
      ],
      "uses": [],
      "idx": 425
    },
    {
      "path": "src/dd/Registry.js",
      "requires": [],
      "uses": [],
      "idx": 426
    },
    {
      "path": "src/dd/DropZone.js",
      "requires": [
        425,
        426
      ],
      "uses": [
        352
      ],
      "idx": 427
    },
    {
      "path": "src/grid/header/DropZone.js",
      "requires": [
        427
      ],
      "uses": [
        352
      ],
      "idx": 428
    },
    {
      "path": "src/grid/plugin/HeaderReorderer.js",
      "requires": [
        417,
        422,
        428
      ],
      "uses": [],
      "idx": 429
    },
    {
      "path": "src/grid/header/Container.js",
      "requires": [
        303,
        308,
        360,
        415,
        419,
        429
      ],
      "uses": [
        24,
        123,
        314,
        358,
        371,
        432,
        537,
        561,
        563,
        564
      ],
      "idx": 430
    },
    {
      "path": "src/grid/ColumnComponentLayout.js",
      "requires": [
        314
      ],
      "uses": [],
      "idx": 431
    },
    {
      "path": "src/grid/column/Column.js",
      "requires": [
        133,
        415,
        430,
        431
      ],
      "uses": [
        55,
        419
      ],
      "idx": 432
    },
    {
      "path": "src/rtl/grid/column/Column.js",
      "requires": [],
      "uses": [],
      "idx": 433
    },
    {
      "path": "src/tree/Column.js",
      "requires": [
        432
      ],
      "uses": [],
      "idx": 434
    },
    {
      "path": "src/rtl/tree/Column.js",
      "requires": [],
      "uses": [],
      "idx": 435
    },
    {
      "path": "src/grid/NavigationModel.js",
      "requires": [
        395
      ],
      "uses": [
        20,
        89,
        308,
        399
      ],
      "idx": 436
    },
    {
      "path": "src/rtl/grid/NavigationModel.js",
      "requires": [],
      "uses": [],
      "idx": 437
    },
    {
      "path": "src/tree/NavigationModel.js",
      "requires": [
        436
      ],
      "uses": [
        89
      ],
      "idx": 438
    },
    {
      "path": "src/tree/Panel.js",
      "requires": [
        191,
        392,
        411,
        413,
        434,
        438
      ],
      "uses": [
        123,
        188,
        301,
        431,
        577
      ],
      "idx": 439
    },
    {
      "path": "src/form/field/VTypes.js",
      "requires": [],
      "uses": [],
      "idx": 440
    },
    {
      "path": "src/form/trigger/Trigger.js",
      "requires": [
        102,
        345
      ],
      "uses": [
        19,
        101
      ],
      "idx": 441
    },
    {
      "path": "src/form/field/Text.js",
      "requires": [
        294,
        389,
        440,
        441
      ],
      "uses": [
        24,
        55,
        56,
        61
      ],
      "idx": 442
    },
    {
      "path": "src/app/bindinspector/ComponentList.js",
      "requires": [
        439,
        442
      ],
      "uses": [
        15,
        123,
        301,
        314,
        338,
        346,
        362,
        371,
        378,
        409,
        431,
        434
      ],
      "idx": 443
    },
    {
      "path": "src/resizer/BorderSplitter.js",
      "requires": [
        353
      ],
      "uses": [
        606
      ],
      "idx": 444
    },
    {
      "path": "src/layout/container/Border.js",
      "requires": [
        47,
        72,
        300,
        444
      ],
      "uses": [
        55,
        123,
        314
      ],
      "idx": 445
    },
    {
      "path": "src/rtl/layout/container/Border.js",
      "requires": [],
      "uses": [],
      "idx": 446
    },
    {
      "path": "src/layout/container/Card.js",
      "requires": [
        391
      ],
      "uses": [],
      "idx": 447
    },
    {
      "path": "src/tab/Tab.js",
      "requires": [
        308,
        346
      ],
      "uses": [
        19
      ],
      "idx": 448
    },
    {
      "path": "src/layout/component/Body.js",
      "requires": [
        314
      ],
      "uses": [],
      "idx": 449
    },
    {
      "path": "src/tab/Bar.js",
      "requires": [
        88,
        332,
        360,
        448,
        449
      ],
      "uses": [
        87
      ],
      "idx": 450
    },
    {
      "path": "src/rtl/tab/Bar.js",
      "requires": [],
      "uses": [],
      "idx": 451
    },
    {
      "path": "src/tab/Panel.js",
      "requires": [
        375,
        447,
        450
      ],
      "uses": [
        123,
        314,
        448
      ],
      "idx": 452
    },
    {
      "path": "src/app/bindinspector/Environment.js",
      "requires": [
        105
      ],
      "uses": [
        12,
        493
      ],
      "idx": 453
    },
    {
      "path": "src/app/bindinspector/ViewModelDetail.js",
      "requires": [
        439
      ],
      "uses": [
        56,
        123,
        301,
        409,
        431,
        434
      ],
      "idx": 454
    },
    {
      "path": "src/app/bindinspector/noconflict/BaseModel.js",
      "requires": [
        156
      ],
      "uses": [],
      "idx": 455
    },
    {
      "path": "src/app/bindinspector/Container.js",
      "requires": [
        71,
        123,
        303,
        314,
        356,
        409,
        410,
        443,
        445,
        452,
        453,
        454,
        455
      ],
      "uses": [
        115,
        301,
        371,
        375,
        391
      ],
      "idx": 456
    },
    {
      "path": "src/util/ComponentDragger.js",
      "requires": [
        418
      ],
      "uses": [
        19,
        87
      ],
      "idx": 457
    },
    {
      "path": "src/window/Window.js",
      "requires": [
        87,
        375,
        457
      ],
      "uses": [],
      "idx": 458
    },
    {
      "path": "src/app/bindinspector/Inspector.js",
      "requires": [
        380,
        391,
        456,
        458
      ],
      "uses": [
        123,
        314,
        445,
        453
      ],
      "idx": 459
    },
    {
      "path": "src/app/domain/Controller.js",
      "requires": [
        320,
        331
      ],
      "uses": [
        324
      ],
      "idx": 460
    },
    {
      "path": "src/app/domain/Direct.js",
      "requires": [
        219,
        320
      ],
      "uses": [],
      "idx": 461
    },
    {
      "path": "src/button/Split.js",
      "requires": [
        346
      ],
      "uses": [],
      "idx": 462
    },
    {
      "path": "src/button/Cycle.js",
      "requires": [
        462
      ],
      "uses": [],
      "idx": 463
    },
    {
      "path": "src/button/Segmented.js",
      "requires": [
        303,
        346
      ],
      "uses": [],
      "idx": 464
    },
    {
      "path": "src/rtl/button/Segmented.js",
      "requires": [],
      "uses": [],
      "idx": 465
    },
    {
      "path": "src/layout/container/Table.js",
      "requires": [
        300
      ],
      "uses": [],
      "idx": 466
    },
    {
      "path": "src/container/ButtonGroup.js",
      "requires": [
        375,
        466
      ],
      "uses": [],
      "idx": 467
    },
    {
      "path": "src/container/Monitor.js",
      "requires": [],
      "uses": [
        30
      ],
      "idx": 468
    },
    {
      "path": "src/plugin/Responsive.js",
      "requires": [
        277
      ],
      "uses": [],
      "idx": 469
    },
    {
      "path": "src/plugin/Viewport.js",
      "requires": [
        469
      ],
      "uses": [
        19
      ],
      "idx": 470
    },
    {
      "path": "src/container/Viewport.js",
      "requires": [
        277,
        303,
        470
      ],
      "uses": [],
      "idx": 471
    },
    {
      "path": "src/layout/container/Anchor.js",
      "requires": [
        301
      ],
      "uses": [],
      "idx": 472
    },
    {
      "path": "src/dashboard/Panel.js",
      "requires": [
        375
      ],
      "uses": [
        12
      ],
      "idx": 473
    },
    {
      "path": "src/dashboard/Column.js",
      "requires": [
        303,
        472,
        473
      ],
      "uses": [],
      "idx": 474
    },
    {
      "path": "src/layout/container/Column.js",
      "requires": [
        301
      ],
      "uses": [],
      "idx": 475
    },
    {
      "path": "src/rtl/layout/container/Column.js",
      "requires": [],
      "uses": [],
      "idx": 476
    },
    {
      "path": "src/resizer/SplitterTracker.js",
      "requires": [
        87,
        418
      ],
      "uses": [
        19
      ],
      "idx": 477
    },
    {
      "path": "src/rtl/resizer/SplitterTracker.js",
      "requires": [],
      "uses": [],
      "idx": 478
    },
    {
      "path": "src/layout/container/ColumnSplitterTracker.js",
      "requires": [
        477
      ],
      "uses": [],
      "idx": 479
    },
    {
      "path": "src/layout/container/ColumnSplitter.js",
      "requires": [
        353,
        479
      ],
      "uses": [],
      "idx": 480
    },
    {
      "path": "src/layout/container/Dashboard.js",
      "requires": [
        475,
        480
      ],
      "uses": [
        123,
        314
      ],
      "idx": 481
    },
    {
      "path": "src/dashboard/DropZone.js",
      "requires": [
        425
      ],
      "uses": [],
      "idx": 482
    },
    {
      "path": "src/dashboard/Part.js",
      "requires": [
        4,
        102,
        107
      ],
      "uses": [],
      "idx": 483
    },
    {
      "path": "src/dashboard/Dashboard.js",
      "requires": [
        375,
        474,
        481,
        482,
        483
      ],
      "uses": [
        66,
        102,
        105
      ],
      "idx": 484
    },
    {
      "path": "src/dom/Layer.js",
      "requires": [
        19
      ],
      "uses": [
        194,
        319
      ],
      "idx": 485
    },
    {
      "path": "src/rtl/dom/Layer.js",
      "requires": [],
      "uses": [
        485
      ],
      "idx": 486
    },
    {
      "path": "src/enums.js",
      "requires": [],
      "uses": [],
      "idx": 487
    },
    {
      "path": "src/flash/Component.js",
      "requires": [
        71
      ],
      "uses": [],
      "idx": 488
    },
    {
      "path": "src/form/action/Action.js",
      "requires": [],
      "uses": [],
      "idx": 489
    },
    {
      "path": "src/form/action/Load.js",
      "requires": [
        9,
        489
      ],
      "uses": [
        10
      ],
      "idx": 490
    },
    {
      "path": "src/form/action/Submit.js",
      "requires": [
        489
      ],
      "uses": [
        10,
        194
      ],
      "idx": 491
    },
    {
      "path": "src/form/field/TextArea.js",
      "requires": [
        24,
        101,
        442
      ],
      "uses": [
        55,
        294
      ],
      "idx": 492
    },
    {
      "path": "src/window/MessageBox.js",
      "requires": [
        316,
        346,
        356,
        362,
        390,
        442,
        458,
        472,
        492
      ],
      "uses": [
        71,
        123,
        303,
        314,
        315
      ],
      "idx": 493
    },
    {
      "path": "src/form/Basic.js",
      "requires": [
        24,
        26,
        30,
        140,
        490,
        491,
        493
      ],
      "uses": [
        468
      ],
      "idx": 494
    },
    {
      "path": "src/form/FieldAncestor.js",
      "requires": [
        3,
        468
      ],
      "uses": [],
      "idx": 495
    },
    {
      "path": "src/layout/component/field/FieldContainer.js",
      "requires": [
        314
      ],
      "uses": [],
      "idx": 496
    },
    {
      "path": "src/form/FieldContainer.js",
      "requires": [
        303,
        386,
        495,
        496
      ],
      "uses": [],
      "idx": 497
    },
    {
      "path": "src/layout/container/CheckboxGroup.js",
      "requires": [
        300
      ],
      "uses": [
        194
      ],
      "idx": 498
    },
    {
      "path": "src/form/CheckboxGroup.js",
      "requires": [
        388,
        389,
        408,
        497,
        498
      ],
      "uses": [],
      "idx": 499
    },
    {
      "path": "src/form/FieldSet.js",
      "requires": [
        303,
        495
      ],
      "uses": [
        19,
        60,
        71,
        123,
        194,
        300,
        314,
        336,
        408,
        472,
        595
      ],
      "idx": 500
    },
    {
      "path": "src/form/Label.js",
      "requires": [
        55,
        71
      ],
      "uses": [],
      "idx": 501
    },
    {
      "path": "src/form/Panel.js",
      "requires": [
        31,
        375,
        494,
        495
      ],
      "uses": [],
      "idx": 502
    },
    {
      "path": "src/form/RadioManager.js",
      "requires": [
        30
      ],
      "uses": [],
      "idx": 503
    },
    {
      "path": "src/form/field/Radio.js",
      "requires": [
        408,
        503
      ],
      "uses": [],
      "idx": 504
    },
    {
      "path": "src/form/RadioGroup.js",
      "requires": [
        360,
        499,
        504
      ],
      "uses": [
        503
      ],
      "idx": 505
    },
    {
      "path": "src/form/action/DirectLoad.js",
      "requires": [
        177,
        490
      ],
      "uses": [],
      "idx": 506
    },
    {
      "path": "src/form/action/DirectSubmit.js",
      "requires": [
        177,
        491
      ],
      "uses": [],
      "idx": 507
    },
    {
      "path": "src/form/action/StandardSubmit.js",
      "requires": [
        491
      ],
      "uses": [],
      "idx": 508
    },
    {
      "path": "src/form/field/Picker.js",
      "requires": [
        308,
        442
      ],
      "uses": [],
      "idx": 509
    },
    {
      "path": "src/layout/component/BoundList.js",
      "requires": [
        314
      ],
      "uses": [],
      "idx": 510
    },
    {
      "path": "src/toolbar/TextItem.js",
      "requires": [
        101,
        340
      ],
      "uses": [],
      "idx": 511
    },
    {
      "path": "src/form/trigger/Spinner.js",
      "requires": [
        441
      ],
      "uses": [],
      "idx": 512
    },
    {
      "path": "src/form/field/Spinner.js",
      "requires": [
        308,
        442,
        512
      ],
      "uses": [],
      "idx": 513
    },
    {
      "path": "src/form/field/Number.js",
      "requires": [
        513
      ],
      "uses": [
        55,
        56
      ],
      "idx": 514
    },
    {
      "path": "src/toolbar/Paging.js",
      "requires": [
        311,
        362,
        511,
        514
      ],
      "uses": [
        56,
        123,
        314,
        512
      ],
      "idx": 515
    },
    {
      "path": "src/view/BoundList.js",
      "requires": [
        19,
        189,
        398,
        510,
        515
      ],
      "uses": [
        101,
        123,
        314
      ],
      "idx": 516
    },
    {
      "path": "src/view/BoundListKeyNav.js",
      "requires": [
        395
      ],
      "uses": [
        308
      ],
      "idx": 517
    },
    {
      "path": "src/form/field/ComboBox.js",
      "requires": [
        24,
        188,
        311,
        509,
        516,
        517
      ],
      "uses": [
        19,
        23,
        89,
        101,
        123,
        170,
        194,
        510
      ],
      "idx": 518
    },
    {
      "path": "src/picker/Month.js",
      "requires": [
        71,
        101,
        345,
        346
      ],
      "uses": [
        123,
        314
      ],
      "idx": 519
    },
    {
      "path": "src/picker/Date.js",
      "requires": [
        41,
        71,
        101,
        308,
        345,
        346,
        462,
        519
      ],
      "uses": [
        56,
        123,
        194,
        314
      ],
      "idx": 520
    },
    {
      "path": "src/form/field/Date.js",
      "requires": [
        509,
        520
      ],
      "uses": [
        56,
        123,
        314
      ],
      "idx": 521
    },
    {
      "path": "src/form/field/FileButton.js",
      "requires": [
        346
      ],
      "uses": [],
      "idx": 522
    },
    {
      "path": "src/rtl/form/field/FileButton.js",
      "requires": [],
      "uses": [],
      "idx": 523
    },
    {
      "path": "src/form/trigger/Component.js",
      "requires": [
        441
      ],
      "uses": [],
      "idx": 524
    },
    {
      "path": "src/form/field/File.js",
      "requires": [
        442,
        522,
        524
      ],
      "uses": [
        123,
        314
      ],
      "idx": 525
    },
    {
      "path": "src/rtl/form/field/File.js",
      "requires": [],
      "uses": [],
      "idx": 526
    },
    {
      "path": "src/form/field/Hidden.js",
      "requires": [
        389
      ],
      "uses": [],
      "idx": 527
    },
    {
      "path": "src/picker/Color.js",
      "requires": [
        71,
        101
      ],
      "uses": [],
      "idx": 528
    },
    {
      "path": "src/layout/component/field/HtmlEditor.js",
      "requires": [
        496
      ],
      "uses": [],
      "idx": 529
    },
    {
      "path": "src/form/field/HtmlEditor.js",
      "requires": [
        55,
        340,
        358,
        362,
        380,
        388,
        497,
        528,
        529
      ],
      "uses": [
        24,
        56,
        71,
        123,
        194,
        293,
        314,
        371,
        564
      ],
      "idx": 530
    },
    {
      "path": "src/form/field/Tag.js",
      "requires": [
        172,
        393,
        518
      ],
      "uses": [
        23,
        51,
        101
      ],
      "idx": 531
    },
    {
      "path": "src/picker/Time.js",
      "requires": [
        172,
        516
      ],
      "uses": [
        23
      ],
      "idx": 532
    },
    {
      "path": "src/form/field/Time.js",
      "requires": [
        517,
        518,
        521,
        532
      ],
      "uses": [
        56,
        101,
        123,
        510
      ],
      "idx": 533
    },
    {
      "path": "src/form/field/Trigger.js",
      "requires": [
        194,
        345,
        442
      ],
      "uses": [],
      "idx": 534
    },
    {
      "path": "src/grid/CellEditor.js",
      "requires": [
        305
      ],
      "uses": [],
      "idx": 535
    },
    {
      "path": "src/rtl/grid/CellEditor.js",
      "requires": [],
      "uses": [],
      "idx": 536
    },
    {
      "path": "src/grid/ColumnManager.js",
      "requires": [],
      "uses": [],
      "idx": 537
    },
    {
      "path": "src/grid/RowEditorButtons.js",
      "requires": [
        303
      ],
      "uses": [
        123,
        314,
        346,
        375
      ],
      "idx": 538
    },
    {
      "path": "src/grid/RowEditor.js",
      "requires": [
        308,
        378,
        502,
        538
      ],
      "uses": [
        19,
        51,
        123,
        301,
        303,
        314,
        371,
        390
      ],
      "idx": 539
    },
    {
      "path": "src/rtl/grid/RowEditor.js",
      "requires": [],
      "uses": [],
      "idx": 540
    },
    {
      "path": "src/grid/Scroller.js",
      "requires": [],
      "uses": [],
      "idx": 541
    },
    {
      "path": "src/view/DropZone.js",
      "requires": [
        427
      ],
      "uses": [
        71,
        123,
        314
      ],
      "idx": 542
    },
    {
      "path": "src/grid/ViewDropZone.js",
      "requires": [
        542
      ],
      "uses": [],
      "idx": 543
    },
    {
      "path": "src/grid/column/Action.js",
      "requires": [
        432
      ],
      "uses": [],
      "idx": 544
    },
    {
      "path": "src/grid/column/Boolean.js",
      "requires": [
        432
      ],
      "uses": [],
      "idx": 545
    },
    {
      "path": "src/grid/column/Check.js",
      "requires": [
        432
      ],
      "uses": [],
      "idx": 546
    },
    {
      "path": "src/grid/column/Date.js",
      "requires": [
        432
      ],
      "uses": [
        55
      ],
      "idx": 547
    },
    {
      "path": "src/grid/column/Number.js",
      "requires": [
        55,
        432
      ],
      "uses": [],
      "idx": 548
    },
    {
      "path": "src/grid/column/RowNumberer.js",
      "requires": [
        432
      ],
      "uses": [],
      "idx": 549
    },
    {
      "path": "src/grid/column/Template.js",
      "requires": [
        101,
        432
      ],
      "uses": [
        546
      ],
      "idx": 550
    },
    {
      "path": "src/grid/column/Widget.js",
      "requires": [
        432
      ],
      "uses": [],
      "idx": 551
    },
    {
      "path": "src/grid/feature/Feature.js",
      "requires": [
        26
      ],
      "uses": [],
      "idx": 552
    },
    {
      "path": "src/grid/feature/AbstractSummary.js",
      "requires": [
        552
      ],
      "uses": [
        156
      ],
      "idx": 553
    },
    {
      "path": "src/grid/feature/GroupStore.js",
      "requires": [
        26
      ],
      "uses": [
        105
      ],
      "idx": 554
    },
    {
      "path": "src/grid/feature/Grouping.js",
      "requires": [
        552,
        553,
        554
      ],
      "uses": [
        101,
        430
      ],
      "idx": 555
    },
    {
      "path": "src/grid/feature/GroupingSummary.js",
      "requires": [
        555
      ],
      "uses": [],
      "idx": 556
    },
    {
      "path": "src/grid/feature/RowBody.js",
      "requires": [
        552
      ],
      "uses": [
        101
      ],
      "idx": 557
    },
    {
      "path": "src/grid/feature/Summary.js",
      "requires": [
        553
      ],
      "uses": [
        71,
        123,
        156,
        314
      ],
      "idx": 558
    },
    {
      "path": "src/rtl/grid/feature/Summary.js",
      "requires": [],
      "uses": [],
      "idx": 559
    },
    {
      "path": "src/menu/Item.js",
      "requires": [
        71,
        189
      ],
      "uses": [
        19,
        344,
        380
      ],
      "idx": 560
    },
    {
      "path": "src/menu/CheckItem.js",
      "requires": [
        560
      ],
      "uses": [
        344
      ],
      "idx": 561
    },
    {
      "path": "src/menu/KeyNav.js",
      "requires": [
        308
      ],
      "uses": [
        344
      ],
      "idx": 562
    },
    {
      "path": "src/menu/Separator.js",
      "requires": [
        560
      ],
      "uses": [],
      "idx": 563
    },
    {
      "path": "src/menu/Menu.js",
      "requires": [
        344,
        358,
        375,
        560,
        561,
        562,
        563
      ],
      "uses": [
        12,
        19,
        51,
        123,
        314
      ],
      "idx": 564
    },
    {
      "path": "src/grid/filters/filter/Base.js",
      "requires": [
        102,
        123,
        358,
        371,
        564
      ],
      "uses": [
        23
      ],
      "idx": 565
    },
    {
      "path": "src/grid/filters/filter/SingleFilter.js",
      "requires": [
        565
      ],
      "uses": [],
      "idx": 566
    },
    {
      "path": "src/grid/filters/filter/Boolean.js",
      "requires": [
        566
      ],
      "uses": [],
      "idx": 567
    },
    {
      "path": "src/grid/filters/filter/TriFilter.js",
      "requires": [
        565
      ],
      "uses": [],
      "idx": 568
    },
    {
      "path": "src/grid/filters/filter/Date.js",
      "requires": [
        123,
        314,
        561,
        568
      ],
      "uses": [
        520,
        564
      ],
      "idx": 569
    },
    {
      "path": "src/grid/filters/filter/List.js",
      "requires": [
        566
      ],
      "uses": [
        162,
        167,
        173,
        174
      ],
      "idx": 570
    },
    {
      "path": "src/grid/filters/filter/Number.js",
      "requires": [
        123,
        314,
        512,
        568
      ],
      "uses": [
        514
      ],
      "idx": 571
    },
    {
      "path": "src/grid/filters/filter/String.js",
      "requires": [
        123,
        314,
        442,
        566
      ],
      "uses": [],
      "idx": 572
    },
    {
      "path": "src/grid/filters/Filters.js",
      "requires": [
        311,
        417,
        565,
        566,
        567,
        568,
        569,
        570,
        571,
        572
      ],
      "uses": [
        102
      ],
      "idx": 573
    },
    {
      "path": "src/grid/locking/HeaderContainer.js",
      "requires": [
        430,
        537
      ],
      "uses": [],
      "idx": 574
    },
    {
      "path": "src/grid/locking/View.js",
      "requires": [
        26,
        70,
        71,
        311,
        397
      ],
      "uses": [
        12,
        312,
        403,
        436
      ],
      "idx": 575
    },
    {
      "path": "src/grid/locking/Lockable.js",
      "requires": [
        71,
        403,
        430,
        574,
        575
      ],
      "uses": [
        24,
        123,
        188,
        301,
        314,
        353,
        354
      ],
      "idx": 576
    },
    {
      "path": "src/grid/plugin/BufferedRenderer.js",
      "requires": [
        417
      ],
      "uses": [
        24
      ],
      "idx": 577
    },
    {
      "path": "src/grid/plugin/Editing.js",
      "requires": [
        26,
        308,
        389,
        403,
        417,
        432
      ],
      "uses": [
        12,
        123,
        314,
        399
      ],
      "idx": 578
    },
    {
      "path": "src/grid/plugin/CellEditing.js",
      "requires": [
        24,
        535,
        578
      ],
      "uses": [
        30,
        123,
        304,
        314
      ],
      "idx": 579
    },
    {
      "path": "src/grid/plugin/DragDrop.js",
      "requires": [
        417
      ],
      "uses": [
        543,
        642
      ],
      "idx": 580
    },
    {
      "path": "src/grid/plugin/RowEditing.js",
      "requires": [
        539,
        578
      ],
      "uses": [],
      "idx": 581
    },
    {
      "path": "src/rtl/grid/plugin/RowEditing.js",
      "requires": [],
      "uses": [],
      "idx": 582
    },
    {
      "path": "src/grid/plugin/RowExpander.js",
      "requires": [
        417,
        557
      ],
      "uses": [
        101,
        432
      ],
      "idx": 583
    },
    {
      "path": "src/grid/property/Grid.js",
      "requires": [
        406
      ],
      "uses": [
        12,
        101,
        123,
        156,
        304,
        314,
        389,
        403,
        442,
        512,
        514,
        518,
        521,
        535,
        579,
        585,
        588
      ],
      "idx": 584
    },
    {
      "path": "src/grid/property/HeaderContainer.js",
      "requires": [
        55,
        430
      ],
      "uses": [],
      "idx": 585
    },
    {
      "path": "src/grid/property/Property.js",
      "requires": [
        156
      ],
      "uses": [],
      "idx": 586
    },
    {
      "path": "src/grid/property/Reader.js",
      "requires": [
        158
      ],
      "uses": [
        157
      ],
      "idx": 587
    },
    {
      "path": "src/grid/property/Store.js",
      "requires": [
        162,
        172,
        586,
        587
      ],
      "uses": [
        167
      ],
      "idx": 588
    },
    {
      "path": "src/layout/ClassList.js",
      "requires": [],
      "uses": [],
      "idx": 589
    },
    {
      "path": "src/util/Queue.js",
      "requires": [],
      "uses": [],
      "idx": 590
    },
    {
      "path": "src/layout/ContextItem.js",
      "requires": [
        589
      ],
      "uses": [
        30,
        41,
        47,
        298
      ],
      "idx": 591
    },
    {
      "path": "src/rtl/layout/ContextItem.js",
      "requires": [],
      "uses": [],
      "idx": 592
    },
    {
      "path": "src/layout/Context.js",
      "requires": [
        41,
        47,
        281,
        299,
        590,
        591
      ],
      "uses": [],
      "idx": 593
    },
    {
      "path": "src/layout/SizePolicy.js",
      "requires": [],
      "uses": [],
      "idx": 594
    },
    {
      "path": "src/layout/component/FieldSet.js",
      "requires": [
        449
      ],
      "uses": [],
      "idx": 595
    },
    {
      "path": "src/layout/container/Absolute.js",
      "requires": [
        472
      ],
      "uses": [],
      "idx": 596
    },
    {
      "path": "src/rtl/layout/container/Absolute.js",
      "requires": [],
      "uses": [],
      "idx": 597
    },
    {
      "path": "src/layout/container/Accordion.js",
      "requires": [
        358
      ],
      "uses": [],
      "idx": 598
    },
    {
      "path": "src/layout/container/Center.js",
      "requires": [
        391
      ],
      "uses": [],
      "idx": 599
    },
    {
      "path": "src/layout/container/Form.js",
      "requires": [
        301
      ],
      "uses": [],
      "idx": 600
    },
    {
      "path": "src/layout/container/SegmentedButton.js",
      "requires": [
        300
      ],
      "uses": [],
      "idx": 601
    },
    {
      "path": "src/menu/ColorPicker.js",
      "requires": [
        528,
        564
      ],
      "uses": [
        123,
        314,
        344
      ],
      "idx": 602
    },
    {
      "path": "src/menu/DatePicker.js",
      "requires": [
        520,
        564
      ],
      "uses": [
        123,
        314,
        344
      ],
      "idx": 603
    },
    {
      "path": "src/panel/Pinnable.js",
      "requires": [
        3
      ],
      "uses": [
        123,
        314,
        336
      ],
      "idx": 604
    },
    {
      "path": "src/plugin/Manager.js",
      "requires": [],
      "uses": [],
      "idx": 605
    },
    {
      "path": "src/resizer/BorderSplitterTracker.js",
      "requires": [
        87,
        477
      ],
      "uses": [],
      "idx": 606
    },
    {
      "path": "src/rtl/resizer/BorderSplitterTracker.js",
      "requires": [],
      "uses": [],
      "idx": 607
    },
    {
      "path": "src/resizer/Handle.js",
      "requires": [
        71
      ],
      "uses": [],
      "idx": 608
    },
    {
      "path": "src/resizer/ResizeTracker.js",
      "requires": [
        418
      ],
      "uses": [],
      "idx": 609
    },
    {
      "path": "src/rtl/resizer/ResizeTracker.js",
      "requires": [],
      "uses": [],
      "idx": 610
    },
    {
      "path": "src/resizer/Resizer.js",
      "requires": [
        26
      ],
      "uses": [
        19,
        56,
        71,
        194,
        609
      ],
      "idx": 611
    },
    {
      "path": "src/scroll/Indicator.js",
      "requires": [],
      "uses": [],
      "idx": 612
    },
    {
      "path": "src/scroll/Manager.js",
      "requires": [
        26,
        51,
        289,
        612
      ],
      "uses": [],
      "idx": 613
    },
    {
      "path": "src/rtl/scroll/Manager.js",
      "requires": [],
      "uses": [],
      "idx": 614
    },
    {
      "path": "src/selection/CellModel.js",
      "requires": [
        394,
        399
      ],
      "uses": [],
      "idx": 615
    },
    {
      "path": "src/rtl/selection/CellModel.js",
      "requires": [],
      "uses": [],
      "idx": 616
    },
    {
      "path": "src/slider/Thumb.js",
      "requires": [
        55,
        418
      ],
      "uses": [
        47
      ],
      "idx": 617
    },
    {
      "path": "src/slider/Tip.js",
      "requires": [
        377
      ],
      "uses": [],
      "idx": 618
    },
    {
      "path": "src/slider/Multi.js",
      "requires": [
        55,
        56,
        389,
        617,
        618
      ],
      "uses": [
        194
      ],
      "idx": 619
    },
    {
      "path": "src/rtl/slider/Multi.js",
      "requires": [],
      "uses": [],
      "idx": 620
    },
    {
      "path": "src/selection/CheckboxModel.js",
      "requires": [
        412
      ],
      "uses": [],
      "idx": 621
    },
    {
      "path": "src/slider/Single.js",
      "requires": [
        619
      ],
      "uses": [],
      "idx": 622
    },
    {
      "path": "src/slider/Widget.js",
      "requires": [
        59,
        619
      ],
      "uses": [
        47,
        55
      ],
      "idx": 623
    },
    {
      "path": "src/sparkline/Shape.js",
      "requires": [],
      "uses": [],
      "idx": 624
    },
    {
      "path": "src/sparkline/CanvasBase.js",
      "requires": [
        624
      ],
      "uses": [],
      "idx": 625
    },
    {
      "path": "src/sparkline/CanvasCanvas.js",
      "requires": [
        625
      ],
      "uses": [],
      "idx": 626
    },
    {
      "path": "src/sparkline/VmlCanvas.js",
      "requires": [
        625
      ],
      "uses": [],
      "idx": 627
    },
    {
      "path": "src/sparkline/Base.js",
      "requires": [
        59,
        101,
        626,
        627
      ],
      "uses": [
        123,
        301,
        371,
        378
      ],
      "idx": 628
    },
    {
      "path": "src/sparkline/BarBase.js",
      "requires": [
        628
      ],
      "uses": [],
      "idx": 629
    },
    {
      "path": "src/sparkline/RangeMap.js",
      "requires": [],
      "uses": [],
      "idx": 630
    },
    {
      "path": "src/sparkline/Bar.js",
      "requires": [
        101,
        629,
        630
      ],
      "uses": [],
      "idx": 631
    },
    {
      "path": "src/sparkline/Box.js",
      "requires": [
        101,
        628
      ],
      "uses": [],
      "idx": 632
    },
    {
      "path": "src/sparkline/Bullet.js",
      "requires": [
        101,
        628
      ],
      "uses": [],
      "idx": 633
    },
    {
      "path": "src/sparkline/Discrete.js",
      "requires": [
        101,
        629
      ],
      "uses": [],
      "idx": 634
    },
    {
      "path": "src/sparkline/Line.js",
      "requires": [
        101,
        628,
        630
      ],
      "uses": [],
      "idx": 635
    },
    {
      "path": "src/sparkline/Pie.js",
      "requires": [
        101,
        628
      ],
      "uses": [],
      "idx": 636
    },
    {
      "path": "src/sparkline/TriState.js",
      "requires": [
        101,
        629,
        630
      ],
      "uses": [],
      "idx": 637
    },
    {
      "path": "src/state/CookieProvider.js",
      "requires": [
        65
      ],
      "uses": [],
      "idx": 638
    },
    {
      "path": "src/state/LocalStorageProvider.js",
      "requires": [
        65,
        292
      ],
      "uses": [],
      "idx": 639
    },
    {
      "path": "src/toolbar/Breadcrumb.js",
      "requires": [
        191,
        303,
        360,
        462
      ],
      "uses": [
        188
      ],
      "idx": 640
    },
    {
      "path": "src/toolbar/Spacer.js",
      "requires": [
        71
      ],
      "uses": [],
      "idx": 641
    },
    {
      "path": "src/view/DragZone.js",
      "requires": [
        421
      ],
      "uses": [
        56
      ],
      "idx": 642
    },
    {
      "path": "src/tree/ViewDragZone.js",
      "requires": [
        642
      ],
      "uses": [
        56
      ],
      "idx": 643
    },
    {
      "path": "src/tree/ViewDropZone.js",
      "requires": [
        542
      ],
      "uses": [],
      "idx": 644
    },
    {
      "path": "src/tree/plugin/TreeViewDragDrop.js",
      "requires": [
        417
      ],
      "uses": [
        643,
        644
      ],
      "idx": 645
    },
    {
      "path": "src/util/Cookies.js",
      "requires": [],
      "uses": [],
      "idx": 646
    },
    {
      "path": "src/view/MultiSelectorSearch.js",
      "requires": [
        375
      ],
      "uses": [
        23,
        123,
        188,
        314,
        371,
        391,
        406,
        442
      ],
      "idx": 647
    },
    {
      "path": "src/view/MultiSelector.js",
      "requires": [
        123,
        371,
        391,
        406,
        647
      ],
      "uses": [],
      "idx": 648
    },
    {
      "path": "src/window/Toast.js",
      "requires": [
        458
      ],
      "uses": [
        24
      ],
      "idx": 649
    }
  ],
  "classes": {
    "Ext.AbstractManager": {
      "idx": 7,
      "alias": [],
      "alternates": []
    },
    "Ext.Action": {
      "idx": 295,
      "alias": [],
      "alternates": []
    },
    "Ext.Ajax": {
      "idx": 10,
      "alias": [],
      "alternates": []
    },
    "Ext.AnimationQueue": {
      "idx": 11,
      "alias": [],
      "alternates": []
    },
    "Ext.Component": {
      "idx": 71,
      "alias": [
        "widget.box",
        "widget.component"
      ],
      "alternates": [
        "Ext.AbstractComponent"
      ]
    },
    "Ext.ComponentLoader": {
      "idx": 297,
      "alias": [],
      "alternates": []
    },
    "Ext.ComponentManager": {
      "idx": 12,
      "alias": [],
      "alternates": [
        "Ext.ComponentMgr"
      ]
    },
    "Ext.ComponentQuery": {
      "idx": 15,
      "alias": [],
      "alternates": []
    },
    "Ext.Editor": {
      "idx": 305,
      "alias": [
        "widget.editor"
      ],
      "alternates": []
    },
    "Ext.ElementLoader": {
      "idx": 296,
      "alias": [],
      "alternates": []
    },
    "Ext.EventManager": {
      "idx": 306,
      "alias": [],
      "alternates": []
    },
    "Ext.Evented": {
      "idx": 16,
      "alias": [],
      "alternates": [
        "Ext.EventedBase"
      ]
    },
    "Ext.FocusManager": {
      "idx": 309,
      "alias": [],
      "alternates": [
        "Ext.FocusMgr"
      ]
    },
    "Ext.GlobalEvents": {
      "idx": 51,
      "alias": [],
      "alternates": [
        "Ext.globalEvents"
      ]
    },
    "Ext.Img": {
      "idx": 310,
      "alias": [
        "widget.image",
        "widget.imagecomponent"
      ],
      "alternates": []
    },
    "Ext.LoadMask": {
      "idx": 312,
      "alias": [
        "widget.loadmask"
      ],
      "alternates": []
    },
    "Ext.Mixin": {
      "idx": 3,
      "alias": [],
      "alternates": []
    },
    "Ext.ProgressBar": {
      "idx": 316,
      "alias": [
        "widget.progressbar"
      ],
      "alternates": []
    },
    "Ext.ProgressBarWidget": {
      "idx": 317,
      "alias": [
        "widget.progressbarwidget"
      ],
      "alternates": []
    },
    "Ext.Shadow": {
      "idx": 319,
      "alias": [],
      "alternates": []
    },
    "Ext.ShadowPool": {
      "idx": 318,
      "alias": [],
      "alternates": []
    },
    "Ext.TaskQueue": {
      "idx": 54,
      "alias": [],
      "alternates": []
    },
    "Ext.Template": {
      "idx": 56,
      "alias": [],
      "alternates": []
    },
    "Ext.Widget": {
      "idx": 59,
      "alias": [
        "widget.widget"
      ],
      "alternates": []
    },
    "Ext.XTemplate": {
      "idx": 101,
      "alias": [],
      "alternates": []
    },
    "Ext.ZIndexManager": {
      "idx": 302,
      "alias": [],
      "alternates": [
        "Ext.WindowGroup"
      ]
    },
    "Ext.app.Application": {
      "idx": 382,
      "alias": [],
      "alternates": []
    },
    "Ext.app.BaseController": {
      "idx": 324,
      "alias": [],
      "alternates": []
    },
    "Ext.app.Controller": {
      "idx": 331,
      "alias": [],
      "alternates": []
    },
    "Ext.app.EventBus": {
      "idx": 322,
      "alias": [],
      "alternates": []
    },
    "Ext.app.EventDomain": {
      "idx": 320,
      "alias": [],
      "alternates": []
    },
    "Ext.app.Util": {
      "idx": 325,
      "alias": [],
      "alternates": []
    },
    "Ext.app.ViewController": {
      "idx": 385,
      "alias": [],
      "alternates": []
    },
    "Ext.app.ViewModel": {
      "idx": 138,
      "alias": [
        "viewmodel.default"
      ],
      "alternates": []
    },
    "Ext.app.bind.AbstractStub": {
      "idx": 127,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bind.BaseBinding": {
      "idx": 125,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bind.Binding": {
      "idx": 126,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bind.Formula": {
      "idx": 132,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bind.LinkStub": {
      "idx": 129,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bind.Multi": {
      "idx": 131,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bind.RootStub": {
      "idx": 130,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bind.Stub": {
      "idx": 128,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bind.Template": {
      "idx": 133,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bind.TemplateBinding": {
      "idx": 134,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bindinspector.ComponentDetail": {
      "idx": 410,
      "alias": [
        "widget.bindinspector-componentdetail"
      ],
      "alternates": []
    },
    "Ext.app.bindinspector.ComponentList": {
      "idx": 443,
      "alias": [
        "widget.bindinspector-componentlist"
      ],
      "alternates": []
    },
    "Ext.app.bindinspector.Container": {
      "idx": 456,
      "alias": [
        "widget.bindinspector-container"
      ],
      "alternates": []
    },
    "Ext.app.bindinspector.Environment": {
      "idx": 453,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bindinspector.Inspector": {
      "idx": 459,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bindinspector.Util": {
      "idx": 409,
      "alias": [],
      "alternates": []
    },
    "Ext.app.bindinspector.ViewModelDetail": {
      "idx": 454,
      "alias": [
        "widget.bindinspector-viewmodeldetail"
      ],
      "alternates": []
    },
    "Ext.app.bindinspector.noconflict.BaseModel": {
      "idx": 455,
      "alias": [],
      "alternates": []
    },
    "Ext.app.domain.Component": {
      "idx": 321,
      "alias": [],
      "alternates": []
    },
    "Ext.app.domain.Controller": {
      "idx": 460,
      "alias": [],
      "alternates": []
    },
    "Ext.app.domain.Direct": {
      "idx": 461,
      "alias": [],
      "alternates": []
    },
    "Ext.app.domain.Global": {
      "idx": 323,
      "alias": [],
      "alternates": []
    },
    "Ext.app.domain.Store": {
      "idx": 326,
      "alias": [],
      "alternates": []
    },
    "Ext.app.domain.View": {
      "idx": 384,
      "alias": [],
      "alternates": []
    },
    "Ext.app.route.Queue": {
      "idx": 327,
      "alias": [],
      "alternates": []
    },
    "Ext.app.route.Route": {
      "idx": 328,
      "alias": [],
      "alternates": []
    },
    "Ext.app.route.Router": {
      "idx": 330,
      "alias": [],
      "alternates": []
    },
    "Ext.button.Button": {
      "idx": 346,
      "alias": [
        "widget.button"
      ],
      "alternates": [
        "Ext.Button"
      ]
    },
    "Ext.button.Cycle": {
      "idx": 463,
      "alias": [
        "widget.cycle"
      ],
      "alternates": [
        "Ext.CycleButton"
      ]
    },
    "Ext.button.Manager": {
      "idx": 343,
      "alias": [],
      "alternates": [
        "Ext.ButtonToggleManager"
      ]
    },
    "Ext.button.Segmented": {
      "idx": 464,
      "alias": [
        "widget.segmentedbutton"
      ],
      "alternates": []
    },
    "Ext.button.Split": {
      "idx": 462,
      "alias": [
        "widget.splitbutton"
      ],
      "alternates": [
        "Ext.SplitButton"
      ]
    },
    "Ext.container.ButtonGroup": {
      "idx": 467,
      "alias": [
        "widget.buttongroup"
      ],
      "alternates": [
        "Ext.ButtonGroup"
      ]
    },
    "Ext.container.Container": {
      "idx": 303,
      "alias": [
        "widget.container"
      ],
      "alternates": [
        "Ext.Container",
        "Ext.AbstractContainer"
      ]
    },
    "Ext.container.DockingContainer": {
      "idx": 374,
      "alias": [],
      "alternates": []
    },
    "Ext.container.Monitor": {
      "idx": 468,
      "alias": [],
      "alternates": []
    },
    "Ext.container.Viewport": {
      "idx": 471,
      "alias": [
        "widget.viewport"
      ],
      "alternates": [
        "Ext.Viewport"
      ]
    },
    "Ext.dashboard.Column": {
      "idx": 474,
      "alias": [
        "widget.dashboard-column"
      ],
      "alternates": []
    },
    "Ext.dashboard.Dashboard": {
      "idx": 484,
      "alias": [
        "widget.dashboard"
      ],
      "alternates": []
    },
    "Ext.dashboard.DropZone": {
      "idx": 482,
      "alias": [],
      "alternates": []
    },
    "Ext.dashboard.Panel": {
      "idx": 473,
      "alias": [
        "widget.dashboard-panel"
      ],
      "alternates": []
    },
    "Ext.dashboard.Part": {
      "idx": 483,
      "alias": [
        "part.part"
      ],
      "alternates": []
    },
    "Ext.data.AbstractStore": {
      "idx": 135,
      "alias": [],
      "alternates": []
    },
    "Ext.data.ArrayStore": {
      "idx": 174,
      "alias": [
        "store.array"
      ],
      "alternates": [
        "Ext.data.SimpleStore"
      ]
    },
    "Ext.data.Batch": {
      "idx": 116,
      "alias": [],
      "alternates": []
    },
    "Ext.data.BufferedStore": {
      "idx": 176,
      "alias": [
        "store.buffered"
      ],
      "alternates": []
    },
    "Ext.data.ChainedStore": {
      "idx": 137,
      "alias": [
        "store.chained"
      ],
      "alternates": []
    },
    "Ext.data.Connection": {
      "idx": 9,
      "alias": [],
      "alternates": []
    },
    "Ext.data.DirectStore": {
      "idx": 179,
      "alias": [
        "store.direct"
      ],
      "alternates": []
    },
    "Ext.data.Error": {
      "idx": 139,
      "alias": [],
      "alternates": []
    },
    "Ext.data.ErrorCollection": {
      "idx": 140,
      "alias": [],
      "alternates": [
        "Ext.data.Errors"
      ]
    },
    "Ext.data.JsonP": {
      "idx": 180,
      "alias": [],
      "alternates": []
    },
    "Ext.data.JsonPStore": {
      "idx": 182,
      "alias": [
        "store.jsonp"
      ],
      "alternates": []
    },
    "Ext.data.JsonStore": {
      "idx": 183,
      "alias": [
        "store.json"
      ],
      "alternates": []
    },
    "Ext.data.LocalStore": {
      "idx": 136,
      "alias": [],
      "alternates": []
    },
    "Ext.data.Model": {
      "idx": 156,
      "alias": [],
      "alternates": [
        "Ext.data.Record"
      ]
    },
    "Ext.data.ModelManager": {
      "idx": 184,
      "alias": [],
      "alternates": [
        "Ext.ModelMgr"
      ]
    },
    "Ext.data.NodeInterface": {
      "idx": 185,
      "alias": [],
      "alternates": []
    },
    "Ext.data.NodeStore": {
      "idx": 186,
      "alias": [
        "store.node"
      ],
      "alternates": []
    },
    "Ext.data.PageMap": {
      "idx": 175,
      "alias": [],
      "alternates": []
    },
    "Ext.data.ProxyStore": {
      "idx": 163,
      "alias": [],
      "alternates": []
    },
    "Ext.data.Request": {
      "idx": 187,
      "alias": [],
      "alternates": []
    },
    "Ext.data.ResultSet": {
      "idx": 157,
      "alias": [],
      "alternates": []
    },
    "Ext.data.Session": {
      "idx": 123,
      "alias": [],
      "alternates": []
    },
    "Ext.data.SortTypes": {
      "idx": 146,
      "alias": [],
      "alternates": []
    },
    "Ext.data.Store": {
      "idx": 172,
      "alias": [
        "store.store"
      ],
      "alternates": []
    },
    "Ext.data.StoreManager": {
      "idx": 188,
      "alias": [],
      "alternates": [
        "Ext.StoreMgr",
        "Ext.data.StoreMgr",
        "Ext.StoreManager"
      ]
    },
    "Ext.data.TreeModel": {
      "idx": 190,
      "alias": [],
      "alternates": []
    },
    "Ext.data.TreeStore": {
      "idx": 191,
      "alias": [
        "store.tree"
      ],
      "alternates": []
    },
    "Ext.data.Types": {
      "idx": 192,
      "alias": [],
      "alternates": []
    },
    "Ext.data.Validation": {
      "idx": 193,
      "alias": [],
      "alternates": []
    },
    "Ext.data.XmlStore": {
      "idx": 199,
      "alias": [
        "store.xml"
      ],
      "alternates": []
    },
    "Ext.data.field.Boolean": {
      "idx": 149,
      "alias": [
        "data.field.bool",
        "data.field.boolean"
      ],
      "alternates": []
    },
    "Ext.data.field.Date": {
      "idx": 150,
      "alias": [
        "data.field.date"
      ],
      "alternates": []
    },
    "Ext.data.field.Field": {
      "idx": 148,
      "alias": [
        "data.field.auto"
      ],
      "alternates": [
        "Ext.data.Field"
      ]
    },
    "Ext.data.field.Integer": {
      "idx": 151,
      "alias": [
        "data.field.int",
        "data.field.integer"
      ],
      "alternates": []
    },
    "Ext.data.field.Number": {
      "idx": 152,
      "alias": [
        "data.field.float",
        "data.field.number"
      ],
      "alternates": []
    },
    "Ext.data.field.String": {
      "idx": 153,
      "alias": [
        "data.field.string"
      ],
      "alternates": []
    },
    "Ext.data.flash.BinaryXhr": {
      "idx": 8,
      "alias": [],
      "alternates": []
    },
    "Ext.data.identifier.Generator": {
      "idx": 154,
      "alias": [
        "data.identifier.default"
      ],
      "alternates": []
    },
    "Ext.data.identifier.Negative": {
      "idx": 200,
      "alias": [
        "data.identifier.negative"
      ],
      "alternates": []
    },
    "Ext.data.identifier.Sequential": {
      "idx": 155,
      "alias": [
        "data.identifier.sequential"
      ],
      "alternates": []
    },
    "Ext.data.identifier.Uuid": {
      "idx": 201,
      "alias": [
        "data.identifier.uuid"
      ],
      "alternates": []
    },
    "Ext.data.matrix.Matrix": {
      "idx": 119,
      "alias": [],
      "alternates": []
    },
    "Ext.data.matrix.Side": {
      "idx": 118,
      "alias": [],
      "alternates": []
    },
    "Ext.data.matrix.Slice": {
      "idx": 117,
      "alias": [],
      "alternates": []
    },
    "Ext.data.operation.Create": {
      "idx": 142,
      "alias": [
        "data.operation.create"
      ],
      "alternates": []
    },
    "Ext.data.operation.Destroy": {
      "idx": 143,
      "alias": [
        "data.operation.destroy"
      ],
      "alternates": []
    },
    "Ext.data.operation.Operation": {
      "idx": 141,
      "alias": [],
      "alternates": [
        "Ext.data.Operation"
      ]
    },
    "Ext.data.operation.Read": {
      "idx": 144,
      "alias": [
        "data.operation.read"
      ],
      "alternates": []
    },
    "Ext.data.operation.Update": {
      "idx": 145,
      "alias": [
        "data.operation.update"
      ],
      "alternates": []
    },
    "Ext.data.proxy.Ajax": {
      "idx": 165,
      "alias": [
        "proxy.ajax"
      ],
      "alternates": [
        "Ext.data.HttpProxy",
        "Ext.data.AjaxProxy"
      ]
    },
    "Ext.data.proxy.Client": {
      "idx": 161,
      "alias": [],
      "alternates": [
        "Ext.data.ClientProxy"
      ]
    },
    "Ext.data.proxy.Direct": {
      "idx": 178,
      "alias": [
        "proxy.direct"
      ],
      "alternates": [
        "Ext.data.DirectProxy"
      ]
    },
    "Ext.data.proxy.JsonP": {
      "idx": 181,
      "alias": [
        "proxy.jsonp",
        "proxy.scripttag"
      ],
      "alternates": [
        "Ext.data.ScriptTagProxy"
      ]
    },
    "Ext.data.proxy.LocalStorage": {
      "idx": 203,
      "alias": [
        "proxy.localstorage"
      ],
      "alternates": [
        "Ext.data.LocalStorageProxy"
      ]
    },
    "Ext.data.proxy.Memory": {
      "idx": 162,
      "alias": [
        "proxy.memory"
      ],
      "alternates": [
        "Ext.data.MemoryProxy"
      ]
    },
    "Ext.data.proxy.Proxy": {
      "idx": 160,
      "alias": [
        "proxy.proxy"
      ],
      "alternates": [
        "Ext.data.DataProxy",
        "Ext.data.Proxy"
      ]
    },
    "Ext.data.proxy.Rest": {
      "idx": 204,
      "alias": [
        "proxy.rest"
      ],
      "alternates": [
        "Ext.data.RestProxy"
      ]
    },
    "Ext.data.proxy.Server": {
      "idx": 164,
      "alias": [
        "proxy.server"
      ],
      "alternates": [
        "Ext.data.ServerProxy"
      ]
    },
    "Ext.data.proxy.SessionStorage": {
      "idx": 205,
      "alias": [
        "proxy.sessionstorage"
      ],
      "alternates": [
        "Ext.data.SessionStorageProxy"
      ]
    },
    "Ext.data.proxy.Sql": {
      "idx": 206,
      "alias": [
        "proxy.sql"
      ],
      "alternates": [
        "Ext.data.proxy.SQL"
      ]
    },
    "Ext.data.proxy.WebStorage": {
      "idx": 202,
      "alias": [],
      "alternates": [
        "Ext.data.WebStorageProxy"
      ]
    },
    "Ext.data.reader.Array": {
      "idx": 173,
      "alias": [
        "reader.array"
      ],
      "alternates": [
        "Ext.data.ArrayReader"
      ]
    },
    "Ext.data.reader.Json": {
      "idx": 166,
      "alias": [
        "reader.json"
      ],
      "alternates": [
        "Ext.data.JsonReader"
      ]
    },
    "Ext.data.reader.Reader": {
      "idx": 158,
      "alias": [
        "reader.base"
      ],
      "alternates": [
        "Ext.data.Reader",
        "Ext.data.DataReader"
      ]
    },
    "Ext.data.reader.Xml": {
      "idx": 197,
      "alias": [
        "reader.xml"
      ],
      "alternates": [
        "Ext.data.XmlReader"
      ]
    },
    "Ext.data.schema.Association": {
      "idx": 109,
      "alias": [],
      "alternates": []
    },
    "Ext.data.schema.ManyToMany": {
      "idx": 112,
      "alias": [],
      "alternates": []
    },
    "Ext.data.schema.ManyToOne": {
      "idx": 111,
      "alias": [],
      "alternates": []
    },
    "Ext.data.schema.Namer": {
      "idx": 114,
      "alias": [
        "namer.default"
      ],
      "alternates": []
    },
    "Ext.data.schema.OneToOne": {
      "idx": 110,
      "alias": [],
      "alternates": []
    },
    "Ext.data.schema.Role": {
      "idx": 108,
      "alias": [],
      "alternates": []
    },
    "Ext.data.schema.Schema": {
      "idx": 115,
      "alias": [
        "schema.default"
      ],
      "alternates": []
    },
    "Ext.data.session.BatchVisitor": {
      "idx": 122,
      "alias": [],
      "alternates": []
    },
    "Ext.data.session.ChangesVisitor": {
      "idx": 120,
      "alias": [],
      "alternates": []
    },
    "Ext.data.session.ChildChangesVisitor": {
      "idx": 121,
      "alias": [],
      "alternates": []
    },
    "Ext.data.validator.Bound": {
      "idx": 207,
      "alias": [
        "data.validator.bound"
      ],
      "alternates": []
    },
    "Ext.data.validator.Email": {
      "idx": 209,
      "alias": [
        "data.validator.email"
      ],
      "alternates": []
    },
    "Ext.data.validator.Exclusion": {
      "idx": 211,
      "alias": [
        "data.validator.exclusion"
      ],
      "alternates": []
    },
    "Ext.data.validator.Format": {
      "idx": 208,
      "alias": [
        "data.validator.format"
      ],
      "alternates": []
    },
    "Ext.data.validator.Inclusion": {
      "idx": 212,
      "alias": [
        "data.validator.inclusion"
      ],
      "alternates": []
    },
    "Ext.data.validator.Length": {
      "idx": 213,
      "alias": [
        "data.validator.length"
      ],
      "alternates": []
    },
    "Ext.data.validator.List": {
      "idx": 210,
      "alias": [
        "data.validator.list"
      ],
      "alternates": []
    },
    "Ext.data.validator.Presence": {
      "idx": 214,
      "alias": [
        "data.validator.presence"
      ],
      "alternates": []
    },
    "Ext.data.validator.Range": {
      "idx": 215,
      "alias": [
        "data.validator.range"
      ],
      "alternates": []
    },
    "Ext.data.validator.Validator": {
      "idx": 147,
      "alias": [
        "data.validator.base"
      ],
      "alternates": []
    },
    "Ext.data.writer.Json": {
      "idx": 167,
      "alias": [
        "writer.json"
      ],
      "alternates": [
        "Ext.data.JsonWriter"
      ]
    },
    "Ext.data.writer.Writer": {
      "idx": 159,
      "alias": [
        "writer.base"
      ],
      "alternates": [
        "Ext.data.DataWriter",
        "Ext.data.Writer"
      ]
    },
    "Ext.data.writer.Xml": {
      "idx": 198,
      "alias": [
        "writer.xml"
      ],
      "alternates": [
        "Ext.data.XmlWriter"
      ]
    },
    "Ext.dd.DD": {
      "idx": 364,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.DDProxy": {
      "idx": 366,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.DDTarget": {
      "idx": 423,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.DragDrop": {
      "idx": 363,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.DragDropManager": {
      "idx": 352,
      "alias": [],
      "alternates": [
        "Ext.dd.DragDropMgr",
        "Ext.dd.DDM"
      ]
    },
    "Ext.dd.DragSource": {
      "idx": 368,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.DragTracker": {
      "idx": 418,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.DragZone": {
      "idx": 421,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.DropTarget": {
      "idx": 425,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.DropZone": {
      "idx": 427,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.Registry": {
      "idx": 426,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.ScrollManager": {
      "idx": 424,
      "alias": [],
      "alternates": []
    },
    "Ext.dd.StatusProxy": {
      "idx": 367,
      "alias": [],
      "alternates": []
    },
    "Ext.direct.Event": {
      "idx": 216,
      "alias": [
        "direct.event"
      ],
      "alternates": []
    },
    "Ext.direct.ExceptionEvent": {
      "idx": 218,
      "alias": [
        "direct.exception"
      ],
      "alternates": []
    },
    "Ext.direct.JsonProvider": {
      "idx": 220,
      "alias": [
        "direct.jsonprovider"
      ],
      "alternates": []
    },
    "Ext.direct.Manager": {
      "idx": 177,
      "alias": [],
      "alternates": []
    },
    "Ext.direct.PollingProvider": {
      "idx": 221,
      "alias": [
        "direct.pollingprovider"
      ],
      "alternates": []
    },
    "Ext.direct.Provider": {
      "idx": 219,
      "alias": [
        "direct.provider"
      ],
      "alternates": []
    },
    "Ext.direct.RemotingEvent": {
      "idx": 217,
      "alias": [
        "direct.rpc"
      ],
      "alternates": []
    },
    "Ext.direct.RemotingMethod": {
      "idx": 222,
      "alias": [],
      "alternates": []
    },
    "Ext.direct.RemotingProvider": {
      "idx": 224,
      "alias": [
        "direct.remotingprovider"
      ],
      "alternates": []
    },
    "Ext.direct.Transaction": {
      "idx": 223,
      "alias": [
        "direct.transaction"
      ],
      "alternates": [
        "Ext.Direct.Transaction"
      ]
    },
    "Ext.dom.ButtonElement": {
      "idx": 342,
      "alias": [],
      "alternates": []
    },
    "Ext.dom.CompositeElement": {
      "idx": 61,
      "alias": [],
      "alternates": [
        "Ext.CompositeElement"
      ]
    },
    "Ext.dom.CompositeElementLite": {
      "idx": 21,
      "alias": [],
      "alternates": [
        "Ext.CompositeElementLite"
      ]
    },
    "Ext.dom.Element": {
      "idx": 19,
      "alias": [],
      "alternates": [
        "Ext.Element"
      ]
    },
    "Ext.dom.Fly": {
      "idx": 20,
      "alias": [],
      "alternates": [
        "Ext.dom.Element.Fly"
      ]
    },
    "Ext.dom.GarbageCollector": {
      "idx": 49,
      "alias": [],
      "alternates": []
    },
    "Ext.dom.Helper": {
      "idx": 194,
      "alias": [],
      "alternates": [
        "Ext.DomHelper",
        "Ext.core.DomHelper"
      ]
    },
    "Ext.dom.Layer": {
      "idx": 485,
      "alias": [],
      "alternates": [
        "Ext.Layer"
      ]
    },
    "Ext.dom.Query": {
      "idx": 196,
      "alias": [],
      "alternates": [
        "Ext.core.DomQuery",
        "Ext.DomQuery"
      ]
    },
    "Ext.event.Controller": {
      "idx": 1,
      "alias": [],
      "alternates": []
    },
    "Ext.event.Dispatcher": {
      "idx": 2,
      "alias": [],
      "alternates": []
    },
    "Ext.event.Event": {
      "idx": 89,
      "alias": [],
      "alternates": [
        "Ext.EventObjectImpl"
      ]
    },
    "Ext.event.ListenerStack": {
      "idx": 0,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.DoubleTap": {
      "idx": 76,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.Drag": {
      "idx": 77,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.EdgeSwipe": {
      "idx": 79,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.LongPress": {
      "idx": 80,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.MultiTouch": {
      "idx": 81,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.Pinch": {
      "idx": 82,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.Recognizer": {
      "idx": 74,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.Rotate": {
      "idx": 83,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.SingleTouch": {
      "idx": 75,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.Swipe": {
      "idx": 78,
      "alias": [],
      "alternates": []
    },
    "Ext.event.gesture.Tap": {
      "idx": 84,
      "alias": [],
      "alternates": []
    },
    "Ext.event.publisher.Dom": {
      "idx": 92,
      "alias": [],
      "alternates": []
    },
    "Ext.event.publisher.ElementPaint": {
      "idx": 229,
      "alias": [],
      "alternates": []
    },
    "Ext.event.publisher.ElementSize": {
      "idx": 236,
      "alias": [],
      "alternates": []
    },
    "Ext.event.publisher.Focus": {
      "idx": 96,
      "alias": [],
      "alternates": []
    },
    "Ext.event.publisher.Gesture": {
      "idx": 94,
      "alias": [],
      "alternates": [
        "Ext.event.publisher.TouchGesture"
      ]
    },
    "Ext.event.publisher.Publisher": {
      "idx": 85,
      "alias": [],
      "alternates": []
    },
    "Ext.flash.Component": {
      "idx": 488,
      "alias": [
        "widget.flash"
      ],
      "alternates": [
        "Ext.FlashComponent"
      ]
    },
    "Ext.form.Basic": {
      "idx": 494,
      "alias": [],
      "alternates": [
        "Ext.form.BasicForm"
      ]
    },
    "Ext.form.CheckboxGroup": {
      "idx": 499,
      "alias": [
        "widget.checkboxgroup"
      ],
      "alternates": []
    },
    "Ext.form.CheckboxManager": {
      "idx": 407,
      "alias": [],
      "alternates": []
    },
    "Ext.form.FieldAncestor": {
      "idx": 495,
      "alias": [],
      "alternates": []
    },
    "Ext.form.FieldContainer": {
      "idx": 497,
      "alias": [
        "widget.fieldcontainer"
      ],
      "alternates": []
    },
    "Ext.form.FieldSet": {
      "idx": 500,
      "alias": [
        "widget.fieldset"
      ],
      "alternates": []
    },
    "Ext.form.Label": {
      "idx": 501,
      "alias": [
        "widget.label"
      ],
      "alternates": []
    },
    "Ext.form.Labelable": {
      "idx": 386,
      "alias": [],
      "alternates": []
    },
    "Ext.form.Panel": {
      "idx": 502,
      "alias": [
        "widget.form"
      ],
      "alternates": [
        "Ext.FormPanel",
        "Ext.form.FormPanel"
      ]
    },
    "Ext.form.RadioGroup": {
      "idx": 505,
      "alias": [
        "widget.radiogroup"
      ],
      "alternates": []
    },
    "Ext.form.RadioManager": {
      "idx": 503,
      "alias": [],
      "alternates": []
    },
    "Ext.form.action.Action": {
      "idx": 489,
      "alias": [],
      "alternates": [
        "Ext.form.Action"
      ]
    },
    "Ext.form.action.DirectLoad": {
      "idx": 506,
      "alias": [
        "formaction.directload"
      ],
      "alternates": [
        "Ext.form.Action.DirectLoad"
      ]
    },
    "Ext.form.action.DirectSubmit": {
      "idx": 507,
      "alias": [
        "formaction.directsubmit"
      ],
      "alternates": [
        "Ext.form.Action.DirectSubmit"
      ]
    },
    "Ext.form.action.Load": {
      "idx": 490,
      "alias": [
        "formaction.load"
      ],
      "alternates": [
        "Ext.form.Action.Load"
      ]
    },
    "Ext.form.action.StandardSubmit": {
      "idx": 508,
      "alias": [
        "formaction.standardsubmit"
      ],
      "alternates": []
    },
    "Ext.form.action.Submit": {
      "idx": 491,
      "alias": [
        "formaction.submit"
      ],
      "alternates": [
        "Ext.form.Action.Submit"
      ]
    },
    "Ext.form.field.Base": {
      "idx": 389,
      "alias": [
        "widget.field"
      ],
      "alternates": [
        "Ext.form.Field",
        "Ext.form.BaseField"
      ]
    },
    "Ext.form.field.Checkbox": {
      "idx": 408,
      "alias": [
        "widget.checkbox",
        "widget.checkboxfield"
      ],
      "alternates": [
        "Ext.form.Checkbox"
      ]
    },
    "Ext.form.field.ComboBox": {
      "idx": 518,
      "alias": [
        "widget.combo",
        "widget.combobox"
      ],
      "alternates": [
        "Ext.form.ComboBox"
      ]
    },
    "Ext.form.field.Date": {
      "idx": 521,
      "alias": [
        "widget.datefield"
      ],
      "alternates": [
        "Ext.form.DateField",
        "Ext.form.Date"
      ]
    },
    "Ext.form.field.Display": {
      "idx": 390,
      "alias": [
        "widget.displayfield"
      ],
      "alternates": [
        "Ext.form.DisplayField",
        "Ext.form.Display"
      ]
    },
    "Ext.form.field.Field": {
      "idx": 388,
      "alias": [],
      "alternates": []
    },
    "Ext.form.field.File": {
      "idx": 525,
      "alias": [
        "widget.filefield",
        "widget.fileuploadfield"
      ],
      "alternates": [
        "Ext.form.FileUploadField",
        "Ext.ux.form.FileUploadField",
        "Ext.form.File"
      ]
    },
    "Ext.form.field.FileButton": {
      "idx": 522,
      "alias": [
        "widget.filebutton"
      ],
      "alternates": []
    },
    "Ext.form.field.Hidden": {
      "idx": 527,
      "alias": [
        "widget.hidden",
        "widget.hiddenfield"
      ],
      "alternates": [
        "Ext.form.Hidden"
      ]
    },
    "Ext.form.field.HtmlEditor": {
      "idx": 530,
      "alias": [
        "widget.htmleditor"
      ],
      "alternates": [
        "Ext.form.HtmlEditor"
      ]
    },
    "Ext.form.field.Number": {
      "idx": 514,
      "alias": [
        "widget.numberfield"
      ],
      "alternates": [
        "Ext.form.NumberField",
        "Ext.form.Number"
      ]
    },
    "Ext.form.field.Picker": {
      "idx": 509,
      "alias": [
        "widget.pickerfield"
      ],
      "alternates": [
        "Ext.form.Picker"
      ]
    },
    "Ext.form.field.Radio": {
      "idx": 504,
      "alias": [
        "widget.radio",
        "widget.radiofield"
      ],
      "alternates": [
        "Ext.form.Radio"
      ]
    },
    "Ext.form.field.Spinner": {
      "idx": 513,
      "alias": [
        "widget.spinnerfield"
      ],
      "alternates": [
        "Ext.form.Spinner"
      ]
    },
    "Ext.form.field.Tag": {
      "idx": 531,
      "alias": [
        "widget.tagfield"
      ],
      "alternates": []
    },
    "Ext.form.field.Text": {
      "idx": 442,
      "alias": [
        "widget.textfield"
      ],
      "alternates": [
        "Ext.form.TextField",
        "Ext.form.Text"
      ]
    },
    "Ext.form.field.TextArea": {
      "idx": 492,
      "alias": [
        "widget.textarea",
        "widget.textareafield"
      ],
      "alternates": [
        "Ext.form.TextArea"
      ]
    },
    "Ext.form.field.Time": {
      "idx": 533,
      "alias": [
        "widget.timefield"
      ],
      "alternates": [
        "Ext.form.TimeField",
        "Ext.form.Time"
      ]
    },
    "Ext.form.field.Trigger": {
      "idx": 534,
      "alias": [
        "widget.trigger",
        "widget.triggerfield"
      ],
      "alternates": [
        "Ext.form.TriggerField",
        "Ext.form.TwinTriggerField",
        "Ext.form.Trigger"
      ]
    },
    "Ext.form.field.VTypes": {
      "idx": 440,
      "alias": [],
      "alternates": [
        "Ext.form.VTypes"
      ]
    },
    "Ext.form.trigger.Component": {
      "idx": 524,
      "alias": [
        "trigger.component"
      ],
      "alternates": []
    },
    "Ext.form.trigger.Spinner": {
      "idx": 512,
      "alias": [
        "trigger.spinner"
      ],
      "alternates": []
    },
    "Ext.form.trigger.Trigger": {
      "idx": 441,
      "alias": [
        "trigger.trigger"
      ],
      "alternates": []
    },
    "Ext.fx.Anim": {
      "idx": 47,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.Animation": {
      "idx": 246,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.Animator": {
      "idx": 42,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.CubicBezier": {
      "idx": 43,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.DrawPath": {
      "idx": 45,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.Easing": {
      "idx": 44,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.Manager": {
      "idx": 41,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.PropertyHandler": {
      "idx": 46,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.Queue": {
      "idx": 40,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.Runner": {
      "idx": 249,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.State": {
      "idx": 237,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.animation.Abstract": {
      "idx": 238,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.animation.Cube": {
      "idx": 250,
      "alias": [
        "animation.cube"
      ],
      "alternates": []
    },
    "Ext.fx.animation.Fade": {
      "idx": 241,
      "alias": [
        "animation.fade",
        "animation.fadeIn"
      ],
      "alternates": [
        "Ext.fx.animation.FadeIn"
      ]
    },
    "Ext.fx.animation.FadeOut": {
      "idx": 242,
      "alias": [
        "animation.fadeOut"
      ],
      "alternates": []
    },
    "Ext.fx.animation.Flip": {
      "idx": 243,
      "alias": [
        "animation.flip"
      ],
      "alternates": []
    },
    "Ext.fx.animation.Pop": {
      "idx": 244,
      "alias": [
        "animation.pop",
        "animation.popIn"
      ],
      "alternates": [
        "Ext.fx.animation.PopIn"
      ]
    },
    "Ext.fx.animation.PopOut": {
      "idx": 245,
      "alias": [
        "animation.popOut"
      ],
      "alternates": []
    },
    "Ext.fx.animation.Slide": {
      "idx": 239,
      "alias": [
        "animation.slide",
        "animation.slideIn"
      ],
      "alternates": [
        "Ext.fx.animation.SlideIn"
      ]
    },
    "Ext.fx.animation.SlideOut": {
      "idx": 240,
      "alias": [
        "animation.slideOut"
      ],
      "alternates": []
    },
    "Ext.fx.animation.Wipe": {
      "idx": 251,
      "alias": [],
      "alternates": [
        "Ext.fx.animation.WipeIn"
      ]
    },
    "Ext.fx.animation.WipeOut": {
      "idx": 252,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.easing.Abstract": {
      "idx": 253,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.easing.Bounce": {
      "idx": 254,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.easing.BoundMomentum": {
      "idx": 256,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.easing.EaseIn": {
      "idx": 258,
      "alias": [
        "easing.ease-in"
      ],
      "alternates": []
    },
    "Ext.fx.easing.EaseOut": {
      "idx": 259,
      "alias": [
        "easing.ease-out"
      ],
      "alternates": []
    },
    "Ext.fx.easing.Easing": {
      "idx": 260,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.easing.Linear": {
      "idx": 257,
      "alias": [
        "easing.linear"
      ],
      "alternates": []
    },
    "Ext.fx.easing.Momentum": {
      "idx": 255,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.layout.Card": {
      "idx": 270,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.layout.card.Abstract": {
      "idx": 261,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.layout.card.Cover": {
      "idx": 264,
      "alias": [
        "fx.layout.card.cover"
      ],
      "alternates": []
    },
    "Ext.fx.layout.card.Cube": {
      "idx": 271,
      "alias": [
        "fx.layout.card.cube"
      ],
      "alternates": []
    },
    "Ext.fx.layout.card.Fade": {
      "idx": 266,
      "alias": [
        "fx.layout.card.fade"
      ],
      "alternates": []
    },
    "Ext.fx.layout.card.Flip": {
      "idx": 267,
      "alias": [
        "fx.layout.card.flip"
      ],
      "alternates": []
    },
    "Ext.fx.layout.card.Pop": {
      "idx": 268,
      "alias": [
        "fx.layout.card.pop"
      ],
      "alternates": []
    },
    "Ext.fx.layout.card.Reveal": {
      "idx": 265,
      "alias": [
        "fx.layout.card.reveal"
      ],
      "alternates": []
    },
    "Ext.fx.layout.card.Scroll": {
      "idx": 269,
      "alias": [
        "fx.layout.card.scroll"
      ],
      "alternates": []
    },
    "Ext.fx.layout.card.ScrollCover": {
      "idx": 272,
      "alias": [
        "fx.layout.card.scrollcover"
      ],
      "alternates": []
    },
    "Ext.fx.layout.card.ScrollReveal": {
      "idx": 273,
      "alias": [
        "fx.layout.card.scrollreveal"
      ],
      "alternates": []
    },
    "Ext.fx.layout.card.Slide": {
      "idx": 263,
      "alias": [
        "fx.layout.card.slide"
      ],
      "alternates": []
    },
    "Ext.fx.layout.card.Style": {
      "idx": 262,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.runner.Css": {
      "idx": 247,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.runner.CssAnimation": {
      "idx": 274,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.runner.CssTransition": {
      "idx": 248,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.target.Component": {
      "idx": 39,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.target.CompositeElement": {
      "idx": 35,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.target.CompositeElementCSS": {
      "idx": 36,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.target.CompositeSprite": {
      "idx": 38,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.target.Element": {
      "idx": 33,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.target.ElementCSS": {
      "idx": 34,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.target.Sprite": {
      "idx": 37,
      "alias": [],
      "alternates": []
    },
    "Ext.fx.target.Target": {
      "idx": 32,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.CellContext": {
      "idx": 399,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.CellEditor": {
      "idx": 535,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.ColumnComponentLayout": {
      "idx": 431,
      "alias": [
        "layout.columncomponent"
      ],
      "alternates": []
    },
    "Ext.grid.ColumnLayout": {
      "idx": 415,
      "alias": [
        "layout.gridcolumn"
      ],
      "alternates": []
    },
    "Ext.grid.ColumnManager": {
      "idx": 537,
      "alias": [],
      "alternates": [
        "Ext.grid.ColumnModel"
      ]
    },
    "Ext.grid.NavigationModel": {
      "idx": 436,
      "alias": [
        "view.navigation.grid"
      ],
      "alternates": []
    },
    "Ext.grid.Panel": {
      "idx": 406,
      "alias": [
        "widget.grid",
        "widget.gridpanel"
      ],
      "alternates": [
        "Ext.list.ListView",
        "Ext.ListView",
        "Ext.grid.GridPanel"
      ]
    },
    "Ext.grid.RowEditor": {
      "idx": 539,
      "alias": [
        "widget.roweditor"
      ],
      "alternates": []
    },
    "Ext.grid.RowEditorButtons": {
      "idx": 538,
      "alias": [
        "widget.roweditorbuttons"
      ],
      "alternates": []
    },
    "Ext.grid.Scroller": {
      "idx": 541,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.View": {
      "idx": 405,
      "alias": [
        "widget.gridview"
      ],
      "alternates": []
    },
    "Ext.grid.ViewDropZone": {
      "idx": 543,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.column.Action": {
      "idx": 544,
      "alias": [
        "widget.actioncolumn"
      ],
      "alternates": [
        "Ext.grid.ActionColumn"
      ]
    },
    "Ext.grid.column.Boolean": {
      "idx": 545,
      "alias": [
        "widget.booleancolumn"
      ],
      "alternates": [
        "Ext.grid.BooleanColumn"
      ]
    },
    "Ext.grid.column.Check": {
      "idx": 546,
      "alias": [
        "widget.checkcolumn"
      ],
      "alternates": [
        "Ext.ux.CheckColumn",
        "Ext.grid.column.CheckColumn"
      ]
    },
    "Ext.grid.column.Column": {
      "idx": 432,
      "alias": [
        "widget.gridcolumn"
      ],
      "alternates": [
        "Ext.grid.Column"
      ]
    },
    "Ext.grid.column.Date": {
      "idx": 547,
      "alias": [
        "widget.datecolumn"
      ],
      "alternates": [
        "Ext.grid.DateColumn"
      ]
    },
    "Ext.grid.column.Number": {
      "idx": 548,
      "alias": [
        "widget.numbercolumn"
      ],
      "alternates": [
        "Ext.grid.NumberColumn"
      ]
    },
    "Ext.grid.column.RowNumberer": {
      "idx": 549,
      "alias": [
        "widget.rownumberer"
      ],
      "alternates": [
        "Ext.grid.RowNumberer"
      ]
    },
    "Ext.grid.column.Template": {
      "idx": 550,
      "alias": [
        "widget.templatecolumn"
      ],
      "alternates": [
        "Ext.grid.TemplateColumn"
      ]
    },
    "Ext.grid.column.Widget": {
      "idx": 551,
      "alias": [
        "widget.widgetcolumn"
      ],
      "alternates": []
    },
    "Ext.grid.feature.AbstractSummary": {
      "idx": 553,
      "alias": [
        "feature.abstractsummary"
      ],
      "alternates": []
    },
    "Ext.grid.feature.Feature": {
      "idx": 552,
      "alias": [
        "feature.feature"
      ],
      "alternates": []
    },
    "Ext.grid.feature.GroupStore": {
      "idx": 554,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.feature.Grouping": {
      "idx": 555,
      "alias": [
        "feature.grouping"
      ],
      "alternates": []
    },
    "Ext.grid.feature.GroupingSummary": {
      "idx": 556,
      "alias": [
        "feature.groupingsummary"
      ],
      "alternates": []
    },
    "Ext.grid.feature.RowBody": {
      "idx": 557,
      "alias": [
        "feature.rowbody"
      ],
      "alternates": []
    },
    "Ext.grid.feature.Summary": {
      "idx": 558,
      "alias": [
        "feature.summary"
      ],
      "alternates": []
    },
    "Ext.grid.filters.Filters": {
      "idx": 573,
      "alias": [
        "plugin.gridfilters"
      ],
      "alternates": []
    },
    "Ext.grid.filters.filter.Base": {
      "idx": 565,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.filters.filter.Boolean": {
      "idx": 567,
      "alias": [
        "grid.filter.boolean"
      ],
      "alternates": []
    },
    "Ext.grid.filters.filter.Date": {
      "idx": 569,
      "alias": [
        "grid.filter.date"
      ],
      "alternates": []
    },
    "Ext.grid.filters.filter.List": {
      "idx": 570,
      "alias": [
        "grid.filter.list"
      ],
      "alternates": []
    },
    "Ext.grid.filters.filter.Number": {
      "idx": 571,
      "alias": [
        "grid.filter.number",
        "grid.filter.numeric"
      ],
      "alternates": []
    },
    "Ext.grid.filters.filter.SingleFilter": {
      "idx": 566,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.filters.filter.String": {
      "idx": 572,
      "alias": [
        "grid.filter.string"
      ],
      "alternates": []
    },
    "Ext.grid.filters.filter.TriFilter": {
      "idx": 568,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.header.Container": {
      "idx": 430,
      "alias": [
        "widget.headercontainer"
      ],
      "alternates": []
    },
    "Ext.grid.header.DragZone": {
      "idx": 422,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.header.DropZone": {
      "idx": 428,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.locking.HeaderContainer": {
      "idx": 574,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.locking.Lockable": {
      "idx": 576,
      "alias": [],
      "alternates": [
        "Ext.grid.Lockable"
      ]
    },
    "Ext.grid.locking.View": {
      "idx": 575,
      "alias": [],
      "alternates": [
        "Ext.grid.LockingView"
      ]
    },
    "Ext.grid.plugin.BufferedRenderer": {
      "idx": 577,
      "alias": [
        "plugin.bufferedrenderer"
      ],
      "alternates": []
    },
    "Ext.grid.plugin.CellEditing": {
      "idx": 579,
      "alias": [
        "plugin.cellediting"
      ],
      "alternates": []
    },
    "Ext.grid.plugin.DragDrop": {
      "idx": 580,
      "alias": [
        "plugin.gridviewdragdrop"
      ],
      "alternates": []
    },
    "Ext.grid.plugin.Editing": {
      "idx": 578,
      "alias": [
        "editing.editing"
      ],
      "alternates": []
    },
    "Ext.grid.plugin.HeaderReorderer": {
      "idx": 429,
      "alias": [
        "plugin.gridheaderreorderer"
      ],
      "alternates": []
    },
    "Ext.grid.plugin.HeaderResizer": {
      "idx": 419,
      "alias": [
        "plugin.gridheaderresizer"
      ],
      "alternates": []
    },
    "Ext.grid.plugin.RowEditing": {
      "idx": 581,
      "alias": [
        "plugin.rowediting"
      ],
      "alternates": []
    },
    "Ext.grid.plugin.RowExpander": {
      "idx": 583,
      "alias": [
        "plugin.rowexpander"
      ],
      "alternates": []
    },
    "Ext.grid.property.Grid": {
      "idx": 584,
      "alias": [
        "widget.propertygrid"
      ],
      "alternates": [
        "Ext.grid.PropertyGrid"
      ]
    },
    "Ext.grid.property.HeaderContainer": {
      "idx": 585,
      "alias": [],
      "alternates": [
        "Ext.grid.PropertyColumnModel"
      ]
    },
    "Ext.grid.property.Property": {
      "idx": 586,
      "alias": [],
      "alternates": [
        "Ext.PropGridProperty"
      ]
    },
    "Ext.grid.property.Reader": {
      "idx": 587,
      "alias": [],
      "alternates": []
    },
    "Ext.grid.property.Store": {
      "idx": 588,
      "alias": [],
      "alternates": [
        "Ext.grid.PropertyStore"
      ]
    },
    "Ext.layout.ClassList": {
      "idx": 589,
      "alias": [],
      "alternates": []
    },
    "Ext.layout.Context": {
      "idx": 593,
      "alias": [],
      "alternates": []
    },
    "Ext.layout.ContextItem": {
      "idx": 591,
      "alias": [],
      "alternates": []
    },
    "Ext.layout.Layout": {
      "idx": 299,
      "alias": [],
      "alternates": []
    },
    "Ext.layout.SizeModel": {
      "idx": 298,
      "alias": [],
      "alternates": []
    },
    "Ext.layout.component.Auto": {
      "idx": 314,
      "alias": [
        "layout.autocomponent"
      ],
      "alternates": []
    },
    "Ext.layout.component.Body": {
      "idx": 449,
      "alias": [
        "layout.body"
      ],
      "alternates": []
    },
    "Ext.layout.component.BoundList": {
      "idx": 510,
      "alias": [
        "layout.boundlist"
      ],
      "alternates": []
    },
    "Ext.layout.component.Component": {
      "idx": 313,
      "alias": [],
      "alternates": []
    },
    "Ext.layout.component.Dock": {
      "idx": 371,
      "alias": [
        "layout.dock"
      ],
      "alternates": [
        "Ext.layout.component.AbstractDock"
      ]
    },
    "Ext.layout.component.FieldSet": {
      "idx": 595,
      "alias": [
        "layout.fieldset"
      ],
      "alternates": []
    },
    "Ext.layout.component.ProgressBar": {
      "idx": 315,
      "alias": [
        "layout.progressbar"
      ],
      "alternates": []
    },
    "Ext.layout.component.field.FieldContainer": {
      "idx": 496,
      "alias": [
        "layout.fieldcontainer"
      ],
      "alternates": []
    },
    "Ext.layout.component.field.HtmlEditor": {
      "idx": 529,
      "alias": [
        "layout.htmleditor"
      ],
      "alternates": []
    },
    "Ext.layout.container.Absolute": {
      "idx": 596,
      "alias": [
        "layout.absolute"
      ],
      "alternates": [
        "Ext.layout.AbsoluteLayout"
      ]
    },
    "Ext.layout.container.Accordion": {
      "idx": 598,
      "alias": [
        "layout.accordion"
      ],
      "alternates": [
        "Ext.layout.AccordionLayout"
      ]
    },
    "Ext.layout.container.Anchor": {
      "idx": 472,
      "alias": [
        "layout.anchor"
      ],
      "alternates": [
        "Ext.layout.AnchorLayout"
      ]
    },
    "Ext.layout.container.Auto": {
      "idx": 301,
      "alias": [
        "layout.auto",
        "layout.autocontainer"
      ],
      "alternates": []
    },
    "Ext.layout.container.Border": {
      "idx": 445,
      "alias": [
        "layout.border"
      ],
      "alternates": [
        "Ext.layout.BorderLayout"
      ]
    },
    "Ext.layout.container.Box": {
      "idx": 354,
      "alias": [
        "layout.box"
      ],
      "alternates": [
        "Ext.layout.BoxLayout"
      ]
    },
    "Ext.layout.container.Card": {
      "idx": 447,
      "alias": [
        "layout.card"
      ],
      "alternates": [
        "Ext.layout.CardLayout"
      ]
    },
    "Ext.layout.container.Center": {
      "idx": 599,
      "alias": [
        "layout.center",
        "layout.ux.center"
      ],
      "alternates": [
        "Ext.ux.layout.Center"
      ]
    },
    "Ext.layout.container.CheckboxGroup": {
      "idx": 498,
      "alias": [
        "layout.checkboxgroup"
      ],
      "alternates": []
    },
    "Ext.layout.container.Column": {
      "idx": 475,
      "alias": [
        "layout.column"
      ],
      "alternates": [
        "Ext.layout.ColumnLayout"
      ]
    },
    "Ext.layout.container.ColumnSplitter": {
      "idx": 480,
      "alias": [
        "widget.columnsplitter"
      ],
      "alternates": []
    },
    "Ext.layout.container.ColumnSplitterTracker": {
      "idx": 479,
      "alias": [],
      "alternates": []
    },
    "Ext.layout.container.Container": {
      "idx": 300,
      "alias": [
        "layout.container"
      ],
      "alternates": [
        "Ext.layout.ContainerLayout"
      ]
    },
    "Ext.layout.container.Dashboard": {
      "idx": 481,
      "alias": [
        "layout.dashboard"
      ],
      "alternates": []
    },
    "Ext.layout.container.Editor": {
      "idx": 304,
      "alias": [
        "layout.editor"
      ],
      "alternates": []
    },
    "Ext.layout.container.Fit": {
      "idx": 391,
      "alias": [
        "layout.fit"
      ],
      "alternates": [
        "Ext.layout.FitLayout"
      ]
    },
    "Ext.layout.container.Form": {
      "idx": 600,
      "alias": [
        "layout.form"
      ],
      "alternates": [
        "Ext.layout.FormLayout"
      ]
    },
    "Ext.layout.container.HBox": {
      "idx": 356,
      "alias": [
        "layout.hbox"
      ],
      "alternates": [
        "Ext.layout.HBoxLayout"
      ]
    },
    "Ext.layout.container.SegmentedButton": {
      "idx": 601,
      "alias": [
        "layout.segmentedbutton"
      ],
      "alternates": []
    },
    "Ext.layout.container.Table": {
      "idx": 466,
      "alias": [
        "layout.table"
      ],
      "alternates": [
        "Ext.layout.TableLayout"
      ]
    },
    "Ext.layout.container.VBox": {
      "idx": 358,
      "alias": [
        "layout.vbox"
      ],
      "alternates": [
        "Ext.layout.VBoxLayout"
      ]
    },
    "Ext.layout.container.border.Region": {
      "idx": 72,
      "alias": [],
      "alternates": []
    },
    "Ext.layout.container.boxOverflow.Menu": {
      "idx": 348,
      "alias": [
        "box.overflow.Menu",
        "box.overflow.menu"
      ],
      "alternates": [
        "Ext.layout.boxOverflow.Menu"
      ]
    },
    "Ext.layout.container.boxOverflow.None": {
      "idx": 339,
      "alias": [
        "box.overflow.None",
        "box.overflow.none"
      ],
      "alternates": [
        "Ext.layout.boxOverflow.None"
      ]
    },
    "Ext.layout.container.boxOverflow.Scroller": {
      "idx": 350,
      "alias": [
        "box.overflow.Scroller",
        "box.overflow.scroller"
      ],
      "alternates": [
        "Ext.layout.boxOverflow.Scroller"
      ]
    },
    "Ext.menu.CheckItem": {
      "idx": 561,
      "alias": [
        "widget.menucheckitem"
      ],
      "alternates": []
    },
    "Ext.menu.ColorPicker": {
      "idx": 602,
      "alias": [
        "widget.colormenu"
      ],
      "alternates": []
    },
    "Ext.menu.DatePicker": {
      "idx": 603,
      "alias": [
        "widget.datemenu"
      ],
      "alternates": []
    },
    "Ext.menu.Item": {
      "idx": 560,
      "alias": [
        "widget.menuitem"
      ],
      "alternates": [
        "Ext.menu.TextItem"
      ]
    },
    "Ext.menu.KeyNav": {
      "idx": 562,
      "alias": [],
      "alternates": []
    },
    "Ext.menu.Manager": {
      "idx": 344,
      "alias": [],
      "alternates": [
        "Ext.menu.MenuMgr"
      ]
    },
    "Ext.menu.Menu": {
      "idx": 564,
      "alias": [
        "widget.menu"
      ],
      "alternates": []
    },
    "Ext.menu.Separator": {
      "idx": 563,
      "alias": [
        "widget.menuseparator"
      ],
      "alternates": []
    },
    "Ext.mixin.Bindable": {
      "idx": 58,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Factoryable": {
      "idx": 102,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Hookable": {
      "idx": 275,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Identifiable": {
      "idx": 4,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Inheritable": {
      "idx": 57,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Mashup": {
      "idx": 276,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Observable": {
      "idx": 5,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Queryable": {
      "idx": 189,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Responsive": {
      "idx": 277,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Selectable": {
      "idx": 278,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Templatable": {
      "idx": 230,
      "alias": [],
      "alternates": []
    },
    "Ext.mixin.Traversable": {
      "idx": 279,
      "alias": [],
      "alternates": []
    },
    "Ext.overrides.GlobalEvents": {
      "idx": 52,
      "alias": [],
      "alternates": []
    },
    "Ext.overrides.Widget": {
      "idx": 98,
      "alias": [],
      "alternates": []
    },
    "Ext.overrides.app.Application": {
      "idx": 383,
      "alias": [],
      "alternates": []
    },
    "Ext.overrides.dom.Element": {
      "idx": 50,
      "alias": [],
      "alternates": []
    },
    "Ext.overrides.dom.Helper": {
      "idx": 195,
      "alias": [],
      "alternates": []
    },
    "Ext.overrides.event.Event": {
      "idx": 91,
      "alias": [],
      "alternates": []
    },
    "Ext.overrides.event.publisher.Dom": {
      "idx": 93,
      "alias": [],
      "alternates": []
    },
    "Ext.overrides.event.publisher.Gesture": {
      "idx": 95,
      "alias": [],
      "alternates": []
    },
    "Ext.overrides.util.Positionable": {
      "idx": 18,
      "alias": [],
      "alternates": []
    },
    "Ext.panel.Bar": {
      "idx": 332,
      "alias": [],
      "alternates": []
    },
    "Ext.panel.DD": {
      "idx": 370,
      "alias": [],
      "alternates": []
    },
    "Ext.panel.Header": {
      "idx": 337,
      "alias": [
        "widget.header"
      ],
      "alternates": []
    },
    "Ext.panel.Panel": {
      "idx": 375,
      "alias": [
        "widget.panel"
      ],
      "alternates": [
        "Ext.Panel"
      ]
    },
    "Ext.panel.Pinnable": {
      "idx": 604,
      "alias": [],
      "alternates": []
    },
    "Ext.panel.Proxy": {
      "idx": 369,
      "alias": [],
      "alternates": [
        "Ext.dd.PanelProxy"
      ]
    },
    "Ext.panel.Table": {
      "idx": 392,
      "alias": [
        "widget.tablepanel"
      ],
      "alternates": []
    },
    "Ext.panel.Title": {
      "idx": 334,
      "alias": [
        "widget.title"
      ],
      "alternates": []
    },
    "Ext.panel.Tool": {
      "idx": 336,
      "alias": [
        "widget.tool"
      ],
      "alternates": []
    },
    "Ext.perf.Accumulator": {
      "idx": 280,
      "alias": [],
      "alternates": []
    },
    "Ext.perf.Monitor": {
      "idx": 281,
      "alias": [],
      "alternates": [
        "Ext.Perf"
      ]
    },
    "Ext.picker.Color": {
      "idx": 528,
      "alias": [
        "widget.colorpicker"
      ],
      "alternates": [
        "Ext.ColorPalette"
      ]
    },
    "Ext.picker.Date": {
      "idx": 520,
      "alias": [
        "widget.datepicker"
      ],
      "alternates": [
        "Ext.DatePicker"
      ]
    },
    "Ext.picker.Month": {
      "idx": 519,
      "alias": [
        "widget.monthpicker"
      ],
      "alternates": [
        "Ext.MonthPicker"
      ]
    },
    "Ext.picker.Time": {
      "idx": 532,
      "alias": [
        "widget.timepicker"
      ],
      "alternates": []
    },
    "Ext.plugin.Abstract": {
      "idx": 417,
      "alias": [],
      "alternates": [
        "Ext.AbstractPlugin"
      ]
    },
    "Ext.plugin.Manager": {
      "idx": 605,
      "alias": [],
      "alternates": [
        "Ext.PluginManager",
        "Ext.PluginMgr"
      ]
    },
    "Ext.plugin.Responsive": {
      "idx": 469,
      "alias": [
        "plugin.responsive"
      ],
      "alternates": []
    },
    "Ext.plugin.Viewport": {
      "idx": 470,
      "alias": [
        "plugin.viewport"
      ],
      "alternates": []
    },
    "Ext.resizer.BorderSplitter": {
      "idx": 444,
      "alias": [
        "widget.bordersplitter"
      ],
      "alternates": []
    },
    "Ext.resizer.BorderSplitterTracker": {
      "idx": 606,
      "alias": [],
      "alternates": []
    },
    "Ext.resizer.Handle": {
      "idx": 608,
      "alias": [],
      "alternates": []
    },
    "Ext.resizer.ResizeTracker": {
      "idx": 609,
      "alias": [],
      "alternates": []
    },
    "Ext.resizer.Resizer": {
      "idx": 611,
      "alias": [],
      "alternates": [
        "Ext.Resizable"
      ]
    },
    "Ext.resizer.Splitter": {
      "idx": 353,
      "alias": [
        "widget.splitter"
      ],
      "alternates": []
    },
    "Ext.resizer.SplitterTracker": {
      "idx": 477,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.Component": {
      "idx": 73,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.button.Button": {
      "idx": 347,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.button.Segmented": {
      "idx": 465,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.dd.DD": {
      "idx": 365,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.dom.Element": {
      "idx": 22,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.dom.Layer": {
      "idx": 486,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.event.Event": {
      "idx": 90,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.form.Labelable": {
      "idx": 387,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.form.field.File": {
      "idx": 526,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.form.field.FileButton": {
      "idx": 523,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.grid.CellEditor": {
      "idx": 536,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.grid.ColumnLayout": {
      "idx": 416,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.grid.NavigationModel": {
      "idx": 437,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.grid.RowEditor": {
      "idx": 540,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.grid.column.Column": {
      "idx": 433,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.grid.feature.Summary": {
      "idx": 559,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.grid.plugin.HeaderResizer": {
      "idx": 420,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.grid.plugin.RowEditing": {
      "idx": 582,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.layout.ContextItem": {
      "idx": 592,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.layout.component.Dock": {
      "idx": 372,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.layout.container.Absolute": {
      "idx": 597,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.layout.container.Border": {
      "idx": 446,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.layout.container.Box": {
      "idx": 355,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.layout.container.Column": {
      "idx": 476,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.layout.container.HBox": {
      "idx": 357,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.layout.container.VBox": {
      "idx": 359,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.layout.container.boxOverflow.Menu": {
      "idx": 349,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.layout.container.boxOverflow.Scroller": {
      "idx": 351,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.panel.Bar": {
      "idx": 333,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.panel.Panel": {
      "idx": 376,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.panel.Title": {
      "idx": 335,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.resizer.BorderSplitterTracker": {
      "idx": 607,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.resizer.ResizeTracker": {
      "idx": 610,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.resizer.SplitterTracker": {
      "idx": 478,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.scroll.Manager": {
      "idx": 614,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.scroll.Scroller": {
      "idx": 290,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.selection.CellModel": {
      "idx": 616,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.selection.TreeModel": {
      "idx": 414,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.slider.Multi": {
      "idx": 620,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.tab.Bar": {
      "idx": 451,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.tip.QuickTipManager": {
      "idx": 381,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.tree.Column": {
      "idx": 435,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.util.Floating": {
      "idx": 69,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.util.FocusableContainer": {
      "idx": 361,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.util.Renderable": {
      "idx": 64,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.view.NavigationModel": {
      "idx": 396,
      "alias": [],
      "alternates": []
    },
    "Ext.rtl.view.Table": {
      "idx": 404,
      "alias": [],
      "alternates": []
    },
    "Ext.scroll.Indicator": {
      "idx": 612,
      "alias": [],
      "alternates": []
    },
    "Ext.scroll.Manager": {
      "idx": 613,
      "alias": [],
      "alternates": []
    },
    "Ext.scroll.Scroller": {
      "idx": 289,
      "alias": [],
      "alternates": []
    },
    "Ext.selection.CellModel": {
      "idx": 615,
      "alias": [
        "selection.cellmodel"
      ],
      "alternates": []
    },
    "Ext.selection.CheckboxModel": {
      "idx": 621,
      "alias": [
        "selection.checkboxmodel"
      ],
      "alternates": []
    },
    "Ext.selection.DataViewModel": {
      "idx": 394,
      "alias": [],
      "alternates": []
    },
    "Ext.selection.Model": {
      "idx": 393,
      "alias": [],
      "alternates": [
        "Ext.AbstractSelectionModel"
      ]
    },
    "Ext.selection.RowModel": {
      "idx": 412,
      "alias": [
        "selection.rowmodel"
      ],
      "alternates": []
    },
    "Ext.selection.TreeModel": {
      "idx": 413,
      "alias": [
        "selection.treemodel"
      ],
      "alternates": []
    },
    "Ext.slider.Multi": {
      "idx": 619,
      "alias": [
        "widget.multislider"
      ],
      "alternates": [
        "Ext.slider.MultiSlider"
      ]
    },
    "Ext.slider.Single": {
      "idx": 622,
      "alias": [
        "widget.slider",
        "widget.sliderfield"
      ],
      "alternates": [
        "Ext.Slider",
        "Ext.form.SliderField",
        "Ext.slider.SingleSlider",
        "Ext.slider.Slider"
      ]
    },
    "Ext.slider.Thumb": {
      "idx": 617,
      "alias": [],
      "alternates": []
    },
    "Ext.slider.Tip": {
      "idx": 618,
      "alias": [
        "widget.slidertip"
      ],
      "alternates": []
    },
    "Ext.slider.Widget": {
      "idx": 623,
      "alias": [
        "widget.sliderwidget"
      ],
      "alternates": []
    },
    "Ext.sparkline.Bar": {
      "idx": 631,
      "alias": [
        "widget.sparklinebar"
      ],
      "alternates": []
    },
    "Ext.sparkline.BarBase": {
      "idx": 629,
      "alias": [],
      "alternates": []
    },
    "Ext.sparkline.Base": {
      "idx": 628,
      "alias": [],
      "alternates": []
    },
    "Ext.sparkline.Box": {
      "idx": 632,
      "alias": [
        "widget.sparklinebox"
      ],
      "alternates": []
    },
    "Ext.sparkline.Bullet": {
      "idx": 633,
      "alias": [
        "widget.sparklinebullet"
      ],
      "alternates": []
    },
    "Ext.sparkline.CanvasBase": {
      "idx": 625,
      "alias": [],
      "alternates": []
    },
    "Ext.sparkline.CanvasCanvas": {
      "idx": 626,
      "alias": [],
      "alternates": []
    },
    "Ext.sparkline.Discrete": {
      "idx": 634,
      "alias": [
        "widget.sparklinediscrete"
      ],
      "alternates": []
    },
    "Ext.sparkline.Line": {
      "idx": 635,
      "alias": [
        "widget.sparklineline"
      ],
      "alternates": []
    },
    "Ext.sparkline.Pie": {
      "idx": 636,
      "alias": [
        "widget.sparklinepie"
      ],
      "alternates": []
    },
    "Ext.sparkline.RangeMap": {
      "idx": 630,
      "alias": [],
      "alternates": []
    },
    "Ext.sparkline.Shape": {
      "idx": 624,
      "alias": [],
      "alternates": []
    },
    "Ext.sparkline.TriState": {
      "idx": 637,
      "alias": [
        "widget.sparklinetristate"
      ],
      "alternates": []
    },
    "Ext.sparkline.VmlCanvas": {
      "idx": 627,
      "alias": [],
      "alternates": []
    },
    "Ext.state.CookieProvider": {
      "idx": 638,
      "alias": [],
      "alternates": []
    },
    "Ext.state.LocalStorageProvider": {
      "idx": 639,
      "alias": [
        "state.localstorage"
      ],
      "alternates": []
    },
    "Ext.state.Manager": {
      "idx": 66,
      "alias": [],
      "alternates": []
    },
    "Ext.state.Provider": {
      "idx": 65,
      "alias": [],
      "alternates": []
    },
    "Ext.state.Stateful": {
      "idx": 67,
      "alias": [],
      "alternates": []
    },
    "Ext.tab.Bar": {
      "idx": 450,
      "alias": [
        "widget.tabbar"
      ],
      "alternates": []
    },
    "Ext.tab.Panel": {
      "idx": 452,
      "alias": [
        "widget.tabpanel"
      ],
      "alternates": [
        "Ext.TabPanel"
      ]
    },
    "Ext.tab.Tab": {
      "idx": 448,
      "alias": [
        "widget.tab"
      ],
      "alternates": []
    },
    "Ext.tip.QuickTip": {
      "idx": 379,
      "alias": [
        "widget.quicktip"
      ],
      "alternates": [
        "Ext.QuickTip"
      ]
    },
    "Ext.tip.QuickTipManager": {
      "idx": 380,
      "alias": [],
      "alternates": [
        "Ext.QuickTips"
      ]
    },
    "Ext.tip.Tip": {
      "idx": 377,
      "alias": [
        "widget.tip"
      ],
      "alternates": [
        "Ext.Tip"
      ]
    },
    "Ext.tip.ToolTip": {
      "idx": 378,
      "alias": [
        "widget.tooltip"
      ],
      "alternates": [
        "Ext.ToolTip"
      ]
    },
    "Ext.toolbar.Breadcrumb": {
      "idx": 640,
      "alias": [
        "widget.breadcrumb"
      ],
      "alternates": []
    },
    "Ext.toolbar.Fill": {
      "idx": 338,
      "alias": [
        "widget.tbfill"
      ],
      "alternates": [
        "Ext.Toolbar.Fill"
      ]
    },
    "Ext.toolbar.Item": {
      "idx": 340,
      "alias": [
        "widget.tbitem"
      ],
      "alternates": [
        "Ext.Toolbar.Item"
      ]
    },
    "Ext.toolbar.Paging": {
      "idx": 515,
      "alias": [
        "widget.pagingtoolbar"
      ],
      "alternates": [
        "Ext.PagingToolbar"
      ]
    },
    "Ext.toolbar.Separator": {
      "idx": 341,
      "alias": [
        "widget.tbseparator"
      ],
      "alternates": [
        "Ext.Toolbar.Separator"
      ]
    },
    "Ext.toolbar.Spacer": {
      "idx": 641,
      "alias": [
        "widget.tbspacer"
      ],
      "alternates": [
        "Ext.Toolbar.Spacer"
      ]
    },
    "Ext.toolbar.TextItem": {
      "idx": 511,
      "alias": [
        "widget.tbtext"
      ],
      "alternates": [
        "Ext.Toolbar.TextItem"
      ]
    },
    "Ext.toolbar.Toolbar": {
      "idx": 362,
      "alias": [
        "widget.toolbar"
      ],
      "alternates": [
        "Ext.Toolbar"
      ]
    },
    "Ext.tree.Column": {
      "idx": 434,
      "alias": [
        "widget.treecolumn"
      ],
      "alternates": []
    },
    "Ext.tree.NavigationModel": {
      "idx": 438,
      "alias": [
        "view.navigation.tree"
      ],
      "alternates": []
    },
    "Ext.tree.Panel": {
      "idx": 439,
      "alias": [
        "widget.treepanel"
      ],
      "alternates": [
        "Ext.tree.TreePanel",
        "Ext.TreePanel"
      ]
    },
    "Ext.tree.View": {
      "idx": 411,
      "alias": [
        "widget.treeview"
      ],
      "alternates": []
    },
    "Ext.tree.ViewDragZone": {
      "idx": 643,
      "alias": [],
      "alternates": []
    },
    "Ext.tree.ViewDropZone": {
      "idx": 644,
      "alias": [],
      "alternates": []
    },
    "Ext.tree.plugin.TreeViewDragDrop": {
      "idx": 645,
      "alias": [
        "plugin.treeviewdragdrop"
      ],
      "alternates": []
    },
    "Ext.util.AbstractMixedCollection": {
      "idx": 27,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Animate": {
      "idx": 48,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Base64": {
      "idx": 291,
      "alias": [],
      "alternates": []
    },
    "Ext.util.CSS": {
      "idx": 400,
      "alias": [],
      "alternates": []
    },
    "Ext.util.ClickRepeater": {
      "idx": 345,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Collection": {
      "idx": 105,
      "alias": [],
      "alternates": []
    },
    "Ext.util.CollectionKey": {
      "idx": 103,
      "alias": [],
      "alternates": []
    },
    "Ext.util.ComponentDragger": {
      "idx": 457,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Cookies": {
      "idx": 646,
      "alias": [],
      "alternates": []
    },
    "Ext.util.ElementContainer": {
      "idx": 62,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Event": {
      "idx": 25,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Filter": {
      "idx": 23,
      "alias": [],
      "alternates": []
    },
    "Ext.util.FilterCollection": {
      "idx": 170,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Floating": {
      "idx": 68,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Focusable": {
      "idx": 70,
      "alias": [],
      "alternates": []
    },
    "Ext.util.FocusableContainer": {
      "idx": 360,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Format": {
      "idx": 55,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Group": {
      "idx": 168,
      "alias": [],
      "alternates": []
    },
    "Ext.util.GroupCollection": {
      "idx": 171,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Grouper": {
      "idx": 104,
      "alias": [],
      "alternates": []
    },
    "Ext.util.HashMap": {
      "idx": 6,
      "alias": [],
      "alternates": []
    },
    "Ext.util.History": {
      "idx": 329,
      "alias": [],
      "alternates": [
        "Ext.History"
      ]
    },
    "Ext.util.Inflector": {
      "idx": 113,
      "alias": [],
      "alternates": []
    },
    "Ext.util.KeyMap": {
      "idx": 307,
      "alias": [],
      "alternates": [
        "Ext.KeyMap"
      ]
    },
    "Ext.util.KeyNav": {
      "idx": 308,
      "alias": [],
      "alternates": [
        "Ext.KeyNav"
      ]
    },
    "Ext.util.LocalStorage": {
      "idx": 292,
      "alias": [],
      "alternates": []
    },
    "Ext.util.LruCache": {
      "idx": 14,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Memento": {
      "idx": 373,
      "alias": [],
      "alternates": []
    },
    "Ext.util.MixedCollection": {
      "idx": 30,
      "alias": [],
      "alternates": []
    },
    "Ext.util.ObjectTemplate": {
      "idx": 107,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Observable": {
      "idx": 26,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Offset": {
      "idx": 86,
      "alias": [],
      "alternates": []
    },
    "Ext.util.PaintMonitor": {
      "idx": 228,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Point": {
      "idx": 88,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Positionable": {
      "idx": 17,
      "alias": [],
      "alternates": []
    },
    "Ext.util.ProtoElement": {
      "idx": 60,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Queue": {
      "idx": 590,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Region": {
      "idx": 87,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Renderable": {
      "idx": 63,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Schedulable": {
      "idx": 124,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Scheduler": {
      "idx": 106,
      "alias": [],
      "alternates": []
    },
    "Ext.util.SizeMonitor": {
      "idx": 235,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Sortable": {
      "idx": 29,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Sorter": {
      "idx": 28,
      "alias": [],
      "alternates": []
    },
    "Ext.util.SorterCollection": {
      "idx": 169,
      "alias": [],
      "alternates": []
    },
    "Ext.util.StoreHolder": {
      "idx": 311,
      "alias": [],
      "alternates": []
    },
    "Ext.util.TaskManager": {
      "idx": 293,
      "alias": [],
      "alternates": [
        "Ext.TaskManager"
      ]
    },
    "Ext.util.TaskRunner": {
      "idx": 31,
      "alias": [],
      "alternates": []
    },
    "Ext.util.TextMetrics": {
      "idx": 294,
      "alias": [],
      "alternates": []
    },
    "Ext.util.Translatable": {
      "idx": 288,
      "alias": [],
      "alternates": []
    },
    "Ext.util.XTemplateCompiler": {
      "idx": 100,
      "alias": [],
      "alternates": []
    },
    "Ext.util.XTemplateParser": {
      "idx": 99,
      "alias": [],
      "alternates": []
    },
    "Ext.util.paintmonitor.Abstract": {
      "idx": 225,
      "alias": [],
      "alternates": []
    },
    "Ext.util.paintmonitor.CssAnimation": {
      "idx": 226,
      "alias": [],
      "alternates": []
    },
    "Ext.util.paintmonitor.OverflowChange": {
      "idx": 227,
      "alias": [],
      "alternates": []
    },
    "Ext.util.sizemonitor.Abstract": {
      "idx": 231,
      "alias": [],
      "alternates": []
    },
    "Ext.util.sizemonitor.Default": {
      "idx": 232,
      "alias": [],
      "alternates": []
    },
    "Ext.util.sizemonitor.OverflowChange": {
      "idx": 234,
      "alias": [],
      "alternates": []
    },
    "Ext.util.sizemonitor.Scroll": {
      "idx": 233,
      "alias": [],
      "alternates": []
    },
    "Ext.util.translatable.Abstract": {
      "idx": 282,
      "alias": [],
      "alternates": []
    },
    "Ext.util.translatable.CssPosition": {
      "idx": 287,
      "alias": [],
      "alternates": []
    },
    "Ext.util.translatable.CssTransform": {
      "idx": 284,
      "alias": [],
      "alternates": []
    },
    "Ext.util.translatable.Dom": {
      "idx": 283,
      "alias": [],
      "alternates": []
    },
    "Ext.util.translatable.ScrollParent": {
      "idx": 286,
      "alias": [],
      "alternates": []
    },
    "Ext.util.translatable.ScrollPosition": {
      "idx": 285,
      "alias": [],
      "alternates": []
    },
    "Ext.view.AbstractView": {
      "idx": 397,
      "alias": [],
      "alternates": []
    },
    "Ext.view.BoundList": {
      "idx": 516,
      "alias": [
        "widget.boundlist"
      ],
      "alternates": [
        "Ext.BoundList"
      ]
    },
    "Ext.view.BoundListKeyNav": {
      "idx": 517,
      "alias": [
        "view.navigation.boundlist"
      ],
      "alternates": []
    },
    "Ext.view.DragZone": {
      "idx": 642,
      "alias": [],
      "alternates": []
    },
    "Ext.view.DropZone": {
      "idx": 542,
      "alias": [],
      "alternates": []
    },
    "Ext.view.MultiSelector": {
      "idx": 648,
      "alias": [
        "widget.multiselector"
      ],
      "alternates": []
    },
    "Ext.view.MultiSelectorSearch": {
      "idx": 647,
      "alias": [
        "widget.multiselector-search"
      ],
      "alternates": []
    },
    "Ext.view.NavigationModel": {
      "idx": 395,
      "alias": [
        "view.navigation.default"
      ],
      "alternates": []
    },
    "Ext.view.NodeCache": {
      "idx": 402,
      "alias": [],
      "alternates": []
    },
    "Ext.view.Table": {
      "idx": 403,
      "alias": [
        "widget.tableview"
      ],
      "alternates": []
    },
    "Ext.view.TableLayout": {
      "idx": 401,
      "alias": [
        "layout.tableview"
      ],
      "alternates": []
    },
    "Ext.view.View": {
      "idx": 398,
      "alias": [
        "widget.dataview"
      ],
      "alternates": [
        "Ext.DataView"
      ]
    },
    "Ext.window.MessageBox": {
      "idx": 493,
      "alias": [
        "widget.messagebox"
      ],
      "alternates": []
    },
    "Ext.window.Toast": {
      "idx": 649,
      "alias": [
        "widget.toast"
      ],
      "alternates": []
    },
    "Ext.window.Window": {
      "idx": 458,
      "alias": [
        "widget.window"
      ],
      "alternates": [
        "Ext.Window"
      ]
    }
  },
  "packages": {
    "ext": {
      "creator": "Sencha",
      "requires": [
        "sencha-core",
        "ext"
      ],
      "type": "framework",
      "version": "5.0.1.1255"
    },
    "sencha-core": {
      "creator": "Sencha",
      "output": "${package.dir}/build",
      "requires": [],
      "slicer": {
        "js": []
      },
      "type": "code",
      "version": "5.0.0"
    }
  },
  "bootRelative": true
};
