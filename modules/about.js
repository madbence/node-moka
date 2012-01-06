exports.commands=
[
	{
		name: 'about',
		man:
		[
			'"%c"',
			'szerintem nyilvanvalo mit csinal'
		],
		func: function(params)
		{
			this.reply('Node.js bot, amit \x02lennon\x02 fabrikalt, fabrikalgat most is (vagy epp nem)');
			return true;
		}
	}
]