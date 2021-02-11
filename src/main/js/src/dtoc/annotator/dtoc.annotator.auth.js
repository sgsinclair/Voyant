/**
 * This class recreates the default Auth plugin, but adds custom events:
 * - authenticationSucceeded
 * - authenticationFailed
 */
Annotator.Plugin.Auth = function(element, options) {
    
    Annotator.Plugin.apply(this, arguments);

    this.waitingForToken = [];
    if (this.options.token) {
        this.setToken(this.options.token)
    } else {
        this.requestToken()
    }
};


// some static methods
Annotator.Plugin.Auth.createDateFromISO8601 = function(string) {
    var d, date, offset, regexp, time, _ref2;
    regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" + "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" + "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    d = string.match(new RegExp(regexp));
    offset = 0;
    date = new Date(d[1], 0, 1);
    if (d[3]) {
        date.setMonth(d[3] - 1)
    }
    if (d[5]) {
        date.setDate(d[5])
    }
    if (d[7]) {
        date.setHours(d[7])
    }
    if (d[8]) {
        date.setMinutes(d[8])
    }
    if (d[10]) {
        date.setSeconds(d[10])
    }
    if (d[12]) {
        date.setMilliseconds(Number("0." + d[12]) * 1e3)
    }
    if (d[14]) {
        offset = Number(d[16]) * 60 + Number(d[17]);
        offset *= (_ref2 = d[15] === "-") != null ? _ref2 : {
            1: -1
        }
    }
    offset -= date.getTimezoneOffset();
    time = Number(date) + offset * 60 * 1e3;
    date.setTime(Number(time));
    return date
};

Annotator.Plugin.Auth.base64Decode = function(data) {
    var ac, b64, bits, dec, h1, h2, h3, h4, i, o1, o2, o3, tmp_arr;
    if (typeof atob !== "undefined" && atob !== null) {
        return atob(data)
    } else {
        b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        i = 0;
        ac = 0;
        dec = "";
        tmp_arr = [];
        if (!data) {
            return data
        }
        data += "";
        while (i < data.length) {
            h1 = b64.indexOf(data.charAt(i++));
            h2 = b64.indexOf(data.charAt(i++));
            h3 = b64.indexOf(data.charAt(i++));
            h4 = b64.indexOf(data.charAt(i++));
            bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
            o1 = bits >> 16 & 255;
            o2 = bits >> 8 & 255;
            o3 = bits & 255;
            if (h3 === 64) {
                tmp_arr[ac++] = String.fromCharCode(o1)
            } else if (h4 === 64) {
                tmp_arr[ac++] = String.fromCharCode(o1, o2)
            } else {
                tmp_arr[ac++] = String.fromCharCode(o1, o2, o3)
            }
        }
        return tmp_arr.join("")
    }
};

Annotator.Plugin.Auth.base64UrlDecode = function(data) {
    var i, m, _k, _ref2;
    m = data.length % 4;
    if (m !== 0) {
        for (i = _k = 0, _ref2 = 4 - m; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
            data += "="
        }
    }
    data = data.replace(/-/g, "+");
    data = data.replace(/_/g, "/");
    return Annotator.Plugin.Auth.base64Decode(data)
};

Annotator.Plugin.Auth.parseToken = function(token) {
    var head, payload, sig, _ref2;
    _ref2 = token.split("."), head = _ref2[0], payload = _ref2[1], sig = _ref2[2];
    return JSON.parse(Annotator.Plugin.Auth.base64UrlDecode(payload))
};



Annotator.Plugin.Auth.prototype = new Annotator.Plugin();

Annotator.Plugin.Auth.prototype.options = {
    token: null,
    tokenUrl: "/auth/token",
    autoFetch: true
};

Annotator.Plugin.Auth.prototype.requestToken = function() {
    this.requestInProgress = true;
    return $.ajax({
        url: this.options.tokenUrl,
        dataType: "text",
        xhrFields: {
            withCredentials: true
        }
    }).done(function(_this) {
        return function(data, status, xhr) {
            _this.publish('authenticationSucceeded');
            
            return _this.setToken(data)
        }
    }(this)).fail(function(_this) {
        return function(xhr, status, err) {
            _this.publish('authenticationFailed');
            
            var msg;
            msg = Annotator._t("Couldn't get auth token:");
            console.error("" + msg + " " + err, xhr);
            return Annotator.showNotification("" + msg + " " + xhr.responseText, Annotator.Notification.ERROR)
        }
    }(this)).always(function(_this) {
        return function() {
            return _this.requestInProgress = false
        }
    }(this))
};

Annotator.Plugin.Auth.prototype.setToken = function(token) {
    var _results;
    this.token = token;
    this._unsafeToken = Annotator.Plugin.Auth.parseToken(token);
    if (this.haveValidToken()) {
        if (this.options.autoFetch) {
            this.refreshTimeout = setTimeout(function(_this) {
                return function() {
                    return _this.requestToken()
                }
            }(this), (this.timeToExpiry() - 2) * 1e3)
        }
        this.updateHeaders();
        _results = [];
        while (this.waitingForToken.length > 0) {
            _results.push(this.waitingForToken.pop()(this._unsafeToken))
        }
        return _results
    } else {
        console.warn(Annotator._t("Didn't get a valid token."));
        if (this.options.autoFetch) {
            console.warn(Annotator._t("Getting a new token in 10s."));
            return setTimeout(function(_this) {
                return function() {
                    return _this.requestToken()
                }
            }(this), 10 * 1e3)
        }
    }
};

Annotator.Plugin.Auth.prototype.haveValidToken = function() {
    var allFields;
    allFields = this._unsafeToken && this._unsafeToken.issuedAt && this._unsafeToken.ttl && this._unsafeToken.consumerKey;
    if (allFields && this.timeToExpiry() > 0) {
        return true
    } else {
        return false
    }
};

Annotator.Plugin.Auth.prototype.timeToExpiry = function() {
    var expiry, issue, now, timeToExpiry;
    now = (new Date).getTime() / 1e3;
    issue = Annotator.Plugin.Auth.createDateFromISO8601(this._unsafeToken.issuedAt).getTime() / 1e3;
    expiry = issue + this._unsafeToken.ttl;
    timeToExpiry = expiry - now;
    if (timeToExpiry > 0) {
        return timeToExpiry
    } else {
        return 0
    }
};

Annotator.Plugin.Auth.prototype.updateHeaders = function() {
    var current;
    current = this.element.data("annotator:headers");
    return this.element.data("annotator:headers", $.extend(current, {
        "x-annotator-auth-token": this.token
    }))
};

Annotator.Plugin.Auth.prototype.withToken = function(callback) {
    if (callback == null) {
        return
    }
    if (this.haveValidToken()) {
        return callback(this._unsafeToken)
    } else {
        this.waitingForToken.push(callback);
        if (!this.requestInProgress) {
            return this.requestToken()
        }
    }
};