( main = async () => {

	const fs = require("fs");
	
	const Xross = require("xross");
	const app = Xross({ body_parser: true, debug: true });
	
	const http = require("http");
	const host = "localhost";
	const port = 8092;
	const home = "./www/";


	const WebSocket = require("ws");
	var websocket = null;



	const not_found = async (res, json = false) =>
		json ? res.setHeader('Content-Type', 'application/json')
		.end(JSON.stringify({
				"error": "404"
		})) :
		res.writeHead(404).end("not found");


	const gates = require("./gates.json");

	app.route("/*", { method: "GET" }, (req, res, next) => {
		//res.setHeader('Content-Type', 'application/json');
		res.setHeader('Access-Control-Allow-Origin', `*`); //http://${host}:${port}
    	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		
		let href = req.url == "/" ? "index.html" : req.url;
		let dirs = home + href;
		console.log("AAAAAAAAA", dirs, req.url);
		fs.readFile(dirs, async (err, fd) =>
				err ? await not_found(res) : res.writeHead(200).end(fd))
		

		//res.end( JSON.stringify({ response: 200 }) );
		next();
	})
	
	// app.route("/(gateway)/(device)/(item)/(command)", { method: "POST" }, async (req, res, next) => {
	app.route("/", { method: "POST" }, async (req, res, next) => {
		console.log("rer", req.body)
		
		try {
		let _ret;
		
		let datas = JSON.parse(req.body);
			datas = datas.packet;
		let gateway_id = datas.gateway;
		let device = datas.receiver;
		let item = datas.item;
		let command = datas.command;
		
		console.log("fetching", datas);
		
		let gateway = gates.find(e => e.id == gateway_id);
		
		if (gateway) {
			
			const response = await fetch('http://' +
				gateway.host + ':' + gateway.port, {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify( { packet: { device, item, data: command } } )
				});
			let body = await response.text();
			
			console.log("response", body);
					
			try {
				body = JSON.parse(body);
				_ret = body;
			} catch (e) {
				_ret["value"] = body || "dead";
			}

			console.log("_ret", _ret);	
			
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(200);
			res.end( JSON.stringify({ /* request: { device, item, command },*/ response: _ret }) );
		}
		
		} catch (e) {
			console.log(e);
		}
		
		next();
	});



	const broadcast = (data) =>
		websocket ? websocket.clients.forEach(async (client) =>
				client.send(JSON.stringify(data))) : null;

	const ws_handler = async (client) => {

		// console.log(`${client.host} connected`);

		broadcast({
				"log": "new client"
		});

		client.on("message", async (message) => {
				// console.log(`${client.host} -> ${message}`);

				var data = JSON.parse(await message);

				let _ret = await process(data);
				_ret["command"] ? null : _ret["command"] = data["command"];
				_ret["device"] ? null : _ret["device"] = data["device"];
				_ret["item"] ? null : _ret["item"] = data["item"];

				broadcast(_ret);
		});

		client.on("disconnect", async () => {
				// console.log(`${client.host} disconnected`);
		});

		client.on("close", async (client) => {
				// console.log(`${client.host} unhandled close`);
		});
	}
	
	

	
	server = http.createServer({}, app);
	server.listen(port, host, async () => {
		console.log(`\nsmart home started at ${host}:${port}`);
		//_bridge2(host, 8885);
	});

	websocket = new WebSocket.Server({
		port: 8093
	}, () => websocket.on("connection", ws_handler));

	setInterval(() => {
		broadcast({ packet: "HEARTBEAT" });
	}, 1000);

	
})();