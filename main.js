


var subMessage = { "event": "subscribe", "pair": ["XBT/USD", "XBT/EUR", "ADA/USD"], "subscription": { "name": "ticker" } }
var authorizied_users = [];

var Websocket = require("ws")


// Kraken Data Receiver

const ws = new Websocket('wss://ws.kraken.com');

ws.on('open', function open() {
	ws.send(JSON.stringify(subMessage));
});

ws.on('message', function message(data) {

	var _data = JSON.parse(data);

	if (_data.event != undefined) {
		console.log(`Passing Event: ${_data.event}`)
	}
	else {
		var symbol_ticker = _data[3];
		var symbol_price = _data[1]["a"][0];

		console.log(`Price of ${symbol_ticker} is ${symbol_price}`);

		for(const userObject of authorizied_users)
		{
			userObject.socket.send(JSON.stringify({
				ticker:symbol_ticker,
				price:symbol_price
			}))
		}
	}


});


// Server

/* {
	socket:"",
	time:""
} */



const wss = new Websocket.Server({ port: 8080 });

wss.on('connection', (client) => {

	client.on('message', (data) => {

		// Inja try catch bayyad use beshe ke server ro crash nakone age data json nabood vali inja anjam nemidam
		var authData = JSON.parse(data);
		if(authData.code != undefined && authData.code == "abcd")
		{
			console.log(`Client Accepted!`);
			authorizied_users.push({
				socket:client,
				time: new Date().getTime()
			})
		}

	});
});