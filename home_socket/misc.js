( main = async () => {
	
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
	
	/*
	*/

	 
	const url = require("url");
	const net = require("http");
	const host = "192.168.1.69";
	const port = 8092;
	
	
	const send_json = async (res, data) => {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(data));
	}
	
	
	const observer = async (data) => {
		let packet = data?.packet;
		let receiver = packet?.receiver;
		let type = packet?.type;
		let dat = packet?.data;
		let item = packet?.item || 0;
		
		let device = devices.find(dev => dev.name == receiver);
		console.log("device", device);
		let command = device?.items[item][dat];
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
			
			console.log("body", body);
		}
	}
	
	
	
	const get_handler = async (req, res, query) => {
		res.writeHead(200);
		res.end("HTML");
	}
	
	
	const post_handler = async (req, res, query) => {
		try {
			var body = '';
			req.on('data', async (data) => {
				try {
					body += data;
					// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
					if (body.length > 1e6) {
						// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
						req.connection.destroy();
					}
				} catch (e) {
					// console.log(c.col_err("at req.on(data) "), e)
				}
			});

			req.on('end', async () => {
				try {
					//var POST = qs.parse(body);
					var obj = JSON.parse(body);

					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(await observer(obj)));
				} catch (e) {
					// console.log(c.col_err("at req.on(end) "), e);
				}
			});
		} catch (e) {
			// console.log(c.col_err("at post listener "), e);
		}	
	}
	
	const listener = async (req, res) => {
		
		domain = req.headers.host.split(".");
		domain.pop();
		req.domain = domain.join();
		
		let query = url.parse(req.url, true);
		console.log(`${req.method} ${query.href} ${query}`)
		await (req.method == "GET" ?
			get_handler : post_handler)(req, res, query);

	};
	
	
	server = net.createServer({}, listener);
	server.listen(port, host, () => console.log(`${host}:${port}`))
	
})();