const tg = require('telegram-bot-api');
const cheerio = require('cheerio');
const axios = require('axios');
const Diff = require('diff');
const fs = require('fs');
const api = new tg({ token: process.env.BOT_TOKEN });

let added_decoration = '+++++++++++++++\n';
let removed_decoration = '~~~~~~~~~~~~~~~\n';

let array = [
    ['http://nimcet.in', 'div.marquee', 'nimcet.txt'],
    ['https://nta.ac.in/NoticeBoardArchive', 'div.content', 'nta.txt'],
    ['http://www.du.ac.in/du/uploads/COVID-19', 'section.main-content', 'du/home.txt'],
    ['http://www.du.ac.in/du/uploads/COVID-19/examination.html', 'section.main-content', 'du/examination.txt'],
    ['http://www.du.ac.in/du/uploads/COVID-19/admissions.html', 'section.main-content', 'du/admissions.txt']
];

array.map(([url, selector, file]) => {
    axios.get(url)
    .then(res => {
        let old_text = fs.readFileSync(file).toString();
        let new_text = cheerio.load(res.data)(selector).text().replace(/\s\s+/g, '\n');
        const diff = Diff.diffLines(old_text, new_text);
        let msg = url + '\n';
        diff.forEach(part => {
            msg += part.added ? added_decoration + part.value + added_decoration :
                part.removed ? removed_decoration + part.value + removed_decoration :
                '';
        });

        if (msg.split('\n')[1]) {
            fs.writeFileSync(file, new_text);
            api.sendMessage({
                chat_id: process.env.CHAT_ID,
                text: msg
            })
            .catch(console.log);
        }
    })
    .catch(console.log);
});
