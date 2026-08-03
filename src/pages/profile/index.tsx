import React from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import { Taro } from '@tarojs/taro'
import './index.scss'

const Profile: React.FC = () => {
  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '退出成功',
            icon: 'success'
          })
        }
      }
    })
  }

  const menuItems = [
    { icon: '📚', title: '植物百科', desc: '探索上万种植物' },
    { icon: '💬', title: '在线咨询', desc: '专家一对一解答' },
    { icon: '🎯', title: '养护计划', desc: '定制专属方案' },
    { icon: '🏆', title: '成就中心', desc: '查看您的荣誉' },
    { icon: '⚙️', title: '设置', desc: '个性化配置' },
    { icon: 'ℹ️', title: '关于我们', desc: '了解AI园林助手' }
  ]

  return (
    <View className="profile-container">
      <View className="profile-header">
        <View className="avatar-section">
          <View className="avatar">
            <Text className="avatar-icon">🌱</Text>
          </View>
          <View className="user-info">
            <Text className="user-name">园艺爱好者</Text>
            <Text className="user-level">Lv.5 资深园丁</Text>
          </View>
        </View>
        <View className="stats-row">
          <View className="stat-item">
            <Text className="stat-value">12</Text>
            <Text className="stat-label">我的植物</Text>
          </View>
          <View className="stat-divider" />
          <View className="stat-item">
            <Text className="stat-value">48</Text>
            <Text className="stat-label">识别次数</Text>
          </View>
          <View className="stat-divider" />
          <View className="stat-item">
            <Text className="stat-value">2</Text>
            <Text className="stat-label">诊断记录</Text>
          </View>
        </View>
      </View>

      <View className="menu-section">
        <View className="menu-list">
          {menuItems.map((item, index) => (
            <View key={index} className="menu-item" onClick={() => {
              Taro.showToast({
                title: item.title,
                icon: 'none'
              })
            }}>
              <Text className="menu-icon">{item.icon}</Text>
              <View className="menu-content">
                <Text className="menu-title">{item.title}</Text>
                <Text className="menu-desc">{item.desc}</Text>
              </View>
              <Text className="menu-arrow">›</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="version-section">
        <Text className="version-text">AI园林助手 v1.0.0</Text>
        <Text className="copyright">© 2026 AI Plant Assistant</Text>
      </View>

      <Button className="logout-btn" onClick={handleLogout}>
        退出登录
      </Button>
    </View>
  )
}

export default Profile
