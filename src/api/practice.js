import axios from 'axios';

const request = axios.create({
  // 因为配置了 Vite 代理，这里直接留空即可，会自动走 5173 代理转发
  baseURL: '', 
  timeout: 5000
});

// 提交专项练习记录
export function submitPractice(data) {
  return request({
    url: '/api/practice/submit',
    method: 'post',
    data: data
  })
}

// 获取统计数据
export function getPracticeStats(params) {
  return request({
    url: '/api/practice/stats',
    method: 'get',
    params: params
  })
}