import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout, // 根路径使用我们刚才创建的 Layout
      redirect: '/exam/dashboard', // 默认重定向到看板
      children: [
        {
          path: 'exam/dashboard',
          name: 'ExamDashboard',
          component: () => import('@/views/ExamDashboard.vue'),
          meta: { title: '套卷趋势看板' }
        },
        {
          path: 'exam/history',
          name: 'ExamHistory',
          component: () => import('@/views/ExamHistory.vue'),
          meta: { title: '套卷历史记录' }
        },
        {
          path: 'exam/submit',
          name: 'ExamSubmit',
          component: () => import('@/views/ExamSubmit.vue'),
          meta: { title: '套卷成绩录入' }
        },
        // --- 预留给后续的模块，目前可以先不建文件 ---
        {
          path: 'topic/dashboard',
          name: 'TopicDashboard',
          // component: () => import('@/views/TopicDashboard.vue'),
          meta: { title: '专项记录分析' }
        },
        {
          path: 'plan/daily',
          name: 'PlanDaily',
          // component: () => import('@/views/PlanDaily.vue'),
          meta: { title: '每日计划进度' }
        }
      ]
    }
  ]
})

export default router