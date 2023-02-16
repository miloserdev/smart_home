let devices = [
	{"id":0,"name":"root","type":"bridge","ip":"localhost","port":8092,"items":[
		{"id":"door1","type":"phantom"},
		{"id":"door2","type":"phantom"},
		{"id":"intercom_1","type":"phantom stream"}]},
		{"id":2,"name":"esp01_relay","type":"switch","ip":"192.168.1.101","port":8081,"items":[
			{"id":0,"turn_on":[{"relay":0}],"turn_off":[{"relay":1}],"status":[{"relay":"state"}]}
		]},
		{"id":1,"name":"relay_array_1","type":"switch","ip":"192.168.1.65","port":8081,"items":[
			{"id":32,"turn_on":[{"digitalWrite":{"pin":32,"value":0}}],"turn_off":[{"digitalWrite":{"pin":32,"value":1}}],"status":[{"digitalRead":{"pin":32}}]},
			{"id":33,"turn_on":[{"digitalWrite":{"pin":33,"value":0}}],"turn_off":[{"digitalWrite":{"pin":33,"value":1}}],"status":[{"digitalRead":{"pin":33}}]},
			{"id":25,"turn_on":[{"digitalWrite":{"pin":25,"value":0}}],"turn_off":[{"digitalWrite":{"pin":25,"value":1}}],"status":[{"digitalRead":{"pin":25}}]},
			{"id":26,"turn_on":[{"digitalWrite":{"pin":26,"value":0}}],"turn_off":[{"digitalWrite":{"pin":26,"value":1}}],"status":[{"digitalRead":{"pin":26}}]}
		]}
	]
	
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