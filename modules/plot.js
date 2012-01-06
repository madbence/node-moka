exports.commands=
[
	{
		name: 'plot',
		func: function(params)
		{
			var f=params[1];
			if(f.match(/(function|arguments|y|this|eval|concat|new|var|require|process|module|file|dir|exports|Timeout|Interval|\[|\]|\{|\}|if|switch|for|while|console)/))
			{
				return;
			}
			if(this.isChannel())
			{
				return;
			}
			var graph=[];
			for(var i=0;i<10;i++)
			{
				graph[i]=[];
				for(var j=0;j<50;j++)
				{
					graph[i][j]=' ';
				}
			}
			
			for(var i=0;i<10;i++)
			{
				graph[i][25]=String.fromCharCode(3)+'2|'+String.fromCharCode(3)+'1';
			}
			for(var i=0;i<50;i++)
			{
				graph[5][i]=String.fromCharCode(3)+'2-'+String.fromCharCode(3)+'1';;
			}
			for(var i=-5;i<5;i+=0.05)
			{
				var f2=f.replace(/x/g, i);
				try
				{
					var e=eval(f2);
					//console.log(e, Math.floor((i+5)*5));
					if(graph[5-Math.floor(e*3)])
					{
						graph[5-Math.floor(e*3)][25+Math.floor(i*5)]=String.fromCharCode(3)+'9X'+String.fromCharCode(3)+'1';
					}
				}
				catch(ex)
				{
					console.log(ex);
				}
			}
			for(var i=0;i<10;i++)
			{
				this.say(graph[i].join(''));
			}
		}
	}
]