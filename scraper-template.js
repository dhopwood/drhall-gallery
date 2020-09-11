const rp = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');
const request = require('request');
var shell = require('shelljs');
const domain = "https://www.natural-lookingresults.com";
const urls = [  
  '/before-and-after-gallery/breast-procedures/breast-reduction/'
]
let listOfPatients = [];
const pad2 = function (number) {
  return (number < 10 ? '0' : '') + number;
}
const download = function (uri, filename, callback) {
  request.head(encodeURI(uri), function (err, res, body) {
    request(encodeURI(uri)).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
Scrape(urls,listOfPatients);
function Scrape(urls) {
  sleep(1000).then(() => {
    if (urls.length != 0) {
      const indexUrl = domain + urls.pop();
      rp(indexUrl).then(function (html) {
        // FIND THE HREF OF THE INDIVIDUAL PATIENT HERE
        $(".case .btn", html).each(function () {
          const patientUrl = $(this).attr("href");
          listOfPatients.push(patientUrl);
        });
        Scrape(urls,listOfPatients);
      })
    }
    else if (listOfPatients.length != 0){
      CreatePatient(listOfPatients.pop());
      Scrape(urls,listOfPatients);
    }
  });
}
function CreatePatient(patienturl) {
  realpatienturl = domain + patienturl;
  rp(realpatienturl).then(function (html) {
    //GET PATIENT IMAGES
    shell.mkdir('-p', __dirname + patienturl);
    let photonumber = 1;
    //FIND ALL PATIENT IMAGES
    $("#BeforeAfterPageCaseBox .img-wrapper img",html).each(function(){
      let img = domain + $(this).attr("style").match(/background-image:url\('(.*\.(jpg|png))/)[1];
      console.log(img);
      download(img, __dirname + patienturl + "/" + pad2(photonumber) + ".jpg" , function(){});
      photonumber++;
    });
    //GET PATIENT INFO
    let patientinfo = $(".case-descritpion",html).text();
    let patientdata = "<ul>" + $(".case-info",html).html() + "</ul>";
    let patientdata2 = "";
    const wstream = fs.createWriteStream(__dirname + patienturl + '/index.php');
    wstream.write('<?php ');
    wstream.write('$patientInfo = "' + patientinfo + '";');
    wstream.write('$patientData = "' + patientdata + '";');
    wstream.write('$patientData2 = "' + patientdata2 + '";');
    wstream.write(' ?>');
    wstream.end();
  });
}