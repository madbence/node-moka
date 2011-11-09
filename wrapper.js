var net = require('net');
var child = require('child_process');
var fs = require('fs');

	
var server = net.createServer(function(c) {
	var restart=function(err, fn)
	{
		if(instance != null)
			instance.kill();
		instance=child.fork(__dirname+'/hook2.js');
		instance.on('message', function(m)
		{
			if(m.message != null)
			{
				f.write(m.message);
				// console.log('Child said: '+m.message);
			}
			if(m.restart)
			{
				restart(null,null);
			}
		});
	}
	var instance;
	restart(null,null);
	var watch=fs.watch(__dirname+'/hook2.js', restart);
	var f=net.connect(6669, 'atw.irc.hu');
	f.on('data', function(data)
	{
		// console.log('srv: '+data);
		instance.send({'message':data.toString()});
		c.write(data);
	});
	c.on('data', function(data)
	{
		// console.log('srv: '+data);
		f.write(data);
	});
});
server.listen(8124);