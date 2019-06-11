$("#selectedServer").change(function (evt) {
    if ($("#rad8:checked").length > 0)
        $("#viewOutputFramework").attr("src", "cass-editor/index.html?server=" + $("#selectedServer :selected").attr("value") + "&ceasnDataFields=true");
});

$("#rad8").change(function (evt) {
    if ($("#selectedServer :selected").attr("value") == "http://nowhere/") return;
    if ($("#rad8:checked").length > 0)
        $("#viewOutputFramework").attr("src", "cass-editor/index.html?server=" + $("#selectedServer :selected").attr("value") + "&ceasnDataFields=true");
    else
        $("#viewOutputFramework").attr("src", "");
});
var to;
$("#rad1,#rad2,#rad3,#rad4,#rad5,#rad6,#rad7,#rad8,#rad9,#rad10").change(function (evt) {
    $("#rad1,#rad2,#rad3,#rad4,#rad5,#rad6,#rad7,#rad8,#rad9,#rad10").parent().children("div").children().hide();
    var me = this;
    clearTimeout(to);
    to = setTimeout(function () {
        $(me).parent().children("div").children().show();
    }, 1000);
})
