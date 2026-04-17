const app = getApp();

Page({
  data: {
    selectedFile: null,
    fileTitle: '',
    folders: [],
    selectedFolderId: null,
    uploadHistory: []
  },
  onLoad() {
    this.loadFolders();
    this.loadUploadHistory();
  },
  onShow() {
    this.loadFolders();
  },
  async loadFolders() {
    wx.showLoading({ title: '加载中...' });
    try {
      const folders = await app.loadFolders();
      this.setData({ folders });
    } catch (err) {
      console.error('加载文件夹失败', err);
    }
    wx.hideLoading();
  },
  loadUploadHistory() {
    const history = wx.getStorageSync('uploadHistory') || [];
    this.setData({
      uploadHistory: history
    });
  },
  chooseFile() {
    wx.showActionSheet({
      itemList: ['图片', '文档'],
      success: (res) => {
        console.log('选择了:', res.tapIndex);
        if (res.tapIndex === 0) {
          this.chooseImage();
        } else if (res.tapIndex === 1) {
          this.chooseDocument();
        }
      },
      fail: (err) => {
        console.error('showActionSheet失败:', err);
      }
    });
  },
  chooseImage() {
    console.log('chooseImage 被调用');
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('选择图片成功:', res);
        const filePath = res.tempFilePaths[0];
        const fileName = filePath.split('/').pop();
        const ext = fileName.split('.').pop().toLowerCase();
        
        wx.getFileInfo({
          filePath: filePath,
          success: (info) => {
            this.setData({
              selectedFile: {
                name: fileName,
                path: filePath,
                size: this.formatFileSize(info.size),
                type: ext
              },
              fileTitle: fileName.replace(/\.[^/.]+$/, '')
            });
          }
        });
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
      }
    });
  },
  chooseDocument() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const file = res.tempFiles[0];
        const type = this.getFileType(file.name);
        this.setData({
          selectedFile: {
            name: file.name,
            path: file.path,
            size: this.formatFileSize(file.size),
            type: type
          },
          fileTitle: file.name.replace(/\.[^/.]+$/, '')
        });
      }
    });
  },
  getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'docx',
      'docx': 'docx',
      'xls': 'xlsx',
      'xlsx': 'xlsx',
      'jpg': 'jpg',
      'jpeg': 'jpg',
      'png': 'png',
      'gif': 'jpg'
    };
    return typeMap[ext] || 'pdf';
  },
  formatFileSize(size) {
    if (size < 1024) {
      return size + 'B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + 'KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + 'MB';
    }
  },
  getTypeEmoji(type) {
    const emojiMap = {
      'pdf': '📄',
      'docx': '📝',
      'xlsx': '📊',
      'jpg': '🖼️',
      'png': '🖼️'
    };
    return emojiMap[type] || '📄';
  },
  removeFile() {
    this.setData({
      selectedFile: null,
      fileTitle: '',
      selectedFolderId: null
    });
  },
  selectFolder(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedFolderId: id
    });
  },
  onTitleInput(e) {
    this.setData({
      fileTitle: e.detail.value
    });
  },
  async submitUpload() {
    const { selectedFile, fileTitle, selectedFolderId } = this.data;
    
    if (!fileTitle || fileTitle.trim() === '') {
      wx.showToast({
        title: '请输入文件标题',
        icon: 'none'
      });
      return;
    }
    
    if (!selectedFolderId) {
      wx.showToast({
        title: '请选择分类文件夹',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '上传中...'
    });
    
    try {
      const newFile = {
        title: fileTitle,
        type: selectedFile.type,
        path: selectedFile.path,
        size: selectedFile.size,
        uploadTime: this.formatDate(new Date()),
        folderId: selectedFolderId
      };
      
      const success = await app.addFile(newFile);
      
      if (success) {
        const uploadHistory = this.data.uploadHistory || [];
        uploadHistory.unshift({
          title: fileTitle,
          type: selectedFile.type,
          size: selectedFile.size,
          time: this.formatDate(new Date())
        });
        
        wx.setStorageSync('uploadHistory', uploadHistory);
        
        wx.showToast({
          title: '上传成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('上传失败', err);
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      });
    }
    
    wx.hideLoading();
  },
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
