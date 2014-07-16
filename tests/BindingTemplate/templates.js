// Copyright (c) Microsoft Open Technologies, Inc.  All Rights Reserved. Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
// <!-- saved from url=(0014)about:internet -->
/// <reference path="ms-appx://$(TargetFramework)/js/base.js" />
/// <reference path="ms-appx://$(TargetFramework)/js/ui.js" />
/// <reference path="ms-appx://$(TargetFramework)/js/en-us/base.strings.js" />

var CorsicaTests = CorsicaTests || {};

window.MyCustomInitializer1 = WinJS.Binding.initializer(function (s, sp, d, dp) {
    return WinJS.Binding.defaultBind(s, sp, d, dp);
});
window.MyCustomInitializer2 = WinJS.Binding.initializer(function (s, sp, d, dp) {
    return WinJS.Binding.defaultBind(s, sp, d, dp);
});
window.MyCustomInitializer2.delayable = true;
window.MyCustomDoNothingInitializer = WinJS.Binding.initializer(function () {
    // do nothing
});

window.MyCustomControlDeclarativeControlContainer = WinJS.Class.define(function (element, options) {
    this.element = element || document.createElement("div");
    this.element.winControl = this;
    this.element.classList.add("mycustomcontroldeclarativecontrolcontainer");
}, {

    delayedProcessorCount: {
        get: function () {
            return (this._delayedProcessing && this._delayedProcessing.length) || 0;
        }
    },

    runDelayedProcessing: function () {
        if (this.delayedProcessorCount) {
            var children = this.element.children;
            this._delayedProcessing.forEach(function (processor) {
                for (var i = 0; i < children.length; i++) {
                    processor(children[i]);
                }
            });
            this._delayedProcessing = null;
            this._delayedProcessed = true;
        }
    }

}, {
    isDeclarativeControlContainer: WinJS.Utilities.markSupportedForProcessing(function (control, callback) {
        control._delayedProcessing = control._delayedProcessing || [];
        control._delayedProcessing.push(callback);
        if (this._delayedProcessed) {
            this.runDelayedProcessing();
        }
    })
});

// Random control used by tests that need a control. Give it whatever surface area you 
//  desire for testing purposes.
//
window.MyCustomControl = WinJS.Class.define(function (element, options) {
    this.element = element || document.createElement("div");
    this.element.winControl = this;
    this.element.classList.add("mycustomcontrol");
    this.element.classList.add("win-disposable");
    this.userRating = 0;
    this.maxRating = 5;
    WinJS.UI.setOptions(this, options || {});
    this._disposed = false;
}, {

    dispose: function () {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
    },

});

// Random control used by tests that need a control. Give it whatever surface area you 
//  desire for testing purposes.
//
window.MyCustomDelayableControl = WinJS.Class.define(function (element, options) {
    this.element = element || document.createElement("div");
    this.element.winControl = this;
    this.element.classList.add("mycustomdelayablecontrol");
    this.element.classList.add("win-disposable");
    this.userRating = 0;
    this.maxRating = 5;
    WinJS.UI.setOptions(this, options || {});
    this._disposed = false;
}, {

    dispose: function () {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
    },

}, {

    delayable: true

});

