import React from 'react'
import Taro from '@tarojs/taro'
import { Button, Text, View } from '@tarojs/components'
import { useApp } from '../../store'
import './index.scss'

const Profile: React.FC = () => {
  const { state, clearAllData } = useApp()
  const pendingTasks = state.careTasks.filter((task) => task.status === 'pending').length

  const showCloudStatus = () => Taro.showModal({ title: '当前为本地模式', content: '数据只保存在这台设备中。注册小程序并开通 CloudBase 后，才能启用云同步和微信订阅消息。', showCancel: false, confirmText: '知道了' })
  const showPrivacy = () => Taro.showModal({ title: '隐私说明', content: '当前版本不会把图片或养护数据上传到网络。接入第三方 AI 前会另行说明图片用途和保存规则。', showCancel: false, confirmText: '知道了' })
  const clearData = async () => {
    const response = await Taro.showModal({ title: '清除所有本地数据？', content: '花园植物、养护记录、任务和历史都会删除，且无法恢复。', confirmText: '确认清除', confirmColor: '#A33D34' })
    if (response.confirm) {
      clearAllData()
      Taro.showToast({ title: '本地数据已清除', icon: 'none' })
    }
  }

  return (
    <View className='profile-page'>
      <View className='profile-hero'>
        <View className='profile-avatar'>植</View>
        <View><Text className='profile-name'>植物爱好者</Text><Text className='profile-mode'>本地体验模式</Text></View>
        <Text className='profile-status' onClick={showCloudStatus}>未连接云端</Text>
      </View>

      <View className='profile-content'>
        <View className='stats-grid'>
          <View><Text>{state.gardenPlants.length}</Text><Text>花园植物</Text></View>
          <View><Text>{state.careRecords.length}</Text><Text>养护记录</Text></View>
          <View><Text>{pendingTasks}</Text><Text>待办任务</Text></View>
        </View>

        <View className='section'>
          <Text className='section-title profile-section-title'>使用记录</Text>
          <View className='menu-list card'>
            <View className='menu-row' onClick={() => Taro.navigateTo({ url: '/pages/history/index?type=identify' })}><View><Text>识别历史</Text><Text>{state.identifyHistory.length} 条记录</Text></View><Text>›</Text></View>
            <View className='menu-row' onClick={() => Taro.navigateTo({ url: '/pages/history/index?type=diagnose' })}><View><Text>诊断历史</Text><Text>{state.diagnosisHistory.length} 条记录</Text></View><Text>›</Text></View>
          </View>
        </View>

        <View className='section'>
          <Text className='section-title profile-section-title'>项目设置</Text>
          <View className='menu-list card'>
            <View className='menu-row' onClick={showCloudStatus}><View><Text>云服务与提醒</Text><Text>尚未开通</Text></View><Text>›</Text></View>
            <View className='menu-row' onClick={showPrivacy}><View><Text>隐私与数据</Text><Text>仅保存在本机</Text></View><Text>›</Text></View>
            <View className='menu-row' onClick={() => Taro.showModal({ title: 'AI 园林助手 v0.1.0', content: '面向普通植物爱好者的免费养护工具。当前识别和诊断结果由模拟服务生成。', showCancel: false })}><View><Text>关于项目</Text><Text>版本 0.1.0</Text></View><Text>›</Text></View>
          </View>
        </View>

        <Button className='danger-button clear-button' onClick={clearData}>清除所有本地数据</Button>
        <Text className='free-note'>永久免费 · 无广告 · 当前为本地 MVP</Text>
      </View>
    </View>
  )
}

export default Profile
