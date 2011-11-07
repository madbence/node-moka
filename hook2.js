Hook=function(socket, data)
{
	this.init(socket,console.log);
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
	prefix: 'l.',
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

Hook.prototype.respondCommandNotFound=function()
{
	this.sendMessage({'message': _.shuffle(this.config.responses.commandNotFound)[0]});
}

Hook.prototype.writeMessage=function(str)
{
	this.socket.write(str);
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
	//console.log('Hook initialised!');
	//console.log(socket);
	if(socket==null||log==null)
	{
		return;
	}
	this.socket=socket;
	this.log=log;
	//This is magic!
	//Hook.prototype.init=function(ss,l){console.log(ss);};
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
	{
		name: 'calc',
		man: 
		[
			'"%c [-t] [-v] \x1Dexpression\x1D"',
			'-t opcioval meri a futasidot',
			'-v bovebb info a hibarol',
			'\x1DMath\x1D objektum hasznalhato a \x1DMath\x1D elotag nelkul',
		],
		reg: / (-t )?(-v )?(.*)/,
		func: function(params)
		{
			var context=vm.createContext({});
			var start=new Date();
			var measure=typeof params[1] != 'undefined';
			var verbose=typeof params[2] != 'undefined';
			var expression=params[3];
			try
			{
				if(expression.search(/for|while|do|function/)!=-1)
				{
					throw new Error('Legyszi meg ne hasznalj mindenfele JS okossagot :)');
				}
				expression=expression.replace(/(sin|cos|asin|acos|tan|atan|atan2|abs|ceil|exp|floor|round|log|max|min|pow|random|sqrt|PI|E|LN2|LN10|LOG10E|LOG2E|SQRT1_2|SQRT_2)/gi,
					'Math.$1').replace('Math.Math.', 'Math.');
				vm.runInContext('this.res='+expression, context);
				var message=context.res+(measure?' ('+(new Date().getTime()-start)+'ms)':'');
				this.sendMessage({'message':message});
				return true;
			}
			catch(e)
			{
				console.log(e);
				console.log(params);
				var message=verbose?e.message:'Hiba :(';
				this.sendMessage({'message':message});
				return false
			}
		}
	},
	{
		name: 'help',
		man: 
		[
			'"%c command"'
		],
		func: function(params)
		{
			if(params==null)
			{
				var message='Elerheto parancsok: ';
				for(var i=0;i<this.commands.length;i++)
				{
					message+=this.commands[i]['name']+' ';
				}
				this.sendMessage({'message':message});
				return true;
			}
			else
			{
				for(var i=0;i<this.commands.length;i++)
				{
					if(this.commands[i]['name'] == params[0].substr(1))
					{
						this.sendMessage({'message':
							'Hasznalat: '+this.commands[i]['man'].join(', ').replace('%c', this.config.prefix+this.commands[i]['name'])});
						return true;
					}
				}
				this.respondCommandNotFound();
				return true;
			}
		}
	},
	{
		name: 'cica',
		man:
		[
			'"%c", megmondja mennyi ido mulva valtozik at _VauViktor',
		],
		func: function(params)
		{
			var target=new Date();
			target.setHours(1);
			target.setMinutes(8);
			target.setSeconds(0);
			if(new Date().getHours()>1||(new Date().getHours()==target.getHours()&&new Date().getMinutes()>target.getMinutes()))
			{
				target.setTime(target.getTime()+3600*24*1000);
			}
			var diff=(target-new Date().getTime())/1000
			var targetString=
				diff>3600?
					(Math.floor(diff/3600)+' ora, '+(Math.floor(diff/60)%60)+' perc'):
					(diff>60?
						((Math.floor(diff/60)%60)+' perc, '+Math.floor(diff)+' masodperc!'):
						(Math.floor(diff)+' masodperc!!!'));
			var targetHint=(target.getHours()<10?'0'+target.getHours():target.getHours())+':'+(target.getMinutes()<10?'0'+target.getMinutes():target.getMinutes());
			this.sendMessage({'message':'Cicafoldig ('+targetHint+') meg '+targetString});
			return true;
		}
	},
	{
		name: 'uptime',
		man:
		[
			'"%c", megmondja miota fut a bot',
		],
		func: function(params)
		{
			var ut=process.uptime();
			utString=
				Math.floor(ut/3600/24)+':'+
				(((ut/3600)%3600)<10?'0':'')+Math.floor((ut/3600)%3600)+':'+
				(((ut/60)%60)<10?'0':'')+Math.floor((ut/60)%60)+':'+
				((ut%60)<10?'0':'')+Math.floor(ut%60);
			this.sendMessage({'message':'uptime: '+utString});
			return true;
		}
	},
	{
		name: 'about',
		man:
		[
			'"%c"',
			'szerintem nyilvanvalo mit csinal'
		],
		func: function(params)
		{
			this.sendMessage('Node.js bot, amit \x02lennon\x02 fabrikalt, fabrikalgat most is (vagy epp nem)');
			return true;
		}
	}
];
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	