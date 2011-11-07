var net = require('net');
var fs = require('fs');
var vm = require('vm');
var _ = require('../npm/node_modules/underscore');

var server = net.createServer(function(c) {
	var Hook=null;
	try
	{
		eval(fs.readFileSync(__dirname+'/hook2.js', 'utf8'), 'hook2.js');
	}
	catch(e)
	{
		console.log(e);
	}
	
	var watch=fs.watch(__dirname+'/hook2.js', function(err, fn)
	{
		console.log('Changed hook2.js!');
		try
		{
			eval(fs.readFileSync(__dirname+'/hook2.js', 'utf8'), 'hook2.js');
		}
		catch(e)
		{
			console.log('out error');
			console.dir(e);
		}
	});
	
	var forward=net.createConnection(6669, 'atw.irc.hu');
	forward.on('data', function(data)
	{
		if(Hook!=null)
		{
			//console.log('valami data', data);
			new Hook(forward, data);
		}
		console.log('srv: '+data.toString().replace('\r\n',''));
		c.write(data);
	});
	c.on('data', function(data)
	{
		console.log('cli: '+data.toString().replace('\r\n',''));
		forward.write(data);
	});
});
server.listen(8124);