let devices = require("./devices.json");
	
	const send_json = async (res, data) => {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	}
	
	
	const observer = async (data) => {
		let _ret = {};
		data = JSON.parse(data);
		console.log(data);
		let packet = data?.packet;
		let receiver = packet?.device;
		let type = packet?.type;
		let dat = packet?.data;
		let item = packet?.item || 0;
		
		let device = devices.find(dev => dev.name == receiver);
		let itm = device?.items;
		itm = itm.find(el => el.id == item)
		let command = itm?.[dat];
		
		console.log(device, command);
		
		command = JSON.stringify(command);
		
		if (!receiver || receiver == "root") {
			
		} else {
			const response = await fetch('http://' +
				device.ip + ':' + device.port, {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: command
				});
			let body = await response.text();
			
			console.log("response", body);
					
			try {
				body = JSON.parse(body);
				_ret = { ...body };
			} catch (e) {
				_ret["value"] = body || "dead";
			}
			
			//_ret["command"] ? null : _ret["command"] = data["command"];
			_ret["device"] ? null : _ret["device"] = receiver;
			_ret["item"] ? null : _ret["item"] = item  || null;
				
			console.log("_ret", _ret);
			return _ret;		
		}
	}


(main = async () => {
	
	let name = "gateway_1";
	let host = "localhost";
	let port = 8884;
	
	const Xross = require("xross");
	const apps = Xross({ body_parser: true, debug: true });
	
	const http = require("http");
	const url = require("url");
	
	apps.route("/", {method: "ANY"}, (req, res, next) => {
		next();	
	});
	
	apps.route("/*", { method: "POST" }, async (req, res, next) => {
		try {
		res.setHeader('Content-Type', 'application/json');
		res.writeHead(200);
		res.end( JSON.stringify( await observer(req.body) ) );
		} catch (e) {
			console.log(e);
		}
		next();
	});
	
	const server = http.createServer(apps);
	server.listen(port, host, () => console.log(`${name} listen on ${host}:${port}`));
	
})();