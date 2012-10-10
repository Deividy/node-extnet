
xn.UrlBuilder = Ext.extend(Object, {
    constructor: function (baseUrl) {
        // MUST: Implement it in common
        baseUrl = this.proxyHandler(baseUrl);
        //
        this.baseUrl = (baseUrl != '/') ? baseUrl : '';
    },
    // MUST: Implement it in common, Microsoft is bad :(
    proxyHandler: function (baseUrl) {
        var base = baseUrl.split('/');
        var c = 0;
        var link;
        base.forEach(function (url) {
            if (c === 0)
                link = url + "//" + window.location.host;
            if (c > 2)
                link = link + "/" + url;
            c++;
        }); 
        return link;
    },
    // 
    build: function (url, params) {

        url = this.baseUrl + '/' + url;

        if (params) {
            if (arguments.length > 2) {
                tokens = arguments.slice(2);
                params = String.format(params, tokens);
            }

            url += ('?' + params);
        }

        return url;
    }
});