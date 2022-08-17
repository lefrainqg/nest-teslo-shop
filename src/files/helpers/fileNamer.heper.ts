
import { v4 as uuid } from 'uuid'

export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
   //Error: Mensaje de error, fals: no estamos aceptando el archivo
   if (!file) return callback(new Error(`File is empy`), false);

   const fileExtension = file.mimetype.split('/')[1];
   const fileName = `${uuid()}.${fileExtension}`;

   callback(null, fileName);

};