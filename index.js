const express = require('express');

const app = express();
const requestify = require('requestify');
var userVisitCount = 0;

app.get('/', (req, res) => {
  
  
  var endResponse = '<h1 style="align: center">List of most recent Confirmed $MIA Mining Transactions</h1><table style="border: 1px solid black;"><thead><tr><th style="border: 1px solid black;">Block Height</th><th style="border: 1px solid black;">Tx_id</th><th style="border: 1px solid black;">Status</th><th style="border: 1px solid black;">Function Type</th><th style="border: 1px solid black;"># of Blocks</th><th style="border: 1px solid black;text-align:left;">Mining Amounts</th></tr></thead><tbody>';

  requestify.get('https://stacks-node-api.stacks.co/extended/v1/tx?limit=200&type%5B%5D=contract_call')
  .then(function(response) {
      // Get the response body (JSON parsed or jQuery object for XMLs)
      var jsonData = response.getBody();
      var jsonDataResults = jsonData.results;
      var JsonDataResultsFiltered = jsonDataResults.filter(function(item){
        return item.contract_call.function_name == 'mine-tokens' || item.contract_call.function_name == 'mine-many';
        });

      var itemsProcessed = 0;
      
      JsonDataResultsFiltered.forEach((item, index, array) => {
          //var itemAmount = item.post_conditions[0].amount/1000000;
          var itemRepr = item.contract_call.function_args[0].repr;
          var itemReprProcessed = itemRepr.replace('(list ','');
          itemReprProcessed = itemReprProcessed.replace(')','');
          itemReprProcessed = itemReprProcessed.replace(/u/g,'');
          itemReprProcessedSplit = itemReprProcessed.split(' ');
          var repr = itemReprProcessedSplit.map(function(item) { return item/1000000+' STX' });
          //console.log('Processed String: '+repr);

          endResponse = endResponse+'<tr>'
            +'<td style="border: 1px solid black;">'+item.block_height+'</td>'
            +'<td style="border: 1px solid black;">'+item.tx_id+'</td>'
            +'<td style="border: 1px solid black;">'+item.tx_status+'</td>'
            +'<td style="border: 1px solid black;">'+item.contract_call.function_name+'</td>'
            +'<td style="border: 1px solid black;">'+repr.length
            +'<td style="border: 1px solid black;">'+repr+'</td></tr>';
          
          itemsProcessed++;
          if(itemsProcessed === array.length) {
            endResponse = endResponse+'</tbody></table>';
            callback();
          }
      });

      function callback () { 
          userVisitCount++;
          console.log('User Visit Count:'+userVisitCount);
          res.send(endResponse);
      };
  }
);
  
});

app.listen(3000, () => {
  console.log('server started');
});