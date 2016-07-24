var MASTER_DOC = "https://docs.google.com/spreadsheets/d/12v-1JWnATDNUHSXdbPeq8_S-7Y9BIO3vXi5-zwm70wE/pubhtml";


function main()
{

  var master_sheet = SpreadsheetApp.openByUrl(MASTER_DOC).getSheetByName("Regular");
  var range = master_sheet.getRange("A2:AJ300");
  var data_values=master_sheet.getDataRange().getValues();  
  
  var accountid_old = ""; 
  
  for (var n = 1;n < data_values.length;n++)
  {
    Logger.log(n)
    var firstRun = data_values[n][3];
    
    if (accountid_old != data_values[n][0])
    {  
      var accountSelector = MccApp.accounts().withIds([data_values[n][0]]);
      var accountIterator = accountSelector.get();  
      if (accountIterator.hasNext()) 
      {
        // Get the current account.
        var account = accountIterator.next();
        // Select the child account.
        MccApp.select(account);
        Logger.log("Account with CID "+[data_values[n][0]]+" selected")
               
      }
    }
    
    accountid_old = account.getCustomerId();
    var campaignIterator_1 = AdWordsApp.campaigns()
    .withCondition('LabelNames CONTAINS_ALL ["' + data_values[n][1] + '", "' + data_values[n][2] + '"]')
    .get();
    
    
    
    if (firstRun)
    {
      while (campaignIterator_1.hasNext()) 
      {
        var campaign = campaignIterator_1.next();    
        var campaignName = campaign.getName();
        var sitelinksIterator = campaign.extensions().sitelinks().get();
        while (sitelinksIterator.hasNext()) 
        {
          sitelink = sitelinksIterator.next();
          var sitelinkText = sitelink.getLinkText();
          campaign.removeSitelink(sitelink);
          Logger.log("Removed Sitelink with text " + sitelinkText + " from campaign " + campaignName + " in First Run")
        }
      }
      master_sheet.getRange(n+1,4).setValue(0);
    }  
    
    for (var i = 4; i < 36;i = i+8)
    {
      if (data_values[n][i])
      {
        var campaignIterator_2 = AdWordsApp.campaigns()
        .withCondition('LabelNames CONTAINS_ALL ["' + data_values[n][1] + '", "' + data_values[n][2] + '"]')
        .get();
        var sitelinkBuilder = AdWordsApp.extensions().newSitelinkBuilder();
        if (data_values[n][(i+7)] != "")
        {
          var newSitelink = sitelinkBuilder
          .withLinkText(data_values[n][(i+1)])
          .withLinkUrl(data_values[n][(i+2)])
          .withDescription1(data_values[n][(i+3)])
          .withDescription2(data_values[n][(i+4)])
          .withEndDate(data_values[n][(i+7)].toString())
          .withMobilePreferred(data_values[n][(i+5)])
          .create();
        }
        else
        {
          var newSitelink = sitelinkBuilder
          .withLinkText(data_values[n][(i+1)])
          .withLinkUrl(data_values[n][(i+2)])
          .withDescription1(data_values[n][(i+3)])
          .withDescription2(data_values[n][(i+4)])
          .withMobilePreferred(data_values[n][(i+5)])
          .create();
        }
          
        
        while (campaignIterator_2.hasNext()) 
        {
          var campaign_2 = campaignIterator_2.next();    
          var campaignName_2 = campaign_2.getName();
          var sitelinksIterator = campaign_2.extensions().sitelinks().get();
          while (sitelinksIterator.hasNext()) 
          {
            var sitelink = sitelinksIterator.next();
            var sitelinkText = sitelink.getLinkText();
            if (sitelinkText == data_values[n][(i+6)])
            {
              campaign_2.removeSitelink(sitelink);
              Logger.log("Removed old sitelink with text " + sitelinkText + " from campaign " + campaignName_2)
            }
          }
          campaign_2.addSitelink(newSitelink);
          Logger.log("Added new sitelink with text " + data_values[n][(i+1)] + " in campaign " + campaignName_2)
        }
        master_sheet.getRange(n+1,i+7).setValue(data_values[n][(i+1)]);
        master_sheet.getRange(n+1,i+1).setValue(0);
      }
    }
  }
}
        
        
          
          
        
        
       



