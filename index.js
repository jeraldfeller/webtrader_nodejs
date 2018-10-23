const config = require('config');
const express = require('express');
const ajax = require('ajax-request');
const app = express();
app.use(express.json());


const {Coincap} = require('./model/Coincap');
const coincap = new Coincap;
const {Common} = require('./model/Common');
const common = new Common;
const {Mysql} = require('./model/Mysql');
const mysql = new Mysql();



if(app.get('env') === 'production'){

}else{

}

async function appInit(){
  // get btc current price
  let currentBtcPrice = await coincap.getCoinLastPrice('BTC');
  let rates = await coincap.getExchangeRates();
  var lastSecond = '';
  let pairPrices = {
    BTCUSD: currentBtcPrice,
    BTCCNY: 0,
    BTCEUR: 0,
    BTCJPY: 0,
    ETHBTC: 0,
    ETHUSD: 0,
    ETCBTC: 0,
    LTCUSD: 0,
    LTCCNY: 0,
    LTCEUR: 0,
    LTCJPY: 0,
    XRPBTC: 0,
    EDOUSD: 0,
    ETPUSD: 0,
    NEOUSD: 0,
    SANUSD: 0,
    ZECUSD: 0,
    DASHUSD: 0,
    XRPUSD: 0,
    EOSUSD: 0,
    IOTUSD: 0,
    OMGUSD: 0,
    XMRUSD: 0,
    BCHUSD: 0
  };

  // atu

  let randomizerPercent = 55;

  let atuEnabled = false;
  let atuAction = '';
  let atuP = 0;
  let atuUid = 0;
  let atuCoin = '';

  // randomizer variables
  var btcLastPrice = 0;
  var btcCurrentPrice = 6571;
  var btcRegistered = false;
  var btcRange = [common.getRandomInt(-100, -50), common.getRandomInt(50, 100)];


  // check currency rates every hour
  setInterval(async function(){
    rates = await coincap.getExchangeRates();
  }, 3600000)
  // start socket

  const socket = require('socket.io-client')('https://coincap.io');
  socket.on('trades', function (tradeMsg) {
    let coin = tradeMsg.coin;
    let price = tradeMsg.message.msg.price;

    if(coin == 'BTC'){
      let cDate = common.getDateNow();
      let lastSeconds = cDate.currentSecond;
      let currentDate = cDate.currentDate;
      let matchDate = cDate.matchDate;

      let currentBtcPrice = price;
      currentBtcPrice = price;
      btcCurrentPrice = price;
      if(currentBtcPrice > 1){
        if(lastSeconds != lastSecond){
          lastSecond = lastSeconds;
          mysql.postCurrentPrice({coin: coin, dollarPrice: price, btcPrice: currentBtcPrice, timestamp: currentDate, matchDate: matchDate});

          pairPrices.BTCUSD = price;
          pairPrices.BTCCNY = currentBtcPrice * rates['CNY'];
          pairPrices.BTCEUR = currentBtcPrice * rates['EUR'];
          pairPrices.BTCJPY = currentBtcPrice * rates['JPY'];
          pairData = [
            {pair: 'BTCUSD', amount: price},
            {pair: 'BTCCNY', amount: currentBtcPrice * rates['CNY']},
            {pair: 'BTCEUR', amount: currentBtcPrice * rates['EUR']},
            {pair: 'BTCJPY', amount: currentBtcPrice * rates['JPY']}

          ];
          mysql.postLastPairPrice(pairData);

        }else{

        }
      }

    }
  });



  // randomizer
  setInterval(function() {
    btcRange = [common.getRandomInt(-50, -1), common.getRandomInt(1, 50)];
  }, 60000);

  setInterval(function(){
    if(btcCurrentPrice != 0){
      if(btcLastPrice > btcCurrentPrice || btcLastPrice < btcCurrentPrice){
        // 30% chance of updating the data
        if(atuEnabled == true){
          var randomPercent = 55;
        }else{
          var randomPercent = 30;
        }
        if(common.getRandomInt(1, 100, true) < randomPercent){
          let randomNum = common.getRandomInt(btcRange[0], btcRange[1]);
          if(randomNum < 0){
            var randomNumNewFixed = randomNum * -1;
            var randomNumNew = '-'+randomNumNewFixed;
          }else{
            var randomNumNew = randomNum;
          }
          let price = btcCurrentPrice + parseFloat(randomNumNew);
          if(atuCoin == 'BTC'){
            if(atuEnabled == true){
              if(Math.floor(Math.random() * (100 - 1 + 1)) + 1 <= randomizerPercent){
                let randomNumATU = common.getRandomInt(0, 100);
                console.log('ATU Enabled');
                if(atuAction == 'buy'){
                  price = (atuP - randomNumATU);

                }else{
                  price = (parseInt(atuP) + randomNumATU);

                }
              }
            }else{
              console.log('ATU Disabled');
            }
          }
          console.log('------------------------------------------');
          console.log('Range: ' + btcRange);
          console.log('Orig: ' + btcCurrentPrice);
          console.log('Ran: ' + randomNumNew);
          console.log('BTC: ' + price);
          console.log('------------------------------------------');

          generateData('BTC', price, currentBtcPrice.price_usd);
        }
      }else{
        //  console.log(zecLastPrice + ' - ' + zecCurrentPrice);
        //  console.log(typeof zecLastPrice + ' - ' + typeof zecCurrentPrice);

      }
    }
  }, 1000);

  function generateData(coin, price, currentBtcPrice){
    let coinUsd = coin+'USD';
    let coinBtc = coin+'BTC';
    let cDate = common.getDateNow();
    let lastSeconds = cDate.currentSecond;
    let currentDate = cDate.currentDate;
    let matchDate = cDate.matchDate;
    pairPrices.coinUsd = price;
    pairPrices.coinBtc = price / currentBtcPrice;
    pairData = [
      {pair: coinUsd, amount: price},
      {pair: coinBtc, amount: price / currentBtcPrice}
    ];
    if(coin != 'BTC'){
      var btcPrice = parseFloat(price) / parseFloat(currentBtcPrice);
    }else{
      var btcPrice = parseFloat(price);
    }
    mysql.postCurrentPrice({coin: coin, dollarPrice: price, btcPrice: btcPrice, timestamp: currentDate, matchDate: matchDate});
    mysql.postLastPairPrice(pairData);
  }


  setInterval(async () => {
    let result = await mysql.checkATU();
    if(result[0]){
      console.log(result[0].transaction_id);
      atuEnabled = true;
      atuP = result[0].amount;
      atuCoin = result[0].coin;
      atuAction = result[0].action;
    }else{
      atuEnabled = false;
    }
  }, 1000);
}
appInit();




