
if (!window.WinJS) {

    require.config({
        paths: {
            "WinJS": "/content/winjs/js/WinJS",
            "require-style": "/require-style",
            "less": "/content/winjs/less",
            "less/desktop": "/content/winjs/less/desktop",
            "less/phone": "empty:",
        },
    });

    window.less = {
        env: "development", globalVars: { platform: "desktop", theme: "dark", inverseTheme: "light", },
    };

    window.WinJS = window.WinJS || {};
    WinJS.Utilities = WinJS.Utilities || {};
    WinJS.Utilities._writeProfilerMark = function _writeProfilerMark(text) {
        window.msWriteProfilerMark && msWriteProfilerMark(text);
    };

    // @TODO, eventually the tests will specify their dependencies and load the required parts of WinJS themselves.
    // @TODO, how to run phone tests here? Need to be able to load phone WinJS, might also be addressed by above.
    require(["/content/winjs/js/base.js", "/content/winjs/js/ui.js"], function (base, ui) {
        var less = document.createElement("script");
        less.src = "/node_modules/less.js";
        document.head.appendChild(less);
    });

    window.onerror = function () {
        return true;
    }

}