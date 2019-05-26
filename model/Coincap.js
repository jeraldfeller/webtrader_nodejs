const ajax = require('ajax-request');

class Coincap{
  async getCoinLastPrice(coin){
  console.log('Fetching '+coin+' current price');
  return new Promise((resolve, reject) => {
    ajax({
      url: "http://coincap.io/page/"+coin,
      method: 'GET',
      data: {}
    }, function(err, res, body) {
      console.log('Fetching '+coin+' current price complete!');
      resolve(JSON.parse(body));
    });
  })
}



  async getExchangeRates(){
  console.log('Fetching current exchange rates');
  return new Promise((resolve, reject) => {
    ajax({
      url: "https://coincap.io/exchange_rates",
      method: 'GET',
      data: {}
    }, function(err, res, body) {
      console.log('Fetching current exchange rates complete!');
      resolve(JSON.parse(body).rates);
    });
  })
}
}



// exports.coincap = {
//   "currentCoinPrice": getCoinLastPrice,
//   "currentEchangeRates": getExchangeRates
// };

exports.Coincap = Coincap;