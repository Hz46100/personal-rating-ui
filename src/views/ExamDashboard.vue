<template>
  <div class="dashboard-container">
    <!-- 顶部全局控制栏 -->
    <el-row style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-card shadow="never"
          body-style="padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: bold; font-size: 16px; color: #303133;">
            <el-icon style="margin-right: 5px; vertical-align: middle;">
              <DataAnalysis />
            </el-icon>
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
import { getWeeklyTrend, getModuleStats } from '@/api/exam';

const timeRange = ref('30');

const trendChartRef = ref(null);
const radarChartRef = ref(null);
const timeChartRef = ref(null);

const chartInstances = shallowRef({
  trend: null,
  radar: null,
  time: null
});

const weeklyTrendData = ref([]);
const moduleStatsData = ref([]);

const buildParams = (days) => {
  const params = {};
  if (days !== 'all') {
    params.days = parseInt(days);
  }
  return params;
};

const fetchDashboardData = async (days) => {
  const params = buildParams(days);
  console.log(`正在请求 ${days === 'all' ? '全部' : `近 ${days} 天`} 的数据...`);

  const [trendRes, statsRes] = await Promise.all([
    getWeeklyTrend(params),
    getModuleStats(params)
  ]);

  if (trendRes.data.code === 200) {
    weeklyTrendData.value = trendRes.data.data;
  }
  if (statsRes.data.code === 200) {
    moduleStatsData.value = statsRes.data.data;
  }
};

const handleTimeChange = async (val) => {
  await fetchDashboardData(val);
  renderCharts();
};

const renderCharts = () => {
  initTrendChart();
  initRadarChart();
  initTimeChart();
};

const initTrendChart = () => {
  if (!chartInstances.value.trend) {
    chartInstances.value.trend = echarts.init(trendChartRef.value);
  }

  const data = weeklyTrendData.value.length > 0 ? weeklyTrendData.value : [
    { weekStr: '2026-W28', avgScore: 112.5, avgCorrectRate: 72.35, avgDuration: 118.5 },
    { weekStr: '2026-W29', avgScore: 115.8, avgCorrectRate: 75.20, avgDuration: 115.0 },
    { weekStr: '2026-W30', avgScore: 118.0, avgCorrectRate: 76.50, avgDuration: 112.0 },
    { weekStr: '2026-W31', avgScore: 120.5, avgCorrectRate: 78.30, avgDuration: 108.5 },
    { weekStr: '2026-W32', avgScore: 122.0, avgCorrectRate: 79.20, avgDuration: 105.0 }
  ];

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
      data: data.map(item => item.weekStr)
    },
    yAxis: [
      { type: 'value', name: '分数/用时', position: 'left' },
      { type: 'value', name: '正确率(%)', position: 'right', min: 0, max: 100 }
    ],
    series: [
      { name: '平均得分', type: 'line', smooth: true, itemStyle: { color: '#409EFF' }, data: data.map(item => item.avgScore) },
      { name: '平均用时(分)', type: 'line', smooth: true, itemStyle: { color: '#E6A23C' }, data: data.map(item => item.avgDuration) },
      { name: '正确率(%)', type: 'line', yAxisIndex: 1, smooth: true, itemStyle: { color: '#67C23A' }, data: data.map(item => item.avgCorrectRate) }
    ]
  };
  chartInstances.value.trend.setOption(option);
};

const initRadarChart = () => {
  if (!chartInstances.value.radar) {
    chartInstances.value.radar = echarts.init(radarChartRef.value);
  }

  const data = moduleStatsData.value.length > 0 ? moduleStatsData.value : [
    { moduleName: '言语理解', accuracyRate: 78.5 },
    { moduleName: '判断推理', accuracyRate: 85.0 },
    { moduleName: '资料分析', accuracyRate: 72.3 },
    { moduleName: '常识判断', accuracyRate: 68.0 },
    { moduleName: '数量关系', accuracyRate: 65.5 }
  ];

  const option = {
    tooltip: {},
    legend: { data: ['当前正确率', '目标正确率'], bottom: 0 },
    radar: {
      indicator: data.map(item => ({ name: item.moduleName, max: 100 })),
      shape: 'circle',
      splitArea: { areaStyle: { color: ['#f6f8fc', '#e9f0f9', '#dce7f6', '#cfdef3'] } }
    },
    series: [{
      name: '模块正确率',
      type: 'radar',
      data: [
        { value: data.map(item => item.accuracyRate), name: '当前正确率', areaStyle: { color: 'rgba(64, 158, 255, 0.4)' }, lineStyle: { color: '#409EFF' } },
        { value: data.map(() => 85), name: '目标正确率', lineStyle: { type: 'dashed', color: '#67C23A' } }
      ]
    }]
  };
  chartInstances.value.radar.setOption(option);
};

const initTimeChart = () => {
  if (!chartInstances.value.time) {
    chartInstances.value.time = echarts.init(timeChartRef.value);
  }

  const data = moduleStatsData.value.length > 0 ? moduleStatsData.value : [
    { moduleName: '言语理解', avgDuration: 32.5 },
    { moduleName: '判断推理', avgDuration: 35.2 },
    { moduleName: '资料分析', avgDuration: 30.8 },
    { moduleName: '常识判断', avgDuration: 15.5 },
    { moduleName: '数量关系', avgDuration: 28.0 }
  ];

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(item => item.moduleName),
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
      data: data.map(item => item.avgDuration)
    }]
  };
  chartInstances.value.time.setOption(option);
};

const handleResize = () => {
  if (chartInstances.value.trend) chartInstances.value.trend.resize();
  if (chartInstances.value.radar) chartInstances.value.radar.resize();
  if (chartInstances.value.time) chartInstances.value.time.resize();
};

onMounted(async () => {
  await nextTick();
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