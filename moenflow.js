"use strict";

const puppeteer = require('puppeteer-core');
const sleep = require("sleep-promise");
const date = require('date-and-time');

const userid = process.env.FLOUSER
const password = process.env.FLOPASSWORD

//console.log("userid:%s" , userid);
//console.log("password:%s" , password);
let errorCount = 0;

if (typeof userid === "undefined"){
	console.log("userid not set in FLOUSER");
	errorCount = errorCount + 1
}
if (typeof password === "undefined"){
	console.log("password is not set in FLOPASSWORD");
	errorCount = errorCount + 1
}

if (errorCount > 0){
	return;
}

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser', headless: true});
    const page = await browser.newPage();
    await page.goto("https://user.meetflo.com/login");
    await page.click("[name='email']");
    await page.type("[name='email']", userid);
    await page.click("[name='password']");
    await page.type("[name='password']", password);
    await page.click("[type='submit']");
    //console.log("submit");
	  await sleep(20000);
	  const entries = await page.$$('.value');
	  for ( let i = 0; i < entries.length; i++){
		  let entry = await (await entries[i].getProperty('innerText'))
		  //console.log("AA %d %s", i, entry);
		  //console.log("type %s" , typeof entry);
		  //console.log(entry.toString().replace('JSHandle:',''));
	  }
	  let entry = await (await entries[0].getProperty('innerText'));
	  let pressure = entry.toString().replace('JSHandle:','');
	  entry = await (await entries[1].getProperty('innerText'));
	  let gpm = entry.toString().replace('JSHandle:','');
	  entry = await (await entries[2].getProperty('innerText'));
	  let temp = entry.toString().replace('JSHandle:','');

          console.log(`pressure ${pressure} rate ${gpm} temp ${temp}`)


	  //const gal = await page.evaluate(() => document.querySelector('.gallons-consumed').className.innterHtml);
	  //const gal = page.evaluate(() => document.querySelector('.gallons-consumed').innerHtml);
	  //console.log("water %d" , gal);
	  const gals = await page.$$('.gallons-consumed');
	  for ( let i = 0; i < gals.length;i++){
		  const gal = await (await gals[i].getProperty('innerText'));
		  //console.log("gal %d %s" ,i, gal);
	  }
	  let gal = await (await gals[0].getProperty('innerText'));
	  let galcon = gal.toString().replace('JSHandle:','');

	  //console.log("galon ${gal} consume ${galcon} gals ${gals}")

	  // water state
	  const states = await page.$$('.active');
	  //for (let i = 0; i < states.length; i++){
//		  const state = await (await states[i].getProperty('innerText'));
//		  console.log("state %d %s" ,i, state);
	  //}
	  let state = await ( await states[2].getProperty('innerText'));
	  let stateVal = state.toString().replace('JSHandle:','');

	  let now = new Date();
	  let timenow = date.format(now, "YYYY/MM/DD HH:mm:ss");
	  let epoc = Math.floor(Date.now() / 1000)

          let logmsg = timenow + " epoc " + epoc + " pressure " + pressure + " rate " + gpm + " temp " + temp + " consume " + galcon + " state " + stateVal
          //let logmsg = timenow + " epoc " + epoc pressure ${pressure} rate ${gpm} temp ${temp} consume ${galcon} state ${stateVal}"
          //console.log(`${timenow} epoc ${epoc} pressure ${pressure} rate ${gpm} temp ${temp} consume ${galcon} state ${stateVal}`)
	  console.log(logmsg)
	  const fs = require('fs');
	  fs.appendFileSync('waterlog.dat', logmsg + "\n");

	  const tags = await page.$$('txt')
	  //console.log("after tags %d", tags.length);
	  for (let i=0; i < tags.length; i++){
		  //console.log("entry %d" , i)
		  const entry = await (await tags[i].getProperty('innerText').jsonValue());
		  //console.log(entry)
	  }
  } finally {
    if (browser) {
	   await browser.close();
    }
  }
})();





