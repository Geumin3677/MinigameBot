const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, italic, EmbedBuilder, channelLink } = require('discord.js');
const { guildId } = require('../config.json');
const fs = require('fs');
const { SheetLog } = require('./functions/Log');

async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lb')
		.setDescription('리더보드를 조회합니다.'),
    async execute(interaction) {
        //userData.json 불러오기
        var jsonBuffer = fs.readFileSync('userData.json')
        var dataJson = jsonBuffer.toString();
        const userData = JSON.parse(dataJson);

        var tmp = []
        for(var a of Object.keys(userData)) {
           tmp.push({
                name : userData[a].name,
                value : userData[a].cntpoint,
                rank: 0
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
            if(a === 21)
            {
                break
            }
        }

        var res  = ''
        for(var a in tmp)
        {
            res += `${tmp[a].rank}위 - **${tmp[a].name}**  ${tmp[a].value} JE#\n`
        }

        const curr = new Date();
        const utc = 
            curr.getTime() + 
            (curr.getTimezoneOffset() * 60 * 1000);
        const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
        const kr_curr = new Date((utc + KR_TIME_DIFF));
        const time = `${kr_curr.getFullYear()}-${kr_curr.getMonth() + 1}-${kr_curr.getDate()} ${kr_curr.getHours()}:${kr_curr.getMinutes()}:${kr_curr.getSeconds()}`
        const embed = new EmbedBuilder()
            .setTitle(`${time} 실시간 리더보드`)
            .setDescription(`${res}`)
        interaction.reply({ embeds: [embed] })
    }
}