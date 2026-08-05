import fernImage from '../assets/plants/fern.jpg'
import ficusImage from '../assets/plants/ficus.jpg'
import haworthiaImage from '../assets/plants/haworthia.jpg'
import monsteraImage from '../assets/plants/monstera.jpg'
import { PlantKnowledge } from '../types'

export const plantKnowledge: PlantKnowledge[] = [
  {
    id: 'monstera-deliciosa',
    name: '龟背竹',
    latinName: 'Monstera deliciosa',
    aliases: ['蓬莱蕉', '电线兰'],
    summary: '叶片宽大并带有自然孔裂的常见室内观叶植物，喜欢明亮散射光和温暖湿润的环境。',
    imageUrl: monsteraImage,
    confidence: 0.94,
    tags: ['观叶', '室内', '耐阴'],
    care: {
      light: '明亮散射光，避免夏季正午强光直晒。',
      water: '表层土壤干燥约 2 至 3 厘米后浇透，避免盆底积水。',
      temperature: '适宜温度 18 至 30℃，冬季尽量保持在 10℃以上。',
      soil: '使用疏松、排水良好的基质，可加入树皮或珍珠岩。',
      fertilizer: '生长期每 3 至 4 周使用一次稀释的通用肥。',
      humidity: '喜欢较高空气湿度，适宜湿度 60% 至 80%，干燥季节可向叶面喷水或使用加湿器。'
    },
    safety: '汁液含草酸钙，对猫狗及儿童有刺激性，应避免误食。'
  },
  {
    id: 'ficus-elastica',
    name: '橡皮树',
    latinName: 'Ficus elastica',
    aliases: ['印度榕', '橡胶榕'],
    summary: '叶片厚实有光泽的室内观叶植物，喜欢明亮散射光和相对稳定的温暖环境。',
    imageUrl: ficusImage,
    confidence: 0.91,
    tags: ['观叶', '室内', '木本'],
    care: {
      light: '明亮散射光最佳，可接受柔和的早晚直射光。',
      water: '表层土壤干燥后再浇透，避免盆土长期潮湿。',
      temperature: '适宜温度 18 至 28℃，避免冷风和突然降温。',
      soil: '使用疏松、透气且排水良好的室内植物基质。',
      fertilizer: '春夏每月使用一次稀释肥料，秋冬减少。',
      humidity: '适应中等空气湿度，适宜湿度 40% 至 60%，定期擦拭叶面灰尘即可。'
    },
    safety: '折断后的乳白色汁液可能刺激皮肤，对宠物也有风险，应避免接触和误食。'
  },
  {
    id: 'haworthiopsis-attenuata',
    name: '条纹十二卷',
    latinName: 'Haworthiopsis attenuata',
    aliases: ['锦鸡尾', '斑马十二卷'],
    summary: '叶片紧凑并带有白色横纹的多肉植物，体型小巧，适合明亮的室内窗台。',
    imageUrl: haworthiaImage,
    confidence: 0.89,
    tags: ['多肉', '耐旱', '小型'],
    care: {
      light: '喜欢明亮散射光，避免夏季强烈直晒灼伤叶片。',
      water: '基质大部分干燥后再浇水，避免水留在叶心。',
      temperature: '适宜温度 15 至 28℃，冬季注意防寒。',
      soil: '选择颗粒比例较高、排水快的多肉植物基质。',
      fertilizer: '春秋生长期少量施用低浓度肥料即可。',
      humidity: '喜欢干燥环境，适宜湿度 30% 至 50%，环境过湿易导致腐烂，无需喷水增湿。'
    },
    safety: '通常被认为对猫狗毒性较低，但仍不建议让宠物啃食。'
  },
  {
    id: 'nephrolepis-exaltata',
    name: '肾蕨',
    latinName: 'Nephrolepis exaltata',
    aliases: ['波士顿蕨', '蜈蚣草'],
    summary: '羽状叶片层层展开的常见蕨类植物，喜欢较高空气湿度和柔和散射光。',
    imageUrl: fernImage,
    confidence: 0.88,
    tags: ['蕨类', '室内', '喜湿润'],
    care: {
      light: '柔和散射光最佳，避免强烈直射光使叶尖干枯。',
      water: '保持基质均匀微湿，同时避免盆底长期积水。',
      temperature: '适宜温度 16 至 26℃，远离空调和暖气直吹。',
      soil: '使用富含腐殖质、保水且排水良好的疏松基质。',
      fertilizer: '生长期每月使用一次低浓度观叶植物肥。',
      humidity: '需要较高空气湿度，适宜湿度 60% 至 80%，干燥环境易导致叶尖枯黄，建议经常喷雾。'
    },
    safety: '通常被认为对猫狗无明显毒性，但大量啃食仍可能造成消化不适。'
  }
]

export function findPlantKnowledge(id?: string): PlantKnowledge | undefined {
  return id ? plantKnowledge.find((plant) => plant.id === id) : undefined
}

export function searchPlantKnowledge(keyword: string): PlantKnowledge[] {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) return []
  return plantKnowledge.filter((plant) =>
    [plant.name, plant.latinName, ...plant.aliases].join(' ').toLowerCase().includes(normalized)
  )
}
