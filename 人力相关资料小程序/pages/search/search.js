const app = getApp();

Page({
  data: {
    keyword: '',
    resultList: [],
    searched: false
  },
  onLoad(options) {
    if (options.keyword) {
      this.setData({
        keyword: options.keyword
      });
      this.doSearch();
    }
  },
  onShow() {
    if (this.data.keyword) {
      this.doSearch();
    }
  },
  onInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },
  onSearch() {
    this.doSearch();
  },
  clearKeyword() {
    this.setData({
      keyword: '',
      resultList: [],
      searched: false
    });
  },
  doSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      this.setData({
        resultList: [],
        searched: false
      });
      return;
    }
    
    const allFiles = app.getFiles();
    const resultList = allFiles.filter(file => 
      file.title.toLowerCase().includes(keyword.toLowerCase())
    );
    
    this.setData({
      resultList: resultList,
      searched: true
    });
  },
  goBack() {
    wx.navigateBack();
  },
  goToFile(e) {
    const file = e.currentTarget.dataset.file;
    wx.navigateTo({
      url: `/pages/file/file?id=${file.id}&title=${encodeURIComponent(file.title)}&type=${file.type}&fileID=${encodeURIComponent(file.fileID)}`
    });
  }
});
