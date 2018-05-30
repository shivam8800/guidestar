var mongoose = require('mongoose');
var DetailsModel = require('../models/details');

var request1 = require('request');
const cheerio = require('cheerio');
const async = require('async');

var fs = require('fs');

var kue = require('kue')
var queue = kue.createQueue();


const routes = [
	{
		method: 'GET',
		path: '/',
		handler: async (request, h) =>{
			return "Hello, World !";

		}
	},
	{
		method: 'GET',
	    path: '/scrape_NGOs',
	    handler: async (request, h) => {
	    	// var final_list = []
	    	var benefiary_group = ['Adolescents', 'Children', 'Girl Child', 'Orphans', 'Street Children', 'Students', 'Youth']

	   //  	function splitingEmails(string, detail){
	   //  		var web1 = ""
				// var list1 = [];
				// var aftersymbol = ""

				// for (var i=0; i < string.length; i ++){
				// 	if (string[i] == "@"){
				// 		web1 = string.substring(0,i);
				// 		var new_string = string.replace(web1,"");
				// 		for (var j=0; j < new_string.length; j++) {
				// 			if (new_string[j] == "w" && new_string[j+1] == "w" && new_string[j+2] == "w"){
				// 				list1.push(web1);
				// 				var web2 =  new_string.replace(aftersymbol, "")
				// 				list1.push(web2);
				// 				return list1
				// 				break;
				// 			} else {
				// 				web1 = web1 + new_string[j];
				// 				aftersymbol = aftersymbol + new_string[j];
				// 			}
				// 		}
				// 		break;
				// 	}
				// }

				// detail.organisation_primary_email = list1[0];
				// detail.organisation_website = list1[1];
	   //  	}

			async function organisationPage(k, detail){
				var web_url = 'https://guidestarindia.org/Organisation.aspx?CCReg=' + k.toString();
				var options = { method: 'GET',
				  url: web_url,
				  qs: { CCReg: k },
				  jar: true,
				  headers: 
				   { 'user-agent': 'Mozilla/5.0',
				     'Cache-Control': 'no-cache' } };
				request1(options, function (error, response, body) {
				  // if (error) throw new Error(error);
				  // if (!error){
				  // 	console.log(k,"fdsfsd",error)
				  // }
				  if (body != "" && !error){
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
						  	for(var i =0; i < benefiary_list.length; i++){
						  		if (benefiary_group.indexOf(benefiary_list[i]) != -1){
						  			// for scraping  summary page

									var web_url = 'https://guidestarindia.org/Summary.aspx?CCReg=' + k.toString();
									var options1 = { method: 'GET',
									  url: web_url,
									  qs: { CCReg: k },
									  jar: true,
									  headers: 
									   { 'user-agent': 'Mozilla/5.0',
									     'Cache-Control': 'no-cache' } };

									request1(options1, async function (err, res, html) {
										// if (html != "" && !err){
											var doc = await cheerio.load(html);
											// this is for organisation_name
											var organisation_name = doc('#SectionPlaceHolder1_ctl01_ctpTxtCharityName span').text();
											detail.name_of_organisation = organisation_name;
											// this is for organisation_website and organisation_primary_email address
											var organisation_web = doc('#SectionPlaceHolder1_ctl01_listOtherCharityName').parent().each(function(e, element){
													var string = doc(this).find('span div.CTPParaClippingHeaderLabel').parent().find('a').text();
														// splitingEmails(string, detail);
														var list1 = string.split('www.');

														detail.organisation_primary_email = list1[0];
														detail.organisation_website = list1[1];


												});
											// this if for state
											var state = doc('#Anthem_SectionPlaceHolder1_ctl01_ccAddrState_ctl01__ span').text();
											detail.state = state;
											// this if for telephone
											var telephone = doc('#SectionPlaceHolder1_ctl01_DynVariableList2_ctl14_txtPhoneNum span').text();
											detail.telephone = telephone;

											var ho_name = doc('#SectionPlaceHolder1_ctl01_DynVariableList4_ctl09_TextControl17 span').text();
											detail.ho_name = ho_name;

											var ho_email = doc('#SectionPlaceHolder1_ctl01_DynVariableList4_ctl09_TextControl19 span').text();
											detail.ho_email = ho_email;

											var ho_telephone = doc('#SectionPlaceHolder1_ctl01_DynVariableList4_ctl07_TextControl20 span').text();
											detail.ho_telephone = ho_telephone.replace(/\D/g,'');																
											var ho_mobile = doc('#SectionPlaceHolder1_ctl01_DynVariableList4_ctl07_TextControl21 span').text();

											detail.ho_mobile = ho_mobile.replace(/\D/g,'');


											var ocp_name = doc('#SectionPlaceHolder1_ctl01_DynVariableList3_ctl09_TextControl14 span').text();
											detail.ocp_name = ocp_name;

											var ocp_email = doc('#SectionPlaceHolder1_ctl01_DynVariableList3_ctl09_TextControl16 span').text();
											detail.ocp_email = ocp_email;	

											var ocp_telephone = doc('#SectionPlaceHolder1_ctl01_DynVariableList3_ctl07_TextControl2 span').text();
											detail.ocp_telephone = ocp_telephone.replace(/\D/g,'');																
											var ocp_mobile = doc('#SectionPlaceHolder1_ctl01_DynVariableList3_ctl07_TextControl8 span').text();

											detail.ocp_mobile = ocp_mobile.replace(/\D/g,'');
											count = count +1;
											console.log(count, "each execution", k , detail);
											final_list.push(detail);
											// if (count >= 15){
											// 	fs.readFile('all_ngos_details1.json', 'utf8', function readFileCallback(err, data){
											// 	    if (err){
											// 	        console.log(err);
											// 	    } else {
											// 	    var obj = JSON.parse(data); //now it an object
											// 	    obj.table.push(final_list); //add some data
											// 	    var json = JSON.stringify(obj); //convert it back to json
											// 	    fs.writeFile('all_ngos_details1.json', json, 'utf8', function(){
											// 	    	console.log("yeah done");
											// 	    }); // write it back 
											// 	}});
											// }

											return detail
										// }
									});
						  			break;
						  		} else {
						  			console.log("benefiary_list not valid",k);
						  		}
						  	}
						  });
						
					} else {
						console.log(k, "not found")
					}
				}

				});

			}

			function sleep(miliseconds) {
				var start = new Date().getTime();
				for (var i = 0; i < 1e7; i++) {
					if ((new Date().getTime() - start) > miliseconds) {
						break;
					}
				}
			}

			var count = 0;

			var job = queue.create('scrape', {
			    title: 'jskfjdskjf'
			}).attempts(5).save(function(err) {
			    if (!err) console.log(job.id);
			});


			queue.process('scrape',function(job,done){
				var k = 101;
				var x = k + 100;
				var final_list = []
				while (k < 301){

					console.log(x);

					while (k <= x) {

						if (k == 10208) {
							break;
						}

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
						organisationPage(k,detail);
						k++;

					}

					console.log(final_list);

					//Makes the program sleep for 1 minute
					sleep(60000);

					x = x + 100;
					
				}

			});
			queue.on('complete', function(result){
			  console.log('Job completed with data ', result);

			});
			
			return null;
	    }

	}
]

export default routes;
