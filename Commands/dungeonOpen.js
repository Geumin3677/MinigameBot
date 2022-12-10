const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, italic, EmbedBuilder, channelLink, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { guildId } = require('../config.json');
const fs = require('fs');
const { SheetLog } = require('./functions/Log');

async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('open')
		.setDescription('던전을 오픈합니다.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('던전채널')
            .setDescription('오픈할 던전 채널을 선택합니다')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('오픈방식')
            .setDescription('던전 오픈 방식을 선택합니다')
            .addChoices(
                { name: '기본', value: 'default' },
                { name: '래플', value: 'random' }
            )
            .setRequired(true)),

    async execute(interaction) {
        //Dungeondata.json 불러오기
		var jsonBuffer = fs.readFileSync('Dungeondata.json')
		var dataJson = jsonBuffer.toString();
		var Dungeondata = JSON.parse(dataJson);

        const name = interaction.options._hoistedOptions[0].value
        
        if(name in Dungeondata)
        {
            if(Dungeondata[name].state === 0)
            {
                Dungeondata[name].state = 1
                dataSave(Dungeondata, 'Dungeondata')

                if(Dungeondata[name].type === 'normal')
                {
                    SheetLog({
                        dname: Dungeondata[name].dungeonName,
                        dtype : Dungeondata[name].type,
                        role: '-',
                        state: 'OPEN',
                        type: 2,
                        editor: `${interaction.user.username}#${interaction.user.discriminator}`
                    })

                    if(interaction.options._hoistedOptions[1].value === 'default')
                    {
                        const row1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(name)
                                .setStyle(ButtonStyle.Primary)
                                .setLabel('입장')
                            );

                        const embed = new EmbedBuilder()
                            .setTitle(`${Dungeondata[name].dungeonName} 던전이 오픈됩니다.`)
                            .setDescription(`아레 버튼을 통해 참가하실수 있습니다\n입장 현황 - 0/${Dungeondata[name].playerLimit}`)
                        interaction.reply({ embeds: [embed], components: [row1] })
                    }
                    else
                    {
                        const row1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(name)
                                .setStyle(ButtonStyle.Primary)
                                .setLabel('신청')
                            );

                        Dungeondata[name].enter_type = true
                        Dungeondata[name].tmp = []
                        Dungeondata[name].openTime = 600
                        dataSave(Dungeondata, 'Dungeondata')

                        const embed = new EmbedBuilder()
                            .setTitle(`${Dungeondata[name].dungeonName} 던전이 오픈됩니다.`)
                            .setDescription(`아레 버튼을 통해 참가신청을 하실수 있습니다\n신청 현황 - 0명 신청\n던전 정원 - ${Dungeondata[name].playerLimit}`)
                        interaction.reply({ embeds: [embed], components: [row1] })
                        const msg = await interaction.fetchReply()
                        Dungeondata[name].openmsg = msg.id
                        Dungeondata[name].openChannel = msg.channelId
                        dataSave(Dungeondata, 'Dungeondata')
                    }
                } 
                else
                {
                    var role = interaction.guild.roles.cache.find(role => role.id === Dungeondata[name].targetrole)

                    SheetLog({
                        dname: Dungeondata[name].dungeonName,
                        dtype : Dungeondata[name].type,
                        role: role.name,
                        state: 'OPEN',
                        type: 2,
                        editor: `${interaction.user.username}#${interaction.user.discriminator}`
                    })

                    if(interaction.options._hoistedOptions[1].value === 'default')
                    {
                        const row2 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(name)
                                .setStyle(ButtonStyle.Primary)
                                .setLabel('입장')
                            );

                        const embed = new EmbedBuilder()
                            .setTitle(`${Dungeondata[name].dungeonName} 이벤트 던전이 오픈됩니다.`)
                            .setDescription(`${role} 역할 보유자 한정으로 아레 버튼을 통해 참가하실수 있습니다\n입장 현황 - 0/${Dungeondata[name].playerLimit}`)
                        interaction.reply({ embeds: [embed], components: [row2] })
                    }
                    else
                    {
                        const row2 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(name)
                                .setStyle(ButtonStyle.Primary)
                                .setLabel('신청')
                            );

                        Dungeondata[name].enter_type = true
                        Dungeondata[name].tmp = []
                        Dungeondata[name].openTime = 600
                        dataSave(Dungeondata, 'Dungeondata')

                        const embed = new EmbedBuilder()
                            .setTitle(`${Dungeondata[name].dungeonName} 이벤트 던전이 오픈됩니다.`)
                            .setDescription(`${role} 역할 보유자 한정으로 아레 버튼을 통해 참가신청을 하실수 있습니다\n신청 현황 - 0명 신청\n던전 정원 - ${Dungeondata[name].playerLimit}`)
                        interaction.reply({ embeds: [embed], components: [row2] })
                        const msg = await interaction.fetchReply()
                        Dungeondata[name].openmsg = msg.id
                        Dungeondata[name].openChannel = msg.channelId
                        dataSave(Dungeondata, 'Dungeondata')
                    }
                }      
            }
            else
            {
                interaction.reply({ content: '이미 오픈된 던전입니다.', ephemeral: true })
            }
        }
        else
        {
            interaction.reply({ content: '존재하지 않는 던전입니다.', ephemeral: true })
        }
    }
}