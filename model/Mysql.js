const mysql = require('mysql');
const config = require('config');
const fs = require('fs');
class Mysql {
  constructor(connection) {
    this.connection = mysql.createConnection({
      host: config.get('dbConfig.host'),
      user: config.get('dbConfig.user'),
      password: config.get('dbConfig.password'),
      database: config.get('dbConfig.dbName')
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


  async postCurrentPrice(data) {
    //console.log(data);
    let post = {
      dollar_price: data.dollarPrice,
      btc_price: data.btcPrice,
      timestamp: data.timestamp,
      coin: data.coin
    };
    let sql = "INSERT INTO " + data.coin + "_table SET ?";
    let result = await this.executeQuery(sql, post);

    // write json file for front end
    /*
     * Note: change this live socket in the front end
     */
    fs.writeFile('coin_live_price/' + data.coin + '.json', JSON.stringify(data), function (err) {
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