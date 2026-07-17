<template>
    <div class="submit-container">
      <el-card header="📊 线下套卷成绩录入">
        <el-form :model="form" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="试卷名称">
                <el-input v-model="form.paperName" placeholder="如：2026年国考行测副省级模考" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="考试日期">
                <el-date-picker v-model="form.examDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="套卷总得分">
                <el-input-number v-model="form.totalScore" :precision="2" :step="0.5" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="总用时(分钟)">
                <el-input-number v-model="form.totalTime" :min="1" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="试卷评分">
                <el-input-number v-model="form.difficulty" :precision="1" :step="0.1" :min="0" :max="10" style="width: 100%" placeholder="例如 5.2" />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-divider content-position="left">🧩 各模块明细记录</el-divider>
  
          <el-table :data="form.moduleDetails" border style="width: 100%; margin-bottom: 20px;">
            <el-table-column label="模块名称" width="180">
              <template #default="scope">
                <el-select v-model="scope.row.moduleName" placeholder="选择模块">
                  <el-option label="政治理论" value="政治理论" />
                  <el-option label="常识判断" value="常识判断" />
                  <el-option label="言语理解与表达" value="言语理解与表达" />
                  <el-option label="数量关系" value="数量关系" />
                  <el-option label="判断推理" value="判断推理" />
                  <el-option label="资料分析" value="资料分析" />
                  <el-option label="申论" value="申论" />
                </el-select>
              </template>
            </el-table-column>
            
            <el-table-column label="答对题数" width="150">
              <template #default="scope">
                <el-input-number v-model="scope.row.correctCount" :min="0" size="small" />
              </template>
            </el-table-column>
  
            <el-table-column label="总题数" width="150">
              <template #default="scope">
                <el-input-number v-model="scope.row.totalCount" :min="1" size="small" />
              </template>
            </el-table-column>
  
            <el-table-column label="用时 (秒)">
              <template #default="scope">
                <el-input-number v-model="scope.row.durationSeconds" :min="0" :step="60" size="small" placeholder="用时秒数" />
              </template>
            </el-table-column>
  
            <el-table-column label="操作" width="100" align="center">
              <template #default="scope">
                <el-button type="danger" size="small" @click="removeModule(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
  
          <el-button type="success" plain @click="addModule" style="margin-bottom: 20px;">+ 添加模块明细</el-button>
  
          <div style="text-align: right;">
            <el-button type="primary" size="large" @click="onSubmit">提交保存</el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue';
  import { ElMessage } from 'element-plus';
  import { submitExam } from '@/api/exam';
  
  const form = reactive({
    paperName: '',
    examDate: new Date().toISOString().split('T')[0],
    totalScore: 70.0,
    totalTime: 120,
    difficulty: 5.0,
    moduleDetails: [
      { moduleName: '政治理论', correctCount: 15, totalCount: 20, durationSeconds: 600 },
      { moduleName: '常识判断', correctCount: 12, totalCount: 20, durationSeconds: 600 },
      { moduleName: '言语理解与表达', correctCount: 28, totalCount: 40, durationSeconds: 2100 },
      { moduleName: '数量关系', correctCount: 7, totalCount: 10, durationSeconds: 600 },
      { moduleName: '判断推理', correctCount: 28, totalCount: 40, durationSeconds: 2100 },
      { moduleName: '资料分析', correctCount: 16, totalCount: 20, durationSeconds: 1800 }
    ]
  });
  
  const addModule = () => {
    form.moduleDetails.push({ moduleName: '', correctCount: 0, totalCount: 10, durationSeconds: 600 });
  };
  
  const removeModule = (index) => {
    form.moduleDetails.splice(index, 1);
  };
  
  const onSubmit = async () => {
    if (!form.paperName) {
      ElMessage.warning('请输入试卷名称！');
      return;
    }
    try {
      const res = await submitExam(form);
      if (res.data.code === 200) {
        ElMessage.success('成绩录入成功！');
      } else {
        ElMessage.error(res.data.msg || '录入失败');
      }
    } catch (error) {
      ElMessage.error('网络请求失败');
    }
  };
  </script>
  
  <style scoped>
  .submit-container {
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
  }
  </style>