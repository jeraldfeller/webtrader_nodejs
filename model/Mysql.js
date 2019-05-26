const mysql = require('mysql');
const config = require('config');
const fs = require('fs');
class Mysql {
  constructor(connection) {
    this.connection = mysql.createConnection({
      host: 'localhost',
      user: 'nanopips_admin',
      password: 'dfab7c358bb163',
      database: 'nanopips_stock'
    });

    this.connection.connect();
  }

  executeQuery(sqlQuery, post = {}) {
    return new Promise((resolve, reject) => {
      let query = this.connection.query(sqlQuery, post, (error, results, fields) => {
        if (error) throw error;
        resolve(results);

      });
      query.sql;

    })
  }

  async postCurrentTradePrice(data, btcPrice) {
    //console.log(data);
    //console.log(data);
    let post = {
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      btc_price: btcPrice,
      volume: data.volume,
      timestamp: data.date,
    };



    let coinTable = data.coin + "_table";
    let sql = "INSERT INTO  btc_eth_table SET ?";

    let result = await this.executeQuery(sql, post);

    // add unix to post
   post['unix'] = data.unix;

    // write json file for front end
    /*
     * Note: change this live socket in the front end
     */
    fs.writeFile('/home/nanopips/public_html/webtrader.nanopips.com/coin_live_price/trade.json', JSON.stringify(post), function (err) {
      // console.log(err);
    })
    //console.log(result);
  }


  async postCurrentPrice(data) {
    console.log(data);
    //console.log(data);
    let post = {
      dollar_price: data.dollarPrice,
      btc_price: data.btcPrice,
      timestamp: data.timestamp,
      coin: data.coin
    };



    let coinTable = data.coin + "_table";
    let sql = "INSERT INTO " + coinTable.toLowerCase() + " SET ?";

    let result = await this.executeQuery(sql, post);

    // write json file for front end
    /*
     * Note: change this live socket in the front end
     */
    fs.writeFile('/home/nanopips/public_html/webtrader.nanopips.com/coin_live_price/' + data.coin + '.json', JSON.stringify(data), function (err) {

    })
    //console.log(result);
  }

  async postLastPairPrice(data) {
    for (let x = 0; x < data.length; x++) {
      let pair = data[x].pair;
      let amount = data[x].amount;
      let result = await this.checkPair(pair);
      if (result.length == 0) {
        this.insertPair({pair: pair, price: amount});
      } else {
        this.updatePair([{pair: pair, price: amount}, {pair: pair}]);
      }

    }
  }

  async checkATU() {
    let post = {status: 1};
    let sql = 'SELECT * FROM atu WHERE ? LIMIT 1';
    let result = await this.executeQuery(sql, post);
    return result;
  }

  async checkPair(pair) {
    let post = {pair: pair};
    let sql = "SELECT * FROM pairing WHERE ?";
    let result = await this.executeQuery(sql, post);
    return result;
  }

  async insertPair(post) {
    let sql = "INSERT INTO pairing SET ?";
    let result = await this.executeQuery(sql, post);
    return result;
  }

  async updatePair(post) {
    let sql = "UPDATE pairing SET ? WHERE ?";
    let result = await this.executeQuery(sql, post);
    return result;
  }

}

exports.Mysql = Mysql;
