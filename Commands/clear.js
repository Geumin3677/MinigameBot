const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, italic, EmbedBuilder, channelLink } = require('discord.js');
const { guildId } = require('../config.json');
const fs = require('fs');
const { Autoreg } = require('./functions/Autoreg');

async function dataSave(data, name) {
    const datastr = JSON.stringify(data, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

function makeRandom(min, max){
    var RandVal = Math.floor(Math.random()*(max-min+1)) + min;
    return RandVal;
}

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
		.setName('clean')
		.setDescription('던전내 카드를 무작위로 확인합니다.'),
    async execute(interaction) {

        //Dungeondata.json 불러오기
		var jsonBuffer = fs.readFileSync('Dungeondata.json')
		var dataJson = jsonBuffer.toString();
		const Dungeondata = JSON.parse(dataJson);

        if(interaction.channel.name in Dungeondata)
        {
            const name = interaction.channel.name
            if(Dungeondata[name].player[interaction.user.id] === 0)
            {
                //뽑기 결과 확인
                const res = makeRandom(0, (Dungeondata[name].cards.length - 1))
                if(Dungeondata[name].cards[res].prize)
                {
                    //당첨
                    Dungeondata[name].cards.splice(res, 1)
                    Dungeondata[name].chance--

                    await Autoreg(interaction)
                    //userData.json 불러오기
                    jsonBuffer = fs.readFileSync('userData.json')
                    dataJson = jsonBuffer.toString();
                    const userData = JSON.parse(dataJson);

                    userData[interaction.user.id].point += 5

                    dataSave(userData, 'userData')

                    const embed = new EmbedBuilder()
                        .setTitle(`획득 성공 문구 1`)
                        .setDescription(`던전내 카드는 ${(Dungeondata[name].cards.length)}장 남았습니다.`)
                    interaction.reply({ embeds: [embed] })
                }
                else
                {
                    //꽝
                    Dungeondata[name].cards.splice(res, 1)
                    const embed = new EmbedBuilder()
                        .setTitle(`획득 실패 문구 1`)
                        .setDescription(`던전내 카드는 ${(Dungeondata[name].cards.length)}장 남았습니다.`)
                    interaction.reply({ embeds: [embed] })
                }
                Dungeondata[name].player[interaction.user.id] = 60
                if(Dungeondata[name].cards.length === 0 || Dungeondata[name].chance === 0 )
                {
                    //던전 폐쇄

                    var role = interaction.guild.roles.cache.find(role => role.name === name)
                    
                    interaction.channel.permissionOverwrites.edit(role, {
                        SendMessages: false,
                    })

                    const embed = new EmbedBuilder()
                        .setTitle(`던전 폐쇄`)
                        .setDescription(`던전내 카드가 모두 소진됨에 따라 던전이 폐쇄됩니다.`)
                    interaction.channel.send({ embeds: [embed] })

                }
                dataSave(Dungeondata, 'Dungeondata')
            }
            else
            {
                interaction.reply({ content: `다음 clean 가능까지 \`${Dungeondata[name].player[interaction.user.id].toString().toHHMMSS()}\` 남았습니다.`, ephemeral: true })
            }
        }
        else
        {
            interaction.reply({ content: '알맞은 채널이 아닙니다.', ephemeral: true })
        }
    }
}