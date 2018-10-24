Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

// Attibution: API requests based
L.TimeDimension.Layer.APIHeatMap = L.TimeDimension.Layer.extend({

    initialize: function(options) {
        var heatmapCfg = this._getHeatmapOptions(options.heatmatOptions || {});
        var layer = new HeatmapOverlay(heatmapCfg);
        L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
        this._currentLoadedTime = 0;
        this._currentTimeData = {
            max: this.options.heatmapMax || 10,
            data: []
        };
        this._baseURL = this.options.baseURL || null;
        this._period = this.options.period || "P1Y";
    },

    _getHeatmapOptions: function(options) {
        var config = {};
        var defaultConfig = {
            radius: 15,
            blur: 25,
            maxOpacity: .8,
            scaleRadius: false,
            useLocalExtrema: false,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'count'
        };
        for (var attrname in defaultConfig) {
            config[attrname] = defaultConfig[attrname];
        }
        for (var attrname in options) {
            config[attrname] = options[attrname];
        }
        return config;
    },

    onAdd: function(map) {
        L.TimeDimension.Layer.prototype.onAdd.call(this, map);
        map.addLayer(this._baseLayer);
        if (this._timeDimension) {
            this._getDataForTime(this._timeDimension.getCurrentTime());
        }
    },

    _onNewTimeLoading: function(ev) {
        this._getDataForTime(ev.time);
        return;
    },

    isReady: function(time) {
        return (this._currentLoadedTime == time);
    },

    _update: function() {
        this._baseLayer.setData(this._currentTimeData);
        return true;
    },

    _getDataForTime: function(time) {
        if (!this._baseURL || !this._map) {
            return;
        }
        var d = new Date(time);
        var url = '/timeline/json/' + d.getUTCFullYear()+'-01-01';
        var oReq = new XMLHttpRequest();
        oReq.addEventListener("load", (function(xhr) {
            var response = xhr.currentTarget.response;
            var data = JSON.parse(response);
            delete this._currentTimeData.data;

            this._currentTimeData.data = [];
            for (var i = 0; i < data.length; i++) {
                var marker = data[i];
                if (marker.location) {
                    this._currentTimeData.data.push({
                        lat: marker.location.latitude,
                        lng: marker.location.longitude,
                        count: marker.average_temperature,
                    });
                }
            }
            this._currentLoadedTime = time;
            if (this._timeDimension && time == this._timeDimension.getCurrentTime() && !this._timeDimension.isLoading()) {
                this._update();
            }
            this.fire('timeload', {
                time: time
            });
        }).bind(this));

        oReq.open("GET", url);
        oReq.send();

    },

});

L.timeDimension.layer.apiHeatMap = function(options) {
    return new L.TimeDimension.Layer.APIHeatMap(options);
};