exports.command=
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
			expression=expression.replace(/(sin|cos|asin|acos|tan|atan|atan2|abs|ceil|exp|floor|round|log|max|min|pow|random|sqrt|PI|E|LN2|LN10|LOG10E|LOG2E|SQRT1_2|SQRT_2)/g,
				'Math.$1').replace(/Math\.Math\./g, 'Math.');
			vm.runInContext('this.res='+expression, context);
			var message=context.res+(measure?' ('+(new Date().getTime()-start)+'ms)':'');
			this.sendMessage({'message':message});
			return true;
		}
		catch(e)
		{
			console.log(e);
			console.log(params);
			console.log(expression);
			var message=verbose?e.message:'Hiba :(';
			this.sendMessage({'message':message});
			return false
		}
	}
};