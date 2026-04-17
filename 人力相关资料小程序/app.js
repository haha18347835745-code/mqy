const app = {
  data: {
    banners: [
      { id: 1, image: './pict/6.png' },
      { id: 2, image: './pict/4.jpg' },
      { id: 3, image: './pict/5.png' }
    ],
    folders: [],
    files: [],
    latestFiles: [],
    keyword: '',
    resultList: [],
    searched: false,
    currentBannerIndex: 0,
    currentPage: 'home',
    isAdmin: false,
    adminPassword: 'admin123',
    selectedIcon: '📁',
    iconOptions: ['📁', '👥', '🏢', '📚', '📋', '💼', '📊', '📄', '🎓', '🏆', '📝', '🔧'],
    selectedFile: null,
    fileTitle: '',
    selectedFolderId: null,
    uploadHistory: [],
    currentFile: {},
    currentFolder: {},
    currentFolderFiles: []
  },
  
  init() {
    this.loadVirtualData();
    this.loadFolders();
    this.loadFiles();
    this.initBanner();
    this.bindEvents();
    this.showPage('home');
  },
  
  virtualData: {
    folders: [
      { _id: 'folder1', name: '人力资源', icon: '👥' },
      { _id: 'folder2', name: '企业管理', icon: '🏢' },
      { _id: 'folder3', name: '培训资料', icon: '📚' },
      { _id: 'folder4', name: '制度规范', icon: '📋' },
      { _id: 'folder5', name: '岗位职责', icon: '💼' },
      { _id: 'folder6', name: '绩效考核', icon: '📊' },
      { _id: 'folder7', name: '招聘流程', icon: '📄' },
      { _id: 'folder8', name: '职业技能', icon: '🎓' }
    ],
    files: [
      { _id: 'file1', title: '新员工入职培训手册', type: 'pdf', size: '2.5MB', uploadTime: '2026-04-17', folderId: 'folder1', fileID: './pict/4.jpg' },
      { _id: 'file2', title: '员工考勤管理制度', type: 'docx', size: '1.2MB', uploadTime: '2026-04-17', folderId: 'folder4', fileID: './pict/5.png' },
      { _id: 'file3', title: '绩效考核表格模板', type: 'xlsx', size: '856KB', uploadTime: '2026-04-16', folderId: 'folder6', fileID: './pict/6.png' },
      { _id: 'file4', title: '招聘需求申请表', type: 'docx', size: '520KB', uploadTime: '2026-04-16', folderId: 'folder7', fileID: './pict/4.jpg' },
      { _id: 'file5', title: '岗位职责说明书范本', type: 'pdf', size: '1.8MB', uploadTime: '2026-04-15', folderId: 'folder5', fileID: './pict/5.png' },
      { _id: 'file6', title: '企业管理架构图', type: 'jpg', size: '3.2MB', uploadTime: '2026-04-15', folderId: 'folder2', fileID: './pict/6.png' },
      { _id: 'file7', title: '职业技能提升计划', type: 'pdf', size: '1.5MB', uploadTime: '2026-04-14', folderId: 'folder8', fileID: './pict/4.jpg' },
      { _id: 'file8', title: '培训课程安排表', type: 'xlsx', size: '420KB', uploadTime: '2026-04-14', folderId: 'folder3', fileID: './pict/5.png' },
      { _id: 'file9', title: '员工信息登记表', type: 'docx', size: '680KB', uploadTime: '2026-04-13', folderId: 'folder1', fileID: './pict/6.png' },
      { _id: 'file10', title: '公司规章制度汇编', type: 'pdf', size: '4.2MB', uploadTime: '2026-04-13', folderId: 'folder4', fileID: './pict/4.jpg' }
    ]
  },
  
  loadVirtualData() {
    const folders = localStorage.getItem('web_folders');
    const files = localStorage.getItem('web_files');
    
    if (!folders) {
      localStorage.setItem('web_folders', JSON.stringify(this.virtualData.folders));
    }
    if (!files) {
      localStorage.setItem('web_files', JSON.stringify(this.virtualData.files));
    }
    
    const uploadHistory = localStorage.getItem('web_uploadHistory');
    if (!uploadHistory) {
      localStorage.setItem('web_uploadHistory', JSON.stringify([]));
    }
    
    const isAdmin = localStorage.getItem('web_isAdmin');
    if (isAdmin) {
      this.data.isAdmin = isAdmin === 'true';
    }
  },
  
  loadFolders() {
    const folders = JSON.parse(localStorage.getItem('web_folders') || '[]');
    this.data.folders = folders;
    this.renderFolders();
  },
  
  loadFiles() {
    const files = JSON.parse(localStorage.getItem('web_files') || '[]');
    this.data.files = files;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentFiles = files.filter(f => {
      const uploadTime = new Date(f.uploadTime || '1970-01-01');
      uploadTime.setHours(0, 0, 0, 0);
      return uploadTime >= today;
    }).slice(0, 7);
    
    this.data.latestFiles = recentFiles;
    this.renderLatestFiles();
  },
  
  initBanner() {
    const bannerSlides = document.getElementById('bannerSlides');
    const bannerDots = document.getElementById('bannerDots');
    
    bannerSlides.innerHTML = this.data.banners.map(banner => `
      <div class="banner-slide">
        <img src="${banner.image}" alt="banner" class="banner-image">
      </div>
    `).join('');
    
    bannerDots.innerHTML = this.data.banners.map((_, index) => `
      <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
    `).join('');
    
    this.setupBannerAutoPlay();
  },
  
  setupBannerAutoPlay() {
    setInterval(() => {
      const nextIndex = (this.data.currentBannerIndex + 1) % this.data.banners.length;
      this.goToBanner(nextIndex);
    }, 4000);
  },
  
  goToBanner(index) {
    this.data.currentBannerIndex = index;
    const slides = document.getElementById('bannerSlides');
    if (slides) {
      slides.style.transform = `translateX(-${index * 100}%)`;
    }
    const dots = document.querySelectorAll('#bannerDots .dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  },
  
  renderFolders() {
    const folderGrid = document.getElementById('folderGrid');
    if (folderGrid) {
      folderGrid.innerHTML = this.data.folders.map(folder => `
        <div class="folder-item" data-id="${folder._id}">
          <div class="folder-icon-wrapper">
            <span class="folder-emoji">${folder.icon}</span>
          </div>
          <span class="folder-name">${folder.name}</span>
        </div>
      `).join('');
    }
  },
  
  renderLatestFiles() {
    const latestFiles = document.getElementById('latestFiles');
    const latestEmpty = document.getElementById('latestEmpty');
    
    if (this.data.latestFiles.length > 0) {
      latestFiles.innerHTML = this.data.latestFiles.map(file => `
        <div class="file-item" data-id="${file._id}">
          <div class="file-icon-wrapper">
            <div class="type-badge ${file.type}">${file.type}</div>
          </div>
          <div class="file-info">
            <span class="file-title">${file.title}</span>
            <span class="file-meta">${file.size} · ${file.uploadTime}</span>
          </div>
          <span class="arrow-icon">›</span>
        </div>
      `).join('');
      latestFiles.style.display = 'flex';
      latestEmpty.style.display = 'none';
    } else {
      latestFiles.style.display = 'none';
      latestEmpty.style.display = 'flex';
    }
  },
  
  showPage(pageName) {
    this.data.currentPage = pageName;
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    const page = document.getElementById('page-' + pageName);
    if (page) {
      page.classList.add('active');
    }
    window.scrollTo(0, 0);
  },
  
  bindEvents() {
    document.getElementById('searchBox').addEventListener('click', () => {
      this.showPage('search');
      setTimeout(() => {
        document.getElementById('searchInput').focus();
      }, 100);
    });
    
    document.getElementById('profileBtn').addEventListener('click', () => {
      this.showPage('profile');
      this.updateProfileUI();
    });
    
    document.getElementById('folderGrid').addEventListener('click', (e) => {
      const folderItem = e.target.closest('.folder-item');
      if (folderItem) {
        const folderId = folderItem.dataset.id;
        const folder = this.data.folders.find(f => f._id === folderId);
        if (folder) {
          this.goToFolderPage(folder);
        }
      }
    });
    
    document.getElementById('latestFiles').addEventListener('click', (e) => {
      const fileItem = e.target.closest('.file-item');
      if (fileItem) {
        const fileId = fileItem.dataset.id;
        const file = this.data.files.find(f => f._id === fileId);
        if (file) {
          this.goToFilePage(file);
        }
      }
    });
    
    document.getElementById('cancelBtn').addEventListener('click', () => {
      this.showPage('home');
    });

    document.getElementById('searchBackBtn').addEventListener('click', () => {
      this.showPage('home');
    });

    document.getElementById('fileBackBtn').addEventListener('click', () => {
      this.showPage('home');
    });

    document.getElementById('profileBackBtn').addEventListener('click', () => {
      this.showPage('home');
    });

    document.getElementById('uploadBackBtn').addEventListener('click', () => {
      this.showPage('profile');
      this.updateProfileUI();
    });

    document.getElementById('folderBackBtn').addEventListener('click', () => {
      this.showPage('home');
    });

    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.data.keyword = e.target.value;
      const clearIcon = document.getElementById('clearIcon');
      clearIcon.style.display = this.data.keyword ? 'block' : 'none';
      
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.doSearch();
      }, 300);
    });
    
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.doSearch();
      }
    });
    
    document.getElementById('clearIcon').addEventListener('click', () => {
      this.data.keyword = '';
      document.getElementById('searchInput').value = '';
      document.getElementById('clearIcon').style.display = 'none';
      this.data.resultList = [];
      this.data.searched = false;
      this.updateSearchResults();
    });
    
    document.getElementById('resultList').addEventListener('click', (e) => {
      const fileItem = e.target.closest('.file-item');
      if (fileItem) {
        const fileId = fileItem.dataset.id;
        const file = this.data.files.find(f => f._id === fileId);
        if (file) {
          this.goToFilePage(file);
        }
      }
    });
    
    document.getElementById('loginOrUploadItem').addEventListener('click', () => {
      if (this.data.isAdmin) {
        this.showPage('upload');
      } else {
        this.showLoginModal();
      }
    });
    
    document.getElementById('logoutItem').addEventListener('click', () => {
      this.logout();
      this.updateProfileUI();
    });
    
    document.getElementById('loginMask').addEventListener('click', () => {
      this.hideLoginModal();
    });
    
    document.getElementById('loginCancelBtn').addEventListener('click', () => {
      this.hideLoginModal();
    });
    
    document.getElementById('loginConfirmBtn').addEventListener('click', () => {
      this.doLogin();
    });
    
    document.getElementById('passwordInput').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.doLogin();
      }
    });
    
    document.getElementById('addFolderBtn').addEventListener('click', () => {
      this.showAddFolderModal();
    });
    
    document.getElementById('addFolderMask').addEventListener('click', () => {
      this.hideAddFolderModal();
    });
    
    document.getElementById('addFolderCancelBtn').addEventListener('click', () => {
      this.hideAddFolderModal();
    });
    
    document.getElementById('addFolderConfirmBtn').addEventListener('click', () => {
      this.addFolder();
    });
    
    document.getElementById('profileFolderList').addEventListener('click', (e) => {
      const folderInfo = e.target.closest('.folder-info');
      const deleteBtn = e.target.closest('.delete-folder-btn');
      
      if (deleteBtn) {
        const folderId = deleteBtn.dataset.id;
        if (confirm('确定要删除这个文件夹吗？文件夹内的所有文件也会被删除')) {
          this.deleteFolder(folderId);
        }
      } else if (folderInfo) {
        const folderId = folderInfo.dataset.id;
        const folder = this.data.folders.find(f => f._id === folderId);
        if (folder) {
          this.goToFolderPage(folder);
        }
      }
    });
    
    document.getElementById('uploadBox').addEventListener('click', () => {
      this.chooseFile();
    });
    
    document.getElementById('removeFileBtn').addEventListener('click', () => {
      this.removeFile();
    });
    
    document.getElementById('uploadFolderList').addEventListener('click', (e) => {
      const folderItem = e.target.closest('.folder-item');
      if (folderItem) {
        this.selectFolder(folderItem.dataset.id);
      }
    });
    
    document.getElementById('submitBtn').addEventListener('click', () => {
      this.submitUpload();
    });
    
    document.getElementById('fileInput').addEventListener('change', (e) => {
      this.handleFileSelect(e);
    });
    
    document.getElementById('imageInput').addEventListener('change', (e) => {
      this.handleImageSelect(e);
    });
    
    document.getElementById('folderFileList').addEventListener('click', (e) => {
      const fileMain = e.target.closest('.file-main');
      const fileDelete = e.target.closest('.file-delete');
      
      if (fileDelete) {
        const fileId = fileDelete.dataset.id;
        if (confirm('确定要删除这个文件吗？')) {
          this.deleteFile(fileId);
          this.loadFiles();
          this.goToFolderPage(this.data.currentFolder);
        }
      } else if (fileMain) {
        const fileId = fileMain.closest('.file-item').dataset.id;
        const file = this.data.files.find(f => f._id === fileId);
        if (file) {
          this.goToFilePage(file);
        }
      }
    });
    
    document.getElementById('bannerDots').addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (dot) {
        this.goToBanner(parseInt(dot.dataset.index));
      }
    });
  },
  
  updateProfileUI() {
    const avatarEmoji = document.getElementById('avatarEmoji');
    const username = document.getElementById('username');
    const userTip = document.getElementById('userTip');
    const loginOrUploadItem = document.getElementById('loginOrUploadItem');
    const loginIcon = document.getElementById('loginIcon');
    const loginText = document.getElementById('loginText');
    const folderManagement = document.getElementById('folderManagement');
    const logoutItem = document.getElementById('logoutItem');
    const profileFolderList = document.getElementById('profileFolderList');
    
    if (this.data.isAdmin) {
      avatarEmoji.textContent = '👨‍💼';
      username.textContent = '管理员';
      userTip.textContent = '可上传和管理资料';
      loginIcon.textContent = '📤';
      loginText.textContent = '上传资料';
      folderManagement.style.display = 'block';
      logoutItem.style.display = 'flex';
      
      profileFolderList.innerHTML = this.data.folders.map(folder => `
        <div class="folder-item">
          <div class="folder-info" data-id="${folder._id}">
            <span class="folder-emoji">${folder.icon}</span>
            <span class="folder-name">${folder.name}</span>
          </div>
          <div class="folder-actions">
            <span class="delete-folder-btn" data-id="${folder._id}">🗑️</span>
          </div>
        </div>
      `).join('');
    } else {
      avatarEmoji.textContent = '👤';
      username.textContent = '游客用户';
      userTip.textContent = '仅可查看资料';
      loginIcon.textContent = '🔐';
      loginText.textContent = '管理员登录';
      folderManagement.style.display = 'none';
      logoutItem.style.display = 'none';
    }
  },
  
  goToFolderPage(folder) {
    this.data.currentFolder = folder;
    this.data.currentFolderFiles = this.getFilesByFolder(folder._id);
    
    document.getElementById('folderPageIcon').textContent = folder.icon;
    document.getElementById('folderPageName').textContent = folder.name;
    document.getElementById('folderPageCount').textContent = this.data.currentFolderFiles.length + ' 个文件';
    
    const folderFileList = document.getElementById('folderFileList');
    const folderEmpty = document.getElementById('folderEmpty');
    
    if (this.data.currentFolderFiles.length > 0) {
      folderFileList.innerHTML = this.data.currentFolderFiles.map(file => `
        <div class="file-item" data-id="${file._id}">
          <div class="file-main">
            <div class="file-icon-wrapper">
              <div class="type-badge ${file.type}">${file.type}</div>
            </div>
            <div class="file-info">
              <span class="file-title">${file.title}</span>
              <span class="file-meta">${file.size} · ${file.uploadTime}</span>
            </div>
            <span class="arrow-icon">›</span>
          </div>
          ${this.data.isAdmin ? '<div class="file-delete" data-id="${file._id}"><span>🗑️</span></div>' : ''}
        </div>
      `).join('');
      folderFileList.style.display = 'flex';
      folderEmpty.style.display = 'none';
    } else {
      folderFileList.style.display = 'none';
      folderEmpty.style.display = 'flex';
    }
    
    this.showPage('folder');
  },
  
  goToFilePage(file) {
    const filePath = file.path || file.fileID || '';
    this.data.currentFile = {
      ...file,
      fileID: filePath,
      isImage: this.isImageType(file.type),
      isPdf: file.type === 'pdf',
      isOffice: ['doc', 'docx', 'xls', 'xlsx'].includes(file.type),
      typeText: this.getTypeText(file.type),
      typeEmoji: this.getTypeEmoji(file.type)
    };

    document.getElementById('fileTitle').textContent = file.title;
    document.getElementById('fileTypeText').textContent = this.getTypeText(file.type);

    const contentWrapper = document.getElementById('contentWrapper');
    if (this.data.currentFile.isImage) {
      contentWrapper.innerHTML = `
        <div class="image-preview">
          <img class="preview-image" src="${filePath}" alt="preview" onerror="this.parentElement.innerHTML='<div class=\\'doc-detail-notice\\'><p>图片加载失败，请检查文件路径</p></div>'">
        </div>
      `;
    } else if (this.data.currentFile.isPdf) {
      contentWrapper.innerHTML = `
        <div class="pdf-preview">
          <iframe class="pdf-iframe" src="${filePath}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" type="application/pdf"></iframe>
          <div class="doc-detail-notice" style="display:none;">
            <p>⚠️ PDF预览需要公网可访问的HTTPS地址，当前文件无法直接预览</p>
            <p>请通过底部的"下载"按钮下载后查看</p>
          </div>
        </div>
      `;
    } else if (this.data.currentFile.isOffice) {
      const officeUrl = this.getOfficePreviewUrl(filePath);
      contentWrapper.innerHTML = `
        <div class="office-preview">
          <iframe class="office-iframe" src="${officeUrl}" sandbox="allow-scripts allow-same-origin allow-popups" onerror="this.style.display='none';this.nextElementSibling.style.display='block';"></iframe>
          <div class="doc-detail-notice" style="display:none;">
            <p>⚠️ Office文档预览需要公网可访问的HTTPS地址</p>
            <p>请通过底部的"下载"按钮下载后查看</p>
          </div>
        </div>
      `;
    } else {
      contentWrapper.innerHTML = `
        <div class="doc-detail-view">
          <div class="doc-detail-icon">
            <span class="doc-icon-emoji">${this.getTypeEmoji(file.type)}</span>
          </div>
          <div class="doc-detail-info">
            <h3 class="doc-detail-title">${file.title}</h3>
            <p class="doc-detail-meta">文件类型：${this.getTypeText(file.type)}</p>
            <p class="doc-detail-meta">文件大小：${file.size}</p>
            <p class="doc-detail-meta">上传时间：${file.uploadTime}</p>
          </div>
          <div class="doc-detail-notice">
            <p>📋 此文件类型暂不支持在线预览，请点击下方按钮下载后查看</p>
          </div>
        </div>
      `;
    }
    
    const actionBar = document.getElementById('actionBar');
    if (this.data.currentFile.isImage) {
      actionBar.innerHTML = `
        <div class="action-btn" data-action="save">
          <span class="action-icon">💾</span>
          <span class="action-text">保存到手机</span>
        </div>
        <div class="action-btn" data-action="share">
          <span class="action-icon">📤</span>
          <span class="action-text">分享</span>
        </div>
        ${this.data.isAdmin ? `
        <div class="action-btn delete-btn" data-action="delete">
          <span class="action-icon">🗑️</span>
          <span class="action-text">删除</span>
        </div>
        ` : ''}
      `;
    } else {
      actionBar.innerHTML = `
        <div class="action-btn" data-action="view">
          <span class="action-icon">📖</span>
          <span class="action-text">查看文档</span>
        </div>
        <div class="action-btn" data-action="download">
          <span class="action-icon">📥</span>
          <span class="action-text">下载</span>
        </div>
        <div class="action-btn" data-action="share">
          <span class="action-icon">📤</span>
          <span class="action-text">分享</span>
        </div>
        ${this.data.isAdmin ? `
        <div class="action-btn delete-btn" data-action="delete">
          <span class="action-icon">🗑️</span>
          <span class="action-text">删除</span>
        </div>
        ` : ''}
      `;
    }
    
    actionBar.onclick = (e) => {
      const btn = e.target.closest('.action-btn');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'save') this.saveImage();
      else if (action === 'view') this.viewDocument();
      else if (action === 'download') this.downloadDocument();
      else if (action === 'share') this.shareFile();
      else if (action === 'delete') {
        if (confirm('确定要删除这个文件吗？')) {
          this.deleteFile(this.data.currentFile._id);
          this.showPage('home');
        }
      }
    };
    
    this.showPage('file');
  },
  
  getFiles() {
    return this.data.files;
  },
  
  getFilesByFolder(folderId) {
    const files = this.data.files.filter(f => f.folderId === folderId);
    return files.sort((a, b) => {
      const timeA = new Date(a.uploadTime || '1970-01-01').getTime();
      const timeB = new Date(b.uploadTime || '1970-01-01').getTime();
      return timeB - timeA;
    });
  },
  
  addFolder() {
    const folderName = document.getElementById('folderNameInput').value.trim();
    if (!folderName) {
      alert('请输入文件夹名称');
      return;
    }
    
    const folders = JSON.parse(localStorage.getItem('web_folders') || '[]');
    const newFolder = {
      _id: 'folder_' + Date.now(),
      name: folderName,
      icon: this.data.selectedIcon
    };
    folders.push(newFolder);
    localStorage.setItem('web_folders', JSON.stringify(folders));
    this.loadFolders();
    this.hideAddFolderModal();
    this.updateProfileUI();
    alert('添加成功');
  },
  
  deleteFolder(folderId) {
    let folders = JSON.parse(localStorage.getItem('web_folders') || '[]');
    folders = folders.filter(f => f._id !== folderId);
    localStorage.setItem('web_folders', JSON.stringify(folders));
    
    let files = JSON.parse(localStorage.getItem('web_files') || '[]');
    files = files.filter(f => f.folderId !== folderId);
    localStorage.setItem('web_files', JSON.stringify(files));
    
    this.loadFolders();
    this.loadFiles();
    this.updateProfileUI();
  },
  
  addFile(file) {
    const files = JSON.parse(localStorage.getItem('web_files') || '[]');
    const newFile = {
      _id: 'file_' + Date.now(),
      title: file.title,
      type: file.type,
      fileID: file.path || './pict/6.png',
      size: file.size,
      uploadTime: file.uploadTime,
      folderId: file.folderId
    };
    files.unshift(newFile);
    localStorage.setItem('web_files', JSON.stringify(files));
    
    const uploadHistory = JSON.parse(localStorage.getItem('web_uploadHistory') || '[]');
    uploadHistory.unshift({
      title: file.title,
      type: file.type,
      size: file.size,
      time: file.uploadTime
    });
    localStorage.setItem('web_uploadHistory', JSON.stringify(uploadHistory));
    
    this.loadFiles();
    return true;
  },
  
  deleteFile(fileId) {
    let files = JSON.parse(localStorage.getItem('web_files') || '[]');
    files = files.filter(f => f._id !== fileId);
    localStorage.setItem('web_files', JSON.stringify(files));
    this.loadFiles();
    return true;
  },
  
  login(password) {
    if (password === this.data.adminPassword) {
      this.data.isAdmin = true;
      localStorage.setItem('web_isAdmin', 'true');
      return { success: true, message: '登录成功' };
    }
    return { success: false, message: '密码错误' };
  },
  
  logout() {
    this.data.isAdmin = false;
    localStorage.setItem('web_isAdmin', 'false');
  },
  
  showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  },
  
  hideLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
  },
  
  doLogin() {
    const password = document.getElementById('passwordInput').value;
    const result = this.login(password);
    if (result.success) {
      this.hideLoginModal();
      this.updateProfileUI();
      alert(result.message);
    } else {
      alert(result.message);
    }
  },
  
  showAddFolderModal() {
    document.getElementById('addFolderModal').style.display = 'flex';
    document.getElementById('folderNameInput').value = '';
    this.data.selectedIcon = '📁';
    
    const iconSelect = document.getElementById('iconSelect');
    iconSelect.innerHTML = this.data.iconOptions.map(icon => `
      <div class="icon-option ${icon === '📁' ? 'selected' : ''}" data-icon="${icon}">
        <span>${icon}</span>
      </div>
    `).join('');
    
    iconSelect.onclick = (e) => {
      const option = e.target.closest('.icon-option');
      if (option) {
        this.data.selectedIcon = option.dataset.icon;
        document.querySelectorAll('.icon-option').forEach(opt => {
          opt.classList.toggle('selected', opt.dataset.icon === this.data.selectedIcon);
        });
      }
    };
  },
  
  hideAddFolderModal() {
    document.getElementById('addFolderModal').style.display = 'none';
  },
  
  doSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      this.data.resultList = [];
      this.data.searched = false;
      this.updateSearchResults();
      return;
    }
    
    const allFiles = this.data.files;
    this.data.resultList = allFiles.filter(file => 
      file.title.toLowerCase().includes(keyword.toLowerCase())
    );
    this.data.searched = true;
    this.updateSearchResults();
  },
  
  updateSearchResults() {
    const resultCount = document.getElementById('resultCount');
    const resultList = document.getElementById('resultList');
    const searchEmpty = document.getElementById('searchEmpty');
    
    if (this.data.searched) {
      resultCount.innerHTML = `<span>找到 ${this.data.resultList.length} 个相关资料</span>`;
      resultCount.style.display = 'block';
    } else {
      resultCount.style.display = 'none';
    }
    
    if (this.data.resultList.length > 0) {
      resultList.innerHTML = this.data.resultList.map(file => `
        <div class="file-item" data-id="${file._id}">
          <div class="file-icon-wrapper">
            <div class="type-badge ${file.type}">${file.type}</div>
          </div>
          <div class="file-info">
            <span class="file-title">${file.title}</span>
            <span class="file-meta">${file.size} · ${file.uploadTime}</span>
          </div>
          <span class="arrow-icon">›</span>
        </div>
      `).join('');
      resultList.style.display = 'flex';
      searchEmpty.style.display = 'none';
    } else if (this.data.searched) {
      resultList.style.display = 'none';
      searchEmpty.style.display = 'flex';
    } else {
      resultList.style.display = 'none';
      searchEmpty.style.display = 'none';
    }
  },
  
  chooseFile() {
    const choice = confirm('选择文件类型：\n确定 - 文档(PDF/Word/Excel)\n取消 - 图片');
    if (choice) {
      document.getElementById('fileInput').accept = '.pdf,.doc,.docx,.xls,.xlsx';
      document.getElementById('fileInput').click();
    } else {
      document.getElementById('imageInput').click();
    }
  },
  
  handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const ext = file.name.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'docx',
      'docx': 'docx',
      'xls': 'xlsx',
      'xlsx': 'xlsx'
    };
    
    this.data.selectedFile = {
      name: file.name,
      path: URL.createObjectURL(file),
      size: this.formatFileSize(file.size),
      type: typeMap[ext] || 'pdf'
    };
    
    this.data.fileTitle = file.name.replace(/\.[^/.]+$/, '');
    this.showSelectedFile();
  },
  
  handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const ext = file.name.split('.').pop().toLowerCase();
    
    this.data.selectedFile = {
      name: file.name,
      path: URL.createObjectURL(file),
      size: this.formatFileSize(file.size),
      type: ['jpg', 'jpeg', 'png', 'gif'].includes(ext) ? ext : 'jpg'
    };
    
    this.data.fileTitle = file.name.replace(/\.[^/.]+$/, '');
    this.showSelectedFile();
  },
  
  showSelectedFile() {
    document.getElementById('selectedFileBox').style.display = 'block';
    document.getElementById('selectedFileEmoji').textContent = this.getTypeEmoji(this.data.selectedFile.type);
    document.getElementById('selectedFileName').textContent = this.data.selectedFile.name;
    document.getElementById('selectedFileSize').textContent = this.data.selectedFile.size;
    document.getElementById('titleInput').value = this.data.fileTitle;
    
    const uploadFolderSection = document.getElementById('uploadFolderSection');
    const uploadBtnWrapper = document.getElementById('uploadBtnWrapper');
    
    uploadFolderSection.style.display = 'block';
    uploadBtnWrapper.style.display = 'block';
    
    const uploadFolderList = document.getElementById('uploadFolderList');
    uploadFolderList.innerHTML = this.data.folders.map(folder => `
      <div class="folder-item" data-id="${folder._id}">
        <span class="folder-emoji">${folder.icon}</span>
        <span class="folder-name">${folder.name}</span>
      </div>
    `).join('');
    
    this.loadUploadHistory();
  },
  
  loadUploadHistory() {
    const uploadHistory = JSON.parse(localStorage.getItem('web_uploadHistory') || '[]');
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    
    if (uploadHistory.length > 0) {
      historySection.style.display = 'block';
      historyList.innerHTML = uploadHistory.map(item => `
        <div class="history-item">
          <div class="history-icon-wrapper">
            <span class="history-icon">${this.getTypeEmoji(item.type)}</span>
          </div>
          <div class="history-info">
            <span class="history-title">${item.title}</span>
            <span class="history-time">${item.time}</span>
          </div>
          <div class="history-status success">已上传</div>
        </div>
      `).join('');
    }
  },
  
  removeFile() {
    this.data.selectedFile = null;
    this.data.fileTitle = '';
    this.data.selectedFolderId = null;
    
    document.getElementById('selectedFileBox').style.display = 'none';
    document.getElementById('uploadFolderSection').style.display = 'none';
    document.getElementById('uploadBtnWrapper').style.display = 'none';
  },
  
  selectFolder(folderId) {
    this.data.selectedFolderId = folderId;
    document.querySelectorAll('#uploadFolderList .folder-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.id === folderId);
    });
  },
  
  submitUpload() {
    const fileTitle = document.getElementById('titleInput').value.trim();
    if (!fileTitle) {
      alert('请输入文件标题');
      return;
    }
    
    if (!this.data.selectedFolderId) {
      alert('请选择分类文件夹');
      return;
    }
    
    this.addFile({
      title: fileTitle,
      type: this.data.selectedFile.type,
      path: this.data.selectedFile.path,
      size: this.data.selectedFile.size,
      uploadTime: this.formatDate(new Date()),
      folderId: this.data.selectedFolderId
    });
    
    alert('上传成功');
    this.removeFile();
    this.loadFiles();
    this.showPage('profile');
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
  
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  getOfficePreviewUrl(fileUrl) {
    const encodedUrl = encodeURIComponent(fileUrl);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  },

  saveImage() {
    const link = document.createElement('a');
    link.href = this.data.currentFile.fileID;
    link.download = this.data.currentFile.title;
    link.click();
    alert('图片已下载');
  },
  
  viewDocument() {
    const file = this.data.currentFile;
    const contentWrapper = document.getElementById('contentWrapper');
    contentWrapper.innerHTML = `
      <div class="doc-detail-view">
        <div class="doc-detail-icon">
          <span class="doc-icon-emoji">${file.typeEmoji}</span>
        </div>
        <div class="doc-detail-info">
          <h3 class="doc-detail-title">${file.title}</h3>
          <p class="doc-detail-meta">文件类型：${file.typeText}</p>
          <p class="doc-detail-meta">文件大小：${file.size}</p>
          <p class="doc-detail-meta">上传时间：${file.uploadTime}</p>
        </div>
        <div class="doc-detail-notice">
          <p>📋 此为预览版本，完整文档需要管理员上传真实文件</p>
        </div>
        <button class="doc-download-btn" id="docDownloadBtn">
          💾 模拟下载文档
        </button>
      </div>
    `;
    document.getElementById('docDownloadBtn').addEventListener('click', () => {
      this.downloadDocument();
    });
  },

  downloadDocument() {
    const file = this.data.currentFile;
    const fileData = this.generateSampleFile(file);
    const blob = new Blob([fileData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.title + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  },

  generateSampleFile(file) {
    return `【${file.title}】
文件类型：${file.typeText}
文件大小：${file.size}
上传时间：${file.uploadTime}

========================================
这是一份示例文档内容。

在实际系统中，这里将显示 ${file.title} 的完整内容。

由于当前使用的是网络虚拟数据，真实的文档文件需要管理员通过上传功能添加。

========================================
天宇人力技能培训赋能库
`;
  },
  
  shareFile() {
    if (navigator.share) {
      navigator.share({
        title: this.data.currentFile.title,
        text: '分享文件：' + this.data.currentFile.title,
        url: window.location.href
      });
    } else {
      alert('您的浏览器不支持分享功能，请复制链接分享');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});