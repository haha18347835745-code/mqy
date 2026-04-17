const app = getApp();

Page({
  data: {
    folderId: '',
    folderName: '',
    folderIcon: '',
    fileList: [],
    isAdmin: false
  },
  onLoad(options) {
    const { id, name, icon } = options;
    this.setData({
      folderId: id,
      folderName: decodeURIComponent(name),
      folderIcon: decodeURIComponent(icon)
    });
    
    wx.setNavigationBarTitle({
      title: decodeURIComponent(name)
    });
    
    this.loadFiles();
  },
  onShow() {
    this.setData({
      isAdmin: app.globalData.isAdmin
    });
    this.loadFiles();
  },
  loadFiles() {
    const files = app.getFilesByFolder(this.data.folderId);
    this.setData({
      fileList: files
    });
  },
  goToFile(e) {
    const file = e.currentTarget.dataset.file;
    const fileId = file._id || file.id;
    wx.navigateTo({
      url: `/pages/file/file?id=${fileId}&title=${encodeURIComponent(file.title)}&type=${file.type}&fileID=${encodeURIComponent(file.fileID)}`
    });
  },
  deleteFile(e) {
    const fileId = e.currentTarget.dataset.id;
    const that = this;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个文件吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          const success = await app.deleteFile(fileId);
          wx.hideLoading();
          
          if (success) {
            that.loadFiles();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
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
