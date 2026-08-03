import React, { useState } from 'react'
import Taro, { useLoad } from '@tarojs/taro'
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components'
import ImageUploader from '../../components/ImageUploader'
import { plantKnowledge } from '../../data/plants'
import { createId, useApp } from '../../store'
import { toDateValue } from '../../utils/date'
import './index.scss'

const PlantForm: React.FC = () => {
  const { state, savePlant } = useApp()
  const [editingId, setEditingId] = useState('')
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [imageUrl, setImageUrl] = useState(plantKnowledge[1].imageUrl)
  const [location, setLocation] = useState('客厅')
  const [acquiredAt, setAcquiredAt] = useState(toDateValue())
  const [note, setNote] = useState('')

  useLoad((options) => {
    if (!options.id) return
    const plant = state.gardenPlants.find((item) => item.id === options.id)
    if (!plant) return
    setEditingId(plant.id)
    setName(plant.name)
    setNickname(plant.nickname)
    setImageUrl(plant.imageUrl)
    setLocation(plant.location)
    setAcquiredAt(plant.acquiredAt)
    setNote(plant.note)
    Taro.setNavigationBarTitle({ title: '编辑植物' })
  })

  const save = () => {
    const normalizedName = name.trim()
    if (!normalizedName) {
      Taro.showToast({ title: '请输入植物名称', icon: 'none' })
      return
    }
    const existing = state.gardenPlants.find((plant) => plant.id === editingId)
    savePlant({
      id: existing?.id || createId('plant'),
      knowledgeId: existing?.knowledgeId,
      name: normalizedName,
      nickname: nickname.trim() || normalizedName,
      imageUrl,
      location: location.trim() || '未设置位置',
      acquiredAt,
      note: note.trim(),
      createdAt: existing?.createdAt || new Date().toISOString()
    })
    Taro.showToast({ title: existing ? '修改已保存' : '植物已添加', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 450)
  }

  return (
    <View className='page-shell plant-form-page'>
      <View className='page-heading'><Text className='page-title'>建立植物档案</Text><Text className='page-copy'>记录你如何称呼它、摆在哪里，以及从什么时候开始养护。</Text></View>
      <ImageUploader compact value={imageUrl} title='添加植物照片' onSelect={setImageUrl} />
      <Text className='field-label'>植物名称 *</Text>
      <Input className='field-input' value={name} maxlength={30} placeholder='例如：绿萝' onInput={(event) => { const value = event.detail.value; setName(value); if (!nickname) setNickname(value) }} />
      <Text className='field-label'>昵称</Text>
      <Input className='field-input' value={nickname} maxlength={30} placeholder='例如：小绿' onInput={(event) => setNickname(event.detail.value)} />
      <Text className='field-label'>摆放位置</Text>
      <Input className='field-input' value={location} maxlength={30} placeholder='例如：客厅窗边' onInput={(event) => setLocation(event.detail.value)} />
      <Text className='field-label'>获得日期</Text>
      <Picker mode='date' value={acquiredAt} onChange={(event) => setAcquiredAt(String(event.detail.value))}><View className='picker-field'>{acquiredAt}</View></Picker>
      <Text className='field-label'>备注</Text>
      <Textarea className='field-textarea plant-note-input' value={note} maxlength={300} placeholder='记录来源、换盆情况或其他信息' onInput={(event) => setNote(event.detail.value)} />
      <Button className='primary-button save-button' onClick={save}>{editingId ? '保存修改' : '添加到花园'}</Button>
    </View>
  )
}

export default PlantForm
