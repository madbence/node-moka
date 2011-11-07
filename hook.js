var warn=1;
hook=function(sock,data)
{
	try
	{
		var response=data.toString().match(/:(.*?) PRIVMSG (.*?) :(.*?)\r\n/);
		if(response != null)
		{
			var message=response[3].
				replace(/\x02/g, '').
				replace(/\x1F/g, '').
				replace(/\x1D/g, '').
				replace(/\x16/g, '').
				replace(/\x03\d,\d/g, '').
				replace(/\x03\d/g, '').
				replace(/\x03/g, '');
			var user=response[1].match(/(.*?)!/)[1];
			var to=response[2][0]=='#'?response[2]:user
			var date=new Date();
			if(user==null)
				return;
			if(user=='_VV')
			{
				if(date.getHours() > 1 || (date.getHours() == 1 && date.getMinutes()>8))
				{
					if(date.getHours() < 8 || (date.getHours() == 8 && date.getMinutes()<8))
					{
						writeMsg(sock,to,user,'valts nicket, cicafold van! Ez a'+((warn==1)?'z':'')+' '+warn+++'. figyelmeztetes.');
						return;
					}
				}
			}
			if(message.search(/lennon_mokazik/) != -1)
			{
				sock.write(composeMsg(to, user, 'riszponz!'));
				console.log('me->'+user+'@'+to);
			}
			else if(message.search(/^l.calc (.*?)/) != -1)
			{
				var expr=message.match(/l.calc (.*?)$/)[1];
				if(expr.search(/(for|while|do|function)/) != -1)
				{
					sock.write(composeMsg(to, user, 'Gonosz vagy! :( ('+expr.match(/(for|while|do|function)/)[1]+'-t hasznaltal)' ));
					return;
				}
				var contx=vm.createContext({res:null});
				var measureStart=new Date().getTime();
				try
				{
					vm.runInContext('this.res='+expr+'', contx);
					sock.write(composeMsg(to, user, contx.res.toString()+' ('+(new Date().getTime()-measureStart)+'ms)'));
					console.log('calc('+expr+')->'+user);
				}
				catch(e)
				{
					sock.write(composeMsg(to, user, 'Syntax error :( ['+e.toString()+']'));
					console.log('calc('+expr+')->'+user+' (failed)');
					console.error(e);
				}
			}
			else if(message.search(/^l.(print|echo) (.*?)$/) != -1)
			{
				var msg=message.match(/^l.(print|echo) (.*?)$/)[2];
				sock.write(composeMsg(to, user, msg));
				console.log('print('+msg+')->'+user);
			}
			else if(message.search(/^l.cica/) != -1)
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
				sock.write(composeMsg(to, user, 'Cicafoldig ('+targetHint+') meg '+targetString));
			}
			else if(message.search(/^l.uptime/) != -1)
			{
				var ut=process.uptime();
				utString=
					Math.floor(ut/3600/24)+':'+
					(((ut/3600)%3600)<10?'0':'')+Math.floor((ut/3600)%3600)+':'+
					(((ut/60)%60)<10?'0':'')+Math.floor((ut/60)%60)+':'+
					((ut%60)<10?'0':'')+Math.floor(ut%60);
				writeMsg(sock,to,user,'uptime: '+utString);
			}
		}
	}
	catch(e)
	{
		console.error('error: ', e);
	}
};

var composeMsg=function(to, usr, msg)
{
	return 'PRIVMSG '+to+' :'+usr+': '+msg+'\r\n';
}

var writeMsg=function(s,t,u,m)
{
	s.write(composeMsg(t,u,m));
}