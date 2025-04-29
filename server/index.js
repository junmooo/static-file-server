const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3008;

// 确保 uploads 目录存在
// const uploadDir = path.join(__dirname, 'uploads');
const uploadDir = '/www/uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 格式化当前时间为 YYYY-MM-DD-HH:mm:ss
const formatDate = () => {
  const now = new Date();
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(
    now.getMinutes(),
  )}${pad(now.getSeconds())}`;
};
const timestamp = formatDate();
const upload = multer({ dest: uploadDir });

// 允许跨域
app.use(cors());
app.use(express.static('public'));

// Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Static File Server API',
      version: '1.0.0',
      description: 'API 文档 for Static File Server',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: [__filename], // 当前文件中定义的注释会被解析为文档
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: 上传文件
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 文件上传成功
 *       500:
 *         description: 文件上传失败
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const extname = path.extname(req.file.originalname);
  const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
  const newName = `${path.basename(originalName, extname)}_${timestamp}${extname}`;
  const targetPath = path.join(uploadDir, newName);

  fs.rename(filePath, targetPath, (err) => {
    if (err) {
      console.error('Error moving file:', err);
      return res.status(500).send('File upload failed');
    }
    res.send({ message: 'File uploaded successfully', file: newName, link: `/api/download/${newName}` });
  });
});

/**
 * @swagger
 * /api/download/{filename}:
 *   get:
 *     summary: 下载文件
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 文件名
 *     responses:
 *       200:
 *         description: 文件下载成功
 *       404:
 *         description: 文件未找到
 */
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(404).send('File not found');
      }
    });
  } else {
    res.status(404).send('File not found');
  }
});

/**
 * @swagger
 * /api/preview/{filename}:
 *   get:
 *     summary: 预览文件
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 文件名
 *     responses:
 *       200:
 *         description: 文件预览成功
 *       404:
 *         description: 文件未找到
 */
app.get('/api/preview/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

/**
 * @swagger
 * /api/delete/{filename}:
 *   delete:
 *     summary: 删除文件
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: 文件名
 *     responses:
 *       200:
 *         description: 文件删除成功
 *       404:
 *         description: 文件未找到
 */
app.delete('/api/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).send('File deletion failed');
      }
      res.send({ message: 'File deleted successfully' });
    });
  } else {
    res.status(404).send('File not found');
  }
});

/**
 * @swagger
 * /uploads:
 *   get:
 *     summary: 获取文件列表
 *     responses:
 *       200:
 *         description: 文件列表获取成功
 *       500:
 *         description: 读取目录失败
 */
app.get('/uploads', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Error reading directory');
    }
    res.send(files);
  });
});

// 启动服务
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API Docs available at http://localhost:${port}/api-docs`);
});