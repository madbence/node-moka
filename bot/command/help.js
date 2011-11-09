exports.command=
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
};