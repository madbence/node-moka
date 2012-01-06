process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data)
{
	try
	{
		process.stdout.write(eval(data.toString()).toString());
	}
	catch(e)
	{
		process.stderr.write(e.toString());
	}
});