// This is not a test fixture
CorsicaTests.TemplatesTestBase = function () {
    "use strict";

    var as = WinJS.Binding.as;
    var Promise = WinJS.Promise;
    var Template = WinJS.Binding.Template;

    function async(test) {
        return function (complete) {
            var p = test.call(this);
            if (p) {
                p
                    .then(null, function (msg) {
                        try {
                            LiveUnit.Assert.fail('There was an unhandled error in your test: ' + msg);
                        } catch (ex) {
                            // purposefully empty
                        }
                    })
                    .then(function () {
                        complete();
                    });
            } else {
                complete();
            }
        };
    }

    function timeout(n) {
        return function (v) { return WinJS.Promise.timeout(n).then(function () { return v; }); };
    }

    this.testTemplateExists = function () {
        LiveUnit.Assert.isTrue("Template" in WinJS.Binding);
    }

    this.testObTemplateStyleBindDeepNested = async(function () {

        var holder = document.createElement("div");
        holder.id = "testObTemplateStyleBindDeepNested";
        holder.innerHTML = "<div>"
        + "<div id='testObTemplateStyleBindDeepNested2' data-win-control='WinJS.Binding.Template'><div data-win-bind='child:q testObTemplateStyleBindDeepNested2Child'></div></div>"
        + "<div id='testObTemplateStyleBindDeepNested2Child' data-win-control='WinJS.Binding.Template'><div data-win-bind='style.backgroundColor: x; textContent: y'></div></div>"
        + "</div>";

        var data = as({ q: as({ x: "blue", y: 2 }) });

        return WinJS.UI.processAll(holder).then(function () {
            window.testObTemplateStyleBindDeepNested2Child = holder.querySelector("#testObTemplateStyleBindDeepNested2Child");
            var template = holder.querySelector("#testObTemplateStyleBindDeepNested2").winControl;
            return template.render(data);
        }).then(timeout(32)).then(function (d) {
            LiveUnit.Assert.areEqual("2", d.textContent.trim());
            LiveUnit.Assert.areEqual("blue", d.firstChild.firstChild.style.backgroundColor);
        });

    });

    this.testObTemplateStyleBindDeepNestedWithControl = async(function () {

        var holder = document.createElement("div");
        holder.id = "testObTemplateStyleBindDeepNested";
        holder.innerHTML = "<div>"
        + "<div id='testObTemplateStyleBindDeepNested2' data-win-control='WinJS.Binding.Template'><div data-win-bind='child:q testObTemplateStyleBindDeepNested2Child'></div><div data-win-control='MyCustomControl' data-win-control='{ maxRating: 1 }' data-win-bind='winControl.userRating: y'></div></div>"
        + "<div id='testObTemplateStyleBindDeepNested2Child' data-win-control='WinJS.Binding.Template'><div data-win-bind='style.backgroundColor: x; textContent: y'></div></div>"
        + "</div>";

        var data = as({ q: as({ x: "blue", y: 2 }) });

        return WinJS.UI.processAll(holder).then(function () {
            window.testObTemplateStyleBindDeepNested2Child = holder.querySelector("#testObTemplateStyleBindDeepNested2Child");
            var template = holder.querySelector("#testObTemplateStyleBindDeepNested2").winControl;
            return template.render(data);
        }).then(timeout(32)).then(function (d) {
            LiveUnit.Assert.areEqual("2", d.textContent.trim());
            LiveUnit.Assert.areEqual("blue", d.firstChild.firstChild.style.backgroundColor);
        });

    });

    this.testObTemplateStyleBind = async(function () {

        var holder = document.createElement("div");
        holder.id = "testObTemplateStyleBind";
        holder.innerHTML = "<div id='testObTemplateStyleBind2'><div data-win-bind='style.backgroundColor: x; textContent: y'></div></div>";

        var data = as({ x: "blue", y: 2 });

        return this._render(new Template(holder), data).then(function (d) {
            LiveUnit.Assert.areEqual("2", d.textContent.trim());
            LiveUnit.Assert.areEqual("blue", d.firstChild.firstChild.style.backgroundColor);
        });

    });

    this.testObTemplateStyleBindDeep = async(function () {

        var holder = document.createElement("div");
        holder.id = "testObTemplateStyleBindDeep";
        holder.innerHTML = "<div id='testObTemplateStyleBindDeep2'><div data-win-bind='style.backgroundColor: q.x; textContent: q.y'></div></div>";

        var data = as({ q: as({ x: "blue", y: 2 }) });

        var template = new Template(holder);

        return this._render(template, data).then(timeout(32)).then(function (d) {
            LiveUnit.Assert.areEqual("2", d.textContent.trim());
            LiveUnit.Assert.areEqual("blue", d.firstChild.firstChild.style.backgroundColor);
        });

    });

    this.testTemplateStyleBind = async(function () {

        var holder = document.createElement("div");
        holder.id = "testTemplateStyleBind";
        holder.innerHTML = "<div id='testTemplateStyleBind2'><div data-win-bind='style.backgroundColor: x; textContent: y'></div></div>";

        var data = { x: "blue", y: 2 };

        var template = new Template(holder);

        return this._render(template, data).then(function (d) {
            LiveUnit.Assert.areEqual("2", d.textContent.trim());
            LiveUnit.Assert.areEqual("blue", d.firstChild.firstChild.style.backgroundColor);
        });

    });

    this.testTemplateStyleBindDeep = async(function () {

        var holder = document.createElement("div");
        holder.id = "testTemplateStyleBindDeep";
        holder.innerHTML = "<div id='testTemplateStyleBindDeep2'><div data-win-bind='style.backgroundColor: q.x; textContent: q.y'></div></div>";

        var data = { q: { x: "blue", y: 2 } };
        var template = new Template(holder);

        return this._render(template, data).then(function (d) {
            LiveUnit.Assert.areEqual("2", d.textContent.trim());
            LiveUnit.Assert.areEqual("blue", d.firstChild.firstChild.style.backgroundColor);
        });

    });

    this.testLargeTemplate = async(function () {

        var template = document.createElement("div");
        template.id = "testLargeTemplate";
        var contents = [];
        var data = [];
        var numbers = [];

        for (var i = 0; i < 4; i++) {
            contents.push("<span data-win-bind='textContent:x" + i + "'></span>");
            data["x" + i] = i;
            numbers.push(i);
        }

        template.innerHTML = contents.join("<span>,</span>");

        var it = new Template(template);

        return it.render(data).then(function (d) {
            LiveUnit.Assert.areEqual(numbers.join(","), d.textContent);
        });

    });

    this.testTemplateFromFragment = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div id='testTemplateFromFragment'><span data-win-bind='textContent: x'></span>, <span data-win-bind='textContent:y'></span></div>";

        WinJS.UI.Fragments.clearCache(holder);
        var frag = document.createElement("div");
        return WinJS.UI.Fragments.renderCopy(holder).then(function (docfrag) {
            frag.appendChild(docfrag);
            WinJS.UI.Fragments.clearCache(holder);

            var data = { x: 1, y: 2 };
            // purposefully leave this going through the static path
            return Template.render(frag, data).then(function (d) {
                LiveUnit.Assert.areEqual("1, 2", d.textContent);
            });
        });

    });

    this.testDeclarativeTemplate = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div id='testDeclarativeTemplate' data-win-control='WinJS.Binding.Template'><div data-win-bind='textContent:x'></div></div>";

        return WinJS.UI.process(holder.firstChild).then(function (control) {
            var control = holder.firstChild.winControl;
            return control.render({ x: 42 }).then(function (d) {
                LiveUnit.Assert.areEqual("42", d.textContent);
                LiveUnit.Assert.isFalse(d.hasAttribute("data-win-control"));
            });
        });

    });

    this.testImperativeTemplate = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div id='testImperativeTemplate'><div data-win-bind='textContent:x'></div></div>";

        return this._render(new Template(holder.firstChild), { x: 42 }).then(function (d) {
            LiveUnit.Assert.areEqual("42", d.textContent);
        });

    });

    this.testTemplateWithControl = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div id='testImperativeTemplate'>\
<div data-win-control='MyCustomControl' data-win-options='{ maxRating: 10 }' data-win-bind='winControl.userRating: rating'></div></div>";

        return this._render(new Template(holder.firstChild), { rating: 3 }).then(function (d) {
            LiveUnit.Assert.isTrue(d.firstElementChild.winControl instanceof MyCustomControl);
            LiveUnit.Assert.areEqual(3, d.firstElementChild.winControl.userRating);
            LiveUnit.Assert.areEqual(10, d.firstElementChild.winControl.maxRating);
        });

    });

    this.testTemplateWithControlAsyncControl = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div id='testImperativeTemplate'>\
