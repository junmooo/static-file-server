const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3008;

// 确保 uploads 目录存在
// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

const uploadDir = '/www/uploads'; // 修改上传目录为 /www/uploads

// 确保 /www/uploads 目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // 使用 recursive 确保父目录也会被创建
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
// 配置文件存储路径
const upload = multer({ dest: uploadDir });

// 允许跨域
app.use(cors());
app.use(express.static('public')); // 提供静态资源访问

// 上传文件接口
app.post('/api/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  // 获取后缀名 并重命名文件名
  const extname = path.extname(req.file.originalname);
  const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
  const newName = `${path.basename(originalName, extname)}_${timestamp}${extname}`;
  const targetPath = path.join(uploadDir, newName);

  // 将文件从临时路径移动到目标路径
  fs.rename(filePath, targetPath, (err) => {
    if (err) {
      console.error('Error moving file:', err);
      return res.status(500).send('File upload failed');
    }
    res.send({ message: 'File uploaded successfully', file: newName });
  });
});

// 下载文件接口
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

// 预览文件接口
app.get('/api/preview/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// 删除文件接口
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

// 获取文件列表接口
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
});
