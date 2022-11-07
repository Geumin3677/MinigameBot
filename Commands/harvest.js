const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, italic, EmbedBuilder, channelLink, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { holderRole } = require('../config.json');
const fs = require('fs');
const { Autoreg } = require('./functions/Autoreg');

async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

function makeRandom(min, max){
    var RandVal = Math.floor(Math.random()*(max-min+1)) + min;
    return RandVal;
}

const pname = [['뿌리가 상한 옥수수', '찰진 옥수수', '초당 옥수수', '단맛 터지는 옥수수', '마법가루 듬뿍 담긴 옥수수', '황금으로 익어버린 옥수수'], ['못난이 토마토', '방울 토마토', '우렁찬 토마토', '멋쟁이 토마토', '마력의 토마토', '과즙 팡팡 토마토'], ['독버섯', '식용버섯', '송이버섯', '대왕버섯', '영혼 담긴 버섯', '하늘에서 내려온 버섯'], ['하는 짓도 가지가지', '말라빠진 가지', '아삭아삭한 가지', '건장미 넘치는 가지', '매력도 가지가지', '빛나는 가지']]

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('harvest')
		.setDescription('식물을 수확합니다.'),
    async execute(interaction) {
        //plant.json 불러오기
		var jsonBuffer = fs.readFileSync('plant.json')
		var dataJson = jsonBuffer.toString();
		const plant = JSON.parse(dataJson);

        if(!(interaction.user.id in plant))
        {
            const isholder = interaction.member.roles.cache.has(holderRole)
            plant[interaction.user.id] = {
                seed : 0,
                seedtime : 0,
                IsHolder : isholder,
                reducecnt : 0,
                amplecnt : 0,
                ampletime : 0,
                planttime : 0,
                Isplanted : false
            }
            dataSave(plant, "plant")
        }

        if(plant[interaction.user.id].Isplanted)
        {
            if(plant[interaction.user.id].planttime != 0)
            {
                interaction.reply({ content: `수확 가능까지 \`${plant[interaction.user.id].planttime.toString().toHHMMSS()}\` 남았습니다.`, ephemeral: true })
            }
            else
            {
                const cnt = plant[interaction.user.id].amplecnt
                var percent = [(20 - (cnt * 1.2)), (30 + (cnt * 0.2)), (17 + (cnt * 0.2)), (15 + (cnt * 0.2)), (10 + (cnt * 0.2)), (5 + (cnt * 0.2)), (3 + (cnt * 0.2))]

                var viaper = [0]

                var totalper = 0
                for(var per of percent)
                {
                    totalper += per
                    viaper.push(totalper)
                }

                const rand = makeRandom(0, 100)
                var rank = 0

                var a = 0
                while(a < 7)
                {
                    if(viaper[a] <= rand && rand < viaper[a + 1])
                    {
                        rank = a
                        break
                    }
                    a++
                }

                const type = makeRandom(0, 3)

                plant[interaction.user.id].Isplanted = false
                dataSave(plant, "plant")
                if(rank === 0 && cnt === 0)
                {
                    const embed = new EmbedBuilder()
                        .setTitle(`꽝`)
                        .setDescription(`획특 JE# - ${rank} JE#`)
                    interaction.reply({ embeds: [embed] })
                }
                else
                {
                    await Autoreg(interaction)
                    //userData.json 불러오기
                    jsonBuffer = fs.readFileSync('userData.json')
                    dataJson = jsonBuffer.toString();
                    const userData = JSON.parse(dataJson);

                    var oldpoint = userData[interaction.user.id].point
                    userData[interaction.user.id].point += rank

                    SheetLog({
                        name: `${interaction.user.username}#${interaction.user.discriminator}`,
                        dname: '-',
                        value: rank,
                        type: 1,
                        gpoint: oldpoint,
                        lpoint: userData[interaction.user.id].point,
                        dtype: '식물재배'
                    })

                    dataSave(userData, "userData")

                    const embed = new EmbedBuilder()
                        .setTitle(`${pname[type][rank-1]}를 수확했다!`)
                        .setDescription(`획특 JE# - ${rank}P`)
                    interaction.reply({ embeds: [embed] })
                }
            }
        }
        else
        {
            interaction.reply({ content: `씨앗이 심어져 있지 않습니다.`, ephemeral: true })
        }
    }
}