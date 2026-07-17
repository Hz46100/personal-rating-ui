import axios from 'axios';

const request = axios.create({
  // 因为配置了 Vite 代理，这里直接留空即可，会自动走 5173 代理转发
  baseURL: '', 
  timeout: 5000
});

// 1. 提交套卷成绩
export function submitExam(data) {
  return request.post('/exam/submit', data);
}

// 2. 获取历史记录列表
export function getExamList(params) {
  return request.get('/exam/list', { params });
}

// 3. 获取每周趋势分析
export function getWeeklyTrend() {
  return request.get('/exam/weekly-trend');
}