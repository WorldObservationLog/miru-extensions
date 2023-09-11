// ==MiruExtension==
// @name         轻小说文库
// @version      v0.0.1
// @author       NPGamma
// @lang         zh-cn
// @license      AGPL-3.0
// @package      moe.wol.wenku8
// @type         fikushon
// @webSite      https://wenku8.npgamma.workers.dev/
// ==/MiruExtension==


export default class extends Extension {
    async latest(page) {
        const req = this.generate_encrypted_body(`action=novellist&sort=lastupdate&page=${page}&t=0`)
        const resp = await this.wenku8_request(req)
        // const items = Array.from((await resp.text()).matchAll("<item aid='(\\d*)'>\\n<data name='Title'><!\\[CDATA\\[(.*)\\]\\]></data>\\n.*\\n.*\\n.*\\n.*\\n.*\\n.*<data name=\"LastUpdate\" value='(.*)'/>"))
        const items = this.querySelectorAll(await resp.text(), "item")
        const results = []
        for (const item of items) {
            const aid = this.getAttributeText(item.content, "", "aid")
            const statusCode = parseInt(parseInt(aid) / 1000)
            const title = this.queryXPath(item.content,'/item/data[@name="Title"]', "text")
            const url = `https://www.wennku8.net/book/${aid}.htm`
            const cover = `https://img.wenku8.com/image/${statusCode}/${aid}/${aid}s.jpg`
            const update = this.queryXPath(item.content, '/item/data[@name="LastUpdate"]', "attr")["value"]
            results.push({title, url, cover, update})
        }
        return results
    }

    async search(kw) {
        const results = []
        for (const type in ["articlename", "author"]) {
            const req = this.generate_encrypted_body(`action=search&searchtype=${type}&searchkey=${kw}&t=0`)
            const resp = await this.wenku8_request(req)
            const items = Array.from((await resp.text()).matchAll("<item aid='(\\d*)'>\\n<data name='Title'>\\n<!\\[CDATA\\[(.*)\\]\\]>\\n</data>\\n.*\\n.*\\n.*\\n.*\\n.*\\n.*<data name=\"LastUpdate\" value='(.*)'/>"))
            for (const item of items) {
                const aid = item[1]
                const statusCode = parseInt(parseInt(aid) / 1000)
                const title = item[2]
                const url = `https://www.wennku8.net/book/${aid}.htm`
                const cover = `https://img.wenku8.com/image/${statusCode}/${aid}/${aid}s.jpg`
                const update = item[3]
                results.push({title, url, cover, update})
            }
        }
        return results
    }

    async detail(url) {
        const aid = url.match("https://www.wennku8.net/book/(\d*).htm")[1]
    }
    
    async watch(url) {
        const aid = url.match("https://www.wennku8.net/book/(\d*).htm")[1]
    }

    async load() {
        this.APPVER = ""
        this.Base64 = Base64
        this.encodeURIComponent = encodeURIComponent
    }

    async wenku8_request(req) {
        var formBody = [];
        for (const property in req) {
            var encodedKey = this.encodeURIComponent(property);
            var encodedValue = this.encodeURIComponent(req[property])
            formBody.push(encodedKey + "=" + encodedValue)
        }
        formBody = formBody.join("&").replaceAll("%3D", "=")
        return await fetch(
            "https://wenku8.npgamma.workers.dev/",
            {
                method: "POST",
                body: formBody
            }
        )
    }

    generate_encrypted_body(raw_req) {
        return {"APPVER": this.APPVER,
         "request": this.cryptoJs.enc.Base64.stringify(this.cryptoJs.enc.Utf8.parse(raw_req)),
         "timetoken": ""}
    }
}

var encodeURIComponent=function($){for(var n="0123456789ABCDEF",r="",e=0;e<$.length;e++){var o=$.charCodeAt(e);o>=48&&o<=57||o>=97&&o<=122||o>=65&&o<=90||45==o||95==o||46==o||33 /*!*/ ==o||126==o||42==o||92==o||40==o||41==o?r+=$[e]:(r+="%",r+=n[(240&o)>>4],r+=n[15&o])}return r};
