$("#selectedServer").change(function (evt) {
    $("#viewOutputFramework").attr("src", "cass-editor/index.html?server=" + $("#selectedServer :selected").attr("value") + "&ceasnDataFields=true");
});
