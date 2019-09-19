function errHandleRedirect(res) {
    res.redirect('/blog');
}
function errHandleJson(res) {
    res.json({ message: 'Ocorreu um erro em sua requisição!', type: 'alert-danger' });
}
exports.errHandleRedirect = errHandleRedirect;
exports.errHandleJson = errHandleJson;
