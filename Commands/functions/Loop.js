const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const { guildId } = require('../../config.json');

async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

function makeRandom(min, max){
    var RandVal = Math.floor(Math.random()*(max-min+1)) + min;
    return RandVal;
}

const ment = ['로드클리닝 던전이 닫혔습니다.', '던전이 닫혔습니다. 아쉽지만 다음 던전에서 만나요~']

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function dungeonStart(id, client) {
    //Dungeondata.json 불러오기
    jsonBuffer = fs.readFileSync('Dungeondata.json')
    dataJson = jsonBuffer.toString();
    const Dungeondata = JSON.parse(dataJson);

    var guild = client.guilds.cache.get(guildId)

    var tmp = Dungeondata[id].tmp
    tmp.sort(() => Math.random() - 0.5);

    var a = 0
    var end = (Dungeondata[id].tmp.length >= 20) ? (20) : (Dungeondata[id].tmp.length)

    var resli = ''
    while(a < end)
    {
        var user = await guild.members.fetch(`${Dungeondata[id].tmp[a]}`)
        resli += (`${user.user.username}#${user.user.discriminator}\n`)
        Dungeondata[id].player[tmp[a]] = 0
        var role = guild.roles.cache.find(role => role.id === Dungeondata[id].role)
		user.roles.add(role)
        a++
    }
    
    if(resli === '')
    {
        resli = '-'
    }

    Dungeondata[id].state = 2
    dataSave(Dungeondata, 'Dungeondata')
    
    var dungeonChannel = guild.channels.cache.find(channel => channel.id === id)
    const embed = new EmbedBuilder()
        .setTitle(`참여자로 선정된 분들이 입장 하였습니다`)
        .setDescription(resli)
    dungeonChannel.send({ embeds:[embed] })

    var openChannel = guild.channels.cache.find(channel => channel.id === Dungeondata[id].openChannel)
    var msg = await openChannel.messages.fetch(Dungeondata[id].openmsg);
    
    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(id)
                .setStyle(ButtonStyle.Primary)
                .setLabel('신청')
                .setDisabled(true)
            );
    
    const embed2 = new EmbedBuilder()
        .setTitle(`${Dungeondata[id].dungeonName} ${ment[makeRandom(0, 1)]}`)
        .setDescription('모집 시간이 지나고 참여자 선정이 완료 되었습니다.')
    msg.edit({ embeds: [embed2], components: [row2] })
}

module.exports = {
    async updateloop(client) {
        while(true)
        {
            //plant.json 불러오기
            var jsonBuffer = fs.readFileSync('plant.json')
            var dataJson = jsonBuffer.toString();
            const plant = JSON.parse(dataJson);

            //Dungeondata.json 불러오기
            jsonBuffer = fs.readFileSync('Dungeondata.json')
            dataJson = jsonBuffer.toString();
            const Dungeondata = JSON.parse(dataJson);

            for(user of Object.keys(plant))
            {
                if(plant[user].seedtime != 0)
                {
                    plant[user].seedtime -= 1
                }
                if(plant[user].ampletime != 0)
                {
                    plant[user].ampletime -= 1
                }
                if(plant[user].planttime != 0)
                {
                    plant[user].planttime -= 1
                }
            }

            for(dungeon of Object.keys(Dungeondata))
            {
                for(id of Object.keys(Dungeondata[dungeon].player))
                {
                    if(Dungeondata[dungeon].player[id] > 0)
                    {
                        Dungeondata[dungeon].player[id] -= 1
                    }
                }
                if(Dungeondata[dungeon].state == 1)
                {
                    if(Dungeondata[dungeon].openTime != 0)
                    {
                        Dungeondata[dungeon].openTime -= 1
                    }
                    if(Dungeondata[dungeon].openTime === 0)
                    {
                        dungeonStart(dungeon, client)
                    }
                }
            }

            dataSave(plant, "plant")
            dataSave(Dungeondata, "Dungeondata")

            await sleep(1000)
        }
    }
}