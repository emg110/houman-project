const request = require('request');
const serverUrl = 'http://localhost:3003/api';
const config = require('../../config');
const fetch = require('node-fetch');
const ejs = require('ejs')
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36';
function getHeaders() {
  return {
    'referer': 'http://localhost:8080/',
    'origin': 'http://localhost:8080/',
    'user-agent': userAgent,
    'x-requested-with': 'XMLHttpRequest'
  }
}
async function getEndpointEtl(etlApiEndpoint){
  let etlData = await fetch(etlApiEndpoint,
    {
      headers: getHeaders(),
    }).then(t => t.json().catch((e) => {
    console.log('Instagram API returned an error:' + e)
  }).then(r => r));
  console.log('Rendering results from etl API to browser client');
  //res.render('pages/profile',{finalData});
  if(etlData.results)etlData = etlData.results;
  return etlData
}
module.exports = function (options = {}) {
  return async function mwEtlApi(req, res, next) {
    if(!(config.sessionid && config.csrftoken)){
      res.redirect('/');
    }else{
      let expr = req.originalUrl;
      if(expr.indexOf('/instagram/profile')>=0){
        let etlApiEndpoint = serverUrl+expr;
        const etlData = await getEndpointEtl(etlApiEndpoint);
        res.render('pages/profile',{etlData},function(err, html) {
          res.send(html);
        });
      }
      else if(expr.indexOf('/instagram/whoami')>=0){
        expr = expr.replace('/instagram/whoami','/instagram/profile') + "?"+ config.username
        let etlApiEndpoint = serverUrl+expr;
        const etlData = await getEndpointEtl(etlApiEndpoint);
        res.render('pages/profile',{etlData},function(err, html) {
          res.send(html);
        });
      }
      else if(expr.indexOf('/instagram/posts')>=0){
        let etlApiEndpoint = serverUrl+expr;
        const etlData = await getEndpointEtl(etlApiEndpoint);
        //res.redirect('/home',results);
        let userid = config.userid;
        res.render('pages/posts',{etlData, userid},function(err, html) {
          if(err)console.log('ejs has returned this error: '+ err);
          res.send(html);
        });
      }
      else if(expr.indexOf('/instagram/allposts')>=0){
        let etlApiEndpoint = serverUrl+expr;
        let etlData = await getEndpointEtl(etlApiEndpoint);
        //res.redirect('/home',results);
        let userid = config.userid;
        if(etlData.length){
          if(etlData.length> 100){
            etlData = etlData.slice(0,100);
            console.log('data has been cropped to 100 items to show for all posts but all posts have been saved to database successfully');
          }
          let finalData = {};
          finalData.user = {};
          finalData.user.edge_owner_to_timeline_media = {};
          finalData.user.edge_owner_to_timeline_media.edges = etlData;
          etlData = finalData;
        }
        res.render('pages/posts',{etlData, userid},function(err, html) {
          if(err)console.log('ejs has returned this error: '+ err);
          res.send(html);
        });
      }
    }


  };
};