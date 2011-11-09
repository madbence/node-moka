var _=require('../npm/node_modules/underscore');

var handle=exports.handle=function(msg)
{
	var h=new Hook(msg);
	return h.getResponse();
}

process.on('message', function(msg)
{
	var response=handle(msg.message);
	process.send({'message':response});
});

var Hook=function(data)
{
	this.init(null,console.log);
	try
	{
		if(this.parseData(data) === false)
		{
			//not a message, return
			return;
		}
		if(this.isCommand() === false)
		{
			//definitely not a command, maybe something else?
			
			return;
		}
		if(this.runPreFilter() === false)
		{
			//if rule found, return
			return;
		}
		if(this.commandExists() === false)
		{
			//no command found, respond
			this.respondCommandNotFound();
			return;
		}
		this.runCommand();
	}
	catch(e)
	{
		console.dir(e);
		//console.log(e.lineNumber);
	}
}

//Hook.prototype.constructor=new Hook();
Hook.prototype.config=
{
	name: 'lennon_mokazik',
	prefix: 'l\\.',
	allowedUsers:[/.*/],
	allowedChannels:['#info'],
	allowQuery:true,
	shortManual:false,
	responses:
	{
		commandNotFound:
		[
			'Bocsi, nincs ilyen parancs',
			'Hiaba probalom kitalalni, nem tudom mit akarsz...',
			'404 Not Found',
			'Trukkos, de nincs ilyen :(',
			'Meg nincs ilyen kommand, de majd lesz!',
			'Nem ertem mit akarsz, probald meg ujbol. (de ne ugyanezt :D)',
			'Hasznald a helpet! (ha mar meg nincs implementalva, akkor bocs :D)'
		],
		permissionDenied:
		[
			'Ne abuzalj! Ugyse csinalom neked!',
			'Most epp nincs jogod ilyet csinalni.',
		],
	},
	BBCodes:
	[
		[/\[b\](.*?)\[\/b\]/, '\x02$1\x02'],
		[/\[u\](.*?)\[\/u\]/, '\x1F$1\x1F'],
		[/\[i\](.*?)\[\/i\]/, '\x1D$1\x1D'],
		[/\[r\](.*?)\[\/r\]/, '\x16$1\x16'],
		[/\[c(\d,\d)\](.*?)\[\/c\]/, '\x03$1$2\x16'],
		[/\[c(\d)\](.*?)\[\/c\]/, '\x03$1$2\x16'],
	],
	messageFormat: /:(.*?) PRIVMSG (.*?) :(.*?)\r\n/,
	permissions:
	{
		'lennon': ['*'],
	}
};

Hook.prototype.isCommand=function()
{
	return this.message.search(new RegExp('^'+this.config.prefix)) !== -1;
}

Hook.prototype.runPreFilter=function()
{
	return true;
}
Hook.prototype.commandExists=function()
{
	for(var i=0;i<this.commands.length;i++)
	{
		if(this.cleanMessage.search(new RegExp('^'+this.config.prefix+this.commands[i]['name'])) != -1)
		{
			return true;
		}
	}
	return false;
}
Hook.prototype.runCommand=function()
{
	for(var i=0;i<this.commands.length;i++)
	{
		if(this.cleanMessage.search(new RegExp('^'+this.config.prefix+this.commands[i]['name'])) != -1)
		{
			if(typeof this.commands[i]['permission'] != 'undefined')
			{
				if(!this.hasPermission(this.commands[i]['permission']))
				{
					return;
				}
			}
			var paramString=this.message.match(new RegExp('^'+this.config.prefix+this.commands[i]['name']+'(.*)'));
			if(paramString!=null)
				paramString=paramString[1];
			var succ=this.commands[i].func.call(this,
				paramString.match(
					typeof this.commands[i]['reg'] !== 'undefined' ?
						this.commands[i]['reg'] : / .*/));
			if(!succ)
			{
				this.log('ERROR!');
			}
			return;
		}
	}
}
Hook.prototype.hasPermission=function(perm)
{
	if(!this.config['permissions'][this.sender])
	{
		return false;
	}
	return _.find(this.config['permissions'][this.sender], function(p)
	{
		return p==perm||p=='*';
	});
}

Hook.prototype.respondCommandNotFound=function()
{
	//this.sendMessage({'message': _.shuffle(this.config.responses.commandNotFound)[0]});
}

Hook.prototype.writeMessage=function(str)
{
	//this.socket.write(str);
	this.response=str;
}

Hook.prototype.getResponse=function()
{
	return typeof this.response != 'undefined' ? this.response : null;
}

Hook.prototype.composeMessage=function(options)
{
	if(typeof options.recipient == 'undefined')
	{
		options.recipient=this.channel;
	}
	if(typeof options.sender == 'undefined')
	{
		options.sender=this.sender;
	}
	if(typeof options.message == 'undefined')
	{
		throw new Exception('Meg kell adni uzenetet!');
	}
	return 'PRIVMSG '+options.recipient+' :'+
		(typeof options.sender === 'undefined'?
			'':
			options.sender+': ')+
		options.message+'\r\n';
}

Hook.prototype.formatMessage=function(str)
{
	for(var i=0;i<this.config.BBCodes.length;i++)
	{
		str=str.replace(this.config.BBCodes[i][0], this.config.BBCodes[i][1]);
	}
	return str;
}

Hook.prototype.clearInput=function(str)
{
	return str.
		replace(/\x02/g, '').
		replace(/\x1F/g, '').
		replace(/\x1D/g, '').
		replace(/\x16/g, '').
		replace(/\x03\d,\d/g, '').
		replace(/\x03\d/g, '').
		replace(/\x03/g, '');
}

Hook.prototype.parseData=function(d)
{
	this.data=d.toString().match(this.config.messageFormat);
	if(this.data!=null)
	{
		this.message=this.data[3];
		this.message=this.message.replace(/ *$/, '');
		this.cleanMessage=this.clearInput(this.message);
		this.sender=this.data[1].match(/(.*?)!/)[1];
		this.channel=this.data[2][0]=='#'?this.data[2]:this.sender;
		if(this.sender == null)
		{
			return false;
		}
	}
	else
	{
		return false;
	}
}
Hook.prototype.init=function(socket, log)
{
	console.log('INIT');
	if(socket==null||log==null)
	{
		return;
	}
	Hook.prototype.log=log;
	Hook.prototype.init=function(){};
}

Hook.prototype.sendMessage=function(options)
{
	if(typeof options === 'string')
	{
		options={'message':options};
	}
	this.writeMessage(this.composeMessage(options));
}
Hook.prototype.commands=
[
	require(__dirname+'/bot/command/calc.js').command,
	require(__dirname+'/bot/command/help.js').command,
	require(__dirname+'/bot/command/cica.js').command,
	require(__dirname+'/bot/command/uptime.js').command,
	require(__dirname+'/bot/command/about.js').command,
	require(__dirname+'/bot/command/restart.js').command,
];
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	