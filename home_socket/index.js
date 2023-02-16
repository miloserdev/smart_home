( main = async () => {
	
	const Xross = require("xross");
	const app = Xross({ body_parser: true, debug: true });
	
	const http = require("http");
	const host = "localhost";
	const port = 8092;
	

	const gates = [
		{ id: "gateway_1", host: host, port: 8884 },
		{ id: "gateway_2", host: host, port: 8885 },
	];

	app.route("/*", { method: "GET" }, (req, res, next) => {
		//res.setHeader('Content-Type', 'application/json');
		res.setHeader('Access-Control-Allow-Origin', `*`); //http://${host}:${port}
    	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.writeHead(200);
		res.end( JSON.stringify({ response: 200 }) );
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
	})
	
	

	
	server = http.createServer({}, app);
	server.listen(port, host, async () => {
		console.log(`\nsmart home started at ${host}:${port}`);
		//_bridge2(host, 8885);
	});
	
})();