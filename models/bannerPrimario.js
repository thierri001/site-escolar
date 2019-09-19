var mongoose = require("mongoose");

var bannerSchema = new mongoose.Schema({
        nome: {type: String, required: true},
        url: {type: String, default:"/uploads/default.png"},
        mobile: {type:Boolean,default:false}
});

module.exports = mongoose.model("BannerPrimario", bannerSchema);