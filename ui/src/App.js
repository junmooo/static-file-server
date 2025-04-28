import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [filesList, setFilesList] = useState([]);

  useEffect(() => {
    // 获取文件列表
    fetchFiles();
  }, []);

  // 获取当前IP或域名
  const getIP = () => {
    const url = window.location.href;

    const arr = url.split('/');
    console.log(1616, arr[2].split(':')[0]);
    return arr[2].split(':')[0];
  };

  // 获取文件列表
  const fetchFiles = async () => {
    const response = await axios.get(`http://${getIP()}:3008/uploads`);
    setFilesList(response.data);
  };

  // 上传文件
  const handleUpload = async (selectedFile) => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`http://${getIP()}:3008/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(response.data.message); // 弹框显示上传成功信息
      fetchFiles(); // 刷新文件列表
    } catch (error) {
      alert('Upload failed'); // 弹框显示上传失败信息
    }
  };

  // 删除文件
  const handleDelete = async (filename) => {
    try {
      await axios.delete(`http://${getIP()}:3008/api/delete/${filename}`);
      alert('File deleted successfully'); // 弹框显示删除成功信息
      fetchFiles(); // 刷新文件列表
    } catch (error) {
      alert('Delete failed'); // 弹框显示删除失败信息
    }
  };

  // 下载文件
  const handleDownload = (filename) => {
    window.location.href = `http://${getIP()}:3008/api/download/${filename}`;
  };

  // 预览文件
  const handlePreview = (filename) => {
    window.open(`http://${getIP()}:3008/api/preview/${filename}`, '_blank');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* 文件上传 */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ height: '32px', lineHeight: '32px' }}>文件列表</span>
          <label htmlFor="file-upload" style={{ display: 'none' }}>
            选择文件
          </label>
          <input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => {
              setFile(e.target.files[0]);
              handleUpload(e.target.files[0]); // 自动上传
            }}
          />
        </div>
        <button
          onClick={() => document.getElementById('file-upload').click()}
          style={{
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          上传文件
        </button>
      </div>

      {/* 文件列表 */}

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>文件名</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {filesList.map((file, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
              }}
            >
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{file}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button
                  onClick={() => handleDownload(file)}
                  style={{
                    padding: '5px 10px',
                    marginRight: '10px',
                    marginBottom: '10px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  下载
                </button>
                <button
                  onClick={() => handlePreview(file)}
                  style={{
                    padding: '5px 10px',
                    marginRight: '10px',
                    marginBottom: '10px',
                    backgroundColor: '#17a2b8',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  预览
                </button>
                <button
                  onClick={() => handleDelete(file)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
