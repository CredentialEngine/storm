$("#importDefinitionsAndTerms").click(function (evt) {

    var repo = new EcRepository();
    repo.selectedServer = $("#selectedServer :selected").val();
    var repo2 = repo;

    var structure = [];
    var lookup = {};
    var error = function (failure) {
        console.trace(failure);
        throw failure;
    };
    EcRepository.caching = true;

    var saveThing = function (thing) {
        Task.asyncImmediate(function (con) {
            repo2.saveTo(thing, function (success) {
                //console.log(thing.id);
                var val = parseInt($("#importTermsProgress").attr("value")) + 1;
                $("#importTermsProgress").attr("value", val);
                $("#importTermsProgressText").text(val);

                con();
            }, function (error) {
                console.log(thing.id);
                console.log(error);
                var val = parseInt($("#importTermsProgress").attr("value")) + 1;
                $("#importTermsProgress").attr("value", val);
                $("#importTermsProgressText").text(val);

                con();
            });
        });
    }

    EcRemote.async = false;
    var descriptionDocument;
    EcRemote.getExpectingObject("dist/geiavocabularies.json", null, function (s) {
        console.log(s);
        descriptionDocument = s;
    }, function (s) {
        console.log(s);
        descriptionDocument = JSON.parse(s);
    });
    EcRemote.async = true;
    if (descriptionDocument["@graph"] == null) {
        console.trace("No graph.");
        throw "No graph";
    }
    var graph = descriptionDocument["@graph"];

    var idConvert = function (id) {
        if (id == null) return null;
        return id.replace(/\//g, ".").replace(/_:/, "");
    };

    var r = {};

    for (var j = 0; j < graph.length; j++) {
        var conceptOrScheme = graph[j];
        var cos = conceptOrScheme;

        cos["@context"] = "http://schema.cassproject.org/0.3/skos/";
        cos["@type"] = cos["@type"].replace("skos:", "");
        if (cos["@type"] == "ConceptScheme") {
            if (cos["rdfs:label"] != null) {
                cos["dcterms:title"] = cos["rdfs:label"]["en-us"];
            } else cos["dcterms:title"] = cos["meta:forProperty"];

        }
        if (cos["skos:prefLabel"] != null)
            cos["skos:prefLabel"] = cos["skos:prefLabel"]["en-us"];
        if (cos["skos:definition"] != null)
            cos["dcterms:description"] = cos["skos:definition"]["en-us"];
        var rld = new EcRemoteLinkedData();
        rld.copyFrom(cos);
        for (var key in cos)
            if (key.startsWith("@") == false)
                rld[key] = cos[key];
        rld.context = "http://schema.cassproject.org/0.3/skos/";
        rld.assignId(repo2.selectedServer, idConvert(cos["@id"]));
        r[idConvert(cos["@id"])] = rld;
    }

    for (var key in r) {
        //console.log(key);
        var rld = r[key];
        if (rld["skos:topConceptOf"] != null) {
            //console.log(rld["skos:topConceptOf"]);
            if (r[idConvert(rld["skos:topConceptOf"])] == null) {
                delete r[key];
                continue;
            }
            rld["skos:topConceptOf"] = r[idConvert(rld["skos:topConceptOf"])].shortId();
        }
        if (rld["skos:hasTopConcept"] != null) {
            for (var i = 0; i < rld["skos:hasTopConcept"].length; i++)
                rld["skos:hasTopConcept"][i] = r[idConvert(rld["skos:hasTopConcept"][i])].shortId();
            console.log(rld.toJson());
        }
        var val = parseInt($("#importTermsProgress").attr("max")) + 1;
        $("#importTermsProgress").attr("max", val);
        $("#importTermsProgressMax").text(val);
        saveThing(rld);
    }
});
