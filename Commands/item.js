const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const { Autoreg } = require('./functions/Autoreg');
const { SheetLog } = require('./functions/Log');

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

function localDay(time) {
    var minutesOffset = time.getTimezoneOffset()
    var millisecondsOffset = minutesOffset*60*1000
    var local = new Date(time - millisecondsOffset)
    return local.toISOString().substr(0, 10)
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('item')
		.setDescription('아이템 관련 명령어')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('아이템 목록을 조회합니다.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('buy')
                .setDescription('해당 아이템을 구매합니다.')
                .addStringOption(option => 
                    option.setName('name')
                    .setDescription('아이템의 이름으로 아이템을 선택합니다')
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('wallet')
                .setDescription('소유 아이템을 조회합니다.')),
    async execute(interaction) {
        await Autoreg(interaction)
        switch(interaction.options._subcommand)
        {
            case "list":
                try {
                    //ItemList.json 불러오기
                    var jsonBuffer = fs.readFileSync('ItemList.json')
                    var dataJson = jsonBuffer.toString();
                    const ItemList = JSON.parse(dataJson);

                    var list = ""
                    for(const name of Object.keys(ItemList))
                    {
                        list += `${name} - ${ItemList[name]}P\n`
                    }

                    const embed = new EmbedBuilder()
                        .setTitle(`\`${localDay(new Date)}\` 아이템 목록`)
                        .setDescription(`${list}`)
                    interaction.reply({ embeds: [embed] })
                } catch(error){

                }
                return 0
            case "buy":
                try {
                    const name = interaction.options._hoistedOptions[0].value
                    //ItemList.json 불러오기
                    var jsonBuffer = fs.readFileSync('ItemList.json')
                    var dataJson = jsonBuffer.toString();
                    const ItemList = JSON.parse(dataJson);

                    if(name in ItemList)
                    {
                        //userData.json 불러오기
                        var jsonBuffer = fs.readFileSync('userData.json')
                        var dataJson = jsonBuffer.toString();
                        const userData = JSON.parse(dataJson);
                        
                        if(userData[interaction.user.id].point >= ItemList[name])
                        {
                            userData[interaction.user.id].point -= ItemList[name]
                            userData[interaction.user.id].item.push(name)
                            dataSave(userData, 'userData')

                            SheetLog({
                                name: `${interaction.user.username}#${interaction.user.discriminator}`,
                                item: name,
                                value: ItemList[name],
                                type: 0
                            })

                            const embed = new EmbedBuilder()
                                .setTitle(`\`${name}\` 구매 성공`)
                                .setDescription(`아이템 가격 - ${ItemList[name]}P\n잔여 JE# - ${userData[interaction.user.id].point}P`)
                            interaction.reply({ embeds: [embed] })

                        }
                        else
                        {
                            interaction.reply({ content: `JE# 잔액이 부족합니다.`, ephemeral: true })
                        }
                    }
                    else
                    {
                        interaction.reply({ content: `존재하지 않는 아이템 입니다.`, ephemeral: true })
                    }

                }catch(error){
                    console.log(error)
                }
                return 0
            case "wallet":
                try {
                    //userData.json 불러오기
                    var jsonBuffer = fs.readFileSync('userData.json')
                    var dataJson = jsonBuffer.toString();
                    const userData = JSON.parse(dataJson);

                    var list = " "
                    if(userData[interaction.user.id].item.length >= 1)
                    {
                        userData[interaction.user.id].item.forEach(name => {
                            list += `${name}\n`
                        });
                    }
                    
                    const embed = new EmbedBuilder()
                        .setTitle(`\`${interaction.user.username}\` 님 소유 아이템 목록`)
                        .setDescription(`${list}`)
                    interaction.reply({ embeds: [embed] })
                } catch(error) {
                    console.log(error)
                }
                return 0
        }
    }
}