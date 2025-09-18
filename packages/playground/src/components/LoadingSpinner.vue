<template>
  <div class="loading-container">
    <div class="logo-spinner">
      <div class="spinner-ring"></div>
      <div class="spinner-ring spinner-ring-2"></div>
      <div class="logo-container">
        <img src="/logo.svg" alt="TinyRobot" class="logo" />
      </div>
    </div>
    <div class="loading-content">
      <h3 class="loading-title">{{ title }}</h3>
      <p class="loading-text">{{ text }}</p>
      <div class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  title?: string
}

withDefaults(defineProps<Props>(), {
  text: '正在初始化 TinyRobot Playground...',
  title: 'TinyRobot Playground',
})
</script>

<style scoped lang="less">
.loading-container {
  // CSS 自定义属性定义
  --logo-size: 64px;
  --ring-size: 120px;
  --container-padding: 60px;
  --container-gap: 32px;
  --animation-duration: 2s;
  --pulse-duration: 1.5s;

  // 亮色模式颜色变量
  --primary-color: #655bf8;
  --secondary-color: #42b883;
  --accent-color: #ff6b6b;
  --ring-bg: rgba(101, 91, 248, 0.1);
  --text-color: #666;
  --title-color: #333;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--container-padding);
  gap: var(--container-gap);
  min-height: 300px;

  .logo-spinner {
    position: relative;
    width: var(--ring-size);
    height: var(--ring-size);
    display: flex;
    align-items: center;
    justify-content: center;

    .spinner-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid transparent;
      border-radius: 50%;
      animation: rotate var(--animation-duration) linear infinite;

      &::before {
        content: '';
        position: absolute;
        top: -3px;
        left: -3px;
        right: -3px;
        bottom: -3px;
        border: 3px solid var(--ring-bg);
        border-radius: 50%;
      }

      // 第一个环
      border-top-color: var(--primary-color);
      border-right-color: var(--primary-color);
    }

    .spinner-ring-2 {
      width: 80%;
      height: 80%;
      border-top-color: var(--secondary-color);
      border-left-color: var(--secondary-color);
      animation-direction: reverse;
      animation-duration: calc(var(--animation-duration) * 1.5);
    }

    .logo-container {
      position: relative;
      width: var(--logo-size);
      height: var(--logo-size);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg, #ffffff);
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: pulse var(--pulse-duration) ease-in-out infinite;

      .logo {
        width: 80%;
        height: 80%;
        object-fit: contain;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }
    }
  }

  .loading-content {
    text-align: center;
    max-width: 300px;

    .loading-title {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--title-color);
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: titleGlow var(--pulse-duration) ease-in-out infinite;
    }

    .loading-text {
      color: var(--text-color);
      font-size: 14px;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .loading-dots {
      display: flex;
      justify-content: center;
      gap: 4px;

      .dot {
        width: 6px;
        height: 6px;
        background: var(--primary-color);
        border-radius: 50%;
        animation: dotBounce 1.4s ease-in-out infinite both;

        &:nth-child(1) {
          animation-delay: -0.32s;
        }
        &:nth-child(2) {
          animation-delay: -0.16s;
        }
        &:nth-child(3) {
          animation-delay: 0s;
        }
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 30px rgba(101, 91, 248, 0.3);
  }
}

@keyframes titleGlow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes dotBounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
