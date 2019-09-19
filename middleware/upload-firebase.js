const   multer  = require('multer'),
        admin   = require("firebase-admin");

var middlewareFirebase = {},
    maxSize = 1024 * 1024 * 5;

const bucket = admin.storage().bucket();

const fileFilterImg = (_req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const mimetype = fileTypes.test(file.mimetype);
  if (mimetype) {
    cb(null, true);
  } else {
    cb(null, false);
    console.log("Erro no filtro.");
  }
};

const fileFilterDoc = (_req, file, cb) => {
  const fileTypes = /pdf|xlsx|docx|doc/;
  const mimetype = fileTypes.test(file.mimetype);
  if (mimetype) {
    cb(null, true);
  } else {
    cb(null, false);
    console.log("Erro no filtro.");
  }
};

middlewareFirebase.uploadImageFirebase =  multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxSize
  },
  fileFilter: fileFilterImg,
  onFileUploadStart: function(file, req, res){
    if(req.files.file.length > maxSize) {
      res.json({message:'Por favor selecione um arquivo até 5Mb', type:'alert-secondary'});
    }
  }
});

middlewareFirebase.uploadImageFirebase =  multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxSize
  },
  fileFilter: fileFilterDoc,
  onFileUploadStart: function(file, req, res){
    if(req.files.file.length > maxSize) {
      res.json({message:'Por favor selecione um arquivo até 5Mb', type:'alert-secondary'});
    }
  }
});

middlewareFirebase.uploadImageToStorage = function(file){
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('Não ha um arquivo de imagem!');
      }
      let newFileName = `${file.originalname}_${Date.now()}`;
  
      let fileUpload = bucket.file(newFileName);
  
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype
        }
      });
  
      blobStream.on('finish', () => {
        const url = "https://firebasestorage.googleapis.com/v0/b/"+`${bucket.name}`+"/o/"+encodeURI(`${fileUpload.name}`+"?alt=media");
        resolve(url);
      });
  
      blobStream.end(file.buffer);
    });
}

module.exports = middlewareFirebase;