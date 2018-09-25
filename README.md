# storm
"If I were an algorithm..." -- CRADA Team Motto

Product Data to S1000D via CTDL-ASN / CASS

# Documentation

## Step 1
This project performs translation from Product Data Standards:

* GEIA 0007 `js/import.js and js/importWorker.js`
* S3000L `js/importS3000L.js`

from XML formats to Linked Data Formats on the Web. (JSON-LD) This work maintains the existing schema, just changes the format of the content. The XML is "shattered" into many individually addressable and searchable objects on the web.

The relevant data is viewable. `js/viewLinkedData.js`

Next, the product data is enriched. In particular:

* Encoded terms and meanings are decoded into human interprable phrases using the specifications. `js/importDefinitionsAndTerms.js`
* (Future) Complex interactions

The enriched product data is viewable. `js/viewExpandedLinkedData.js`

Next, the product data is translated into two competency frameworks.

`js/convertProductDataToCompetencies.js`

The competency frameworks are viewable. `js/viewOutputFramework.js`

Next, 

#