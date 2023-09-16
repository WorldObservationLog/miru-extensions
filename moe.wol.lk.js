// ==MiruExtension==
// @name         轻之国度 轻小说版
// @version      v0.0.1
// @author       NPGamma
// @lang         zh-cn
// @icon         https://www.lightnovel.us/favicon.ico
// @license      AGPL-3.0
// @package      moe.wol.lk
// @type         fikushon
// @webSite      https://api.lightnovel.us
// ==/MiruExtension==

export default class extends Extension{
    async req(endpoint, params) {
        const req = await this.request(endpoint,
        {"method": "post", "headers": {"content-type": "application/json", "user-agent": "Dart/2.10 (dart:io)"},
       "data": JSON.stringify({"is_encrypted":0,"platform":"android","client":"web","sign":"","gz":0,"d":params})})
       return await req.json()
    }

    async load() {
        await this.registerSetting({
            title: "轻之国度 账号",
            key: "lk.account",
            type: "input",
            description: "",
            defaultValue: ""
        })
        await this.registerSetting({
            title: "轻之国度 密码",
            key: "lk.password",
            type: "password",
            description: "",
            defaultValue: ""
        })
        await this.registerSetting({
            title: "轻之国度 分区",
            key: "lk.category",
            type: "input",
            description: "最新：106，整卷：107，原创：111",
            defaultValue: 106
        })
        if (await this.getSetting("lk.account") != "" && await this.getSetting("lk.password") != "" && this.security_key == undefined) {
            const resp = await this.req("/api/user/login", {username: await this.getSetting("lk.account"), password: await this.getSetting("lk.password")})
            this.security_key = resp.security_key
        }
    }

    async latest(page) {
        const resp = await this.req("/api/category/get-article-by-cate", {parent_gid: 3, gid: await this.getSetting("lk.category")}, page, this.security_key)
        const results = []
        for (const article in resp.data.list) {
            results.push({title: article.title, url: article.aid, cover: article.cover, update: article.last_time})
        }
        return results
    }

    async search(kw, page) {

    }
}