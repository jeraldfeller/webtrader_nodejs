const fetch = require("node-fetch");
const config = require('config');
const express = require('express');
const ajax = require('ajax-request');
const request = require("request");

const d3 = require('d3');

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
  var feed;
  var parseDate = d3.timeParse("%Q");
  var API_URL =
    "https://api.coincap.io/v2/candles?exchange=poloniex&interval=m1&baseId=ethereum&quoteId=bitcoin";
  // get btc current price

  let rates = await coincap.getExchangeRates();
  var lastSecond = '';




  var apiCallSeconds = 60;
  var indicatorPreRoll = 33;
  var randomizedDatum;
  var lastClose = 0;
  var lockOpen = 0;
  var lastDate = '';
  let currentBtcPriceObj = await coincap.getCoinLastPrice('BTC');
  let currentBtcPrice = currentBtcPriceObj.price;


  async function refresh() {

    var nowSeconds = new Date().getSeconds();
    if (nowSeconds < apiCallSeconds) {
      currentBtcPriceObj = await coincap.getCoinLastPrice('BTC');
      currentBtcPrice = currentBtcPriceObj.price;
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

      // Pass a new minute, make api call
      apiCallSeconds = 0;
      var options = { method: 'GET',
        url: 'https://api.coincap.io/v2/candles',
        qs:
          { exchange: 'poloniex',
            interval: 'm1',
            baseId: 'ethereum',
            quoteId: 'bitcoin' },
        headers:
          { 'Postman-Token': 'a0fa1510-d34d-413d-82a1-f6766315ac61',
            'cache-control': 'no-cache' } };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        let jsonData = JSON.parse(body);
        feed = jsonData.data
          .slice(jsonData.data.length - 60 - indicatorPreRoll)
          .map(function(d) {
            return {
              date: parseDate(d.period),
              unix: d.period,
              open: +toUsd(d.open),
              high: +toUsd(d.high),
              low: +toUsd(d.low),
              close: +toUsd(d.close),
              volume: +toUsd(d.volume)
            };
          })
          .sort(function(a, b) {
            return d3.ascending(a, b);
          });
        randomizedDatum = Object.assign({}, feed[feed.length - 1]);

        var lastFeed = feed[feed.length-1];
        if(lastClose != 0){
          console.log(lastDate.getTime(), lastFeed.date.getTime());
          if(lastDate.getTime() !== lastFeed.date.getTime()){
            lastFeed.open = lastClose
            lockOpen = lastClose;
            console.log('Last close ', lastClose, lastFeed.date);
            console.log(typeof lastDate, typeof lastFeed.date);
          }
        }
        mysql.postCurrentTradePrice(lastFeed, currentBtcPrice);
        setTimeout(refresh, 1000);
      });
      // d3.json(API_URL, function(error, json) {
      //   feed = json.data
      //     .slice(json.data.length - 60 - indicatorPreRoll)
      //     .map(function(d) {
      //       return {
      //         date: parseDate(d.period),
      //         open: +d.open,
      //         high: +d.high,
      //         low: +d.low,
      //         close: +d.close,
      //         volume: +d.volume
      //       };
      //     })
      //     .sort(function(a, b) {
      //       return d3.ascending(accessor.d(a), accessor.d(b));
      //     });
      //   console.log(feed);
      //   randomizedDatum = Object.assign({}, feed[feed.length - 1]);
      //   setTimeout(refresh, 1000);
      // });
    } else {
      apiCallSeconds = nowSeconds;
      var data = feed.slice(0, feed.length - 1);

      // Randomize last data point
      var offsetMax = 0.0005;
      // These values don't change
      var date = randomizedDatum.date;
      var volume = randomizedDatum.volume;
      var open = (lockOpen != 0 ? lockOpen : randomizedDatum.open);
      // These values do change
      var close = d3.randomUniform(
        randomizedDatum.close * (1 - offsetMax),
        randomizedDatum.close * (1 + offsetMax)
      )();
      var high = Math.max(
        close,
        d3.randomUniform(
          randomizedDatum.high ,
          randomizedDatum.high
        )()
      );
      var low = Math.min(
        close,
        d3.randomUniform(
          randomizedDatum.low ,
          randomizedDatum.low
        )()
      );

      // Calculate the transition values
      var closeInterpolator = d3.interpolate(randomizedDatum.close, close);
      var highInterpolator = d3.interpolate(randomizedDatum.high, high);
      var lowInterpolator = d3.interpolate(randomizedDatum.low, low);
      var steps = 1; // Number of steps during the transition

      var transitionValues = d3.range(steps).map(function(d) {
        const t = (d + 1) / steps;
        return {
          date: date,
          unix: common.toTimestamp(date),
          open: open,
          high: highInterpolator(t),
          low: lowInterpolator(t),
          close: closeInterpolator(t),
          volume: volume
        };
      });

      // The actual transition
      var i = 0;
      var transition = setInterval(function() {
        // redraw(data.slice().concat(transitionValues[i]));
        // console.log(transitionValues[i]);
        lastClose = transitionValues[i].close;
        lastDate = transitionValues[i].date;
        console.log('Current Open ', transitionValues[i].open, transitionValues[i].date);
        mysql.postCurrentTradePrice(transitionValues[i], currentBtcPrice);
        i++;
        if (i === steps) clearInterval(transition);
      }, 50);

      // Update the randomized values for subsequent transition calculation
      randomizedDatum.close = close;
      randomizedDatum.high = high;
      randomizedDatum.low = low;
      //console.log(close);
      setTimeout(refresh, 1000);
    }

    function toUsd(p){
      return currentBtcPrice / (1/p);
    }
  }
  refresh();


}
appInit();
