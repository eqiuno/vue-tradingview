module.exports = {
    devServer: {
        proxy: {
            '/binanceHttp': {
                target: "https://api.binance.com",
                pathRewrite: {'^/binanceHttp': ''}
            },
            '/binanceWs': {
                target: "wss://stream.binance.com:9443",
                ws: true,
                secure: false,
                logLevel: 'debug',
                pathRewrite: {'^/binanceWs': ''}
            },
        }
    }
}