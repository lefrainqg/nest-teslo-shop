
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
   //Error: Mensaje de error, fals: no estamos aceptando el archivo
   if (!file) return callback(new Error(`File is empy`), false);

   const fileExtension = file.mimetype.split('/')[1];
   const validExtension = ['jpg', 'jpeg', 'png', 'gif'];
   if (validExtension.includes(fileExtension)) {
      return callback(null, true);
   }
   callback(null, false);

};