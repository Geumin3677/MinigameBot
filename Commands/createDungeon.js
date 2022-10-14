const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, italic, EmbedBuilder, channelLink } = require('discord.js');
const { guildId } = require('../config.json');
const fs = require('fs')

function makeRandom(min, max){
    var RandVal = Math.floor(Math.random()*(max-min+1)) + min;
    return RandVal;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('새로운 던전을 생성합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('name')
            .setDescription('던전의 이름을 선택합니다')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('type')
            .setDescription('던전의 유형을 선택합니다')
            .setRequired(true)
            .addChoices(
                { name: '일반', value: 'normal' },
                { name: '이벤트', value: 'event' }
            ))
        .addNumberOption(option => 
            option.setName('playernum')
            .setDescription('던전 입장 가능 인원수를 선택합니다')
            .setRequired(true))
        .addRoleOption(option => 
            option.setName('targetrole')
            .setDescription('이벤트 던전일 경우 역할을 선택합니다. 일반 던전일 경우 아무거나 태그')
            .setRequired(true)),
	async execute(interaction) {

        //Dungeondata.json 불러오기
		var jsonBuffer = fs.readFileSync('Dungeondata.json')
		var dataJson = jsonBuffer.toString();
		const Dungeondata = JSON.parse(dataJson);

        const name = interaction.options._hoistedOptions[0].value
        const type = interaction.options._hoistedOptions[1].value
        const playerLimit = interaction.options._hoistedOptions[2].value
        const targetRole = interaction.options._hoistedOptions[3].value

        if(name in Dungeondata)
        {
            interaction.reply('이미 존재하는 던전입니다.')
            return 0
        }

        var chance

        if(type === 'normal')
        {
            chance = makeRandom(10, 30)
        }
        else
        {
            chance = makeRandom(25, 45)
        }

        const multiple = makeRandom(3, 5)
        const cardnum = playerLimit * multiple

        const chancecardnum = cardnum * (chance / 100)
        let cards = []

        var a = 0
        while(a < cardnum) {
            if(a <= chancecardnum)
            {
                cards.push({ prize : true })
            }
            else
            {
                cards.push({ prize : false })
            }
            a++
        }

        const role = await interaction.guild.roles.create({
            name: name,
        })

        var id

        await interaction.guild.channels.create({
            name : name,
            type: ChannelType.GuildText,
            parent : "1025632933991694406",
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: role.id,
                    allow: [PermissionFlagsBits.ViewChannel]
                }
            ]
        }).then(channel => {
            const embed = new EmbedBuilder()
                .setTitle('로드클리닝 던전이 생성되었습니다. ')
                .addFields(
                    { name: '최대 인원', value: playerLimit.toString(), inline: true },
                    { name: '크리스탈 개수', value: Math.ceil(chancecardnum).toString(), inline: true },
                    { name: '당첨 확률', value: `${Math.ceil(chance).toString()}%`, inline: true },
                )
            channel.send({ embeds: [embed] })
            id = channel.id
        })

        if(type === 'normal')
        {
            Dungeondata[name] = {
                state : 0,
                channelId : id,
                type : type,
                cards : cards,
                cardnum : cardnum,
                chance : Math.ceil(chancecardnum),
                playerLimit : playerLimit,
                player : {}
            }
        }
        else
        {
            Dungeondata[name] = {
                state : 0,
                targetrole : targetRole,
                channelId : id,
                type : type,
                cards : cards,
                cardnum : cardnum,
                chance : Math.ceil(chancecardnum),
                playerLimit : playerLimit,
                player : {}
            }
        }

        const datastr = JSON.stringify(Dungeondata, null, '\t');
        fs.writeFileSync('./Dungeondata.json', datastr);

        
        const embed = new EmbedBuilder()
         .setTitle('던전 생성 성공!')
         .setDescription('/dungeonopen 을 이용해 던전을 오픈해주세요')
         .addFields(
            { name: '최대 인원', value: playerLimit.toString(), inline: true },
            { name: '카드 개수', value: cardnum.toString(), inline: true },
            { name: '당첨 카드 개수', value: Math.ceil(chancecardnum).toString(), inline: true },
            { name: '확률', value: `${chance.toString()}%`, inline: true },
         )
        interaction.reply( { embeds: [embed] } )
        
    }
}

/*
.addStringOption(option => 
            option.setName('type')
            .setDescription('던전의 유형을 선택합니다')
            .setRequired(true)
            .addChoices(
				{ name: '일반', value: false },
				{ name: '이벤트', value: true }
			))


*/