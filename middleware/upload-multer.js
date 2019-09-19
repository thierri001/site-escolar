const   multer  = require('multer');

var middlewareLocal = {},
    maxSize = 1024 * 1024 * 5;

//  local = 'public/uploads/eventos'

const storage = (local)=>{
    multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, local);
    },
    filename: function(req, file, cb) {
      var id = ID();
      cb(null,file.fieldname
      +'-'+'e-'+Date.now()+id+'-'+file.originalname);
    }
    });
}
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


middlewareLocal.uploadImage = (local)=>{
  return multer({
  storage: storage(local),
  limits: {
    fileSize: maxSize
  },
  fileFilter: fileFilterImage,
  onFileUploadStart: function(file, req, res){
    if(req.files.file.length > maxSize) {
      res.json({message:'Por favor selecione um arquivo até 5Mb', type:'alert-secondary'});
    }
  }
});
}

middlewareLocal.uploadDocument = (local)=>{return multer({
  storage: storage(local),
  limits: {
    fileSize: maxSize
  },
  fileFilter: fileFilterDocument,
  onFileUploadStart: function(file, req, res){
    if(req.files.file.length > maxSize) {
      res.json({message:'Por favor selecione um arquivo até 5Mb', type:'alert-secondary'});
    }
  }
});
}

module.exports = middlewareLocal;