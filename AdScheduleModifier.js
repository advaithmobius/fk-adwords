var SCHEDULE_DOC = "https://docs.google.com/spreadsheets/d/16ToA2q2dPbFyq3uSSNel-gycJEU0Ycw7qknwBVTNY10/pubhtml";
var LABEL_DOC = "https://docs.google.com/spreadsheets/d/1mgZxfmRW3YBSUwUAd4RgubfFru74GATVc12D0e-Ezx8/pubhtml";
var DATE_RANGE = 'LAST_14_DAYS';
var MINIMUM_BID_ADJUSTMENT = .2;
var MAXIMUM_BID_ADJUSTMENT = 1.3;
var DECIMAL_PLACES = 1;

function main() 
{
  var schedule_sheet = SpreadsheetApp.openByUrl(SCHEDULE_DOC).getSheetByName("Sheet1");
  var schedule_range = schedule_sheet.getRange("A1:N7");
  var schedule_values=schedule_sheet.getDataRange().getValues();
  var label_sheet = SpreadsheetApp.openByUrl(LABEL_DOC).getSheetByName("Sheet1");
  var range = label_sheet.getRange("A2:E318");
  var data_values=label_sheet.getDataRange().getValues();  
  var accountid_old = ""; 
  var modArray = new Array(7);
  for (var x = 0; x < 7; x++) 
  {
    modArray[x] = new Array(6);
    for (var y = 0; y < 6; y++)
    {
      modArray[x][y]= new Array(3);
    }
  }
  
  for (var n=269;n<data_values.length;n++)
  {
       
    Logger.log(n)
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
        
        var accountMapping = {};// { CampaignName : { Day of Week : { Hour : { stat : value } } } }
        var statIterator = getCampaignStats();
        var statRows = statIterator.rows();
        Logger.log("Stats Retrieved")
      
        while (statRows.hasNext())
        {
          var row = statRows.next();
          
          if(!accountMapping[row.CampaignName])
          {
            accountMapping[row.CampaignName] = {}
          }
          if(!accountMapping[row.CampaignName][row.DayOfWeek])
          {
            accountMapping[row.CampaignName][row.DayOfWeek] = {};
          }
          if(!accountMapping[row.CampaignName][row.DayOfWeek][(row.HourOfDay).toString()])
          {
            accountMapping[row.CampaignName][row.DayOfWeek][(row.HourOfDay).toString()] = {};
          }
          accountMapping[row.CampaignName][row.DayOfWeek][(row.HourOfDay).toString()] = {Clicks : row["Clicks"], Cost : row["Cost"], ConversionValue : row["ConversionValue"]};
          
        }
      }
      
      Logger.log("Stats Mapped")
      
    }        
                            
    var timeZone = AdWordsApp.currentAccount().getTimeZone();
    accountid_old = account.getCustomerId();
    
    if (data_values[n][4] == "SubChannel:PLA")
    {
      var campaignIterator = AdWordsApp.shoppingCampaigns()
      .withCondition('LabelNames CONTAINS_ALL ["' + data_values[n][1] + '", "' + data_values[n][4] + '"]')
      .get();
    }
    else
    {
      var campaignIterator = AdWordsApp.campaigns()
      .withCondition('LabelNames CONTAINS_ALL ["' + data_values[n][1] + '", "' + data_values[n][4] + '"]')
      .get();
    }
    
    modArray = initModArray(modArray);
    Logger.log(data_values[n][4])
    Logger.log(data_values[n][1])
    
    while (campaignIterator.hasNext()) 
    {
      var campaign = campaignIterator.next();    
      var campaignName = campaign.getName();            
      Logger.log(campaignName)
      for (var i = 0; i < 14; i+=2)
      {
        if (accountMapping[campaignName] && accountMapping[campaignName][schedule_values[0][i]])
        {
          var k = 1;
          var hourLimit = schedule_values[k][i+1];
          for (var j = 0; j < 24; j++)
          {
            if (accountMapping[campaignName] && accountMapping[campaignName][schedule_values[0][i]] && accountMapping[campaignName][schedule_values[0][i]][j.toString()])
            {
              if (j < hourLimit)
              {
                modArray[parseInt(i/2)][k-1][0] = modArray[parseInt(i/2)][k-1][0] + parseFloat(accountMapping[campaignName][schedule_values[0][i]][j.toString()].Clicks.replace(/,/g,''));
                modArray[parseInt(i/2)][k-1][1] = modArray[parseInt(i/2)][k-1][1] + parseFloat(accountMapping[campaignName][schedule_values[0][i]][j.toString()].ConversionValue.replace(/,/g,''));
              }
              else
              {
                k++;
                hourLimit = schedule_values[k][i+1];
                j = j - 1;
              }
             
            }
          }
        }
      }
    }
    
    modArray = calculateModifiers(modArray);
    Logger.log(modArray)
        
    if (data_values[n][4] == "SubChannel:PLA")
    {
      var campaignIterator2 = AdWordsApp.shoppingCampaigns()
      .withCondition('LabelNames CONTAINS_ALL ["' + data_values[n][1] + '", "' + data_values[n][4] + '"]')
      .get();
    }
    else
    {
      var campaignIterator2 = AdWordsApp.campaigns()
      .withCondition('LabelNames CONTAINS_ALL ["' + data_values[n][1] + '", "' + data_values[n][4] + '"]')
      .get();
    }
        
    while (campaignIterator2.hasNext()) 
    {
      var campaign_2 = campaignIterator2.next(); 
      var adSchedules = campaign_2.targeting().adSchedules().get();
      
      
      if(adSchedules.totalNumEntities() != 0)
      {
        Logger.log("Removing Schedules")
        while (adSchedules.hasNext()) 
        {
          var adSchedule = adSchedules.next();
          adSchedule.remove();
        }
      }
      
      Logger.log("Adding Schedules")
      for(var i = 0; i < 14; i+=2)
      {
        for (var j = 1 ; j < schedule_values.length; j++)
        {
          campaign_2.addAdSchedule({
            dayOfWeek: (schedule_values[0][i]).toUpperCase(),
            startHour: parseInt(schedule_values[j][i]),
            startMinute: 0,
            endHour: parseInt(schedule_values[j][i+1]),
            endMinute: 0,
            bidModifier: modArray[parseInt(i/2)][(j-1)][2]
          })
        }
      }      
    }
  }
}

          
        
    


