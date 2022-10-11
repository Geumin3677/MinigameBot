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

            //Dungeondata.json 불러오기
            jsonBuffer = fs.readFileSync('Dungeondata.json')
            dataJson = jsonBuffer.toString();
            const Dungeondata = JSON.parse(dataJson);

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

            for(dungeon of Object.keys(Dungeondata))
            {
                for(id of Object.keys(Dungeondata[dungeon].player))
                {
                    if(Dungeondata[dungeon].player[id] > 0)
                    {
                        Dungeondata[dungeon].player[id] -= 1
                    }
                }
            }

            dataSave(plant, "plant")
            dataSave(Dungeondata, "Dungeondata")

            await sleep(1000)
        }
    }
}