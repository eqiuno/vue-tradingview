/* eslint-disable */
<template>
  <div class="hello">
    <div id="chart_container" class="f-fill" style="height:800px;"></div>
  </div>
</template>

<script>
  import { setTimeout } from 'timers';
  import Axios from 'axios'
  const supportedSymbols = ['btcusdt', 'ethusdt', 'ltcusdt', 'eosusdt']
  const supportedResolutions = [1, 3, 5, 15, 60, '1D'];

  const BinanceProxy = function() {
    const getInterval = (interval) => {
      if (Number.isInteger(interval)) {
        if (interval == 60) {
          return '1h';
        } else {
          return interval + 'm';
        }
      } else {
        return interval.toLowerCase();
      }
    };
    const streams = []
    suportedSymbols.forEach((symbol, i) => {
      ['1m', '1h', '1d'].forEach((interval, j) => {
        streamNames.push(`${symbol}@kline_${interval}`)
      })
    })
    const streamNames = streams.join('/')
    const socket = new WebSocket(`wss://stream.binance.com:9443:/stream?streams=${steamNames}`)
    socket.onopen = () => console.log('connected')
    socket.onclose = () => console.log('connect close')

    return {
      getK: function(symbol, interval, startTime, endTime) {
        const intervalQ = this.getInterval(interval)
        const endpoint = `https://api.binance.com/api/v1/klines?symbol=${symbol}&interval=${intervalQ}&startTime=${startTime}&endTime=${endTime}`
        return Axios.get(endpoint)
          .then(function(resp) {
            const rows = resp.data;
            return rows.map(function(row) {
              // [
              //   1499040000000,      // Open time
              //   "0.01634790",       // Open
              //   "0.80000000",       // High
              //   "0.01575800",       // Low
              //   "0.01577100",       // Close
              //   "148976.11427815",  // Volume
              //   1499644799999,      // Close time
              //   "2434.19055334",    // Quote asset volume
              //   308,                // Number of trades
              //   "1756.87402397",    // Taker buy base asset volume
              //   "28.46694368",      // Taker buy quote asset volume
              //   "17928899.62484339" // Ignore.
              // ]
              return {
                time: row[0],
                open: row[1],
                high: row[2],
                low: row[3],
                close: row[4],
                volumne: row[5]
              }
            })
          })
      },
      listen: function(symbol, interval, cb) {
        ws.onmessage(evt => {

        })
      }
  }();


  const supportedResolutions = [1, 3, 5, 15, 60, '1D'];
  const config = {
    exchanges: [],  // 交易所数组
    symbol_types: [], // 商品类型过滤数组
    supported_resolutions: supportedResolutions, //后台数据支持时间粒度
    supported_marks: true, // 是否支持K线标记
  }

  function createSymbolType(symbol) {
    return {
      symbol: symbol,
      full_name: symbol,
      description: symbol,
      exchange: '',
      type: 'crypto',
    }
  }

  const symbolPricescale = {
    'BTC': 100,
    'ETH': 100,
    'LTC': 100,
    'EOS': 10000,
  }

  function createSymbolInfo(symbolName) {
    return {
      name: symbolName,
      description: '',
      type: 'crypto',
      session: '24x7',
      minmov: 1,
      pricesacle: symbolPricescale[symbolName],
      has_intraday: true, //是否有分钟数据
      supported_resolutions: [1, 60],
      has_daily: true,
      has_weekly_and_monthly: false,
      has_empty_bars: true,
      has_fractional_volume: false,
      data_status: 'streaming'
    }
  }

  const feed = {
    onReady: function(cb) {
      setTimeout(cb(config), 0) // 不知道为什么一定要这么写
    },
    searchSymbols: function(userInput, exchange, symbolType, onResultReadyCallback) {
      onResultReadyCallback([createSymbolType(symbolType)]);
    },
    resolveSymbol: function(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
      onSymbolResolvedCallback(createSymbolInfo(symbolName));
    },
    getBars: function(symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) {
      return BinanceProxy.getK(symbolInfo.name, resolution, from, to)
        .then(function(rows) {
          if (rows.length > 0) {
            return onHistoryCallback({bars: rows, meta: {noData: false}});
          } else {
            return onHistoryCallback({bars: [], meta: {noData: true}});
          }
        })
        .catch(function(err) {
          return onErrorCallback(err);
        });
    },
    subscribeBars: function(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
      BinanceProxy.ws.onmessage(evt => {
        onRealtimeCallback()
      })
    }

  }
    export default {
      name: "HelloWorld",
        mounted: function() {
            const this_vue = this;
            //this_vue.getChartData();//todo: do odkomentowania na feedzie
            // if(window.localStorage.getItem("chart_settings")) //todo: do sprawdzenia w bardziej zaawansowanym stanie
            //     this_vue.saved_chart = JSON.parse(window.localStorage.getItem("chart_settings"));
            this_vue.feed = this_vue.createFeed();
            window.TradingView.onready(function (configurationData) {
                this_vue.chart = window.tvWidget = new TradingView.widget({
                    fullscreen: false,
                    autosize: true,
                    symbol:this_vue.currency1 + ":"+ this_vue.currency2,
                    container_id: "chart_container",
                    datafeed: this_vue.feed,
                    library_path: "static/custom_scripts/chart_main/",
                    locale: "en",
                    timezone: 'Etc/UTC', //todo: ustawianie timezone'a po strefie usera
                    charts_storage_api_version: "1.1",
                    client_id: 'tradingview.com',
                    user_id: 'public_user_id',
                    debug: true,
                    //loading_screen:{ backgroundColor: "#000000",foregroundColor: "#000000", }//todo:do it
                    interval: '60',
                    // timeframe:'',//todo: na koncu
                    toolbar_bg: "#20334d",
                    // saved_data: this_vue.savedData,
                    allow_symbol_change: true,
                    time_frames: [
                        {text: "1y", resolution: "1W"},
                        {text: "6m", resolution: "3D"},
                        {text: "3m", resolution: "1D"},
                        {text: "1m", resolution: "1D"},
                        {text: "1w", resolution: "30"},
                        {text: "3d", resolution: "30"},
                        {text: "1d", resolution: "30"},
                        {text: "6h", resolution: "15"},
                        {text: "1h", resolution: "1"}],
                    drawings_access: {
                        type: 'black',
                        // tools: [{name: "Regression Trend"}]//todo: moje
                        tools: [{name: "Trend Line", grayed: true}, {name: "Trend Angle", grayed: true}] //todo: bb
                    },
                    disabled_features: [
                        // "header_symbol_search",
                        // "header_interval_dialog_button",
                        // "show_interval_dialog_on_key_press",
                        // "symbol_search_hot_key",
                        // "study_dialog_search_control",
                        // "display_market_status",
                        // "header_compare",
                        // "edit_buttons_in_legend",
                        // "symbol_info",
                        // "border_around_the_chart",
                        // "main_series_scale_menu",
                        // "star_some_intervals_by_default",
                        // "datasource_copypaste",
                        // "right_bar_stays_on_scroll",
                        // "context_menus",
                        // "go_to_date",
                        // "compare_symbol",
                        // "border_around_the_chart",
                        // "timezone_menu",
                        //"header_resolutions",//todo: przetestowac
                        //"control_bar",//todo: przetestowac
                        //"edit_buttons_in_legend",//todo: przetestowac
                        "remove_library_container_border",
                    ],
                    enabled_features: [
                        // "dont_show_boolean_study_arguments",
                        // "use_localstorage_for_settings",
                        // "remove_library_container_border",
                        // "save_chart_properties_to_local_storage",
                        // "side_toolbar_in_fullscreen_mode",
                        // "hide_last_na_study_output",
                        // "constraint_dialogs_movement",//todo: nie do końca jestem pewien
                    ],
                    studies_overrides: {
                        "volume.volume.color.0": "#fe4761",
                        "volume.volume.color.1": "#3fcfb4",
                        "volume.volume.transparency": 75,
                    },
                    overrides: {
                        // "symbolWatermarkProperties.color": "rgba(0,0,0, 0)",
                        // "paneProperties.background": "#20334d",
                        // "paneProperties.vertGridProperties.color": "#344568",
                        // "paneProperties.horzGridProperties.color": "#344568",
                        // "paneProperties.crossHairProperties.color": "#58637a",
                        // "paneProperties.crossHairProperties.style": 2,
                        // "mainSeriesProperties.style": 9,
                        // "mainSeriesProperties.showCountdown": false,
                        // "scalesProperties.showSeriesLastValue": true,
                        // "mainSeriesProperties.visible": false,
                        // "mainSeriesProperties.showPriceLine": false,
                        // "mainSeriesProperties.priceLineWidth": 1,
                        // "mainSeriesProperties.lockScale": false,
                        // "mainSeriesProperties.minTick": "default",
                        // "mainSeriesProperties.extendedHours": false,
                        // "volumePaneSize": "tiny",
                        // editorFontsList: ["Lato", "Arial", "Verdana", "Courier New", "Times New Roman"],
                        // "paneProperties.topMargin": 5,
                        // "paneProperties.bottomMargin": 5,
                        // "paneProperties.leftAxisProperties.autoScale": true,
                        // "paneProperties.leftAxisProperties.autoScaleDisabled": false,
                        // "paneProperties.leftAxisProperties.percentage": false,
                        // "paneProperties.leftAxisProperties.percentageDisabled": false,
                        // "paneProperties.leftAxisProperties.log": false,
                        // "paneProperties.leftAxisProperties.logDisabled": false,
                        // "paneProperties.leftAxisProperties.alignLabels": true,
                        // // "paneProperties.legendProperties.showStudyArguments": true,
                        // "paneProperties.legendProperties.showStudyTitles": true,
                        // "paneProperties.legendProperties.showStudyValues": true,
                        // "paneProperties.legendProperties.showSeriesTitle": true,
                        // "paneProperties.legendProperties.showSeriesOHLC": true,
                        // "scalesProperties.showLeftScale": false,
                        // "scalesProperties.showRightScale": true,
                        // "scalesProperties.backgroundColor": "#20334d",
                        // "scalesProperties.lineColor": "#46587b",
                        // "scalesProperties.textColor": "#8f98ad",
                        // "scalesProperties.scaleSeriesOnly": false,
                        // "mainSeriesProperties.priceAxisProperties.autoScale": true,
                        // "mainSeriesProperties.priceAxisProperties.autoScaleDisabled": false,
                        // "mainSeriesProperties.priceAxisProperties.percentage": false,
                        // "mainSeriesProperties.priceAxisProperties.percentageDisabled": false,
                        // "mainSeriesProperties.priceAxisProperties.log": false,
                        // "mainSeriesProperties.priceAxisProperties.logDisabled": false,
                        // "mainSeriesProperties.candleStyle.upColor": "#3fcfb4",
                        // "mainSeriesProperties.candleStyle.downColor": "#fe4761",
                        // "mainSeriesProperties.candleStyle.drawWick": true,
                        // "mainSeriesProperties.candleStyle.drawBorder": true,
                        // "mainSeriesProperties.candleStyle.borderColor": "#3fcfb4",
                        // "mainSeriesProperties.candleStyle.borderUpColor": "#3fcfb4",
                        // "mainSeriesProperties.candleStyle.borderDownColor": "#fe4761",
                        // "mainSeriesProperties.candleStyle.wickColor": "#737375",
                        // "mainSeriesProperties.candleStyle.wickUpColor": "#3fcfb4",
                        // "mainSeriesProperties.candleStyle.wickDownColor": "#fe4761",
                        // "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
                        // "mainSeriesProperties.hollowCandleStyle.upColor": "#3fcfb4",
                        // "mainSeriesProperties.hollowCandleStyle.downColor": "#fe4761",
                        // "mainSeriesProperties.hollowCandleStyle.drawWick": true,
                        // "mainSeriesProperties.hollowCandleStyle.drawBorder": true,
                        // "mainSeriesProperties.hollowCandleStyle.borderColor": "#3fcfb4",
                        // "mainSeriesProperties.hollowCandleStyle.borderUpColor": "#3fcfb4",
                        // "mainSeriesProperties.hollowCandleStyle.borderDownColor": "#fe4761",
                        // "mainSeriesProperties.hollowCandleStyle.wickColor": "#737375",
                        // "mainSeriesProperties.hollowCandleStyle.wickUpColor": "#3fcfb4",
                        // "mainSeriesProperties.hollowCandleStyle.wickDownColor": "#fe4761",
                        // "mainSeriesProperties.haStyle.upColor": "#3fcfb4",
                        // "mainSeriesProperties.haStyle.downColor": "#fe4761",
                        // "mainSeriesProperties.haStyle.drawWick": true,
                        // "mainSeriesProperties.haStyle.drawBorder": true,
                        // "mainSeriesProperties.haStyle.borderColor": "#3fcfb4",
                        // "mainSeriesProperties.haStyle.borderUpColor": "#3fcfb4",
                        // "mainSeriesProperties.haStyle.borderDownColor": "#fe4761",
                        // "mainSeriesProperties.haStyle.wickColor": "#737375",
                        // "mainSeriesProperties.haStyle.wickUpColor": "#3fcfb4",
                        // "mainSeriesProperties.haStyle.wickDownColor": "#fe4761",
                        // "mainSeriesProperties.haStyle.barColorsOnPrevClose": false,
                        // "mainSeriesProperties.barStyle.upColor": "#3fcfb4",
                        // "mainSeriesProperties.barStyle.downColor": "#fe4761",
                        // "mainSeriesProperties.barStyle.barColorsOnPrevClose": false,
                        // "mainSeriesProperties.barStyle.dontDrawOpen": false,
                        // "mainSeriesProperties.lineStyle.color": "#0cbef3",
                        // "mainSeriesProperties.lineStyle.linestyle": 0,
                        // "mainSeriesProperties.lineStyle.linewidth": 1,
                        // "mainSeriesProperties.lineStyle.priceSource": "close",
                        // "mainSeriesProperties.areaStyle.color1": "#0cbef3",
                        // "mainSeriesProperties.areaStyle.color2": "#0098c4",
                        // "mainSeriesProperties.areaStyle.linecolor": "#0cbef3",
                        // "mainSeriesProperties.areaStyle.linestyle": 0,
                        // "mainSeriesProperties.areaStyle.linewidth": 1,
                        // "mainSeriesProperties.areaStyle.priceSource": "close",
                        // "mainSeriesProperties.areaStyle.transparency": 80
                    },
                    custom_css_url: 'chart.css'
                });
            });
        },
        methods: {
            getChartData: function() {
                console.log("GET CHART DATA")
                _this = this;
                this.$http.get('/api/getChartData', this.parseToSend({ pair: this.currentPair.code }))
                    .then(response => {
                        console.log('GET CHART DATA',response.body);
                        response.body.forEach((order => {
                            _this.$data.bars.push({
                                close: Number(order.close),
                                open: Number(order.open),
                                high: Number(order.high),
                                low: Number(order.low),
                                volume: Number(order.volume),
                                time: Number(order.time),
                            })
                        }))
                        console.log(_this.$data.bars);
                        this.log('@@@',response.body);
                        //this.$data.bars = response.body;
                        //this.$data.activeOffers = response.body;
                        //Events.$emit('active-offers', response.body);
                    },err => {
                        this.log('err', err);
                    });
            },
            changePair: function(){
                let this_vue = this;
                if(this.chart && this.feed){
                    this.feed._fireEvent('pair_change');
                    this.chart.activeChart().resetData();
                    this.chart.activeChart().setSymbol(this.currency1+":"+this.currency2, function(){
                        console.log("GOWNO :: proba zmiany",this_vue.currency1,this_vue.currency2);
                    });
                }
            },
            createFeed: function(){
                let this_vue = this;
                let Datafeed = {};
                Datafeed.DataPulseUpdater = function(datafeed, updateFrequency) {
                    this._datafeed = datafeed;
                    this._subscribers = {};
                    this._requestsPending = 0;
                    var that = this;
                    var update = function() {
                        if (that._requestsPending > 0) {
                            return;
                        }
                        for (var listenerGUID in that._subscribers) {
                            var subscriptionRecord = that._subscribers[listenerGUID];
                            var resolution = subscriptionRecord.resolution;
                            var datesRangeRight = parseInt((new Date().valueOf()) / 1000);
                            //	BEWARE: please note we really need 2 bars, not the only last one
                            //	see the explanation below. `10` is the `large enough` value to work around holidays
                            var datesRangeLeft = datesRangeRight - that.periodLengthSeconds(resolution, 10);
                            that._requestsPending++;
                            (function(_subscriptionRecord) { // eslint-disable-line
                                that._datafeed.getBars(_subscriptionRecord.symbolInfo, resolution, datesRangeLeft, datesRangeRight, function(bars) {
                                        that._requestsPending--;
                                        //	means the subscription was cancelled while waiting for data
                                        if (!that._subscribers.hasOwnProperty(listenerGUID)) {
                                            return;
                                        }
                                        if (bars.length === 0) {
                                            return;
                                        }
                                        var lastBar = bars[bars.length - 1];
                                        if (!isNaN(_subscriptionRecord.lastBarTime) && lastBar.time < _subscriptionRecord.lastBarTime) {
                                            return;
                                        }
                                        var subscribers = _subscriptionRecord.listeners;
                                        //	BEWARE: this one isn't working when first update comes and this update makes a new bar. In this case
                                        //	_subscriptionRecord.lastBarTime = NaN
                                        var isNewBar = !isNaN(_subscriptionRecord.lastBarTime) && lastBar.time > _subscriptionRecord.lastBarTime;
                                        //	Pulse updating may miss some trades data (ie, if pulse period = 10 secods and new bar is started 5 seconds later after the last update, the
                                        //	old bar's last 5 seconds trades will be lost). Thus, at fist we should broadcast old bar updates when it's ready.
                                        if (isNewBar) {
                                            if (bars.length < 2) {
                                                throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
                                            }
                                            var previousBar = bars[bars.length - 2];
                                            for (var i = 0; i < subscribers.length; ++i) {
                                                subscribers[i](previousBar);
                                            }
                                        }
                                        _subscriptionRecord.lastBarTime = lastBar.time;
                                        for (var i = 0; i < subscribers.length; ++i) {
                                            subscribers[i](lastBar);
                                        }
                                    },
                                    //	on error
                                    function() {
                                        that._requestsPending--;
                                    });
                            })(subscriptionRecord);
                        }
                    };
                    if (typeof updateFrequency != 'undefined' && updateFrequency > 0) {
                        setInterval(update, updateFrequency);
                    }
                };
                Datafeed.DataPulseUpdater.prototype.periodLengthSeconds = function(resolution, requiredPeriodsCount) {
                    var daysCount = 0;
                    if (resolution === 'D') {
                        daysCount = requiredPeriodsCount;
                    } else if (resolution === 'M') {
                        daysCount = 31 * requiredPeriodsCount;
                    } else if (resolution === 'W') {
                        daysCount = 7 * requiredPeriodsCount;
                    } else {
                        daysCount = requiredPeriodsCount * resolution / (24 * 60);
                    }
                    return daysCount * 24 * 60 * 60;
                };
                Datafeed.DataPulseUpdater.prototype.subscribeDataListener = function(symbolInfo, resolution, newDataCallback, listenerGUID) {
                    this._datafeed._logMessage('Subscribing ' + listenerGUID);
                    if (!this._subscribers.hasOwnProperty(listenerGUID)) {
                        this._subscribers[listenerGUID] = {
                            symbolInfo: symbolInfo,
                            resolution: resolution,
                            lastBarTime: NaN,
                            listeners: []
                        };
                    }
                    this._subscribers[listenerGUID].listeners.push(newDataCallback);
                };
                Datafeed.DataPulseUpdater.prototype.unsubscribeDataListener = function(listenerGUID) {
                    this._datafeed._logMessage('Unsubscribing ' + listenerGUID);
                    delete this._subscribers[listenerGUID];
                };
                Datafeed.Container = function(updateFrequency){
                    this._configuration = {
                        supports_search: false,
                        supports_group_request: false,
                        supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '720', '1D', '3D', '1W', '1M'],
                        supports_marks: true,
                        supports_timescale_marks: true,
                        exchanges: ['myExchange']
                    };
                    this._barsPulseUpdater = new Datafeed.DataPulseUpdater(this, updateFrequency || 10 * 1000);
                    // this._quotesPulseUpdater = new Datafeed.QuotesPulseUpdater(this);
                    this._enableLogging = true;
                    this._callbacks = {};
                    this._initializationFinished = true;
                    this._fireEvent('initialized');
                    this._fireEvent('configuration_ready');
                };
                Datafeed.Container.prototype._fireEvent = function(event, argument) {
                    if (this._callbacks.hasOwnProperty(event)) {
                        var callbacksChain = this._callbacks[event];
                        for (var i = 0; i < callbacksChain.length; ++i) {
                            callbacksChain[i](argument);
                        }
                        this._callbacks[event] = [];
                    }
                };
                Datafeed.Container.prototype._logMessage = function(message) {
                    if (this._enableLogging) {
                        var now = new Date();
                        console.log("CHART LOGS: "+now.toLocaleTimeString() + '.' + now.getMilliseconds() + '> ' + message);
                    }
                };
                Datafeed.Container.prototype.on = function(event, callback) {
                    if (!this._callbacks.hasOwnProperty(event)) {
                        this._callbacks[event] = [];
                    }
                    this._callbacks[event].push(callback);
                    return this;
                };
                Datafeed.Container.prototype.onReady = function(callback) {
                    let that = this;
                    if (this._configuration) {
                        setTimeout(function() {
                            callback(that._configuration);
                        }, 0);
                    }
                    else {
                        this.on('configuration_ready', function() {
                            callback(that._configuration);
                        });
                    }
                };
                Datafeed.Container.prototype.resolveSymbol = function(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
                    this._logMessage("GOWNO :: resolve symbol "+ symbolName);
                    Promise.resolve().then(() => {
                        function adjustScale(){
                            if(this_vue.last_price>1000)
                                return 100;
                            else
                                return 100000000;
                        }
                        this._logMessage("GOWNO :: onResultReady inject "+this_vue.currency1 + ":"+ this_vue.currency2);
                        onSymbolResolvedCallback({
                            "name": this_vue.currency1 + ":"+ this_vue.currency2,
                            "timezone": "Europe/Warsaw",
                            "pricescale": adjustScale(),
                            "minmov": 1,
                            "minmov2": 0,
                            "ticker": this_vue.currency1 + ":"+ this_vue.currency2,
                            "description": "",
                            "session": "24x7",
                            "type": "bitcoin",
                            "exchange-traded": "myExchange",
                            "exchange-listed": "myExchange",
                            "has_intraday": true,
                            "intraday_multipliers": ['60'], //It is an array containing intraday resolutions (in minutes) the datafeed wants to build by itself. E.g., if the datafeed reported he supports resolutions ["1", "5", "15"], but in fact it has only 1 minute bars for symbol X, it should set intraday_multipliers of X = [1]. This will make Charting Library to build 5 and 15 resolutions by itself.
                            "has_weekly_and_monthly": false,
                            "has_no_volume": false,
                            "regular_session": "24x7"
                        });
                    })
                };
                Datafeed.Container.prototype.getBars = function(symbolInfo, resolution, rangeStartDate, rangeEndDate, onDataCallback, onErrorCallback) {
                    if (rangeStartDate > 0 && (rangeStartDate + '').length > 10) {
                        throw new Error(['Got a JS time instead of Unix one.', rangeStartDate, rangeEndDate]);
                    }
                    onDataCallback([], { noData: true });
                    //onDataCallback(bars, { noData: true , nextTime: data.nb || data.nextTime });
                };
                Datafeed.Container.prototype.subscribeBars = function(symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback) {
                    this_vue.bars.forEach(function (bar) { // in subscribeBars
                        onRealtimeCallback(bar)
                    });
                    this.on('pair_change', function() {
                        onResetCacheNeededCallback();
                    });
                    //this._barsPulseUpdater.subscribeDataListener(symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback);
                };
                Datafeed.Container.prototype.unsubscribeBars = function(listenerGUID) {
                    this._barsPulseUpdater.unsubscribeDataListener(listenerGUID);
                };
                return new Datafeed.Container;
            },
            adjustChart: function(){
                let chart_iframe = $("#chart_container").find("iframe");
                let chart_top = chart_iframe.contents().find(".header-chart-panel");
                let chart_top_container = chart_iframe.contents().find(".header-chart-panel-content");
                let chart_bottom = chart_iframe.contents().find(".date-range-wrapper");
                chart_bottom.appendTo(chart_top_container);
            }
        },
        watch:{
            pair: function(newVal, oldVal){
                this.currency1= newVal[0];
                this.currency2= newVal[1];
                this.changePair();
            },
        },
        data: function () {
            return {
                currency1: 'USD',
                currency2: 'BTC',
                saved_chart: null,
                chart: null,
                feed: null,
                last_price:1234.2365,
                bars: [
                     {
                         time:1508313600000,
                         close:42.1,
                         open:41.0,
                         high:43.0,
                         low:40.4,
                         volume:12000
                     }, {
                         time:1508317200000,
                         close:43.4,
                         open:42.9,
                         high:44.1,
                         low:42.1,
                         volume:18500
                     }, {
                         time:1508320800000,
                         close:44.3,
                         open:43.7,
                         high:44.8,
                         low:42.8,
                         volume:24000
                     }, {
                         time:1508324400000,
                         close:42.8,
                         open:44.5,
                         high:44.5,
                         low:42.3,
                         volume:45000
                     }
                ]
            }
        }
<<<<<<< HEAD
=======

>>>>>>> c16e10b1c13f1718af7f837761cffa34b5703d41
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
