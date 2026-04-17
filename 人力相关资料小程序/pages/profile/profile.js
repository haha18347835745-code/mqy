const app = getApp();

Page({
  data: {
    isAdmin: false,
    showLogin: false,
    showAddFolder: false,
    password: '',
    folders: [],
    folderName: '',
    selectedIcon: '📁',
    iconOptions: ['📁', '👥', '🏢', '📚', '📋', '💼', '📊', '📄', '🎓', '🏆', '📝', '🔧']
  },
  onShow() {
    this.setData({
      isAdmin: app.globalData.isAdmin
    });
    if (this.data.isAdmin) {
      this.loadFolders();
    }
  },
  async loadFolders() {
    try {
      const folders = await app.loadFolders();
      this.setData({
        folders: folders
      });
    } catch (err) {
      console.error('加载文件夹失败', err);
    }
  },
  goToUpload() {
    wx.navigateTo({
      url: '/pages/upload/upload'
    });
  },
  goToFolder(e) {
    const folder = e.currentTarget.dataset.folder;
    wx.navigateTo({
      url: `/pages/folder/folder?id=${folder._id}&name=${encodeURIComponent(folder.name)}&icon=${encodeURIComponent(folder.icon)}`
    });
  },
  showLoginModal() {
    this.setData({
      showLogin: true,
      password: ''
    });
  },
  hideLoginModal() {
    this.setData({
      showLogin: false,
      password: ''
    });
  },
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },
  doLogin() {
    const result = app.login(this.data.password);
    if (result.success) {
      this.setData({
        isAdmin: true,
        showLogin: false
      });
      this.loadFolders();
      wx.showToast({
        title: result.message,
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: result.message,
        icon: 'none'
      });
    }
  },
  logout() {
    app.logout();
    this.setData({
      isAdmin: false,
      folders: []
    });
    wx.showToast({
      title: '已退出登录',
      icon: 'success'
    });
  },
  showAddFolderModal() {
    this.setData({
      showAddFolder: true,
      folderName: '',
      selectedIcon: '📁'
    });
  },
  hideAddFolderModal() {
    this.setData({
      showAddFolder: false,
      folderName: '',
      selectedIcon: '📁'
    });
  },
  onFolderNameInput(e) {
    this.setData({
      folderName: e.detail.value
    });
  },
  selectIcon(e) {
    const icon = e.currentTarget.dataset.icon;
    this.setData({
      selectedIcon: icon
    });
  },
  async addFolder() {
    const { folderName, selectedIcon } = this.data;
    
    if (!folderName || folderName.trim() === '') {
      wx.showToast({
        title: '请输入文件夹名称',
        icon: 'none'
      });
      return;
    }
    
    const newFolder = {
      name: folderName.trim(),
      icon: selectedIcon
    };
    
    wx.showLoading({ title: '添加中...' });
    const success = await app.addFolder(newFolder);
    wx.hideLoading();
    
    if (success) {
      this.setData({
        showAddFolder: false,
        folderName: '',
        selectedIcon: '📁'
      });
      
      this.loadFolders();
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      });
    }
  },
  async deleteFolder(e) {
    const folderId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个文件夹吗？文件夹内的所有文件也会被删除',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          const success = await app.deleteFolder(folderId);
          wx.hideLoading();
          
          if (success) {
            this.loadFolders();
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
