# storm
"If I were an algorithm..." -- CRADA Team Motto

Product Data to S1000D via CTDL-ASN / CASS

# Documentation
This project performs translation from Product Data Standards:
* GEIA 0007 `js/import.js and js/importWorker.js`
* S3000L `js/importS3000L.js`

from XML formats to Linked Data Formats on the Web. (JSON-LD) This work maintains the existing schema, just changes the format of the content. The XML is "shattered" into many individually addressable and searchable objects on the web.

The relevant data is viewable. `js/viewLinkedData.js`

Next, the product data is enriched. In particular:
* Encoded terms and meanings are decoded into human interprable phrases using the specifications. `js/importDefinitionsAndTerms.js`
* (Future) Complex interactions with other product data objects are turned into interprable phrases.

The enriched product data is viewable. `js/viewExpandedLinkedData.js`

Next, the product data is translated into two competency frameworks. `js/convertProductDataToCompetencies.js`

The competency frameworks are viewable. `js/viewOutputFramework.js`

The competency frameworks are exportable to CTDL-ASN. `js/viewCtdlasn.js`

Next, frameworks can be exported to S1000D. `js/exportS1000D.js`

# Process
Product data, `GEIA 0007` and `S3000L` is information about products that is generated as part of the design and development process for machinery and other equipment. These standards inform about the product, how to diagnose and repair the product, and several other topics related to the product.
## Changing Format
Conversion of these data standards from the XML format to a JSON-LD linked data format on the web does not change the information that the standards provide, however, it does change the form and medium that the information is sent across. This has the following effects:
* Increases connectivity by allowing deep linking to any data element in a document.
* Increases granularity, permitting reuse of data elements across multiple products or version.
* Increases access, as all data is available on the web and searchable.
## Changing Schema to CASS
Conversion between data standards change the intent, goal, purpose and use of data. Both `GEIA 0007` and `S3000L` are converted into an intermediate CASS format, which includes several vocabularies, but more importantly, it changes the intent, goal, purpose and use towards the people who will have to perform, as an example, diagnostic and maintenance tasks. This has the following effects:
* Orients data towards what a person can do instead of what a misbehaving product needs done.
* Includes in its scope whether a person can do something.
* Maintains a 'digital thread' connecting back to the product data version of the schema.
## Changing Schema to CTDL-ASN