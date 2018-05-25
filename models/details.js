var mongoose = require('mongoose');
const Email = require('mongoose-type-mail');


var Schema = mongoose.Schema;

var DetailsSchema = new Schema({
	name_of_organisation: {type:String},
	organisation_website: {type:String},
	organisation_primary_email:{type:mongoose.SchemaTypes.Email},
	state: {type:String},
	telephone: {type:Number},

	ho_name: {type: String},
	ho_email: {type:mongoose.SchemaTypes.Email},
	ho_telephone: {type: Number},
	ho_mobile: {type: Number},
	
	ocp_name: {type: String},
	ocp_email: {type:mongoose.SchemaTypes.Email},
	ocp_telephone: {type: Number},
	ocp_mobile: {type: Number}
});

const Details = mongoose.model('Details', DetailsSchema);

module.exports = Details;