var net = require('net');
var http = require('http');
var fs = require('fs');
var instance;
var f;
var restart=function(err, fn)
	{
		console.log('Restarting...');
		delete require.cache[__dirname+'\\hook.js'];
		try
		{
			instance=require(__dirname+'/hook.js');
			instance.IRC.send=function(m){/*console.log('cli:'+m);*/f.write(m);}
		}
		catch(e)
		{
			console.log(e);
		}
	}

	/*
var server = net.createServer(function(c) {
	restart(null,null);
	var watch=fs.watch(__dirname+'/hook.js', restart);
	f=net.connect(6669, 'atw.irc.hu', function(succ)
	{
		//instance.connect();
	});
	f.on('data', function(data)
	{
		instance.send(data.toString());
		console.log(data.toString());
		c.write(data);
	});
	c.on('data', function(data)
	{
		f.write(data);
		console.log(data.toString());
	});
});
server.listen(8124);*/


restart(null,null);
var watch=fs.watch(__dirname, restart);
f=net.connect(6669, 'atw.irc.hu', function(succ)
{
	instance.connect();
});
f.on('data', function(data)
{
	instance.send(data.toString());
	console.log('srv:'+data.toString().replace(/\r\n$/, ''));
});

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
  for(var i=0;i<instance.log.messages.length;i++)
	{
		res.write(instance.log.messages[i]+'\n');
	}
	res.end();
}).listen(1337);