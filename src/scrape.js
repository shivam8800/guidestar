
var asyncLoop = require('node-async-loop');
var request1 = require('request');
const cheerio = require('cheerio');


exports.displayItem = async (item, next) =>{
	var detail = {
		name_of_organisation: "",
		organisation_website: "",
		organisation_primary_email: "",
		state: "",
		telephone: 0,

		ho_name: "",
		ho_email: "",
		ho_telephone: 0,
		ho_mobile: 0,
		
		ocp_name: "",
		ocp_email: "",
		ocp_telephone: 0,
		ocp_mobile: 0 
	}
	console.log(item);
	organisation_page(item);
	next();
}

let organisation_page = (index) =>{
 	var web_url = 'https://guidestarindia.org/Organisation.aspx?CCReg=' + index.toString();
 	var options = { method: 'GET',
	url: web_url,
	qs: { CCReg: index },
	jar: true,
	headers: 
	{ 'user-agent': 'Mozilla/5.0',
	 'Cache-Control': 'no-cache' } };


	 request1(options, function (error, response, body) {

		if (error) throw new Error(error);

		var $ = cheerio.load(body);
		var benefiary_list = []
		var span = $('#SectionPlaceHolder1_ctl01_ComboControl1 ul');
		if (span != ""){
			span.each(function(e,element){
		  	var ul = $(this).text();
		  	var ele = ""
		  	for (var j = ul.length - 1; j >= 0; j--) {
		  		if (ul[j] == '\n'){
		  			if (ele != ""){
		  				benefiary_list.push(ele);					  				
		  			}
		  			ele = ""
		  		} else {
		  			ele = ul[j] + ele 
		  		}
		  	}
		  });
		}
		return benefiary_list;
	});
}













