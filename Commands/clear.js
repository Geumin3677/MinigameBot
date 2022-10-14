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

const ment0 = ['크리스탈 획득 성공!', '크리스탈 당첨!', '겟또!', '크리스탈 당첨!']
const ment1 = ['당첨! 크리스탈을 획득했어요.', '행운 그 잡채!', '당신은 럭키 그 자체!', '어마무시한 경쟁률을 뚫었어요!']

const ment2 = ['크리스탈 획득 실패!', '크리스탈 낙첨첨!', '언럭...', '크리스탈 낙첨!']
const ment3 = ['낙첨! 다음에 다시 도전해주세요.', '행운없음 그 잡채!', '다음을 기대해요.', '아쉽지만 꽝! 하지만 도전은 언제나 아름다운 것..']

const ment4 = ['로드클리닝 던전 종료', '던전이 닫혔습니다.']
const ment5 = ['던전내 크리스탈이 모두 소진되어 던전이 종료되었습니다.', '크리스탈이 모두 소진되어 던전이 종료되었습니다.']


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

                    const ment = makeRandom(0, 3)

                    const embed = new EmbedBuilder()
                        .setTitle(`${ment0[ment]}`)
                        .setDescription(`${ment1[ment]} 남은 크리스탈은 ${(Dungeondata[name].chance)}개 입니다.`)
                    interaction.reply({ embeds: [embed] })
                }
                else
                {
                    const ment = makeRandom(0, 3)
                    //꽝
                    Dungeondata[name].cards.splice(res, 1)
                    const embed = new EmbedBuilder()
                        .setTitle(`${ment2[ment]}`)
                        .setDescription(`${ment3[ment]} 남은 크리스탈은 ${(Dungeondata[name].chance)}개 입니다.`)
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

                    const m = makeRandom(0, 1)
                    const embed = new EmbedBuilder()
                        .setTitle(`${ment4[m]}`)
                        .setDescription(`${ment5[m]}`)
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