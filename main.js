


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



const wss = new Websocket.Server({ port: 8181 });

wss.on('connection', (client) => {

	client.on('message', (data) => {

		// Inja try catch bayyad use beshe ke server ro crash nakone age data json nabood vali inja anjam nemidam
		var authData = JSON.parse(data);
		if(authData.code != undefined && authData.code == "abcd")
		{

			var userObject = authorizied_users.find(_user => _user.socket == client);
			if(userObject == undefined)
			{
				console.log(`Client Accepted!`);
				authorizied_users.push({
					socket:client,
					time: new Date().getTime()
				})
			}
			else
			{
				console.log(`client time updated`);
				userObject.time = new Date().getTime();

			}

			
		}

	});
});



// Interval zadan tebghe tajrobe man ziad khoob nist chon bazi oghat momkene yeho dead beshan vali inja use kardam bara test
setInterval(() => {

	console.log(`Checking Users ...`)
	for(var x = authorizied_users.length-1;x>=0;x--)
	{
		var userObject = authorizied_users[x];
		if((new Date().getTime() - parseInt(userObject.time)) > 5000)
		{
			userObject.socket.close();
			authorizied_users.splice(x, 1);
		}
	}


}, 1000);
