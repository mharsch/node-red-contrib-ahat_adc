module.exports = function(RED) {
	var spawn = require('child_process').spawn;
	var readline = require('readline');

	var adcCommand = __dirname + '/nrahat_adc';
	process.env.PYTHONUNBUFFERED = 1;

	function ADCRead(config) {
		RED.nodes.createNode(this, config);
		var node = this;

		node.child = spawn(adcCommand);

		var reader = readline.createInterface({
			input: node.child.stdout,
			output: null
		});

		node.running = true;
		node.status({fill:"green",shape:"dot",text:"common.status.ok"});

		reader.on('line', function (line) {
			if (line.match(/^Automation/))
				return;

			line = line.trim();
			line = line.replace(/\'/g, '"');

			var obj = JSON.parse(line);
			var messages = Array(4);
			messages[0] = {payload: obj.one};
			messages[1] = {payload: obj.two};
			messages[2] = {payload: obj.three};
			messages[3] = {payload: obj.four};

			node.send(messages);
		});

		this.on('input', function (msg) {
			// read requested values and emit them on the output ports
			node.child.stdin.write(msg.payload + '\n');
		});


		node.child.on('close', function (code) {
			node.running = false;
			node.child = null;
			if (RED.settings.verbose)
				node.log('ahat_adc child process closed');

			if (node.done)
				node.done();
		
		});

		node.on('close', function (done) {
			reader.close();
			if (node.child != null) {
				node.done = done;
				node.child.kill('SIGKILL');
				node.child = null;
			} else {
				done();
			}
		});
	}
	RED.nodes.registerType("ahat_adc", ADCRead);
}
