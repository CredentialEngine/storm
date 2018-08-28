$("#selectedServer").change(function (evt) {
    if ($("#rad8:selected").length > 0)
        $("#viewOutputFramework").attr("src", "cass-editor/index.html?server=" + $("#selectedServer :selected").attr("value") + "&ceasnDataFields=true");
});

$("#rad8").change(function (evt) {

    if ($("#rad8:checked").length > 0)
        $("#viewOutputFramework").attr("src", "cass-editor/index.html?server=" + $("#selectedServer :selected").attr("value") + "&ceasnDataFields=true");
    else
        $("#viewOutputFramework").attr("src", "");
});
