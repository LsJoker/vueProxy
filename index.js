const fs = require('fs') 
const Vue = require('vue')
const url  = require("url")
const server = require('express')()
const path = require("path");
const renderer = require('vue-server-renderer').createRenderer({
    template: fs.readFileSync('./views/index.html', 'utf-8')
})

server.get('*', (req, res) => {
    if (!req.url.includes('js')) {
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
            console.log(err)
            if (err) {
                res.status(500).end('Internal Server Error')
                return
            }
            res.end(html)
        })
    } else {        
        let pathname=__dirname+url.parse(req.url).pathname;
        console.log(pathname);
        fs.exists(pathname,function(exists){
            if(exists){
                switch(path.extname(pathname)){
                    case ".html":
                        res.writeHead(200, {"Content-Type": "text/html"});
                        break;
                    case ".js":
                        res.writeHead(200, {"Content-Type": "text/javascript"});
                        break;
                    case ".css":
                        res.writeHead(200, {"Content-Type": "text/css"});
                        break;
                    case ".gif":
                        res.writeHead(200, {"Content-Type": "image/gif"});
                        break;
                    case ".jpg":
                        res.writeHead(200, {"Content-Type": "image/jpeg"});
                        break;
                    case ".png":
                        res.writeHead(200, {"Content-Type": "image/png"});
                        break;
                    default:
                        res.writeHead(200, {"Content-Type": "application/octet-stream"});
                }
     
                fs.readFile(pathname,function (err,data){
                    res.end(data);
                });
            } else {
                res.writeHead(404, {"Content-Type": "text/html"});
                res.end("<h1>404 Not Found</h1>");
            }
        });
    }
    
})



server.listen(8099)
console.log(123);