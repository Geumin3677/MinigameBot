const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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
		.setName('option')
		.setDescription('각종 값을 변경합니다')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommandGroup(subcommand =>
            subcommand.setName('상점메뉴')
            .setDescription('아이템 상점관련 값들을 수정합니다.')
            .addSubcommand(subcommand => 
                subcommand.setName('추가')
                .setDescription('메뉴를 추가합니다')
                .addStringOption(option =>
                    option.setName('이름')
                    .setDescription("해당 메뉴의 이름")
                    .setRequired(true))
                .addNumberOption(option =>
                    option.setName('가격')
                    .setDescription('해당 메뉴의 가격')
                    .setRequired(true)))
            .addSubcommand(subcommand => 
                subcommand.setName('삭제')
                .setDescription('메뉴를 삭제합니다')
                .addStringOption(option =>
                    option.setName('이름')
                    .setDescription("해당 메뉴의 이름")
                    .setRequired(true)))),
    async execute(interaction) {
        switch(interaction.options._group) {
            case "상점메뉴":
                try {
                    //ItemList.json 불러오기
                    var jsonBuffer = fs.readFileSync('ItemList.json')
                    var dataJson = jsonBuffer.toString();
                    const ItemList = JSON.parse(dataJson);

                    if(interaction.options._subcommand === "추가")
                    {
                        const name = interaction.options._hoistedOptions[0].value
                        const price = interaction.options._hoistedOptions[1].value

                        ItemList[name] = price

                        dataSave(ItemList, "ItemList")

                        interaction.reply(`\`${name}\` 항목이 상점에 \`${price} JE#\` 으로 추가 되었습니다`)
                    }   
                    if(interaction.options._subcommand === "삭제")
                    {
                        const name = interaction.options._hoistedOptions[0].value
                        if(name in ItemList)
                        {
                            delete ItemList[name]
                            dataSave(ItemList, "ItemList")

                            interaction.reply(`\`${name}\` 삭제 성공`)
                        }
                        else
                        {
                            interaction.reply(`\`${name}\` 존재하지 않는 메뉴 입니다`)
                        }
                    }
                } catch (error) {
                    console.log(error)
                    interaction.reply("오류 발생")
                }
                return 0
        }
    }
}