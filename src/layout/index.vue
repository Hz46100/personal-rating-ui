<template>
    <el-container class="layout-container">
      <!-- 左侧导航栏 -->
      <el-aside width="220px" class="aside-menu">
        <div class="logo-box">
          <span class="logo-text">PersonalRating</span>
          <div class="logo-sub">分析记录系统</div>
        </div>
        
        <!-- router 属性让菜单激活路由跳转，default-active 绑定当前路径 -->
        <el-menu
          :default-active="route.path"
          router
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <!-- 套卷分析模块 -->
          <el-sub-menu index="1">
            <template #title>
              <span>📊 套卷分析</span>
            </template>
            <el-menu-item index="/exam/dashboard">趋势看板</el-menu-item>
            <el-menu-item index="/exam/history">历史记录</el-menu-item>
            <el-menu-item index="/exam/submit">成绩录入</el-menu-item>
          </el-sub-menu>
  
          <!-- 专项记录模块 -->
          <el-menu-item index="/topic/dashboard">
            <span>🎯 专项记录</span>
          </el-menu-item>
  
          <!-- 每日计划模块 -->
          <el-menu-item index="/plan/daily">
            <span>📅 每日计划</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
  
      <el-container>
        <!-- 顶部 Header -->
        <el-header class="header">
          <div class="header-left">
            <span style="font-weight: bold; color: #606266;">当前位置：{{ route.meta.title || '系统看板' }}</span>
          </div>
          <div class="header-right">
            <el-avatar size="small" style="background-color: #409EFF;">Me</el-avatar>
          </div>
        </el-header>
  
        <!-- 核心内容渲染区 -->
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  </script>
  
  <style scoped>
  .layout-container {
    height: 100vh;
    width: 100vw;
  }
  
  .aside-menu {
    background-color: #304156;
    transition: width 0.3s;
    display: flex;
    flex-direction: column;
  }
  
  .logo-box {
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #2b3643;
    color: #fff;
    padding: 10px 0;
  }
  
  .logo-text {
    font-size: 18px;
    font-weight: bold;
  }
  
  .logo-sub {
    font-size: 12px;
    color: #bfcbd9;
    margin-top: 4px;
  }
  
  .el-menu-vertical {
    border-right: none;
    flex: 1;
  }
  
  .header {
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
  }
  
  .main-content {
    background-color: #f0f2f5;
    padding: 20px;
  }
  
  /* 简单的路由切换动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  </style>