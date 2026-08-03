export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/identify/index',
    'pages/garden/index',
    'pages/diagnose/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#52c41a',
    navigationBarTitleText: 'AI园林助手',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#52c41a',
    backgroundColor: '#fff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'images/tab/home.png',
        selectedIconPath: 'images/tab/home-active.png'
      },
      {
        pagePath: 'pages/identify/index',
        text: '识别',
        iconPath: 'images/tab/identify.png',
        selectedIconPath: 'images/tab/identify-active.png'
      },
      {
        pagePath: 'pages/garden/index',
        text: '花园',
        iconPath: 'images/tab/garden.png',
        selectedIconPath: 'images/tab/garden-active.png'
      },
      {
        pagePath: 'pages/diagnose/index',
        text: '诊断',
        iconPath: 'images/tab/diagnose.png',
        selectedIconPath: 'images/tab/diagnose-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'images/tab/profile.png',
        selectedIconPath: 'images/tab/profile-active.png'
      }
    ]
  }
})
