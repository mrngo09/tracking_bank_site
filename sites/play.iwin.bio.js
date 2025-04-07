import axios from 'axios';
class PlaySonClubSite {
    constructor() { }

    async register(username, password) {
        let url = 'https://getquayaybiai.gwyqinbg.com/user/register.aspx'
        let dataOrigin = {
            fullname: username,
            username: username,
            password: password,
            app_id: "iwin.club",
            avatar: "Avatar_22",
            os: "Windows",
            device: "Computer",
            browser: "chrome",
            fg: "8f2777955068b42039855089b9c77513",
            aff_id: "iwin",
            version: "2.31.1"
        }
        let data = JSON.stringify(dataOrigin)
        let config = {
            maxBodyLength: Infinity,
            headers: {
                'authority': 'getquayaybiai.gwyqinbg.com',
                'accept': '*/*',
                'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                'content-type': 'text/plain;charset=UTF-8',
                'origin': 'https://play.iwin.bio',
                'referer': 'https://play.iwin.bio/',
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            },
        };

        let response = await axios.post(url, data, config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
        return response;
    }

    async updateUsername(username) {
        let url = 'https://getquayaybiai.gwyqinbg.com/user/update.aspx'
        let data = JSON.stringify({
            fullname: username
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            headers: {
                'authority': 'getquayaybiai.gwyqinbg.com',
                'accept': '*/*',
                'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                'content-type': 'application/json',
                'origin': 'https://play.iwin.bio',
                'referer': 'https://play.iwin.bio/',
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'x-token': 'ee19ad3888b75bd46e98bc26e7cdb86f'
            },
            data: data
        };

        let response = await axios.post(url, data, config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
        return response;
    }

    async signIn(username, password) {
        let url = 'https://getquayaybiai.gwyqinbg.com/user/login.aspx'
        let dataOrigin = {
            username: username,
            password: password,
            app_id: "iwin.club",
            os: "Windows",
            device: "Computer",
            browser: "chrome",
            fg: "8f2777955068b42039855089b9c77513",
            aff_id: "iwin",
            version: "2.31.1"
        }
        let data = JSON.stringify(dataOrigin)
        let config = {
            maxBodyLength: Infinity,
            headers: {
                'authority': 'getquayaybiai.gwyqinbg.com',
                'accept': '*/*',
                'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                'content-type': 'text/plain;charset=UTF-8',
                'origin': 'https://play.iwin.bio',
                'referer': 'https://play.iwin.bio/',
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Cookie': 'ci_session=0dlgeb7fllkno304ptu7jlmosvs1fojg'
            },
        };

        let response = await axios.post(url, data, config)
            .then((response) => {
                if (response.data.data[0].session_id != null)
                    console.log(`Login Successfully.`);
                return response.data.data[0].session_id
            })
            .catch((error) => {
                console.log(error);
            });
        return response

    }

    async getBankCode(token) {
        let url = 'https://baymentgwapy.gwyqinbg.com/payment/bnp?xtoken=ee19ad3888b75bd46e98bc26e7cdb86f'
        let config = {
            maxBodyLength: Infinity,
            headers: {
                'authority': 'baymentgwapy.gwyqinbg.com',
                'accept': '*/*',
                'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                'content-length': '0',
                'content-type': 'application/json',
                'origin': 'https://play.iwin.bio',
                'referer': 'https://play.iwin.bio/',
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'x-token': `${token}`
            }
        };

        await axios.post(url, null, config)
            .then((response) => {
                console.log(JSON.stringify(response.data.rows));
                return response.data.rows
            })
            .catch((error) => {
                console.log(error);
            });

    }

    async deposit(token, amount = 500000, bankCode = "BIDV") {
        let data = JSON.stringify({
            amount: amount,
            bank_code: bankCode
        });
        let url = `https://baymentgwapy.gwyqinbg.com/payment/np?xtoken=${token}`
        let config = {
            maxBodyLength: Infinity,
            headers: {
                'authority': 'baymentgwapy.gwyqinbg.com',
                'accept': '*/*',
                'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
                'content-type': 'application/json',
                'origin': 'https://play.iwin.bio',
                'referer': 'https://play.iwin.bio/',
                'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'x-token': `${token}`
            },
        };

        let response = await axios.post(url, data, config)
            .then((response) => {
                if (response.data.rows) {
                    let res = response.data.rows;
                    let data = {
                        account_no: res.account_no,
                        account_name: res.account_name,
                        bank_name: res.bank_name
                    }
                    return data
                }
                if (response.data.code == 400) {
                    return `He thong bao tri.`
                }

            })
            .catch((error) => {
                console.log(error);
            });
        return response
    }
}

let site = new PlaySonClubSite();
let username = "namdaik222245"
let password = "qweqwe123"
await site.register(username, password)
await site.updateUsername(`${username}r712`)
let token = await site.signIn(username, password)

// let listCode = await site.getBankCode(token)
let amount = Math.floor(100000 + Math.random() * 900000)
let bankInfo = await site.deposit(token, amount, "SHB")
console.log(bankInfo);

