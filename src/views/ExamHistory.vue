<template>
  <div class="history-container">
    <el-card header="📋 套卷历史记录">
      <div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center;">
        <el-radio-group v-model="timeRange" size="small">
          <el-radio-button label="7">近 7 天</el-radio-button>
          <el-radio-button label="30">近 30 天</el-radio-button>
          <el-radio-button label="all">全部记录</el-radio-button>
        </el-radio-group>
        <el-input v-model="searchPaperName" placeholder="输入试卷名称搜索..." style="width: 300px" @keyup.enter="loadData"
          clearable />
        <el-button type="primary" @click="loadData">查询</el-button>
      </div>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column type="expand">
          <template #default="props">
            <div style="padding: 10px 50px;">
              <h4>📌 模块正确率明细</h4>
              <el-table :data="props.row.moduleDetails" size="small" border>
                <el-table-column prop="moduleName" label="模块名称" />
                <el-table-column label="对题/总题" width="150">
                  <template #default="scope">
                    {{ scope.row.correctCount }} / {{ scope.row.totalCount }}
                  </template>
                </el-table-column>
                <el-table-column label="模块正确率" width="200">
                  <template #default="scope">
                    <span>{{ scope.row.totalCount > 0 ? ((scope.row.correctCount / scope.row.totalCount) *
                      100).toFixed(1) + '%' : '-' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="耗时">
                  <template #default="scope">
                    {{ Math.floor(scope.row.durationSeconds / 60) }} 分 {{ scope.row.durationSeconds % 60 }} 秒
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="paperRecord.examDate" label="考试日期" width="130" />
        <el-table-column prop="paperRecord.paperName" label="试卷名称" />

        <el-table-column prop="paperRecord.totalScore" label="得分" width="100" align="center">
          <template #default="scope">
            <span style="font-weight: bold; color: #67C23A;">{{ scope.row.paperRecord.totalScore }}</span>
          </template>
        </el-table-column>

        <el-table-column label="正确率" width="120" align="center">
          <template #default="scope">
            <el-tag :type="parseFloat(calculateOverallRate(scope.row.moduleDetails)) < 65 ? 'danger' : 'success'"
              effect="plain" style="font-weight: bold;">
              {{ calculateOverallRate(scope.row.moduleDetails) }}%
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="paperRecord.totalTime" label="总用时(分)" width="110" align="center" />

        <el-table-column label="试卷评分" width="120" align="center">
          <template #default="scope">
            <el-tag type="warning" effect="dark" style="font-weight: bold; font-size: 14px;">
              {{ scope.row.paperRecord.difficulty.toFixed(1) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 15px; display: flex; justify-content: flex-end;">
        <el-pagination background layout="total, prev, pager, next" :current-page="page" :page-size="size"
          :total="total" @current-change="handlePageChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getExamList } from '@/api/exam';

const tableData = ref([]);
const searchPaperName = ref('');
const page = ref(1);
const size = ref(10);
const total = ref(0);
const timeRange = ref('all');

const calculateOverallRate = (details) => {
  if (!details || details.length === 0) return '0.0';
  const totalCorrect = details.reduce((sum, item) => sum + item.correctCount, 0);
  const totalQuestions = details.reduce((sum, item) => sum + item.totalCount, 0);
  if (totalQuestions === 0) return '0.0';
  return ((totalCorrect / totalQuestions) * 100).toFixed(1);
};

const loadData = async () => {
  const params = {
    page: page.value,
    size: size.value,
    paperName: searchPaperName.value
  };
  if (timeRange.value !== 'all') {
    params.days = parseInt(timeRange.value);
  }
  const listRes = await getExamList(params);
  if (listRes.data.code === 200) {
    tableData.value = listRes.data.data.records;
    total.value = listRes.data.data.total;
  }
};

const handlePageChange = (val) => {
  page.value = val;
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.history-container {
  width: 100%;
  box-sizing: border-box;
}
</style>