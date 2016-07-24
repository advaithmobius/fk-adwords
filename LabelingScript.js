var SPREADSHEET_URL = 'https://docs.google.com/a/flipkart.com/spreadsheets/d/1QLWpFmnhaESYg3xevy8gQ56aHMmnSitEwDafz4suDQ0/pubhtml';

function main() {
  
  var spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  var sheet1 = spreadsheet.getSheetByName('Sheet1');
  var itemid = sheet1.getDataRange().getValues();
  var rownumber=1;
  
  for(;rownumber<itemid.length;rownumber++){
    var adGroupSelector=AdWordsApp.adGroups()
    .withCondition("CampaignName = \"" + itemid[rownumber][0] + "\"")
    .withCondition("AdGroupName = \"" + itemid[rownumber][1] + "\"");
   
    
    var adGroupIterator = adGroupSelector.get();
    while (adGroupIterator.hasNext()) {
      var adGroup = adGroupIterator.next();
       adGroup.applyLabel("Academic Label");
      }
    }
  
}