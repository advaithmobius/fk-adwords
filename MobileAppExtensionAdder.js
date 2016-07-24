var LABEL_DOC = "https://docs.google.com/spreadsheets/d/1mgZxfmRW3YBSUwUAd4RgubfFru74GATVc12D0e-Ezx8/pubhtml";

function main() {
  
  var label_sheet = SpreadsheetApp.openByUrl(LABEL_DOC).getSheetByName("Sheet1");
  var range = label_sheet.getRange("A2:E298");
  var data_values=label_sheet.getDataRange().getValues();
  var accountid_old = ""; 
  
  for (var i=1;i<data_values.length;i++)
  {
    Logger.log(i)
    if (accountid_old != data_values[i][0])
    {  
      
      var accountSelector = MccApp.accounts().withIds([data_values[i][0]]);
      var accountIterator = accountSelector.get();
      
      if (accountIterator.hasNext()) 
      {
        // Get the current account.
        var account = accountIterator.next();
        // Select the child account.
        MccApp.select(account);
        var newMobileApp = AdWordsApp.extensions().newMobileAppBuilder()
        .withAppId('com.flipkart.android')                 // required
        .withStore('Android')                               // required
        .withLinkText('Flipkart Android App')          // required
        .withLinkUrl('http://play.google.com/store/apps/details?id=com.flipkart.android&referrer=utm_source=google&utm_medium=admob&utm_campaign=admob')  // required
        .withStartDate({day: 11, month: 2, year: 2015})
        .create();
        
        var newiOSApp = AdWordsApp.extensions().newMobileAppBuilder()
        .withAppId('742044692')                 // required
        .withStore('iOS')                               // required
        .withLinkText('Flipkart iOS App')          // required
        .withLinkUrl('http://itunes.apple.com/app/flipkart/id742044692?uo=5&referrer=utm_source=google&utm_medium=admob&utm_campaign=admob')  // required
        .create();
      }
    }
    accountid_old = account.getCustomerId();
    
    
    if (data_values[i][4] == "SubChannel:Text")
    {
      var campaignIterator = AdWordsApp.campaigns()
      .withCondition('LabelNames CONTAINS_ALL ["' + data_values[i][1] + '", "' + data_values[i][4] + '"]')
      .get();
    
    
      while (campaignIterator.hasNext()) 
      {
        var campaign = campaignIterator.next();
        var campaignName = campaign.getName();
        var mobileAppsIterator = campaign.extensions().mobileApps().get();
        
        if (!mobileAppsIterator.hasNext())
        {
          campaign.addMobileApp(newMobileApp);
          campaign.addMobileApp(newiOSApp);
          Logger.log("Added App Extensions for Campaign " + campaignName)
        }
        else
        {
          Logger.log("App Extensions Already Present")
        }
      }
    }
  }
}