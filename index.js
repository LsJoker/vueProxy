const fs = require('fs') 
const Vue = require('vue')
const server = require('express')()
const renderer = require('vue-server-renderer').createRenderer({
    template: fs.readFileSync('./views/index.html', 'utf-8')
})

server.get('*', (req, res) => {
    const app = new Vue({
        data: {
            url: req.url
        },
        template: `<div>访问的 URL 是： {{ url }}</div>`
    })

    const context = {
        title: 'vue ssr',
        meta: `
          <meta charset="utf-8"/>
        `
    }

    renderer.renderToString(app, context, (err, html) => {
        if (err) {
            res.status(500).end('Internal Server Error')
            return
        }
        res.end(html)
    })
})



server.listen(8099)
// console.log(123);