<div><div data-win-control='MyCustomControl' data-win-options='{ maxRating: 10 }' data-win-bind='winControl.userRating: rating'></div></div>\
<div data-win-control='AsyncTemplate.AsyncControl' data-win-options='{}'></div>\
</div>";

        var d = document.createElement("div");
        // Passes a container, purposefully leave this going through render path
        var templatePromise = Template.render(holder.firstChild, { rating: 3 }, d);

        var rating = d.children[0].children[0].winControl;
        LiveUnit.Assert.isTrue(rating instanceof MyCustomControl);
        LiveUnit.Assert.areEqual(0, rating.userRating);
        LiveUnit.Assert.areEqual(10, rating.maxRating);

        var async = d.children[1].winControl;
        LiveUnit.Assert.isTrue(async instanceof AsyncTemplate.AsyncControl);
        // bindings should not run until async controls are done being constructed
        //
        async.completeMe();
        LiveUnit.Assert.areEqual(3, rating.userRating);

        return templatePromise;

    });

    WinJS.Namespace.define("AsyncTemplate", {

        AsyncControl: WinJS.Class.define(function (element, options, complete) {
            element.winControl = this;
            // Note that for teste purposes this guy expects to always get an empty options record
            LiveUnit.Assert.isNotNull(options);
            LiveUnit.Assert.areEqual("object", typeof options);
            LiveUnit.Assert.areEqual(0, Object.keys(options).length);
            this.completeMe = complete;
        })

    });

    this.testBooleanAttributes = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div id='testObTemplateStyleBind2'>\
<input class='one' type='checkbox' data-win-bind='checked: y; checked: x'>\
<input class='two' type='checkbox' data-win-bind='checked: y'>\
</div>";

        var data = as({ x: true, y: false });

        return this._render(new Template(holder), data).then(function (d) {
            LiveUnit.Assert.areEqual(true, d.querySelector(".one").checked);
            LiveUnit.Assert.areEqual(false, d.querySelector(".two").checked);
        });

    });

    this.testInlineStyleBindings = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div id='testObTemplateStyleBind2'>\
<div class='one' data-win-bind='style.backgroundColor: x'></div>\
</div>";

        var data = as({ x: "red" });

        return this._render(new Template(holder), data).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
        });

    });

    this.testSlowData = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div id='testObTemplateStyleBind2'>\
<div class='one' data-win-bind='style.backgroundColor: x'></div>\
</div>";

        var data = WinJS.Promise.timeout().then(function () { return as({ x: "red" }); });

        return this._render(new Template(holder), data).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
        });

    });

    this.testOneTimeBindings = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div id='testObTemplateStyleBind2'>\
<div class='one' data-win-bind='style.backgroundColor: x WinJS.Binding.oneTime'></div>\
<div class='two' data-win-bind='tabIndex: y WinJS.Binding.setAttributeOneTime'></div>\
<div class='three' data-win-bind='mythis: this WinJS.Binding.oneTime'></div>\
</div>";

        var data = as({ x: "red", y: 100 }); 5

        return this._render(new Template(holder), data).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
            LiveUnit.Assert.areEqual(100, d.querySelector(".two").tabIndex);
            LiveUnit.Assert.areEqual(data, d.querySelector(".three").mythis);
        });

    });

    this.testVSTemplate = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div class='item'>\
    <img class='item-image' src='#' data-win-bind='src: backgroundImage; alt: title' />\
    <div class='item-overlay'>\
        <h4 class='item-title' data-win-bind='textContent: title'></h4>\
        <h6 class='item-subtitle win-type-ellipsis' data-win-bind='textContent: subtitle'></h6>\
    </div>\
</div>";

        var data = as({ backgroundImage: "#", title: "some title", subtitle: "some subtitle" });

        return this._render(new Template(holder), data).then(function (d) {
            LiveUnit.Assert.areEqual("#", d.querySelector(".item-image").src.substr(-1)[0]);
            LiveUnit.Assert.areEqual("some title", d.querySelector(".item-title").textContent);
            LiveUnit.Assert.areEqual("some subtitle", d.querySelector(".item-subtitle").textContent);
        });

    });

    this.testBindingAgainstEmptyObject = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div class='content' data-win-bind='textContent: a.b.d'>some text</div>";

        var data = as({ a: null });

        return this._render(new Template(holder), data).then(function (d) {
            var content = d.querySelector(".content").textContent;
            // Firefox has a bug where undefined gets coerced to empty string
            if(content !== "undefined" && content !== "") {
                LiveUnit.Assert.fail("Binding to an empty object should set textContent to undefined.");
            }
        });

    });

    this.testDeadCodeElimination = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = '<div data-win-bind="textContent:foo">\
<div>\
    <div data-win-control="MyCustomControl" data-win-bind="winControl.userRating: y">some text</div>\
    <div class="two" data-win-bind="alt: f"></div>\
</div>\
</div>\
<div class="other">some other content</div>';

        var data = as({ x: 1, y: 2, foo: "foo text" });

        return this._render(new Template(holder), data).then(function (d) {
            LiveUnit.Assert.areEqual(null, d.querySelector(".mycustomcontrol"));
            LiveUnit.Assert.areEqual(null, d.querySelector(".two"));
        });

    });

    this.testSelectors = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div class='one' data-win-control='MyCustomControl' data-win-options='{ userRating: 3 }'></div>\
