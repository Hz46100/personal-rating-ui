<template>
    <div class="dashboard-container">
      <!-- 左侧：录入表单 -->
      <div class="card form-section">
        <h3 class="card-title">录入专项练习成绩</h3>
        <div class="form-item">
          <label>练习模块</label>
          <select v-model="formData.moduleName">
            <option value="政治理论">政治理论</option>
            <option value="常识判断">常识判断</option>
            <option value="言语">言语</option>
            <option value="数量关系">数量关系</option>
            <option value="判断推理">判断推理</option>
            <option value="资料分析">资料分析</option>
          </select>
        </div>
        <div class="form-item">
          <label>总题数</label>
          <input type="number" v-model.number="formData.totalCount" placeholder="请输入总题数" />
        </div>
        <div class="form-item">
          <label>答对题数</label>
          <input type="number" v-model.number="formData.correctCount" placeholder="请输入答对数" />
        </div>
        <div class="form-item">
          <label>用时(秒)</label>
          <input type="number" v-model.number="formData.durationSeconds" placeholder="请输入用时" />
        </div>
        <button class="submit-btn" @click="submitRecord">提交并刷新看板</button>
      </div>
  
      <!-- 右侧：数据大盘 -->
      <div class="card charts-section">
        <h3 class="card-title">分析看板</h3>
        <div ref="radarChartRef" class="chart"></div>
        <div class="divider"></div>
        <div ref="barChartRef" class="chart"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import { submitPractice, getPracticeStats } from '@/api/practice'
  
  const formData = reactive({
    moduleName: '政治理论',
    totalCount: 20,
    correctCount: 0,
    durationSeconds: 0
  })
  
  const submitRecord = async () => {
    if (formData.correctCount > formData.totalCount) {
      alert('答对题数不能大于总题数！')
      return
    }
    
    try {
      const res = await submitPractice(formData)
      // 按照你现在的逻辑
      if (res.data.code === 200) {
        alert('录入成功！')
        fetchStatsData()
      } else {
        alert('提交失败: ' + (res.data.msg || '未知错误'))
      }
    } catch (error) {
      console.error('网络请求异常:', error)
      alert('请求异常，请检查后端是否启动或代理配置')
    }
  }
  
  const radarChartRef = ref(null)
  const barChartRef = ref(null)
  let radarChart = null
  let barChart = null
  
  const initCharts = () => {
    if (radarChartRef.value) radarChart = echarts.init(radarChartRef.value)
    if (barChartRef.value) barChart = echarts.init(barChartRef.value)
  }
  
  const fetchStatsData = async () => {
    try {
      const res = await getPracticeStats()
      const statsList = res.data.data // 注意：如果你的API返回结构是 {data: [...]}, 这里可能需要 res.data.data
      
      if (!statsList || statsList.length === 0) return
  
      const radarIndicator = statsList.map(item => ({ name: item.moduleName, max: 100 }))
      const radarData = statsList.map(item => item.accuracyRate)
      const barCategories = statsList.map(item => item.moduleName)
      const barData = statsList.map(item => item.avgDuration)
  
      radarChart.setOption({
        title: { text: '模块掌握度 (%)', left: 'center' },
        tooltip: {},
        radar: { indicator: radarIndicator },
        series: [{ type: 'radar', data: [{ value: radarData, name: '正确率' }], areaStyle: { color: 'rgba(64, 158, 255, 0.3)' } }]
      })
  
      barChart.setOption({
        title: { text: '平均用时 (秒)', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: barCategories },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: barData, itemStyle: { color: '#67C23A' }, barWidth: '40%' }]
      })
    } catch (error) {
      console.error('获取统计数据失败', error)
    }
  }
  
  const handleResize = () => {
    radarChart?.resize()
    barChart?.resize()
  }
  
  onMounted(() => {
    initCharts()
    fetchStatsData()
    window.addEventListener('resize', handleResize)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    radarChart?.dispose()
    barChart?.dispose()
  })
  </script>
  
  <style scoped>
  .dashboard-container { 
    display: flex; gap: 24px; padding: 24px; background-color: #f5f7fa; min-height: 100vh; 
  }
  .card { 
    background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  }
  .card-title { margin-top: 0; margin-bottom: 20px; font-size: 18px; color: #303133; border-left: 4px solid #409EFF; padding-left: 10px; }
  
  .form-section { width: 320px; flex-shrink: 0; }
  .charts-section { flex: 1; min-width: 0; }
  
  .form-item { margin-bottom: 20px; }
  .form-item label { display: block; margin-bottom: 8px; font-size: 14px; color: #606266; font-weight: 500; }
  .form-item input, .form-item select { 
    width: 100%; padding: 10px; border: 1px solid #dcdfe6; border-radius: 6px; box-sizing: border-box; transition: border-color 0.3s;
  }
  .form-item input:focus, .form-item select:focus { border-color: #409EFF; outline: none; }
  
  .submit-btn { 
    width: 100%; padding: 12px; background-color: #409EFF; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.3s;
  }
  .submit-btn:hover { background-color: #66b1ff; }
  
  .chart { height: 320px; width: 100%; }
  .divider { height: 1px; background: #ebeef5; margin: 20px 0; }
  </style>