const fs = require('fs');

async function dataSave(data, name) {
    const datastr = JSON.stringify(data, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

module.exports = {
    async Autoreg(interaction) {
        //userData.json 불러오기
		var jsonBuffer = fs.readFileSync('userData.json')
		var dataJson = jsonBuffer.toString();
		const userData = JSON.parse(dataJson);
        if(!(interaction.user.id in userData))
        {
            const name = `${interaction.user.username}#${interaction.user.discriminator}`

            userData[interaction.user.id] = {
                name : name,
                point : 0,
                item : [],
                cntpoint: 0
            }
            dataSave(userData, 'userData')
        }
    }
}