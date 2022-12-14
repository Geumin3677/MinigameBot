const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { Autoreg } = require('./functions/Autoreg');

async function dataSave(data, name) {
    const datastr = JSON.stringify(data, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function makeRandom(min, max){
    var RandVal = Math.floor(Math.random()*(max-min+1)) + min;
    return RandVal;
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('본인의 프로필을 조회합니다.'),
    async execute(interaction) {

        await Autoreg(interaction)

        //userData.json 불러오기
		var jsonBuffer = fs.readFileSync('userData.json')
		var dataJson = jsonBuffer.toString();
		const userData = JSON.parse(dataJson);

        var list = " "
        if(userData[interaction.user.id].item.length >= 1)
        {
            var tmp = {}
            userData[interaction.user.id].item.forEach(name => {
                if(name in tmp)
                {
                    tmp[name] += 1
                }
                else
                {
                    tmp[name] = 1
                }
            });
            for(var a of Object.keys(tmp))
            {
                list += `${a} - ${tmp[a]}\n`
            }
        }
        else
        {
            list = '소유중인 아이템이 없습니다.'
        }

        var tmp = []
        for(var a of Object.keys(userData)) {
           tmp.push({
                name : userData[a].name,
                value : userData[a].cntpoint,
                rank: 0,
                id: a
           })
        }

        tmp.sort(function(a, b) {
            // 스코어별로 오름차순 정렬
            if (a.value < b.value) return 1;
            if (a.value > b.value) return -1;
        })

        for(var a in tmp)
        {
            if(a != 0)
            {
                if(tmp[Number(a) - 1].value == tmp[a].value)
                {
                    tmp[a].rank = tmp[Number(a) - 1].rank
                }
                else
                {
                    tmp[a].rank = Number(a) + 1
                }
            }
            else
            {
                tmp[a].rank = 1
            }
        }

        ud = userData[interaction.user.id]

        var a = tmp.find(user => user.id === interaction.user.id)

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${ud.name}`, iconURL: `${interaction.user.displayAvatarURL()}`, url: 'https://discord.js.org' })
            .setDescription(`Leaderboard Rank - ${a.rank}\nJE# - 💰${ud.point}`)
            .addFields(
                { name: '소유 아이템 목록', value: `${list}` }
            );
        interaction.reply({ embeds: [embed] })
    }
}