const tg = require("telegram-bot-api");
const Diff = require("diff");
const fs = require("fs");
const puppeteer = require("puppeteer");

const api = new tg({ token: process.env.BOT_TOKEN });

let array = [
  ["http://nimcet.in", "div.marquee", "nimcet.txt"],
  ["http://du.ac.in", "div#pills-spotlight", "du/home.txt"],
  // ['https://nta.ac.in/NoticeBoardArchive', 'div.content', 'nta.txt'],
  // [
  //   "http://oldweb.du.ac.in/du/uploads/COVID-19/examination.html",
  //   "section.main-content",
  //   "du/examination.txt",
  // ],
  // [
  //   "http://oldweb.du.ac.in/du/uploads/COVID-19/admissions.html",
  //   "section.main-content",
  //   "du/admissions.txt",
  // ],
  // ['http://www.du.ac.in/du/uploads/COVID-19/Result%20of%20DUET%202020.html', 'section.main-content', 'du/result-duet.txt'],
  // ['http://www.du.ac.in/du/uploads/COVID-19/Admissions-list.html', 'section.main-content', 'du/admission-lists.txt'],
  ["http://cs.du.ac.in/", "section#content", "csdu/home.txt"],
  ["http://cs.du.ac.in/admission/mca/", "div.main-content", "csdu/mca.txt"],
  ["http://cs.du.ac.in/admission/mcs/", "div.main-content", "csdu/mcs.txt"],
  [
    "http://durslt.du.ac.in/DURSLT_ND2020/Students/List_Of_Declared_Results.aspx",
    "table#gvshow_Reg",
    "du/results.txt",
    "th[style='height:35px;'], td[style='height:35px;']",
  ],
];

puppeteer
  .launch()
  .then((browser) => {
    let cnt = array.length;
    array.map(async ([url, selector, file, remove = ""]) => {
      try {
        const page = await browser.newPage();
        // await page.setDefaultNavigationTimeout(0);
        await page.goto(url);

        if (remove) {
          await page.evaluate((selector) => {
            let elements = document.querySelectorAll(selector);
            for (let i = 0; i < elements.length; i++) {
              elements[i].parentNode.removeChild(elements[i]);
            }
          }, remove);
        }

        let text = await page.$eval(selector, (el) => el.innerText);
        text = text.replace(/\s\s+/g, "\n");

        if (!fs.existsSync(file)) {
          fs.writeFileSync(file, text);
        } else {
          let old_text = fs
            .readFileSync(file)
            .toString()
            .replace(/(\r\n|\r)/gm, "\n");

          const diff = Diff.diffTrimmedLines(old_text, text);
          let msg = url + "\n";

          diff.forEach((part) => {
            msg += part.added
              ? "<strong>" + part.value + "</strong>\n"
              : part.removed
              ? "<strike>" + part.value + "</strike>\n"
              : "";
          });

          if (msg.split("\n")[1]) {
            fs.writeFileSync(file, text);
            api
              .sendMessage({
                chat_id: process.env.CHAT_ID,
                text: msg.slice(0, 4000),
                parse_mode: "HTML",
              })
              .catch(console.log);
          }
        }

        cnt--;
        if (cnt == 0) {
          await browser.close();
        }
      } catch (err) {
        console.log(url);
        console.log(err);
        cnt--;
        if (cnt == 0) {
          await browser.close();
        }
      }
    });
  })
  .catch(console.log);
