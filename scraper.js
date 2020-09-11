const rp = require('axios');
const $ = require('cheerio');
const fs = require('fs');
const request = require('request');
var shell = require('shelljs');
const domain = "https://drjasonhall.com";

const urls = [
  '/before-and-after/facelift-gallery/',
  '/before-and-after/rhinoplasty-gallery/',
  '/before-and-after/body-lift-liposuction-gallery/',
  '/before-and-after/breast-augmentation-gallery/',
  '/before-and-after/chin-and-neck-liposuction/',
  '/before-and-after/breast-revision/',
  '/before-and-after/tummy-tuck-gallery/',
  '/before-and-after/breast-lift-gallery/',
  '/before-and-after/non-surgical-facial-rejuvenation/',
  '/before-and-after/blepharoplasty-gallery/',
  '/before-and-after/cosmetic-lesion-removal/',
  '/before-and-after/forehead-reduction/>',
  '/before-and-after/chemical-peels/',
  '/before-and-after/ear-molding-gallery/',
  '/before-and-after/facial-skin-cancer-reconstruction-gallery/',
  '/before-and-after/breast-reduction/',
  '/before-and-after/liposuction-gallery/',
  '/before-and-after/buttock-augmentation-brazilian-butt-lift-gallery/',
  '/before-and-after/brachioplasty-gallery/',
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

// Scrape(urls,listOfPatients);
Scrape(urls);
function Scrape(urls) {
  sleep(1000).then(() => {
    if (urls.length != 0) {
      let indexUrl = domain + urls.pop();
      let patientUrl = indexUrl.split('/before-and-after/')[1];
      console.log(patientUrl);
      rp(indexUrl).then(function (html) {
        html = html.data;        

          let patientNumber = 1;
          // Finding each patient section
          $(".patient",html).each(function(){
            var $this = $(this);
            let photonumber = 1;
            // Gather patient description
            let patientDescription = $this.find('.patientDescr').text();
            // Downloading each image
            $this.find(".bandaRow [id^=slide-] img" , html).each(function (){
              let img = $(this).attr('src');
              shell.mkdir('-p', __dirname + '/'  + patientUrl + "/" + pad2(patientNumber));
              download(img, __dirname + '/'  + patientUrl + "/" + pad2(patientNumber) + "/" + pad2(photonumber) + ".jpg" , function(){});
              photonumber++;

              const wstream = fs.createWriteStream(__dirname + '/'  + patientUrl + "/" + pad2(patientNumber) + '/index.php');
              wstream.write('<?php ');
              wstream.write('$patientData = "' + patientDescription + '";');
              wstream.write(' ?>');
              wstream.end();
            });
            patientNumber++;


          });
        Scrape(urls);
      })
    }
  });
}

