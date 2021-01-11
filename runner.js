const tg = require('telegram-bot-api');
const Diff = require('diff');
const fs = require('fs');
const api = new tg({ token: process.env.BOT_TOKEN });
const puppeteer = require('puppeteer');
let added_decoration = '+++++++++++++++\n';
let removed_decoration = '~~~~~~~~~~~~~~~\n';

let array = [
    ['http://nimcet.in', 'div.marquee', 'nimcet.txt'],
    // ['https://nta.ac.in/NoticeBoardArchive', 'div.content', 'nta.txt'],
    ['http://oldweb.du.ac.in/du/uploads/COVID-19', 'section.main-content', 'du/home.txt'],
    ['http://oldweb.du.ac.in/du/uploads/COVID-19/examination.html', 'section.main-content', 'du/examination.txt'],
    ['http://oldweb.du.ac.in/du/uploads/COVID-19/admissions.html', 'section.main-content', 'du/admissions.txt'],
    // ['http://www.du.ac.in/du/uploads/COVID-19/Result%20of%20DUET%202020.html', 'section.main-content', 'du/result-duet.txt'],
    // ['http://www.du.ac.in/du/uploads/COVID-19/Admissions-list.html', 'section.main-content', 'du/admission-lists.txt'],
    ['http://cs.du.ac.in/', 'section#content', 'csdu/home.txt'],
    ['http://cs.du.ac.in/admission/mca/', 'div.main-content', 'csdu/mca.txt'],
    ['http://cs.du.ac.in/admission/mcs/', 'div.main-content', 'csdu/mcs.txt']
];

puppeteer.launch()
.then(browser => {
  let cnt = array.length;
  array.map(async([url, selector, file]) => {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url);
    let text = await page.$eval(selector, el => el.innerText);
    text = text.replace(/\s\s+/g, '\n');
    cnt--;

    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, text);
    }
    else {
      let old_text = fs.readFileSync(file).toString();
      const diff = Diff.diffLines(old_text, text);
      let msg = url + '\n';
      diff.forEach(part => {
        msg += part.added ? added_decoration + part.value + added_decoration :
        part.removed ? removed_decoration + part.value + removed_decoration :
        '';
      });

      if (msg.split('\n')[1]) {
        fs.writeFileSync(file, text);
        api.sendMessage({
          chat_id: process.env.CHAT_ID,
          text: msg.slice(0, 4000)
        })
        .catch(console.log);
      }
    }

    if (cnt == 0) {
      await browser.close();
    }
  });
})
.catch(console.log);
