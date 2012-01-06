var cp=require('child_process');
var instances=0;
exports.commands=
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
		func: function(params)
		{
			var start=new Date().getTime();
			var verbose=false;
			var measure=false;
			var that=this;
			for(var i=0;i<params.length;i++)
			{
				switch(params[i])
				{
					case '-v': verbose=true; break;
					case '-t': measure=true; break;
				}
			}
			var expression=params.slice(verbose+measure+1).join(' ');
			console.log(expression);
			try
			{
				if(expression.search(/require|eval|process/)!=-1)
				{
					this.reply('gonosz dolgokat nem szabad!');
					return;
				}
				expression=expression.replace(/(sin|cos|asin|acos|tan|atan|atan2|abs|ceil|exp|floor|round|log|max|min|pow|random|sqrt|PI|E|LN2|LN10|LOG10E|LOG2E|SQRT1_2|SQRT_2)/g,
					'Math.$1').replace(/Math\.Math\./g, 'Math.');
				if(instances>4)
				{
					this.reply('Bocs, de egyszerre 5 szamologep futhat :(');
					return;
				}
				instances++;
				console.log(instances);
				var proc=cp.spawn('node',['modules/calc.fork.js']);
				var timer=setTimeout(function(){instances--;proc.kill();that.reply('Ennek igy soha nem lesz vege, hagyjuk...');}, 10000);
				proc.stdin.write(expression);
				proc.stdout.setEncoding('utf8');
				proc.stderr.setEncoding('utf8');
				proc.stdout.on('data', function(data)
				{
					instances--;
					that.reply(data+(measure?(' ('+(new Date().getTime()-start)+'ms)'):''));
					proc.kill();
					clearTimeout(timer);
				});
				proc.stderr.on('data', function(data)
				{
					instances--;
					if(verbose)
					{
						that.reply(data);
					}
					else
					{
						that.reply('Valami nem koser.');
					}
					proc.kill();
					clearTimeout(timer);
				});
			}
			catch(e)
			{
		
			}
		}
	}
]