function round(value) 
{
  var decimals = Math.pow(10,DECIMAL_PLACES);
  return Math.round(value*decimals)/decimals;
}
    
function getCampaignStats() 
{
  var API_VERSION = {includeZeroImpressions : false };
  var query = buildAWQLQuery();
  var reportIter = AdWordsApp.report(query, API_VERSION); 
  return reportIter;
}
        
function buildAWQLQuery() 
{
  var cols = ['CampaignId','CampaignName','DayOfWeek','HourOfDay','Clicks','Cost','ConversionValue'];
  var report = 'CAMPAIGN_PERFORMANCE_REPORT';
  return ['select',cols.join(','),'from',report,'during',DATE_RANGE].join(' ');
}
 
function initModArray(modArray)
{
  for (var i = 0; i < 7; i++)
  {
    for(var j = 0; j < 6; j++)
    {
      for (var k = 0; k < 3; k++)
      {        
        modArray[i][j][k] = 0;
      }
    }
  }
  return modArray;
}

function calculateModifiers(modArray)
{
  var totclicks = 0;
  var totrev = 0;
  var modifier = 1;
  for (var i = 0; i < 7; i++)
  {
    
    for(var j = 0; j < 6; j++)
    {       
      totclicks = totclicks + modArray[i][j][0];
      totrev = totrev + modArray[i][j][1];    
    }
  }
  var totrpc = totrev/totclicks;
  for (var i = 0; i < 7; i++)
  {
    for(var j = 0; j < 6; j++)
    {
      if (modArray[i][j][0] >= 500)
      {
        var rpc = modArray[i][j][1]/modArray[i][j][0];
        modifier = round(rpc/totrpc);
        modifier = Math.max(modifier,MINIMUM_BID_ADJUSTMENT);
        modifier = Math.min(modifier,MAXIMUM_BID_ADJUSTMENT);        
      }
      modArray[i][j][2] = modifier;
      
    }
  }
  return modArray
  
}
  
  

 
                                 
                                 
                                 
                                 
  
