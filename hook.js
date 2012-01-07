var _=require('../npm/node_modules/underscore');
var fs=require('fs');
var util=require('./util.js');

var connect=exports.connect=function()
{
	IRC.send('CAP LS\nNICK lennon_mokazik\nUSER lennon_mokazik 0 * :...\n');
}
var log;
exports.log=log=
{
	log:[],
	messages:[],
	logMessage: function(m)
	{
		this.messages.push(m);
	},
}

var Hook=function(m)
{
	this.init();
	this._handle(m);
}
var send;
exports.send=send=function(m)
{
	var response=new Hook(m);
}

var IRC;
var notLoaded=function(){console.log('IRC not loaded!');};
exports.IRC=IRC=
{
	send: notLoaded,
	restart: notLoaded,
}

var queue=
{
	queue: [],
	queueNames: {},
	put: function(cmd, name)
	{
		name=name||'global';
		if(typeof this.queueNames[name] == 'undefined')
		{
			this.queueNames[name]=this.queue.length;
			this.queue[this.queueNames[name]]=[];
		}
		this.queue[this.queueNames[name]].push(cmd);
	},
	tick: function()
	{
		for(var i=0;i<this.queue.length;i++)
		{
			if(this.queue[i].length)
			{
				var m=this.queue[i].shift();
				IRC.send(m);
				//process.send({'message': m});
			}
		};
	}
};

setInterval(function(){queue.tick()}, 2000);

Hook.prototype._config=require('./config.js').config;
Hook.prototype.commands=[];
Hook.prototype.regexpListeners=[];

Hook.prototype.init=function()
{
	this.log('Starting hook...');
	modules=fs.readdirSync(__dirname+'/modules/');
	for(var i=0;i<modules.length;i++)
	{
		if(modules[i].match(/\.js$/))
		{
			delete require.cache[__dirname+'\\modules\\'+modules[i]];
			this.addModule(require(__dirname+'\\modules\\'+modules[i]));
		}
		else
		{
			//this.log(modules[i]);
		}
	}
	Hook.prototype.init=function(){};
}
Hook.prototype.addModule=function(m)
{
	if(m.commands)
	{
		for(var i=0;i<m.commands.length;i++)
		{
			Hook.prototype.commands.push(m.commands[i]);
		}
	}
	if(m['listeners'])
	{
		for(var i=0;i<m['listeners'].length;i++)
		{
			if(m['listeners'][i]['regexp'])
			{
				this.addRegexpListener(m['listeners'][i]['regexp'], m['listeners'][i]['func']);
			}
		}
	}
	if(typeof m.onInit == 'function')
		m.onInit.call(this);
}
Hook.prototype.addRegexpListener=function(regexp, clb)
{
	this.regexpListeners.push({'pattern':regexp, 'callback':clb});
}

Hook.prototype.log=function()
{
	for(var i=0;i<arguments.length;i++)
	{
		//arguments[i]=arguments[i].replace('\r\n', '');
	}
	//this.logger.history.push(arguments);
	console.log.apply(this, arguments);
	log.log.push(
	{
		date: new Date(),
		content: arguments,
	});
}
Hook.prototype._handle=function(message)
{
	try
	{
		var isMessage=message.match(/^:(.*?) PRIVMSG (.*?) :(.*)\r\n/);
		if(isMessage)
		{
			return this.handleMessage(isMessage[1], isMessage[2], isMessage[3]);
		}
		var isPing=message.match(/^PING/);
		var isPong=message.match(/^PONG/);
		if(isPing || isPong)
		{
			if(isPing)
			{
				this.pong(this._config['server']);
				this.log('PING');
			}
			else
			{
				this.log('PONG');
			}
		}
	}
	catch(e)
	{
		this.log(e);
	}
}
Hook.prototype.handleMessage=function(sender, channel, message)
{
	this._user=sender.match(/^(.*?)!/)[1];
	this._channel=channel;
	this._rawMessage=message;
	this._cleanMessage=message; //this._sanitize(message);
	log.logMessage(util.dateFormatter(new Date(), '[%H:%i:%s] ')+channel+' '+this.getUser()+': '+this.getMessage())
	var temp;
	if(temp=message.match(/^\x01PING (\d+?)\x01$/))
	{
		IRC.send(this._cmd('NOTICE', this.getUser()+' :'+String.fromCharCode(1)+'PING '+temp[1]+String.fromCharCode(1), 0));
	}
	if(temp=message.match(/^\x01VERSION\x01$/))
	{
		IRC.send(this._cmd('NOTICE', this.getUser()+' :'+String.fromCharCode(1)+'VERSION NodeJS IRC bot, (c) lennon'+String.fromCharCode(1), 0));
	}
	if(temp=message.match(/^\x01TIME\x01$/))
	{
		IRC.send(this._cmd('NOTICE', this.getUser()+' :'+String.fromCharCode(1)+'TIME '+(new Date().toString())+String.fromCharCode(1), 0));
	}
	if(temp=message.match(/^\x01FINGER\x01$/))
	{
		IRC.send(this._cmd('NOTICE', this.getUser()+' :'+String.fromCharCode(1)+'FINGER MEG NE UJJAZZ!!!4'+String.fromCharCode(1), 0));
	}
	if(message.match(/^(s|S)zem(e|é)lyg(e|é)pj(a|á)rm(u|ű)re\?$/))
	{
		this.say('nem, kajakra!');
	}
	if(message.match(/^(K|k)ajakra\?$/))
	{
		this.say('nem, szemelygepjarmure!');
	}
	if(message.match(/^0x202e$/))
	{
		this.say('123456789'+String.fromCharCode(0x202e)+'123456789');
	}
	if(this.getMessage().match(this._config['commandPrefix']))
	{
		this.handleCommand(message.split(' '));
		//this._executeCmd(this.reply('szia'));
	}
	this.checkListeners(this.getMessage());
}

