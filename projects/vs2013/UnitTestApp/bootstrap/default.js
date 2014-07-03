(function () {

    document.addEventListener("DOMContentLoaded", function () {
        var packageFolder = Windows.ApplicationModel.Package.current.installedLocation;
        packageFolder.getFolderAsync("content\\tests").then(function (tests) {
            var options = new Windows.Storage.Search.QueryOptions(Windows.Storage.Search.CommonFileQuery.orderByName, [".html"]);
            var query = tests.createFileQueryWithOptions(options);
            query.getFilesAsync().then(function (files) {
                files = files.filter(function (file) {
                    return file.name === "test.html";
                }).map(function (file) {
                    return file.path.slice(packageFolder.path.length).replace(/\\/g, "\/");
                });
                var tests = document.querySelector("#testSelector");
                tests.innerHTML = "";
                files.forEach(function (file) {
                    var option = document.createElement("option");
                    option.innerText = file;
                    tests.appendChild(option);
                });
            })
        });
    });

    window.changeTest = function () {
        var current = document.querySelector("#testSelector");
        var tests = document.querySelector("#tests");
        tests.src = current.value;
    };

}())