const easyVk = require('easyvk'),
    request = require('request'),
    unixtime = require('unixtime'),
    vkHelper = require('./modules');



// Запуск браузера
    const {Builder, By, until} = require('selenium-webdriver');
    const chrome = require('selenium-webdriver/chrome');
    let o = new chrome.Options();
    o.addArguments('disable-infobars');
    //o.addArguments('headless'); // running test on visual chrome browser
    o.setUserPreferences({ credential_enable_service: false });

    let driver = new Builder()
        .setChromeOptions(o)
        .forBrowser('chrome')
        .build();


const VK_KEY = '08cbebc12e74e0fa1c700692e40664443504f63701038b8d31441de17829f5e8106d8b2bfb98c5ec2e70a',
    OPTIONS = {access_token: VK_KEY},
    owner_id = '-163871471';

function getPosts(id, amount) {
    // Вход в вк
    easyVk(OPTIONS).then(async vk => {
        // Собрать записи со стены
        let wallResult = await vk.call('wall.get', {
            domain: id,
            count: amount
        });

        async function getLastPostTime() {
            let { vkr } = await vk.call('wall.get', {
                domain: 'xrefund',
                filter: 'postponed',
                count: 50
            });
            return (vkr.items[vkr.count - 1].date)
        }

        let filteredPosts = wallResult.vkr.items.filter(el => {
            return !/Повышай рейтинг аккаунта/.test(el.text.toString())
        });
        // в JSON
        let info = await vkHelper.parseInfo(filteredPosts);
        // Массив в временем
        let time = await vkHelper.generateUnixTime(amount, undefined/* await getLastPostTime()*/, unixtime);
        console.log(time)
        // Цикл для каждого товара
        for(let product = 0; product < info.length; product++) {
            let actualProduct = await vkHelper.getActualLink(info[product].link, driver);

            if(actualProduct.match(/^(.*)\.html/g) !== null) {
                info[product].link = await vkHelper.requestRefLint(actualProduct.match(/^(.*)\.html/g)[0], request);
            } // Проверка ссылки
            let shortLink = await vk.call('utils.getShortLink', {url: info[product].link}); // сократить ссылку
            info[product].link = shortLink.vkr.short_url;

            let result = await vkHelper.post(
                info[product]['photo'], // фото
                await vkHelper.generateMessage(info[product]['name'], info[product]['link']), // сообщение
                time[product], // время
                vk
            ); // Запостить
            console.log(result)
        }
    })
}


getPosts('bdalivzk', 100);