<div class='two' data-win-control='MyCustomControl' data-win-options='{ userRating: select(\".one\").winControl.userRating }'></div>";

        var data = as({});

        return this._render(new Template(holder), data).then(function (d) {
            LiveUnit.Assert.areEqual(3, d.querySelector(".one").winControl.userRating);
            LiveUnit.Assert.areEqual(3, d.querySelector(".two").winControl.userRating);
        });

    });

    this.testErrorInBindingExpression = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div class='one' data-win-control='MyCustomControl' data-win-options='{ userRating: 3 }' data-win-bind='a: b c d e'></div>\
<div class='two' data-win-control='MyCustomControl' data-win-options='{ userRating: select(\".one\").winControl.userRating }'></div>";

        var data = as({});

        return this._render(new Template(holder), data).then(
            function () {
                LiveUnit.Assert.fail("Should not complete successfully");
            },
            function () {
                // should get here
            }
        );

    });

    this.testErrorInOptionsRecord = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "<div class='one' data-win-control='MyCustomControl' data-win-options='{ userRating: 3, a b c d }'></div>\
<div class='two' data-win-control='MyCustomControl' data-win-options='{ userRating: select(\".one\").winControl.userRating }'></div>";

        var data = as({});

        return this._render(new Template(holder), data).then(
            function () {
                LiveUnit.Assert.fail("Should not complete successfully");
            },
            function () {
                // should get here
            }
        );

    });

    this.testCustomInitializers = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "\
<div class='one' data-win-bind='textContent: text1 MyCustomInitializer1'></div>\
<div class='two' data-win-bind='textContent: text2 MyCustomInitializer2'></div>\
<div class='three' data-win-bind='textContent: text2 MyCustomInitializer2; textContent: text1 MyCustomInitializer1'></div>\
";

        var data = as({ text1: "text1", text2: "text2" });
        var template = new Template(holder);
        var that = this;

        return this._render(template, data).then(function (d) {
            LiveUnit.Assert.areEqual("text1", d.querySelector(".one").textContent);
            LiveUnit.Assert.areEqual("text2", d.querySelector(".two").textContent);

            // The gotcha with .delayable is that it only delays for the renderItem pipe with compiled templates.
            //
            if (that._isRenderItem && template._shouldCompile) {
                LiveUnit.Assert.areEqual("text2", d.querySelector(".three").textContent);
            } else {
                LiveUnit.Assert.areEqual("text1", d.querySelector(".three").textContent);
            }
        });

    });

    this.testExtractFirst = async(function () {

        var holder = document.createElement("div");
        holder.innerHTML = "\
<div class='one' data-win-bind='textContent: text1'></div>\
<div class='two' data-win-bind='textContent: text2'></div>\
";

        var data = as({ text1: "text1", text2: "text2" });
        var template = new Template(holder, { extractChild: true });

        return this._render(template, data).then(function (d) {
            LiveUnit.Assert.isTrue(WinJS.Utilities._matchesSelector(d, ".one"));
            LiveUnit.Assert.areEqual("text1", d.textContent);
        });

    });

    this.testDisposingRenderedItemBeforeAsyncDataWasFetched = async(function () {

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div><div data-win-control='MyCustomControl'></div><div class='testclass' data-win-bind='textContent: data'></div></div>";

        // Mimic an async data source by return an async item promise
        var itemPromise = WinJS.Promise.timeout().then(function () {
            return WinJS.Promise.wrap({ data: "testValue" });
        });

        var div1 = document.createElement("div");
        var div2 = document.createElement("div");

        var template = new WinJS.Binding.Template(templateDiv);
        var item1 = template.render(itemPromise, div1);
        var item2 = template.render(itemPromise, div2);

        // No bindings should be processed at this point
        LiveUnit.Assert.areEqual("", div1.querySelector('.testclass').textContent);
        LiveUnit.Assert.areEqual("", div2.querySelector('.testclass').textContent);

        // Dispose the first rendered item before bindings were processed
        item1.cancel();

        return item1.then(LiveUnit.Assert.fail, function () {
            return item2.then(function (e) {
                // The first item should have no value and its ratings control is disposed
                LiveUnit.Assert.isTrue(div1.querySelector(".mycustomcontrol").winControl._disposed);
                LiveUnit.Assert.areEqual("", div1.querySelector('.testclass').textContent);

                // The second item should have a value bound to it and an intact rating control
                LiveUnit.Assert.isFalse(div2.querySelector(".mycustomcontrol").winControl._disposed);
                LiveUnit.Assert.areEqual("testValue", div2.querySelector('.testclass').textContent);
            }, LiveUnit.Assert.fail);
        });

    });

    this.testAddClassOneTimeSimple = async(function () {
        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div id='testAddClassOneTime'>\
<div class='one' data-win-bind='foo: x WinJS.Binding.addClassOneTime'></div>\
</div>";

        var template = new WinJS.Binding.Template(templateDiv);
        template._renderImpl = template._compileTemplate({
            defaultInitializer: WinJS.Binding.oneTime,
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof template._renderImpl);

        return template.render({ x: "two" }).then(function (d) {
            LiveUnit.Assert.areEqual("one two", d.querySelector(".one").className);
        });
    });

    this.testAddClassOneTimeOverriding = async(function () {
        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div id='testAddClassOneTime'>\
<div id='meta' class='zero' data-win-bind='foo: one WinJS.Binding.addClassOneTime; className: two; foo: three WinJS.Binding.addClassOneTime'></div>\
</div>";

        var template = new WinJS.Binding.Template(templateDiv);
        template._renderImpl = template._compileTemplate({
            defaultInitializer: WinJS.Binding.oneTime,
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof template._renderImpl);

        return template.render({ one: "one", two: "two", three: "three" }).then(function (d) {
            LiveUnit.Assert.areEqual("two three", d.querySelector("#meta").className);
        });
    });

    this.testDoNothingInitializerNoSecurityCheck = async(function () {

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div id='testAddClassOneTime'>\
<div class='one' data-win-bind='foo: x.y.z MyCustomDoNothingInitializer'></div>\
</div>";

        var template = new WinJS.Binding.Template(templateDiv);

        var data = {
            x: function () { },
        };
        data.x.y = function () { };
        data.x.y.z = 12;

        // should not error with security check
        return template.render(data).then(function (d) {
            LiveUnit.Assert.areEqual(undefined, d.querySelector(".one").foo);
        }, function () {
            LiveUnit.Assert.fail("should not be here");
        });

    });

    this.testControlWhichIsDeclarativeControlContainer = async(function () {
        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div data-win-control='MyCustomControlDeclarativeControlContainer'>\
<div class='one' data-win-control='MyCustomControl'></div>\
<div class='two' data-win-bind='textContent: text1'>default text</div>\
</div>";

        var data = as({ text1: "text1", text2: "text2" });
        var template = new WinJS.Binding.Template(templateDiv);

        return this._render(template, data).then(function (d) {
            var control = d.querySelector(".mycustomcontroldeclarativecontrolcontainer").winControl;
            LiveUnit.Assert.isNotNull(control);
            LiveUnit.Assert.areEqual(2, control.delayedProcessorCount);

            var one = d.querySelector(".one");
            var two = d.querySelector(".two");
            LiveUnit.Assert.isFalse(one.winControl);
            LiveUnit.Assert.areEqual("default text", two.textContent);

            control.runDelayedProcessing();
            LiveUnit.Assert.isTrue(one.winControl);
            LiveUnit.Assert.isTrue(one.winControl instanceof MyCustomControl);
            LiveUnit.Assert.areEqual("text1", two.textContent);
        });

    });

    this.testInvalidBindings = async(function () {

        // add this, id, and multi attribute 
        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div>\
    <div class='one' data-win-bind='id: text1; this: text2; foo: text3; bar.baz: text4 WinJS.Binding.setAttributeOneTime'></div>\
</div>";

        var data = as({
            text1: "text1",
            text2: "text2",
            text3: "text3",
            text4: "text4"
        });
        var template = new WinJS.Binding.Template(templateDiv);

        var temp = WinJS.log;
        var messages = []
        WinJS.log = function (m) {
            messages.push(m);
        };

        return this._render(template, data).then(function (d) {
            var one = d.querySelector(".one");
            LiveUnit.Assert.isTrue(messages.length >= 3);
            LiveUnit.Assert.areEqual("text3", one.foo);
            LiveUnit.Assert.areNotEqual("text1", one.id);
            LiveUnit.Assert.areEqual(null, one.getAttribute("bar"));
        }).then(
            function () {
                WinJS.log = temp;
            },
            function (e) {
                WinJS.log = temp;
                return WinJS.Promise.wrapError(e);
            }
        );

    });

};

CorsicaTests.Templates_Interpreted = function () {
    CorsicaTests.TemplatesTestBase.call(this);

    this.setUp = function () {
        this._interpretAllSetting = WinJS.Binding.Template._interpretAll;
        WinJS.Binding.Template._interpretAll = true;
    };
    this.tearDown = function () {
        WinJS.Binding.Template._interpretAll = this._interpretAllSetting;
    };

    this._isRenderItem = false;
    this._render = function (template, data) {
        return template.render(data);
    };
};

// Test fixture to run all the tests using .renderItem instead of .render on the template
//
CorsicaTests.Templates_Interpreted_renderItem = function () {
    CorsicaTests.TemplatesTestBase.call(this);

    this.setUp = function () {
        this._interpretAllSetting = WinJS.Binding.Template._interpretAll;
        WinJS.Binding.Template._interpretAll = true;
    };
    this.tearDown = function () {
        WinJS.Binding.Template._interpretAll = this._interpretAllSetting;
    };

    // replace _render method with use of .renderItem instead of .render
    //
    this._isRenderItem = true;
    this._render = function (template, data) {
        var item = {
            key: "key",
            data: data,
            ready: WinJS.Promise.timeout().then(function () { return item; }),
            isImageCached: function () { return false; },
            isOnScreen: function () { return true; },
            loadImage: function (srcUrl, image) {
                image.src = srcUrl;
            },
        };
        var itemPromise = WinJS.Promise.as(item);
        var result = template.renderItem(itemPromise);
        return result.renderComplete.then(function () { return result.element; });
    }

};

// Test fixture to run all the old template tests in compiled mode
//
CorsicaTests.Templates_Compiled = function () {
    CorsicaTests.Templates_Interpreted.call(this);

    // Make templates run in compiled mode
    //
    this.setUp = function () {
        this._interpretAllSetting = WinJS.Binding.Template._interpretAll;
        WinJS.Binding.Template._interpretAll = false;
    };
    this.tearDown = function () {
        WinJS.Binding.Template._interpretAll = this._interpretAllSetting;
    };
};

// Test fixture to run all the old templates tests in compiled mode using .renderItem instead of .render on the template
//
CorsicaTests.Templates_Compiled_renderItem = function () {
    CorsicaTests.Templates_Interpreted_renderItem.call(this);

    // Make templates run in compiled mode
    //
    this.setUp = function () {
        this._interpretAllSetting = WinJS.Binding.Template._interpretAll;
        WinJS.Binding.Template._interpretAll = false;
    };
    this.tearDown = function () {
        WinJS.Binding.Template._interpretAll = this._interpretAllSetting;
    };
}

// New test fixture targeting compiled templates.
//
CorsicaTests.TemplateCompilerTests = function () {

    function async(test) {
        return function (complete) {
            var p = test();
            if (p) {
                p
                    .then(null, function (msg) {
                        try {
                            LiveUnit.Assert.fail('There was an unhandled error in your test: ' + msg);
                        } catch (ex) {
                            // purposefully empty
                        }
                    })
                    .then(function () {
                        complete();
                    });
            } else {
                complete();
            }
        };
    }

    this.testDebugBreak = function () {

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div>content</div>";

        var templateWithBreakpoint = new WinJS.Binding.Template(templateDiv);
        templateWithBreakpoint.debugBreakOnRender = true;
        templateWithBreakpoint._renderImpl = templateWithBreakpoint._compileTemplate({
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof templateWithBreakpoint._renderImpl);
        LiveUnit.Assert.areNotEqual(-1, templateWithBreakpoint._renderImpl.toString().indexOf("debugger;"));

        var templateWithoutBreakpoint = new WinJS.Binding.Template(templateDiv);
        templateWithoutBreakpoint.debugBreakOnRender = false;
        templateWithoutBreakpoint._renderImpl = templateWithoutBreakpoint._compileTemplate({
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof templateWithoutBreakpoint._renderImpl);
        LiveUnit.Assert.areEqual(-1, templateWithoutBreakpoint._renderImpl.toString().indexOf("debugger;"));

        var templateWithoutBreakpointWithoutSpecifying = new WinJS.Binding.Template(templateDiv);
        templateWithoutBreakpointWithoutSpecifying._renderImpl = templateWithoutBreakpointWithoutSpecifying._compileTemplate({
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof templateWithoutBreakpointWithoutSpecifying._renderImpl);
        LiveUnit.Assert.areEqual(-1, templateWithoutBreakpointWithoutSpecifying._renderImpl.toString().indexOf("debugger;"));

    }

    this.testDisableOptimizedProcessing = function () {

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div>content</div>";

        var template = new WinJS.Binding.Template(templateDiv, { disableOptimizedProcessing: true });
        LiveUnit.Assert.isFalse(template._shouldCompile);

        template.disableOptimizedProcessing = false;
        LiveUnit.Assert.isTrue(template._shouldCompile);

    }

    this.testStyleOptimizations = async(function () {

        var userSelect = WinJS.Utilities._browserStyleEquivalents["user-select"];

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div>\
<div class='target' data-win-bind='style.backgroundColor: color; style." + userSelect.scriptName + ": userSelect; style.background: background; style.purplePeopleEater: something;'></div>\
</div>";

        var template = new WinJS.Binding.Template(templateDiv);
        template._renderImpl = template._compileTemplate({
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof template._renderImpl);

        var string = template._renderImpl.toString();
        // Assert that the supported style properties get turned into CSS style named properties
        //
        LiveUnit.Assert.areNotEqual(-1, string.indexOf("background-color:"));
        LiveUnit.Assert.areNotEqual(-1, string.indexOf(userSelect.cssName + ":"));
        LiveUnit.Assert.areEqual(0, userSelect.cssName.indexOf('-'));
        LiveUnit.Assert.areNotEqual(-1, string.indexOf("background:"));

        // Assert that my new property doesn't get turned into a text replacement because it isn't part of the
        //  style object.
        //
        LiveUnit.Assert.areEqual(-1, string.indexOf("purplePeopleEater:"));

        // Assert that cssText doesn't get turned into a text replacement because we don't support that.
        //
        LiveUnit.Assert.areEqual(-1, string.indexOf("css-text:"));
        LiveUnit.Assert.areEqual(-1, string.indexOf("cssText:"));

        return template.render({ color: "red", userSelect: "none", background: "purple" }).then(function (d) {
            var target = d.querySelector('.target');
            LiveUnit.Assert.areEqual("purple", target.style.backgroundColor);
            LiveUnit.Assert.areEqual("none", target.style[userSelect.scriptName]);
        });

    });

    this.testUnsupportedStyleProperty = function () {

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div>\
<div data-win-bind='style.purplePeopleEater: something; style.cssText: text'></div>\
</div>";

        var template = new WinJS.Binding.Template(templateDiv);
        template._renderImpl = template._compileTemplate({
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof template._renderImpl);

        var string = template._renderImpl.toString();

        // Assert that my new property doesn't get turned into a text replacement because it isn't part of the
        //  style object.
        //
        LiveUnit.Assert.areEqual(-1, string.indexOf("purplePeopleEater:"));

        // Assert that cssText doesn't get turned into a text replacement because we don't support that.
        //
        LiveUnit.Assert.areEqual(-1, string.indexOf("css-text:"));
        LiveUnit.Assert.areEqual(-1, string.indexOf("cssText:"));

    };

    this.testBindings = async(function () {

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div id='testObTemplateStyleBind2'>\
<div class='one' data-win-bind='style.backgroundColor: x'></div>\
<div class='two' data-win-bind='tabIndex: y WinJS.Binding.setAttribute'></div>\
</div>";

        var template = new WinJS.Binding.Template(templateDiv);
        template._renderImpl = template._compileTemplate({
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof template._renderImpl);

        var string = template._renderImpl.toString();
        // Because these need to setup reoccurant bindings we should find evidence in the form of 
        //  the parsed binding expressions.
        //
        LiveUnit.Assert.areNotEqual(-1, string.indexOf('["style","backgroundColor"]'));
        LiveUnit.Assert.areNotEqual(-1, string.indexOf('["tabIndex"]'));

        return template.render({ x: "red", y: 100 }).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
            LiveUnit.Assert.areEqual(100, d.querySelector(".two").tabIndex);
        });

    });

    this.testOneTimeBindings = function () {

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div id='testObTemplateStyleBind2'>\
<div class='one' data-win-bind='style.backgroundColor: x WinJS.Binding.oneTime'></div>\
<div class='two' data-win-bind='tabIndex: y WinJS.Binding.setAttributeOneTime'></div>\
</div>";

        var template = new WinJS.Binding.Template(templateDiv);
        template._renderImpl = template._compileTemplate({
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof template._renderImpl);

        var string = template._renderImpl.toString();
        // Because these are one-time bindings we should find no evidence of the binding
        //  initializers being called...
        //
        LiveUnit.Assert.areEqual(-1, string.indexOf('["style","backgroundColor"]'));
        LiveUnit.Assert.areEqual(-1, string.indexOf('["tabIndex"]'));

        return template.render({ x: "red", y: 100 }).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
            LiveUnit.Assert.areEqual(100, d.querySelector(".two").tabIndex);
        });

    };

    this.testDefaultInitializerOneTime = function (complete) {

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div id='testObTemplateStyleBind2'>\
<div class='one' data-win-bind='style.backgroundColor: x'></div>\
</div>";

        var template = new WinJS.Binding.Template(templateDiv, { bindingInitializer: WinJS.Binding.oneTime });
        template._renderImpl = template._compileTemplate({
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof template._renderImpl);

        var string = template._renderImpl.toString();
        // Because these are one-time bindings we should find no evidence of the binding
        //  initializers being called...
        //
        LiveUnit.Assert.areEqual(-1, string.indexOf('["style","backgroundColor"]'));

        var data = WinJS.Binding.as({ x: "red", y: 100 });
        return template.render(data).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
            data.x = "green";
            return WinJS.Promise.timeout().then(function () { return d; });
        }).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
            complete();
        });

    };

    this.testDelayedControl = async(function () {
        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div id='testObTemplateStyleBind2'>\n\
  <div class='one' data-win-bind='style.backgroundColor: x'></div>\n\
  <div class='two' data-win-bind='tabIndex: y WinJS.Binding.setAttribute'></div>\n\
  <div class='three' data-win-bind='winControl.userRating: y' data-win-control='MyCustomDelayableControl'>\n\
    <div class='four' data-win-bind='style.backgroundColor: x; madeUpProperty: y'></div>\n\
  </div>\n\
</div>";

        var template = new WinJS.Binding.Template(templateDiv);
        template._renderItemImpl = template._compileTemplate({
            target: "renderItem",
        });

        LiveUnit.Assert.areEqual("function", typeof template._renderImpl);

        var string = template._renderItemImpl.toString();
        // Because these need to setup reoccurant bindings we should find evidence in the form of 
        //  the parsed binding expressions.
        //
        LiveUnit.Assert.areNotEqual(-1, string.indexOf('["style","backgroundColor"]'));
        LiveUnit.Assert.areNotEqual(-1, string.indexOf('["tabIndex"]'));
        LiveUnit.Assert.areNotEqual(-1, string.indexOf('["madeUpProperty"]'));
        LiveUnit.Assert.areNotEqual(-1, string.indexOf('["userRating"]'));

        var readyComplete;
        var readyPromise = new WinJS.Promise(function (c) {
            readyComplete = c;
        });

        var itemComplete;
        var itemPromise = new WinJS.Promise(function (c) {
            itemComplete = c;
        });

        var item = {
            data: { x: "red", y: 100 },
            ready: readyPromise,
        };
        itemComplete(item);

        var elementDone = false;
        var result = template.renderItem(itemPromise);
        result.element.then(function (d) {
            elementDone = true;
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
            LiveUnit.Assert.areEqual(100, d.querySelector(".two").tabIndex);
            // Before readyComplete has been fired nothing on .three or .four should be initialized
            LiveUnit.Assert.isFalse(d.querySelector(".three").classList.contains("mycustomdelayablecontrol"));
            LiveUnit.Assert.isNull(d.querySelector(".three").winControl);
            LiveUnit.Assert.areEqual("", d.querySelector(".four").style.backgroundColor);
            LiveUnit.Assert.isNull(d.querySelector(".four").madeUpProperty);
        });
        LiveUnit.Assert.isTrue(elementDone);

        readyComplete(item);
        return result.renderComplete.then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
            LiveUnit.Assert.areEqual(100, d.querySelector(".two").tabIndex);
            // After readyComplete has been fired .three or .four should be initialized with the control and bindings
            LiveUnit.Assert.isTrue(d.querySelector(".three").classList.contains("mycustomdelayablecontrol"));
            LiveUnit.Assert.areEqual(100, d.querySelector(".three").winControl.userRating);
            LiveUnit.Assert.areEqual("red", d.querySelector(".four").style.backgroundColor);
            LiveUnit.Assert.areEqual(100, d.querySelector(".four").madeUpProperty);
        });
    });

    // In order to support blend we need to support changing the template and recompiling
    //
    this.testResetOnFragmentTreeChange = function (complete) {

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div id='testObTemplateStyleBind2'>\
<div class='one' data-win-bind='style.backgroundColor: x'></div>\
</div>";

        var metaOne = templateDiv.querySelector(".one");

        var template = new WinJS.Binding.Template(templateDiv);
        template._renderImpl = template._compileTemplate({
            defaultInitializer: WinJS.Binding.oneTime,
            resetOnFragmentChange: true,
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof template._renderImpl);

        var string = template._renderImpl.toString();
        // Because these are one-time bindings we should find no evidence of the binding
        //  initializers being called...
        //
        LiveUnit.Assert.areEqual(-1, string.indexOf('["style","backgroundColor"]'));

        template.render({ x: "red", y: 100 }).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
        }).then(function () {
            metaOne.innerHTML = "<div class='two' data-win-bind='textContent: y'></div>";
            return WinJS.Promise.timeout();
        }).then(function () {
            // @TODO, once mutation observers for DOM elements come online we can remove this whole block
            template._reset();
        }).then(function () {
            LiveUnit.Assert.areEqual(WinJS.Binding.Template.prototype._renderImpl, template._renderImpl);
            // recompile
            template._renderImpl = template._compileTemplate({
                defaultInitializer: WinJS.Binding.oneTime,
                resetOnFragmentChange: true,
                target: "render",
            });
            LiveUnit.Assert.areNotEqual(WinJS.Binding.Template.prototype._renderImpl, template._renderImpl);
            return template.render({ x: "red", y: 100 });
        }).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
            LiveUnit.Assert.areEqual("100", d.querySelector(".two").textContent);
            complete();
        });

    };

    this.testResetOnFragmentAttributeChange = function (complete) {

        if(WinJS.Utilities._MutationObserver._isShim) {
            // The Template Compiler will not automatically regenerate
            // when the raw DOM is modified on platforms without
            // MutationObserver support.
            return complete();
        }

        var templateDiv = document.createElement("div");
        templateDiv.innerHTML = "<div id='testObTemplateStyleBind2'>\
<div class='one' data-win-bind='style.backgroundColor: x'></div>\
</div>";

        var metaOne = templateDiv.querySelector(".one");

        var template = new WinJS.Binding.Template(templateDiv);
        template._renderImpl = template._compileTemplate({
            defaultInitializer: WinJS.Binding.oneTime,
            resetOnFragmentChange: true,
            target: "render",
        });

        LiveUnit.Assert.areEqual("function", typeof template._renderImpl);

        var string = template._renderImpl.toString();
        // Because these are one-time bindings we should find no evidence of the binding
        //  initializers being called...
        //
        LiveUnit.Assert.areEqual(-1, string.indexOf('["style","backgroundColor"]'));

        template.render({ x: "red", y: 100 }).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
        }).then(function () {
            // go change an attribute value and verify that the template reset itself.
            WinJS.Utilities.data(template.element).docFragment.querySelector(".one").setAttribute("aria-label", "something");
            return WinJS.Promise.timeout();
        }).then(function () {
            LiveUnit.Assert.areEqual(WinJS.Binding.Template.prototype._renderImpl, template._renderImpl);
            // recompile
            template._renderImpl = template._compileTemplate({
                defaultInitializer: WinJS.Binding.oneTime,
                resetOnFragmentChange: true,
                target: "render",
            });
            LiveUnit.Assert.areNotEqual(WinJS.Binding.Template.prototype._renderImpl, template._renderImpl);
            return template.render({ x: "red", y: 100 });
        }).then(function (d) {
            LiveUnit.Assert.areEqual("red", d.querySelector(".one").style.backgroundColor);
            LiveUnit.Assert.areEqual("something", d.querySelector(".one").getAttribute("aria-label"));
            complete();
        });

    };

    this.testCSETreeWithNormalAccessGenerator = function () {
        var compiler = {
            _instanceVariables: {},
            _instanceVariablesCount: {},
            defineInstance: WinJS.Binding._TemplateCompiler.prototype.defineInstance,
            formatCode: WinJS.Binding._TemplateCompiler.prototype.formatCode,
            nullableIdentifierAccessTemporary: "t0",
        };

        var cse = new WinJS.Binding._TemplateCompiler._TreeCSE(compiler, "root", "data", WinJS.Binding._TemplateCompiler.prototype.generateNormalAccess.bind(compiler));

        cse.createPathExpression(["data", "moreData", "detail1"], "data_moreData_detail1");
        cse.createPathExpression(["data", "moreData", "detail2"], "data_moreData_detail2");
        cse.createPathExpression(["data", "moreData", "detail2", "evenMoreDetail"], "data_moreData_detail2_evenMoreDetail");

        cse.lower();

        var definitions = cse.definitions();

        // MoreData should have been aliased
        LiveUnit.Assert.areEqual(definitions[0], "d3_data_moreData = (t0 = root) && (t0 = (t0.data)) && (t0.moreData)");

        // Detail1 and Detail2 should reference off the aliased moreData
        LiveUnit.Assert.areEqual(definitions[1], "d0_data_moreData_detail1 = (t0 = d3_data_moreData) && (t0.detail1)");
        LiveUnit.Assert.areEqual(definitions[2], "d1_data_moreData_detail2 = (t0 = d3_data_moreData) && (t0.detail2)");

        // EvenMoreDetail should reference off detail2
        LiveUnit.Assert.areEqual(definitions[3], "d2_data_moreData_detail2_evenMoreDetail = (t0 = d1_data_moreData_detail2) && (t0.evenMoreDetail)");
    };

    this.testCSETreeWithNormalElementCaptureAccessGenerator = function () {
        var compiler = {
            _instanceVariables: {},
            _instanceVariablesCount: {},
            defineInstance: WinJS.Binding._TemplateCompiler.prototype.defineInstance,
            formatCodeN: WinJS.Binding._TemplateCompiler.prototype.formatCodeN,
            nullableIdentifierAccessTemporary: "t0",
        };

        var cse = new WinJS.Binding._TemplateCompiler._TreeCSE(compiler, "container", "capture", WinJS.Binding._TemplateCompiler.prototype.generateElementCaptureAccess.bind(compiler));

        cse.createPathExpression(["0", "0"], "one_two");
        cse.createPathExpression(["0", "1"], "one_two");
        cse.createPathExpression(["0", "1", "0"], "one_two_three");

        cse.lower();

        var definitions = cse.definitions();

        // 0_0 should have been aliased
        LiveUnit.Assert.areEqual(definitions[0], "c3_0 = container.children[startIndex]");

        // Detail1 and Detail2 should reference off the aliased moreData
        LiveUnit.Assert.areEqual(definitions[1], "c0_one_two = c3_0.children[0]");
        LiveUnit.Assert.areEqual(definitions[2], "c1_one_two = c3_0.children[1]");

        // EvenMoreDetail should reference off detail2
        LiveUnit.Assert.areEqual(definitions[3], "c2_one_two_three = c1_one_two.children[0]");
    };
};

LiveUnit.registerTestClass("CorsicaTests.Templates_Interpreted");
LiveUnit.registerTestClass("CorsicaTests.Templates_Interpreted_renderItem");
LiveUnit.registerTestClass("CorsicaTests.Templates_Compiled");
LiveUnit.registerTestClass("CorsicaTests.Templates_Compiled_renderItem");

LiveUnit.registerTestClass("CorsicaTests.TemplateCompilerTests");
