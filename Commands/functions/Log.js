const fs = require('fs');

async function dataSave(data, name) {
    const datastr = JSON.stringify(data, null, '\t');
    fs.writeFileSync(`./${name}.json`, datastr);
}

//https://docs.google.com/spreadsheets/d/19jwiekPwjAErrX53HsCUakSp1uXMf-I4nqoLpRdwsVg/edit?usp=sharing

const {GoogleSpreadsheet} = require("google-spreadsheet");
const gs_creds = require('./challengebot-342904-35fdbb8c1054.json')
const doc = new GoogleSpreadsheet("19jwiekPwjAErrX53HsCUakSp1uXMf-I4nqoLpRdwsVg");

module.exports = {
    async SheetLog(msg) {
        const curr = new Date();
        const utc = 
            curr.getTime() + 
            (curr.getTimezoneOffset() * 60 * 1000);
        const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
        const kr_curr = new Date((utc + KR_TIME_DIFF));
        const time = `${kr_curr.getFullYear()}-${kr_curr.getMonth() + 1}-${kr_curr.getDate()} ${kr_curr.getHours()}:${kr_curr.getMinutes()}:${kr_curr.getSeconds()}`

        try
        { 
            await doc.useServiceAccountAuth(gs_creds);
            await doc.loadInfo() 
        }
        catch(err)
        {
            console.log( "AUTH ERROR ", err)
            return
        }

        switch(msg.type)
        {
            case 0:
                var sheet = doc.sheetsByIndex[0];
                await sheet.addRow({ 날짜: time, 닉네임: msg.name, 구매_아이템: msg.item, 구매_비용: msg.value, 구매전_포인트: msg.gpoint, 잔존_포인트: msg.lpoint, 아이템_소유현황: msg.nitem});
                return
            case 1:
                var sheet = doc.sheetsByIndex[1];
                await sheet.addRow({ 날짜: time, 닉네임: msg.name, 던전이름: msg.dname, 던전타입: msg.dtype, 획득_포인트: msg.value, 기존_포인트: msg.gpoint, 보유_포인트: msg.lpoint});
                return
            case 2:
                var sheet = doc.sheetsByIndex[2];
                await sheet.addRow({ 날짜: time, 던전이름: msg.dname, 던전_종류: msg.dtype, 타겟_역할: msg.role, 상태: msg.state, 던전_작성자: msg.editor});
                return
            case 3:
                var sheet = doc.sheetsByIndex[2];
                await sheet.addRow({ 날짜: time, 던전이름: msg.dname, 던전_종류: msg.dtype, 타겟_역할: msg.role, 상태: msg.state, 던전_작성자: msg.editor, 폐쇄사유: msg.res, 잔존_포인트: msg.lpoint, 확률: msg.chance, 배수: msg.mult});
                return
            case 4:
                var sheet = doc.sheetsByIndex[3];
                await sheet.addRow({ 날짜: time, 지급실행자: msg.name, 지급대상: msg.tname, 지급사유: msg.res, 기존_포인트: msg.gpoint, 지급_포인트: msg.value, 보유_포인트: msg.lpoint});
                return
        }
    }
}