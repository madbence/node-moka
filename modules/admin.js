exports.commands=
[
	{
		name: 'join',
		func: function(params)
		{
			if(this.getUser() != 'lennon')
			{
				this.reply('csak lennon parancsol nekem! :<');
				return;
			}
			if(params[1].charAt(0) == '#')
			{
				this.join(params[1]);
			}
		}
	},
	{
		name: 'leave',
		func: function(params)
		{
			if(this.getUser() != 'lennon')
			{
				this.reply('csak lennon parancsol nekem! :<');
				return;
			}
			if(params[1] && params[1].charAt(0) == '#')
			{
				this.leave(params[1], params[2]);
			}
			else
			{
				this.leave(this.getChannel());
			}
		}
	},
	{
		name: 'nick',
		func: function(params)
		{
			if(this.getUser() != 'lennon')
			{
				this.reply('csak lennon parancsol nekem! :<');
				return;
			}
			if(params[1])
			{
				this.nick(params[1]);
			}
		}
	},
	{
		name: 'op',
		func: function(params)
		{
			if(this.getUser() != 'lennon')
			{
				this.reply('csak lennon parancsol nekem! :<');
				return;
			}
			if(params[1])
			{
				this.op(params[1]);
			}
		}
	},
	{
		name: 'dfd',
		func: function(params)
		{
			if(params[1])
			{
				this.reply('Kell a'+(params[1].match(/^(b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|w|x|y|z)/i)?'':'z')+' '+params.slice(1).join(' ')+' belsejebe 7 processz, meg par store, meg mindenfele nyilak!');
			}
		}
	}
]