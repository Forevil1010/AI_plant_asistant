export default defineAppConfig({
  lazyCodeLoading: 'requiredComponents',
  pages: [
    'pages/home/index',
    'pages/identify/index',
    'pages/garden/index',
    'pages/diagnose/index',
    'pages/profile/index',
    'pages/plant-form/index',
    'pages/plant-detail/index',
    'pages/plant-knowledge/index',
    'pages/task-form/index',
    'pages/history/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#F6F8F5',
    navigationBarTitleText: 'AI 园林助手',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F6F8F5'
  },
  tabBar: {
    color: '#6E756F',
    selectedColor: '#176B45',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页', iconPath: 'images/tab/home.png', selectedIconPath: 'images/tab/home-active.png' },
      { pagePath: 'pages/identify/index', text: '识别', iconPath: 'images/tab/identify.png', selectedIconPath: 'images/tab/identify-active.png' },
      { pagePath: 'pages/garden/index', text: '花园', iconPath: 'images/tab/garden.png', selectedIconPath: 'images/tab/garden-active.png' },
      { pagePath: 'pages/diagnose/index', text: '诊断', iconPath: 'images/tab/diagnose.png', selectedIconPath: 'images/tab/diagnose-active.png' },
      { pagePath: 'pages/profile/index', text: '我的', iconPath: 'images/tab/profile.png', selectedIconPath: 'images/tab/profile-active.png' }
    ]
  }
})
