

// Sample to demonstrate the usage of getdns nodejs API and host it
// in an express web context.
// Install from http://expressjs.com/ and follow instructions to setup in the Readme
//
//
// Replace the relative paths with your own path for the install of expressjs
var express = require('../../expressjs/express');
var app = module.exports = express();

// You need getdns and getdns node installed prior to running this sample
// You can install this sample in the root directory of the getdnsnode install directory
// getdns includes. set LD_LIBRARY_PATH to /usr/local/lib
var getdns = require('../../getdnsnode/branch15/getdns-node/getdns');

var options = {
    // request timeout time in millis
    timeout : 5000,
    // always return dnssec status
    return_dnssec_status : true,
    dnssec_return_only_secure : true,
    dnssec_return_validation_chain : true
    };

var repl = function(key, value){
    if(key == "rdata_raw") { 
        return undefined;
    }
    if(key == "signature"){
        return undefined;
    }
    if(key == "certificate_association_data"){
        return undefined;
    }
    return value;
};

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {

// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    if (!input) return "";
    //input = Base64._utf8_encode(input);

    while (i < input.length) {

        chr1 = input[i++];
        chr2 = input[i++];
        chr3 = input[i++];

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

    }

    return output;
},

}
// getdns query callback
var callback = function(err, result) {
        
    process.stdout.write("testing app err = " + JSON.stringify(err));
    // if not null, err is an object w/ msg and code.
    // code maps to a GETDNS_CALLBACK_TYPE
    // result is a response dictionary
    var res1 = "<h1>Response tree</h1>";
    res1 += "<h2>Question: _443._tcp.good.dane.verisignlabs.com TLSA</h2>";
    res1 += "<p>This web page is created using nodejs, the getdns API, in the expressjs framework. Source code available in github/getdnsapi/getdnsnodejsdanesample.</p>";
    if (result == null ) {
        res1 += "<p>No result</p>";
        process.stdout.write("no result\n");
    } else {
        for ( var index in result.replies_tree) {
            process.stdout.write("tree = " +  JSON.stringify(result.replies_tree[index], 0 , 2));
            res1 += "<h3>QUESTION</h3><pre> " + JSON.stringify(result.replies_tree[index].question, 0, 4) + "</pre>";
            res1 += "<h3>HEADER</h3><pre> " + JSON.stringify(result.replies_tree[index].header, 0, 2) + "</pre>";
            if (result.replies_tree[index].dnssec_status == getdns.DNSSEC_SECURE)
                res1 += "<h3>DNSSEC_STATUS</h3><pre> " + "GETDNS_DNSSEC_SECURE" + "</pre>";
            else if (result.replies_tree[index].dnssec_status == getdns.DNSSEC_INSECURE) 
                res1 += "<h3>DNSSEC_STATUS</h3><pre> " + "GETDNS_DNSSEC_INSECURE" + "</pre>";
            res1 += "<h3>CANONICAL_NAME</h3><pre> " + JSON.stringify(result.replies_tree[index].canonical_name, 0, 2) + "</pre>";
            for ( var index1 in result.replies_tree[index].answer) {
                res1 += "<h3>ANSWER</h3><pre> " + JSON.stringify(result.replies_tree[index].answer[index1], repl, 2) + "</pre>";
                if (result.replies_tree[index].answer[index1].rdata.certificate_association_data)
                    res1 += "<h3>CERTIFICATE ASSOCIATION DATA</h3><pre> " + Base64.encode(result.replies_tree[index].answer[index1].rdata.certificate_association_data) + "</pre>";
                if (result.replies_tree[index].answer[index1].rdata.signature)
                    res1 += "<h3>TLSA </h3><pre> " + Base64.encode(result.replies_tree[index].answer[index1].rdata.signature) + "</pre>";
            }
            for ( var index1 in result.replies_tree[index].authority) {
                res1 += "<h3>AUTHORITY</h3><pre> " + JSON.stringify(result.replies_tree[index].authority[index1], repl, 2) + "</pre>";
                if (result.replies_tree[index].authority[index1].rdata.certificate_association_data)
                    res1 += "<h3>CERTIFICATE ASSOCIATION DATA</h3><pre> " + Base64.encode(result.replies_tree[index].authority[index1].rdata.certificate_association_data) + "</pre>";
                if (result.replies_tree[index].authority[index1].rdata.signature)
                    res1 += "<h3>TLSA </h3><pre> " + Base64.encode(result.replies_tree[index].authority[index1].rdata.signature) + "</pre>";
            
            for ( var index1 in result.replies_tree[index].additional) {
                res1 += "<h3>AUTHORITY</h3><pre> " + JSON.stringify(result.replies_tree[index].additional[index1], repl, 2) + "</pre>";
                if (result.replies_tree[index].additional[index1].rdata.certificate_association_data)
                    res1 += "<h3>CERTIFICATE ASSOCIATION DATA</h3><pre> " + Base64.encode(result.replies_tree[index].additional[index1].rdata.certificate_association_data) + "</pre>";
                if (result.replies_tree[index].additional[index1].rdata.signature)
                    res1 += "<h3>TLSA </h3><pre> " + Base64.encode(result.replies_tree[index].additional[index1].rdata.signature) + "</pre>";
            }
         } 
    }
    app.get('/', function(req, res){
        res.send(res1);
    });
    // when done with a context, it must be explicitly destroyed
    context.destroy();
}
}

// create the context with the above options
var context = getdns.createContext(options);

// getdns general
// last argument must be a callback

var transactionId = context.lookup("_443._tcp.good.dane.verisignlabs.com", getdns.RRTYPE_TLSA, callback);

// extensions are passed as dictionaries
// where the value for on / off are normal bools
//context.getAddress("cnn.com", { return_both_v4_and_v6 : true }, callback);


if (!module.parent) {
  app.listen(50000);
  console.log('Express started on port 50000');
}
