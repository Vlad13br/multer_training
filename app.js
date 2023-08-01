const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const multer = require('multer');
const uploadDir = path.join(process.cwd(), 'uploads');
const storeImage = path.join(process.cwd(), 'images');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1048576
  }
});

app.post('/upload', upload.single('picture'), async (req, res, next) => {
  const { description } = req.body;
  const { path: temporaryName, originalname } = req.file;
  const fileName = path.join(storeImage, originalname);
  try {
    await fs.rename(temporaryName, fileName);
  } catch (err) {
    await fs.unlink(temporaryName);
    return next(err);
  }
  res.json({ description, message: 'Файл успішно завантажено', status: 200 });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ message: err.message, status: err.status });
});

const isAccessible = path => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

const createFolderIsNotExist = async folder => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder);
  }
};

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  await createFolderIsNotExist(uploadDir);
  await createFolderIsNotExist(storeImage);
  console.log(`Сервер працює. Використовуйте порт:${PORT}`);
});