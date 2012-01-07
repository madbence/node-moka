exports.replaceString=function(template, args)
{
	for(var i in args)
	{
		template=template.replace(':'+i, args[i]);
	}
	return template;
};