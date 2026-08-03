import React from 'react'
import { Button, Input, View } from '@tarojs/components'
import './index.scss'

interface SearchBarProps {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  onSearch: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({ value, placeholder = '搜索植物名称', onChange, onSearch }) => (
  <View className='search-bar'>
    <Input
      className='search-bar__input'
      value={value}
      placeholder={placeholder}
      confirmType='search'
      onInput={(event) => onChange(event.detail.value)}
      onConfirm={onSearch}
    />
    <Button className='search-bar__button' onClick={onSearch}>搜索</Button>
  </View>
)

export default SearchBar
