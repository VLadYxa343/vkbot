const FIND_LINKS = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)/gi,
    owner_id = '-163871471';

function getInfo(posts) {
    return new Promise(resolve => {
        let result = [];
        for (let post = 0; post < posts.length; post++) {
            function generateAttachment (){
                if(posts[post].attachments.length >= 2) {
                    return  'photo' + posts[post].attachments[0].photo.owner_id + '_' + posts[post].attachments[0].photo.id +
                        ',' + 'photo' + posts[post].attachments[1].photo.owner_id + '_' + posts[post].attachments[1].photo.id
                }
                else {
                    return 'photo' + posts[post].attachments[0].photo.owner_id + '_' + posts[post].attachments[0].photo.id
                }
            }
            result.push({
                link: posts[post].text
                    .match(FIND_LINKS)
                    .toString(),
                name: posts[post].text
                    .match(/^(.*?)\n/g)
                    .toString()
                    .slice(0, -1),
                photo: generateAttachment()
            })
        }
        resolve(result)
    })
}

async function getActualLink(link, driver) {
    await driver.get(link);
    return await driver.getCurrentUrl()
}

function requestRefLint(item, request) {
    return new Promise(((resolve, reject) => {
        let headers = {
            'ACCEPT-LANGUAGE':'ru',
            'X-ACCESS-TOKEN': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzX3Rva2VuIiwiZXhwIjoxNTgwMzg0Njg5LCJ1c2VyX2lkIjozNzg5MDQxLCJ1c2VyX3JvbGUiOiJ1c2VyIiwiY2xpZW50X3BsYXRmb3JtIjoid2ViIiwiY2xpZW50X2lwIjoiMTg1LjYwLjUwLjIzMCIsImNoZWNrX2lwIjpmYWxzZSwidG9rZW4iOiIzMmEzOGQyNjBmNjQ4Yzk1MzM5ZDYyZDczOTBjNDczZDM3ZjAyNTNhIiwic2NvcGUiOiJkZWZhdWx0In0',
            'Cookie': 'auth_id=DhmfRwU5lnx9MiGQ8KWyzpkXCPHbg2Za; access_token_signature=kW1v24Pq9diz6JrXzBy-u31YheOLd4ltun2biabfqt14KTjIC9-jpRAq2mq7SiMClYSz0zg5NwLxwDHcj3UMXA; jwt_access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzX3Rva2VuIiwiZXhwIjoxNTgwMzg0Njg5LCJ1c2VyX2lkIjozNzg5MDQxLCJ1c2VyX3JvbGUiOiJ1c2VyIiwiY2xpZW50X3BsYXRmb3JtIjoid2ViIiwiY2xpZW50X2lwIjoiMTg1LjYwLjUwLjIzMCIsImNoZWNrX2lwIjpmYWxzZSwidG9rZW4iOiIzMmEzOGQyNjBmNjQ4Yzk1MzM5ZDYyZDczOTBjNDczZDM3ZjAyNTNhIiwic2NvcGUiOiJkZWZhdWx0In0; refresh_token_signature=MHObByJPzjwHQ7O0-g8UTQk2OQVXAC6L4c-9SI93N_WxiKdYl9QjZsdMSBCL35XBr6GItUmIyDzZdWGNFw_v_w; jwt_refresh_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaF90b2tlbiIsImV4cCI6MTU4MTU5NDI4OSwidG9rZW4iOiIwMzgxY2U4MDk1MDcxZWNhNTEzOTE4YTQyNmZlZTk0NDU2MmMwYjhhIiwidXNlcl9pZCI6Mzc4OTA0MSwiY2xpZW50X2lwIjoiMTg1LjYwLjUwLjIzMCIsImNoZWNrX2lwIjpmYWxzZSwic2NvcGUiOiJkZWZhdWx0In0'
        };
        let formData = {
            link: item,
            offerId: 1,
            description:'dfgdfg',
            type:'link'
        };
        let options = {
            form: formData,
            headers: headers
        };
        request.post('https://app.epn.bz/creative/create', options, (e, r, p) => {
            if(e) reject(e);
            if(!JSON.parse(p)['data']) reject(p);
            else {
                resolve(JSON.parse(p).data.attributes.code)
            }
        })
    }))
}

function generateMessage(name, link) {
    return `📦Товар - ${name} \n
🔗Ссылка на товар - ${link} \n
⚡Причина - Указан левый производитель, нет сертификатов на продажу, подделка. \n
❗При заказе по нашей ссылке вы можете рассчитывать на помощь в споре. Всё в ЛС группы 😊 \n
❗Открывать спор лучше всего через 2-3 дня, только после того, как вы подтвердите получение товара на сайте AliExpress! 👍🏻`;
}

function generateUnixTime(amount, since, unixtime) {
    return new Promise(((resolve) => {
        let numbers = [];
        let time = since | Number(unixtime());
        for (let i = 0; i < amount; i++) {
            time += 7200;
            numbers.push(time)
        }
        resolve(numbers)
    }))
}

async function post(attachment, message, time, vk) {
    let {vkr} = await vk.call('wall.post', {
        owner_id: owner_id,
        from_group: 1,
        attachments: attachment,
        message: message,
        publish_date: time
    });
    return vkr
}

module.exports = {
    parseInfo: getInfo,
    getActualLink: getActualLink,
    requestRefLint: requestRefLint,
    generateMessage: generateMessage,
    generateUnixTime: generateUnixTime,
    post: post
};
