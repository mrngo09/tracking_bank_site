import axios from 'axios';
class PlaySonClubSite {
    constructor() { }

    async singIn(username, password) {
        let url = 'https://portal.taison01.com/api/Account/Login'
        let dataOrigin = {
            LoginType: 1,
            UserName: username,
            Password: password,
            DeviceId: "627bec5e-917d-49cf-b9ae-d1723b203233",
            DeviceType: 1,
            PackageName: "http://null"
        }
        let data = JSON.stringify(dataOrigin);
        let headers = {
            'authority': 'portal.taison01.com',
            'accept': '*/*',
            'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
            'content-type': 'application/json; charset=UTF-8',
            'origin': 'https://play.son.club',
            'referer': 'https://play.son.club/',
            'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
        var response = await axios.post(url, data, { headers, maxBodyLength: Infinity })
            .then((response) => {
                return response.data.Token
            })
            .catch((error) => {
                console.log(error);
            });
        return response
    }

    async getBankInfo(token, amount, chargeType = "bank", subType = "VCB") {
        let url = `https://portal.taison01.com/api/charge/getInfor?amount=${amount}&chargeType=${chargeType}&subType=${subType}&access_token=${token}`
        let config = {
            maxBodyLength: Infinity,
            headers: {
                'authority': 'portal.taison01.com',
                'accept': '*/*',
                'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                'content-type': 'application/json; charset=UTF-8',
                'origin': 'https://play.son.club',
                'referer': 'https://play.son.club/',
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        };

        let response = await axios.get(url, config)
            .then((response) => {

                //case deposit rare limit 
                if (response.data.ResponseCode = -99) {
                    return "He thong bao tri"
                }
            })
            .catch((error) => {
                console.log(error);
            });
        return response
    }
}

let site = new PlaySonClubSite()
let token = await site.singIn("tienbip12345", "qweqwe123")
let amount = 500000
let bankInfo = await site.getBankInfo(token, amount)
console.log(bankInfo);
