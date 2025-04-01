# Yuanziguan AI | 原子观 AI

This repository contains AI-related code and tools for the Yuanziguan project. It includes data analysis, visualization, and processing tools for various cryptocurrency datasets.

此存储库包含元子观项目的AI相关代码和工具。它包括用于各种加密货币数据集的数据分析、可视化和处理工具。

This is an automated scraping tool designed to feed the Yuanziguan proprietary LLM, which specializes in crypto market tracking and forecasting. The project is incubated by JL Capital.

这是一个自动化的数据抓取工具，旨在为原子观专有的大语言模型(LLM)提供数据，该模型专注于加密货币市场跟踪和预测。该项目由JL Capital孵化。

## Directory Structure | 目录结构

- **Coinglass/**: Scripts and tools for processing Coinglass data
  - **01-decrypt.js**: Decryption utility for Coinglass data

- **Coinglass/**: 用于处理Coinglass数据的脚本和工具
  - **01-decrypt.js**: Coinglass数据的解密工具

## Automation | 自动化

This repository is set up with automatic git commits and pushes:

- `auto-push.sh`: Script that automatically adds, commits, and pushes changes
- Cron job scheduled to run hourly to push changes to GitHub

该存储库设置了自动git提交和推送：

- `auto-push.sh`: 自动添加、提交和推送变更的脚本
- 计划每小时运行的Cron作业，将变更推送到GitHub

## Getting Started | 入门指南

1. Clone this repository
2. Navigate to the specific project directory you're interested in
3. Follow the README or documentation in that directory 

1. 克隆此存储库
2. 导航到您感兴趣的特定项目目录
3. 按照该目录中的README或文档进行操作 