L.TimeDimension.Layer.AjaxGeoJSON = L.TimeDimension.Layer.extend({

    initialize: function(layer, options) {
        var heatmapCfg = this._getHeatmapOptions();
        var layer = new HeatmapOverlay(heatmapCfg);
        L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
        this._currentLoadedTime = 0;
        this._currentTimeData = {
            max: 10,
            data: [],
        };
        this._baseURL = this.options.baseURL || null;
        this._period = this.options.period || "P1Y";
    },

    _getHeatmapOptions: function(options) {
        var config = {};
        var defaultConfig = {
            radius: 15,
            maxOpacity: .8,
            scaleRadius: false,
            useLocalExtrema: false,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'avg_temp'
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
        if (!this._map)
            return;
        var layer = L.geoJson(this._currentTimeData.data, this._baseLayer.options);
        if (this._currentLayer) {
            this._map.removeLayer(this._currentLayer);
        }
        layer.addTo(this._map);
        this._currentLayer = layer;
    },

    /*_update: function() {
        this._baseLayer.setData(this._currentTimeData);
        return true;
    }*/

    _getDataForTime: function(time) {
        if (!this._map) {
            return;
        }
        var d = new Date(time);
        //var url = 'timeline/geoJSON/' + d.getUTCFullYear() + '-0' + d.getUTCMonth() + '-0' + d.getUTCDate();
        var url = 'timeline/geoJSON/' + d.getUTCFullYear() + '-01-01';
        console.log(url);
        var callback = function(status, data) {

            this._currentTimeData.data = data;
//            for (var i = 0; i < data.features.length; i++) {
//                var marker = data.features[i];
//                console.log(marker);
//                if (marker.location) {
//                    this._currentTimeData.data.push({
//                        lat: marker.geometry.coordinates[0],
//                        lng: marker.geometry.coordinates[1],
//                        avg_temp: marker.properties.average_temperature
//                    });
//                }
//            }
            this._currentLoadedTime = time;
            if (this._timeDimension && time == this._timeDimension.getCurrentTime() && !this._timeDimension.isLoading()) {
                this._update();
            }
            this.fire('timeload', {
                time: time
            });
        };
        $.getJSON(url, callback.bind(this, 'ok')).fail(callback.bind(this, 'error'));
    },
});

L.timeDimension.layer.ajaxGeoJSON = function(layer, options) {
    return new L.TimeDimension.Layer.AjaxGeoJSON(layer, options);
};