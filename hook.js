var _=require('../npm/node_modules/underscore');

console.log('Hook started!');

var Hook=function(m)
{
	this._handle(m);
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
				process.send({'message': this.queue[i].shift()});
			}
		};
	}
};

setInterval(function(){queue.tick()}, 2000);

Hook.prototype._config=require('./config.js').config;


Hook.prototype.log=function()
{
	for(var i=0;i<arguments.length;i++)
	{
		//arguments[i]=arguments[i].replace('\r\n', '');
	}
	//this.logger.history.push(arguments);
	console.log(arguments);
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
				this.log('PING');
			else
				this.log('PONG');
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
	// if(message.match(/lennon/))
	// {
		// this._executeCmd(this.reply('szia'));
		// this._executeCmd(this.reply('szia'));
		// this._executeCmd(this.reply('szia'));
	// }
	if(this.getMessage().match(this._config['commandPrefix']))
	{
		this.handleCommand(message.split(' '));
	}
}

Hook.prototype.handleCommand=function(args)
{
	this._command=args[0].slice(2);
	if(!this.commandExists(this._command))
	{
		//
		return;
	}
	if(this.hasPermission(this._command, this._user))
	{
		this.runCommand(this._command, args);
	}
}

Hook.prototype._executeCmd=function(s,name)
{
	queue.put(s,name)
	//process.send({'message': s});
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
			this.commands[i].call(this, args, this.commands[i]);
			return;
		}
	}
}
/***********************************************
Primitive IRC methods
(message constructing, etc.)
***********************************************/
Hook.prototype._cmd=function(cmd, params)
{
	return cmd+' '+params+'\n';
}
Hook.prototype._message=function(to, message, sendName)
{
	return this._cmd('PRIVMSG', to+' :'+(sendName?(sendName+': '):'')+message);
}
Hook.prototype._reply=function(msg, sendName)
{
	return this._message(this.getReplyAddress(), msg, sendName);
}
Hook.prototype.reply=function(msg)
{
	return this._reply(msg, this.isQuery()?false:this.getUser());
}
/***********************************************
Message related methods
***********************************************/
Hook.prototype.getReplyAddress=function()
{
	return this.isQuery?this.getUser():this.getChannel();
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

Hook.prototype.addMessageListener=function(listener)
{
	this._messageListeners.push(listener);
}


process.on('message', function(msg)
{
	var response=new Hook(msg.message);
	//process.send({'message':response});
});