
if (!window.WinJS) {

    require.config({
        paths: {
            "WinJS": "/content/winjs/js/WinJS",
            "require-style": "/require-style",
        },
    });

    window.WinJS = window.WinJS || {};
    WinJS.Utilities = WinJS.Utilities || {};
    WinJS.Utilities._writeProfilerMark = function _writeProfilerMark(text) {
        window.msWriteProfilerMark && msWriteProfilerMark(text);
    };

    require(["/content/winjs/js/base.js", "/content/winjs/js/ui.js"], function (base, ui) {
        // loaded
    });

}