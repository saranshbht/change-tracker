const tg = require('telegram-bot-api');
const cheerio = require('cheerio');
const axios = require('axios');
const Diff = require('diff');
const fs = require('fs');
const api = new tg({ token: process.env.BOT_TOKEN });

let added_decoration = '+++++++++++++++\n';
let removed_decoration = '~~~~~~~~~~~~~~~\n'
axios.get('http://nimcet.in')
.then(res => {
    let old_text = fs.readFileSync('nimcet.txt').toString();
    let new_text = cheerio.load(res.data)('div.marquee').text().trim();
    const diff = Diff.diffLines(old_text, new_text);
    let msg = 'nimcet.in\n';
    diff.forEach(part => {
        msg += part.added ? added_decoration + part.value + added_decoration :
            part.removed ? removed_decoration + part.value + removed_decoration :
            '';
    });

    if (msg.split('\n')[1]) {
        fs.writeFileSync('nimcet.txt', new_text);
        api.sendMessage({
            chat_id: process.env.CHAT_ID,
            text: msg
        })
        .catch(console.log);
    }
})
.catch(console.log);
