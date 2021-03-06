var request1 = require('request');
const cheerio = require('cheerio');
const async = require('async');

var fs = require('fs');

var json2csv = require('json2csv');

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

	    	var benefiary_group = ['Adolescents', 'Children', 'Girl Child', 'Orphans', 'Street Children', 'Students', 'Youth'];

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

											var final_list = [];

											for (var key in detail) {
												final_list.push(detail[key]);
											}

											var newLine = '\r\n';
											var fields = ['Name of Organisation', 'Website', 'Email', 'State', 'Telephone', 'HO_Name', 'HO_Email', 'HO_Telephone', 'HO_Mobile', 'OCP_Name', 'OCP_Email', 'OCP_Telephone', 'OCP_Mobile'];
											var appendThis = final_list;

											fs.stat('details.csv', function (err, stat) {
											    if (err == null) {
											        appendThis = (appendThis + newLine);
											        fs.appendFile('details.csv', appendThis)
											    } else {
											        fields= (fields + newLine);
											        fs.writeFile('details.csv', fields)
											    }
											});

											console.log(k)
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

			var job = queue.create('scrape', {
			    title: 'jskfjdskjf'
			}).attempts(5).save(function(err) {
			    if (!err) console.log(job.id);
			});

			queue.process('scrape',function(){

				var k = 101;
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

				while (k < 10208) {

					organisationPage(k,detail);

					k ++;

				}
			});

			return null;

	    }

	}
]

export default routes;