class Common{
  getDateNow(){
    let dateNow = Date.now();
    let date = new Date(dateNow);
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    if(month < 10){
      month = '0'+month;
    }
    let day = date.getUTCDate();
    if(day < 10){
      day = '0'+day;
    }
    let hour = date.getUTCHours();         //
    if(hour < 10){
      hour = '0'+hour;
    }
    let minute = date.getMinutes();
    if(minute < 10){
      minute = '0'+minute;
    }

    let seconds = date.getSeconds();
    let milliSeconds = date.getMilliseconds();
    //  console.log($year+'-'+$month+'-'+$day+' '+$hour+':'+$minute+':00');
    //return $year+'-'+$month+'-'+$day+' '+$hour+':'+$minute+':'+$seconds+'.'+$milliSeconds;
    return {
      matchDate: year+'-'+month+'-'+day+' '+hour+':'+minute+':00',
      currentSecond: seconds,
      currentDate: year+'-'+month+'-'+day+' '+hour+':'+minute+':'+seconds+'.'+milliSeconds
    }
  }


  getRandomInt(min = -10, max = 10, isWholeNumber = false) {
  var precision = 100; // 2 decimals
  //  return Math.floor(Math.random() * (max - min + 1)) + min;
  //return Math.floor(Math.random() * (max * precision - min * precision) + 1 * precision) / (1*precision);
  if(isWholeNumber == true){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }else{
    return Math.floor(Math.random() * (max * precision - min * precision) + min * precision) / (1*precision);
  }
}

}

exports.Common = Common;