Hook.prototype.handleCommand=function(args)
{
	this._command=args[0].slice(2);
	if(!this.commandExists(this._command))
	{
		return;
	}
	if(this.hasPermission(this._command, this._user))
	{
		this.runCommand(this._command, args);
	}
}

Hook.prototype._executeCmd=function(s,name)
{
	queue.put(s,name);
	//this.log(s);
	//process.send({'message': s});
}
Hook.prototype.send=function(s)
{
	//console.log('queue['+this.getChannel()+'].put('+s+')');
	this._executeCmd(s, this.getChannel());
}

/***********************************************
Command related stuff
***********************************************/
Hook.prototype.commandExists=function(command)
{
	for(var i=0;i<this.commands.length;i++)
	{
		if(this.commands[i]['name']==command)
		{
			return true;
		}
	}
	return false;
}
Hook.prototype.hasPermission=function(command, user)
{
	return true;
}
Hook.prototype.runCommand=function(command, args)
{
	for(var i=0;i<this.commands.length;i++)
	{
		if(this.commands[i]['name']==command)
		{
			try
			{
				this.log(this.getUser()+': '+args.join(' '));
				this.commands[i]['func'].call(this, args, this.commands[i]);
			}
			catch(error)
			{
				console.log(error);
			}
			return;
		}
	}
}
/***********************************************
Primitive IRC methods
(message constructing, etc.)
***********************************************/
Hook.prototype._cmd=function(cmd, params, x)
{
	if(x)
		this.send(cmd+' '+params+'\n');
	return cmd+' '+params+'\n';
}
Hook.prototype._message=function(to, message, sendName, x)
{
	return this._cmd('PRIVMSG', to+' :'+(sendName?(sendName+': '):'')+message, x);
}
Hook.prototype._reply=function(msg, sendName, x)
{
	return this._message(this.getReplyAddress(), msg, sendName, x);
}
/***********************************************
Basic IRC methods
***********************************************/
Hook.prototype.say=function(message, x)
{
	x=x||true;
	return this._message(this.getReplyAddress(), message, null, x);
}
Hook.prototype.reply=function(msg, x)
{
	x=x||true;
	return this._reply(msg, this.isQuery()?false:this.getUser(), x);
}
Hook.prototype.nick=function(newNick)
{
	this._cmd('NICK', newNick, true);
}
Hook.prototype.join=function(channel)
{
	this._cmd('JOIN', channel, true);
	this._cmd('MODE', channel, true);
}
Hook.prototype.leave=function(channel, message)
{
	this._cmd('PART', channel+(message?' :'+message:''), true);
}
Hook.prototype.op=function(users, channel)
{
	this._cmd('MODE', (channel?channel:this.getChannel())+' +o '+users, true);
}
Hook.prototype.deop=function(users, channel)
{
	this._cmd('MODE', (channel?channel:this.getChannel())+' -o '+users, true);
}
Hook.prototype.pong=function(server)
{
	IRC.send(this._cmd('PONG', ':'+server, false));
}
/***********************************************
Message related methods
***********************************************/
Hook.prototype.getReplyAddress=function()
{
	return this.isQuery()?this.getUser():this.getChannel();
}
Hook.prototype.getChannel=function()
{
	return this._channel;
}
Hook.prototype.isQuery=function()
{
	return this._channel[0]!='#';
}
Hook.prototype.isChannel=function()
{
	return !this.isQuery();
}
Hook.prototype.getUser=function()
{
	return this._user;
}
Hook.prototype.getMessage=function(raw)
{
	return raw?this._rawMessage:this._cleanMessage;
}

Hook.prototype.checkListeners=function(message)
{
	for(var i=0;i<this.regexpListeners.length;i++)
	{
		var match;
		console.log(this.regexpListeners[i]['pattern'], message);
		if(match=message.match(this.regexpListeners[i]['pattern']))
		{
			this.regexpListeners[i]['callback'].call(this, match);
			return;
		}
	}
}

process.on('message', function(msg)
{
	var response=new Hook(msg.message);
	//process.send({'message':response});
});