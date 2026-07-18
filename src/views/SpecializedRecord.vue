<template>
    <div class="page-container">
      <!-- 顶部 Tabs 切换 -->
      <div class="tabs-header">
        <div 
          :class="['tab-item', activeTab === 'dashboard' ? 'active' : '']" 
          @click="activeTab = 'dashboard'">趋势看板</div>
        <div 
          :class="['tab-item', activeTab === 'history' ? 'active' : '']" 
          @click="fetchHistoryData(); activeTab = 'history'">历史记录</div>
      </div>
  
      <!-- 1. 趋势看板页 -->
      <div v-if="activeTab === 'dashboard'" class="dashboard-container">
        <div class="card form-section">
          <h3 class="card-title">录入练习成绩</h3>
          <div class="form-item">
            <label>练习模块</label>
            <select v-model="formData.moduleName">
              <option>政治理论</option><option>常识判断</option><option>言语</option>
              <option>数量关系</option><option>判断推理</option><option>资料分析</option>
            </select>
          </div>
          <div class="form-item">
            <label>总题数</label>
            <input type="number" v-model.number="formData.totalCount" />
          </div>
          <div class="form-item">
            <label>答对题数</label>
            <input type="number" v-model.number="formData.correctCount" />
          </div>
          <div class="form-item">
            <label>用时(秒)</label>
            <input type="number" v-model.number="formData.durationSeconds" />
          </div>
          <button class="submit-btn" @click="submitRecord">提交并刷新看板</button>
        </div>
  
        <div class="card charts-section">
          <h3 class="card-title">数据分析</h3>
          <div ref="radarChartRef" class="chart"></div>
          <div class="divider"></div>
          <div ref="barChartRef" class="chart"></div>
        </div>
      </div>
  
      <!-- 2. 历史记录页 -->
      <div v-else class="history-container">
        <div class="card table-wrapper">
          <h3 class="card-title">所有录入明细</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>模块</th>
                <th>总题数</th>
                <th>答对</th>
                <th>用时(秒)</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in historyList" :key="index">
                <td>{{ item.moduleName }}</td>
                <td>{{ item.totalCount }}</td>
                <td>{{ item.correctCount }}</td>
                <td>{{ item.durationSeconds }}</td>
                <td>{{ item.createTime || '刚刚' }}</td>
              </tr>
              <tr v-if="historyList.length === 0">
                <td colspan="5" style="text-align: center; color: #999;">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
  import * as echarts from 'echarts'
  // 请确保这些 API 已在 @/api/practice 中定义
  import { submitPractice, getPracticeStats, getPracticeList } from '@/api/practice' 
  
  const activeTab = ref('dashboard')
  const historyList = ref([])
  
  // 表单数据
  const formData = reactive({
    moduleName: '政治理论', totalCount: 20, correctCount: 0, durationSeconds: 0
  })
  
  // --- 逻辑处理 ---
  const submitRecord = async () => {
    if (formData.correctCount > formData.totalCount) return alert('答对不能大于总题数')
    try {
      const res = await submitPractice(formData)
      if (res.data.code === 200) {
        alert('录入成功！')
        fetchStatsData() // 刷新看板
      } else {
        alert(res.data.msg || '提交失败')
      }
    } catch (e) { alert('请求异常') }
  }
  
  // 获取历史数据 (你需要确保 getPracticeList 接口存在)
  const fetchHistoryData = async () => {
    try {
      const res = await getPracticeList() // 假设后端提供列表接口
      historyList.value = res.data.data || []
    } catch (e) { console.error("获取记录失败", e) }
  }
  
  // 渲染看板逻辑
  const radarChartRef = ref(null)
  const barChartRef = ref(null)
  let radarChart = null, barChart = null
  
  const fetchStatsData = async () => {
    try {
      const res = await getPracticeStats()
      const stats = res.data.data
      if (!stats || !stats.length) return
      
      // 初始化图表 (仅在 Tab 为 dashboard 时执行)
      await nextTick()
      if (!radarChart) radarChart = echarts.init(radarChartRef.value)
      if (!barChart) barChart = echarts.init(barChartRef.value)
  
      radarChart.setOption({ 
        radar: { indicator: stats.map(i => ({ name: i.moduleName, max: 100 })) },
        series: [{ type: 'radar', data: [{ value: stats.map(i => i.accuracyRate) }] }]
      })
      barChart.setOption({
        xAxis: { type: 'category', data: stats.map(i => i.moduleName) },
        series: [{ type: 'bar', data: stats.map(i => i.avgDuration), itemStyle: { color: '#67C23A' } }]
      })
    } catch (e) { console.error(e) }
  }
  
  onMounted(() => { fetchStatsData() })
  </script>
  
  <style scoped>
  .page-container { padding: 20px; background: #f5f7fa; min-height: 100vh; }
  .tabs-header { display: flex; gap: 20px; margin-bottom: 20px; border-bottom: 2px solid #e4e7ed; padding-bottom: 10px; }
  .tab-item { cursor: pointer; padding: 5px 20px; color: #606266; font-weight: bold; }
  .tab-item.active { color: #409EFF; border-bottom: 2px solid #409EFF; }
  
  /* 你的原布局样式 */
  .dashboard-container { display: flex; gap: 20px; }
  .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
  .form-section { width: 300px; }
  .charts-section { flex: 1; }
  .chart { height: 300px; }
  
  /* 表格样式 */
  .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .data-table th, .data-table td { padding: 12px; border-bottom: 1px solid #ebeef5; text-align: left; }
  .data-table th { background: #fafafa; }
  </style>