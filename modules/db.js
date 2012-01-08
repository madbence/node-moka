var util=require('../util.js');
var client=require('./mongo.js').client;
var databaseAPI=
{
	create: function(owner, name, content, clb)
	{
		client.insert(
			'db',
			{
				'owner': owner,
				'created': new Date().getTime(),
				'modified': new Date().getTime(),
				'modifier': owner,
				'name': name,
				'content': [content]
			},
			function(s){clb(null,s);},
			function(s){clb(s,null);});
	},
	get: function(name, clb)
	{
		client.find(
			'db',
			{'name':this.nameRegExp(name)},
			function(s)
			{
				if(!s.length)
				{
					clb(1, 'Nincs ilyen bejegyzes');
				}
				else
				{
					clb(null, s[0]);
				}
			},
			function(s)
			{
				clb(s, null);
			});
	},
	append: function(modifier, name, content, clb)
	{
		client.update(
			'db',
			{'name':this.nameRegExp(name)},
			{'$set':{'modified':new Date().getTime(), 'modifier': modifier},
			 '$push':{'content': content}},
			function(s)
			{
				clb(null, s);
			},
			function(s)
			{
				clb(s,null);
			});
	},
	search: function(content, clb)
	{
		client.find(
			'db',
			{'content': new RegExp(content)},
			function(s)
			{
				clb(null, s);
			},
			function(s)
			{
				clb(s, null);
			});
	},
	nameRegExp: function(name)
	{
		console.log(new RegExp('^'+name.replace(/([a-z0-9])/g, '$1[a-z0-9]*?-?')));
		return new RegExp('^'+name.replace(/([a-z0-9])/g, '$1[a-z0-9]*?-?'));
	}
	
}

/**
owner
created
modified
modifier
name
content
*/

exports.commands=
[
	{
		'name': 'db',
		'func': function(params)
		{
			var that=this;
			var name=util.trimHyphens(util.toASCII(params[2]||''));
			if(name == '' || name == '-')
			{
				return;
			}
			switch(params[1])
			{
				case 'h':
				case 'help':
					//that.reply(params[0]+' [create|c|get|g|help|h|info|i|append|a] name');
					break;
				case 'c':
				case 'create':
					databaseAPI.create(this.getUser(), name, params.slice(3).join(' '), function(err,succ)
					{
						if(err)
						{
							switch(err)
							{
								case 1:
									that.reply(succ);
									break;
								default:
									that.reply('Hiba tortent.');
							}
							return;
						}
						that.reply(name+' letrehozva.');
					});
					break;
				case 'g':
				case 'get':
					databaseAPI.get(name, function(err,succ)
					{
						if(err)
						{
							switch(err)
							{
								case 1:
									that.reply(succ);
									break;
								default:
									that.reply('Hiba tortent.');
							}
							return;
						}
						var result=succ['content'].join(' || ');
						if(result.length>400)
						{
							result=result.substr(0, 400)+'...'
						}
						that.reply(succ['name']+': '+result);
					});
					break;
				case 'i':
				case 'info':
					databaseAPI.get(name, function(err, succ)
					{
						if(err)
						{
							switch(err)
							{
								case 1:
									that.reply(succ);
									break;
								default:
									that.reply('Hiba tortent.');
							}
							return;
						}
						var created=util.dateFormatter(new Date(succ['created']), '%Y. %F %j-%S, %D %H:%i:%s');
						var modified=util.dateFormatter(new Date(succ['modified']), '%Y. %F %j-%S, %D %H:%i:%s');
						that.reply(succ['name']+': letrehozta '+succ['owner']+' '+created+', utoljara modositotta '+succ['modifier']+' '+modified);
					});
					break;
				case 'a':
				case 'app':
				case 'append':
					databaseAPI.append(this.getUser(), name, params.slice(3).join(' '), function(err,succ)
					{
						if(err)
						{
							switch(err)
							{
								case 1:
									that.reply(succ);
									break;
								default:
									that.reply('Hiba tortent.');
							}
							return;
						}
						if(succ)
						{
							that.reply(name+' frissitve!');
						}
						else
						{
							that.reply('Hoppa, nincs ilyen bejegyzes');
						}
					});
					break;
				case 's':
				case 'search':
					databaseAPI.search(params.slice(2).join(' '), function(err, succ)
					{
						if(err)
						{
							that.reply('Hiba tortent!');
						}
						else
						{
							if(succ.length==0)
							{
								that.reply('Nincs talalat :-(');
							}
							else
							{
								var a=[];
								for(var i=0;i<succ.length;i++)
								{
									a[i]=succ[i]['name'];
								}
								var result=a.join(', ');
								if(result.length>400)
								{
									result=result.substr(0, 400)+'...';
								}
								that.reply(succ.length+' talalat: '+result);
							}
						}
					});
					break;
					default:
						params[1]='get';
						params[2]='help';
						arguments.callee.call(this, params);
			}
		}
	}
];