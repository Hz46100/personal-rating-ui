<template>
    <div class="dashboard-container">
      <!-- 顶部全局控制栏 -->
      <el-row style="margin-bottom: 20px;">
        <el-col :span="24">
          <el-card 
            shadow="never" 
            body-style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;"
          >
            <div style="font-weight: bold; font-size: 16px; color: #303133;">
              <el-icon style="margin-right: 5px; vertical-align: middle;"><DataAnalysis /></el-icon>
              <span style="vertical-align: middle;">数据分析视图</span>
            </div>
            
            <!-- 时间筛选器 -->
            <el-radio-group v-model="timeRange" @change="handleTimeChange" size="large">
              <el-radio-button label="7">近 7 天</el-radio-button>
              <el-radio-button label="30">近 30 天</el-radio-button>
              <el-radio-button label="all">全部记录</el-radio-button>
            </el-radio-group>
          </el-card>
        </el-col>
      </el-row>
  
      <el-row :gutter="20">
        <!-- 综合趋势折线图：得分、正确率、用时 -->
        <el-col :span="24" style="margin-bottom: 20px;">
          <el-card header="📈 综合能力趋势 (得分 / 正确率 / 用时)">
            <div ref="trendChartRef" style="width: 100%; height: 350px;"></div>
          </el-card>
        </el-col>
      </el-row>
  
      <el-row :gutter="20">
        <!-- 模块正确率雷达图 -->
        <el-col :span="12">
          <el-card header="🎯 各模块掌握度 (雷达图)">
            <div ref="radarChartRef" style="width: 100%; height: 400px;"></div>
          </el-card>
        </el-col>
  
        <!-- 模块用时柱状图 -->
        <el-col :span="12">
          <el-card header="⏱️ 各模块平均用时 (分钟)">
            <div ref="timeChartRef" style="width: 100%; height: 400px;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick, shallowRef } from 'vue';
  import * as echarts from 'echarts';
  import { DataAnalysis } from '@element-plus/icons-vue';
  
  // 定义时间范围：默认为近 30 天
  const timeRange = ref('30'); 
  
  const trendChartRef = ref(null);
  const radarChartRef = ref(null);
  const timeChartRef = ref(null);
  
  // 使用 shallowRef 存储 ECharts 实例，避免 Vue 响应式代理带来的性能问题
  const chartInstances = shallowRef({
    trend: null,
    radar: null,
    time: null
  });
  
  // 模拟向后端请求数据的方法
  const fetchDashboardData = async (days) => {
    // TODO: 后续这里替换为真实的 API 调用
    // const res = await getDashboardAnalysis({ days: days === 'all' ? null : parseInt(days) });
    console.log(`正在请求 ${days === 'all' ? '全部' : `近 ${days} 天`} 的数据...`);
    
    // 模拟接口调用延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  };
  
  // 当时间筛选器改变时触发
  const handleTimeChange = async (val) => {
    await fetchDashboardData(val);
    // 数据返回后重新渲染图表
    renderCharts();
  };
  
  const renderCharts = () => {
    initTrendChart();
    initRadarChart();
    initTimeChart();
  };
  
  // 初始化折线图 (综合趋势)
  const initTrendChart = () => {
    if (!chartInstances.value.trend) {
      chartInstances.value.trend = echarts.init(trendChartRef.value);
    }
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { 
        data: ['平均得分', '正确率(%)', '平均用时(分)'],
        bottom: 0 
      },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['3月第1周', '3月第2周', '3月第3周', '3月第4周', '4月第1周'] // 真实环境从后端获取
      },
      yAxis: [
        { type: 'value', name: '分数/用时', position: 'left' },
        { type: 'value', name: '正确率(%)', position: 'right', min: 0, max: 100 }
      ],
      series: [
        { name: '平均得分', type: 'line', smooth: true, itemStyle: { color: '#409EFF' }, data: [68, 70, 72.5, 71, 75] },
        { name: '平均用时(分)', type: 'line', smooth: true, itemStyle: { color: '#E6A23C' }, data: [120, 118, 115, 122, 110] },
        { name: '正确率(%)', type: 'line', yAxisIndex: 1, smooth: true, itemStyle: { color: '#67C23A' }, data: [62, 65, 68, 66, 73] }
      ]
    };
    chartInstances.value.trend.setOption(option);
  };
  
  // 初始化雷达图 (模块正确率)
  const initRadarChart = () => {
    if (!chartInstances.value.radar) {
      chartInstances.value.radar = echarts.init(radarChartRef.value);
    }
    const option = {
      tooltip: {},
      legend: { data: ['当前正确率', '目标正确率'], bottom: 0 },
      radar: {
        indicator: [
          { name: '政治理论', max: 100 },
          { name: '常识判断', max: 100 },
          { name: '言语', max: 100 },
          { name: '数量关系', max: 100 },
          { name: '判断推理', max: 100 },
          { name: '资料分析', max: 100 }
        ],
        shape: 'circle',
        splitArea: { areaStyle: { color: ['#f6f8fc', '#e9f0f9', '#dce7f6', '#cfdef3'] } }
      },
      series: [{
        name: '模块正确率',
        type: 'radar',
        data: [
          { value: [85, 60, 75, 40, 80, 85], name: '当前正确率', areaStyle: { color: 'rgba(64, 158, 255, 0.4)' }, lineStyle: { color: '#409EFF' } },
          { value: [90, 70, 80, 60, 85, 90], name: '目标正确率', lineStyle: { type: 'dashed', color: '#67C23A' } }
        ]
      }]
    };
    chartInstances.value.radar.setOption(option);
  };
  
  // 初始化柱状图 (模块用时)
  const initTimeChart = () => {
    if (!chartInstances.value.time) {
      chartInstances.value.time = echarts.init(timeChartRef.value);
    }
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['政治理论', '常识判断', '言语', '数量关系', '判断推理', '资料分析'],
        axisLabel: { interval: 0, rotate: 30 }
      },
      yAxis: { type: 'value', name: '时间(分钟)' },
      series: [{
        name: '平均用时',
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 1, color: '#188df0' }
          ])
        },
        data: [5, 10, 35, 20, 35, 30] 
      }]
    };
    chartInstances.value.time.setOption(option);
  };
  
  // 监听窗口大小变化自适应图表
  const handleResize = () => {
    if (chartInstances.value.trend) chartInstances.value.trend.resize();
    if (chartInstances.value.radar) chartInstances.value.radar.resize();
    if (chartInstances.value.time) chartInstances.value.time.resize();
  };
  
  onMounted(async () => {
    await nextTick();
    // 初次加载默认天数的数据
    await fetchDashboardData(timeRange.value);
    renderCharts();
    window.addEventListener('resize', handleResize);
  });
  </script>
  
  <style scoped>
  .dashboard-container {
    width: 100%;
    box-sizing: border-box;
  }
  </style>