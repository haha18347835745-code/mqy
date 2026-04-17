const app = getApp();

Page({
  data: {
    id: '',
    title: '',
    fileID: '',
    type: '',
    isImage: false,
    typeText: '',
    typeEmoji: '📄',
    isAdmin: false
  },
  onLoad(options) {
    const { id, title, type, fileID } = options;
    this.setData({
      id: id,
      title: decodeURIComponent(title),
      type: type,
      fileID: decodeURIComponent(fileID),
      isImage: this.isImageType(type),
      typeText: this.getTypeText(type),
      typeEmoji: this.getTypeEmoji(type),
      isAdmin: app.globalData.isAdmin
    });
  },
  isImageType(type) {
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(type.toLowerCase());
  },
  getTypeText(type) {
    const typeMap = {
      'pdf': 'PDF文档',
      'doc': 'Word文档',
      'docx': 'Word文档',
      'xls': 'Excel表格',
      'xlsx': 'Excel表格',
      'ppt': 'PPT演示',
      'pptx': 'PPT演示',
      'txt': '文本文件',
      'jpg': '图片',
      'jpeg': '图片',
      'png': '图片',
      'gif': '图片'
    };
    return typeMap[type.toLowerCase()] || '未知类型';
  },
  getTypeEmoji(type) {
    const emojiMap = {
      'pdf': '📕',
      'doc': '📘',
      'docx': '📘',
      'xls': '📗',
      'xlsx': '📗',
      'ppt': '📙',
      'pptx': '📙',
      'txt': '📄',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'png': '🖼️',
      'gif': '🖼️'
    };
    return emojiMap[type.toLowerCase()] || '📄';
  },
  previewImage() {
    console.log('预览图片 - fileID:', this.data.fileID);
    console.log('预览图片 - type:', this.data.type);
    
    if (!this.data.fileID) {
      wx.showToast({ title: '文件不存在', icon: 'none' });
      return;
    }
    
    if (!this.data.fileID.startsWith('cloud://')) {
      wx.showToast({ title: '请重新上传图片', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '加载中...' });
    wx.cloud.downloadFile({
      fileID: this.data.fileID,
      success: (res) => {
        wx.hideLoading();
        console.log('下载成功, tempPath:', res.tempFilePath);
        wx.previewImage({
          urls: [res.tempFilePath]
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('预览图片失败:', err);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    });
  },
  saveImage() {
    wx.showLoading({ title: '下载中...' });
    wx.cloud.downloadFile({
      fileID: this.data.fileID,
      success: (res) => {
        wx.hideLoading();
        wx.getSetting({
          success: (setting) => {
            if (!setting.authSetting['scope.writePhotosAlbum']) {
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success: () => {
                  this.doSaveImage(res.tempFilePath);
                },
                fail: () => {
                  wx.showModal({
                    title: '提示',
                    content: '需要授权保存图片到相册',
                    success: (res) => {
                      if (res.confirm) {
                        wx.openSetting();
                      }
                    }
                  });
                }
              });
            } else {
              this.doSaveImage(res.tempFilePath);
            }
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('下载图片失败:', err);
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        });
      }
    });
  },
  doSaveImage(tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('保存图片失败:', err);
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },
  viewDocument() {
    wx.showLoading({
      title: '加载中...'
    });
    
    wx.cloud.downloadFile({
      fileID: this.data.fileID,
      success: (res) => {
        wx.hideLoading();
        wx.openDocument({
          filePath: res.tempFilePath,
          fileType: this.data.type,
          showMenu: true,
          success: () => {
            console.log('文档打开成功');
          },
          fail: (err) => {
            console.error('打开文档失败:', err);
            wx.showToast({
              title: '打开失败: ' + (err.errMsg || ''),
              icon: 'none',
              duration: 3000
            });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('下载文档失败:', err);
        wx.showToast({
          title: '下载失败: ' + (err.errMsg || ''),
          icon: 'none',
          duration: 3000
        });
      }
    });
  },
  downloadDocument() {
    if (this.data.isImage) {
      this.saveImage();
      return;
    }
    
    wx.showLoading({
      title: '下载中...'
    });
    
    wx.cloud.downloadFile({
      fileID: this.data.fileID,
      success: (res) => {
        wx.hideLoading();
        wx.openDocument({
          filePath: res.tempFilePath,
          fileType: this.data.type,
          showMenu: true,
          success: () => {
            wx.showToast({
              title: '下载成功',
              icon: 'success'
            });
          },
          fail: (err) => {
            console.error('下载文档失败:', err);
            wx.showToast({
              title: '打开失败: ' + (err.errMsg || ''),
              icon: 'none',
              duration: 3000
            });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('下载失败:', err);
        wx.showToast({
          title: '下载失败: ' + (err.errMsg || ''),
          icon: 'none',
          duration: 3000
        });
      }
    });
  },
  onShareAppMessage() {
    return {
      title: this.data.title,
      path: `/pages/file/file?id=${this.data.id}&title=${encodeURIComponent(this.data.title)}&type=${this.data.type}&fileID=${encodeURIComponent(this.data.fileID)}`
    };
  },
  deleteFile() {
    const that = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个文件吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          const fileId = that.data.id || that.data.fileID;
          const success = await app.deleteFile(fileId);
          wx.hideLoading();
          if (success) {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } else {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  }
});
