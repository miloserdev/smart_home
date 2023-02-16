// message to device through gateway

let msg = {
	device: "relay_array_1",
	"command": {
		pin: "relay_1",
		value: "off"
	}
};


[
	{
	  "id": "relay_1",
	  "pin": 32,
	  "type": "ANALOG",
	  "pinmode": "OUTPUT",
	  "defval": "HIGH",
	  "invert": true
	},
	{
	  "id": "relay_2",
	  "pin": 33,
	  "type": "ANALOG",
	  "pinmode": "OUTPUT",
	  "defval": "LOW",
	  "invert": true
	},
	{
	  "id": "relay_3",
	  "pin": 25,
	  "type": "ANALOG",
	  "pinmode": "OUTPUT",
	  "defval": "HIGH",
	  "invert": true
	},
	{
	  "id": "relay_4",
	  "pin": 26,
	  "type": "ANALOG",
	  "pinmode": "OUTPUT",
	  "defval": "HIGH",
	  "invert": true
	}
]