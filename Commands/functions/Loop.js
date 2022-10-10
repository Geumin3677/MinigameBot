const fs = require('fs');

async function dataSave(Dungeondata, name) {
    const datastr = JSON.stringify(Dungeondata, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    async updateloop(client) {
        while(true)
        {
            //plant.json 불러오기
            var jsonBuffer = fs.readFileSync('plant.json')
            var dataJson = jsonBuffer.toString();
            const plant = JSON.parse(dataJson);

            for(user of Object.keys(plant))
            {
                if(plant[user].seedtime != 0)
                {
                    plant[user].seedtime -= 1
                }
                if(plant[user].ampletime != 0)
                {
                    plant[user].ampletime -= 1
                }
                if(plant[user].planttime != 0)
                {
                    plant[user].planttime -= 1
                }
            }

            dataSave(plant, "plant")

            await sleep(1000)
        }
    }
}