const app = getApp();

Page({
  data: {
    banners: [],
    folders: [],
    latestFiles: []
  },
  onLoad() {
    this.loadData();
  },
  onShow() {
    this.loadData();
  },
  async loadData() {
    wx.showLoading({ title: '加载中...' });
    
    const banners = [
      { id: 1, image: '/pict/6.png' },
      { id: 2, image: '/pict/4.jpg' },
      { id: 3, image: '/pict/5.png' }
    ];
    
    const folders = await app.loadFolders();
    const files = await app.loadFiles();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentFiles = files.filter(f => {
      const uploadTime = new Date(f.uploadTime || '1970-01-01');
      uploadTime.setHours(0, 0, 0, 0);
      return uploadTime >= today;
    }).slice(0, 7);
    
    this.setData({
      banners: banners,
      folders: folders,
      latestFiles: recentFiles
    });
    
    wx.hideLoading();
  },
  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },
  goToFolder(e) {
    const folder = e.currentTarget.dataset.folder;
    wx.navigateTo({
      url: `/pages/folder/folder?id=${folder._id}&name=${encodeURIComponent(folder.name)}&icon=${encodeURIComponent(folder.icon)}`
    });
  },
  goToFile(e) {
    const file = e.currentTarget.dataset.file;
    const fileId = file._id || file.id;
    wx.navigateTo({
      url: `/pages/file/file?id=${fileId}&title=${encodeURIComponent(file.title)}&type=${file.type}&fileID=${encodeURIComponent(file.fileID)}`
    });
  }
});
