<template>
    <div id="chart_container"></div>
</template>
<script>
import { setTimeout } from 'timers';
import { exists } from 'fs';
import Axios from 'axios'

const dataConfig = {
    exchanges: [],  // 交易所数组
    symbol_types: [], // 商品类型过滤数组
    supported_resolutions: ['1', '3', '5', '60', '1D'], //后台数据支持时间粒度
    supported_marks: true, // 是否支持K线标记
}

const supportedSymbols = {
    'BINANCE:BTC/USDT': {
        pricescale: 1000,
        stream: 'BTCUSDT'
    },
    'BINANCE:ETH/USDT': {
        pricescale: 1000,
        stream: 'ETHUSDT'
    },
    'BINANCE:EOS/USDT': {
        pricescale: 100000,
        stream: 'EOSUSDT'
    },
}

const binanceK = ['1m', '1h']

const fetchKline = (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
    const symbol = supportedSymbols[symbolInfo.name];
    if (!symbol) return onErrorCallback('not found');
    const interval = resolution === '60' ? '1h' : '1m'
    const endpoint = `/binanceHttp/api/v1/klines?symbol=${symbol.stream}&interval=${interval}&startTime=${from * 1000}&endTime=${to * 1000}`
    return Axios.get(endpoint).then(resp => {
        const rows = resp.data;

        if (rows.length == 0) return onHistoryCallback([], {noData: true})
        const bars = rows.map(function(row) {
            return {
                time: row[0],
                open: row[1],
                high: row[2],
                low: row[3],
                close: row[4],
                volumne: row[5]
            }
        });
        console.log('bars:', bars);
        return onHistoryCallback(bars, {noData: false})
    })
    .catch(err => console.log("err", err));
}

const streams = [];

Object.values(supportedSymbols).map(symbol => {
    binanceK.forEach(k => {
        streams.push(`${symbol.stream}@kline_${k}`)
    })
})

const ws = new WebSocket(`ws://${window.location.host}/binanceWs/stream?streams=${streams.join('/')}`)
ws.onopen = () => console.log('connect ws');
ws.onclose = () => console.log('connect close');
ws.onmessage = msg => console.log('get wss msg:', msg)
ws.onerror = err => console.log('ws err:', err)

const Datafeed = {
    /* 实时图表的必须方法 */  
    onReady: cb => {
        console.log("onready")
        setTimeout(cb(dataConfig), 0)
    },

    // 只在检索功能开启时才需要searchSymbols方法
    searchSymbols:(userInput, exchange, symbolType, onResultReadyCallback) => {
        console.log('searchSymbols')
    },

    resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
        console.log(`resolvSymbol:${symbolName}`)
        const symbol = supportedSymbols[symbolName];
        console.log('symbol', symbol)
        if (!symbol) {
            return setTimeout(onResolveErrorCallback('not found'), 0);
        }
        let symbolInfo =  {
            name: symbolName,  
            description: 'BTC/USDT',  
            type: 'crypto',  
            session: '24x7',  
            timezone: 'America/New_York',  
            ticker: symbolName,  
            minmov: 1,  
            pricescale: 100000000,  
            has_intraday: true,  
            intraday_multipliers: ['1', '60'],  
            supported_resolutions: ['1', '3', '5', '15', '30', '60', 'D', '2D'],  
            volume_precision: 8,  
            data_status: 'streaming',  
        }
        console.log('symbol info:', symbolInfo)
        return setTimeout(onSymbolResolvedCallback(symbolInfo), 0);
    },

    getBars: (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
        console.log('getBars:', symbolInfo, ':', resolution);
        fetchKline(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest)
    },

    subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
        console.log('subscribeBars', window.location.host, symbolInfo, resolution)
    },

    unsubscribeBars: subscriberUID => {},

    /* 可选方法 */

    getServerTime: cb => {
        console.log('getServerTime')
    },

    calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
        console.log('calculateHistoryDepth')
    },

    getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
        console.log('getMarks')
    },

    getTimeScaleMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
        console.log('getTimeScaleMarks')
    } 
}

const widgetOptions = {  
    debug: false,  
    symbol: 'BINANCE:BTC/USDT',  
    datafeed: Datafeed, // our datafeed object  
    interval: '1',  
    container_id: 'chart_container',  
    library_path: 'static/custom_scripts/chart_main/',  
    locale: 'en',  
    disabled_features: ['use_localstorage_for_settings'],  
    enabled_features: [],  
    client_id: 'test',  
    user_id: 'public_user_id',  
    fullscreen: false,  
    autosize: true,  
    overrides: {  
        "paneProperties.background": "#131722",  
        "paneProperties.vertGridProperties.color": "#363c4e",  
        "paneProperties.horzGridProperties.color": "#363c4e",  
        "symbolWatermarkProperties.transparency": 90,  
        "scalesProperties.textColor" : "#AAA",  
        "mainSeriesProperties.candleStyle.wickUpColor": '#336854',  
        "mainSeriesProperties.candleStyle.wickDownColor": '#7f323f',  
    }  
};
export default {
    data() {
        return {
            chart: {}
        }
    },
    mounted() {
        window.TradingView.onready(config => this.chart = new TradingView.widget(widgetOptions))
    }
    
}
</script>

