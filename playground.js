const easyVk = require('easyvk');
const unixTime = require('unixtime');
const { Debugger } = easyVk;

let debug = new Debugger();

debug.on('response', ({body}) => {
    console.log(body)
})

debug.on('request', ({query, url, method}) => {
    console.log(method, url, query)
})

const VK_KEY = '08cbebc12e74e0fa1c700692e40664443504f63701038b8d31441de17829f5e8106d8b2bfb98c5ec2e70a',
    OPTIONS = {
        access_token: VK_KEY,
        mode: {
            name: 'highload',
            timeout: 300
        }
    },
    OPTIONS_2 = {
        username: '+79024403939',
        password: 'artemlox14',
        mode: {
            name: 'highload',
            timeout: 5000
        }
    };

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
 /* easyVk(OPTIONS).then(async vk => {
    let { vkr } = await vk.call('search.getHints', {
        q: 'Refund Aliexpress',
        limit: 70,
        fields: 'contacts'
    });
    let filtered = vkr.items.filter(e => {
        if(e.group) {
            if(e.group.contacts) {
                return e.group.contacts.length
            }
        }
    });
    let groupsArray = [];
    for (let el of filtered) {
        let x = await vk.call('wall.get', {
            owner_id: '-' + el.group.id,
            count: 2
        });

        let lastPost = x.vkr.items.length ? x.vkr.items[0].date : unixTime();

        if (lastPost + 828000 > unixTime()) {
            lastPost = 0
        }
        else {
            groupsArray.push({
                admin: el.group.contacts[0]['user_id'] | 0,
                group: el.group.id,
                members: el.description.split(',')[1],
                lastPost: lastPost
            });
        }
    }
    sendMessage(groupsArray)
}); */

function sendMessage(ids) {
        easyVk(OPTIONS_2).then(async vk => {
            for(let e = 0; e < ids.length; e++) {
                vk.call('messages.send', {
                    user_id: ids[e],
                    peer_id: ids[e],
                    random_id: getRandomInt(1000000),
                    message: e
                }).then(e => console.log(e.vkr)).catch(e => console.log('xyi', e))
                console.log(e)
            }
        })
}

sendMessage(['261683915', '261683915', '261683915', '261683915', '261683915', '261683915', '261683915']);
