var mongoose = require("mongoose");

var bannerSchema = new mongoose.Schema({
        nome: {type: String, required: true},
        url: {type: String, default:"/uploads/default.png"}
});

module.exports = mongoose.model("BannerSecundario", bannerSchema);