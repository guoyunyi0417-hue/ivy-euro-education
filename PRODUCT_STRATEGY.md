# Ivy AI Teacher 产品聚焦报告

## 结论

当前项目不应该继续横向扩成“所有教育功能都做”的大生态。第一阶段应该收缩为：

> Ivy AI Teacher：5 分钟生成完整国际学校课程包。

第一版核心模块是 `AI Lesson Builder`，先服务老师和机构，把每天最消耗时间的备课、出题、作业和评价标准自动化。

## 为什么先做老师端

- 老师和机构比学生端更容易为效率付费。
- 备课、PPT、Quiz、Homework、Rubric 是高频刚需。
- 课程模板会沉淀为机构自己的教研资产，形成数据壁垒。
- 国际学校、欧洲本地课程、IB、IGCSE、A-Level、西语、法语、中文和英语之间存在碎片化空白。

## 第一版范围

输入：

- Age
- Grade
- Subject
- Topic
- Duration
- Curriculum
- Level
- Learning Objective

输出：

- Lesson Plan
- Slides
- Quiz
- Homework
- Rubric
- Audio Script

暂时不优先做：

- 完整学校后台
- 家长 CRM
- 学生长期画像
- 所有学科同时深度智能化
- 复杂视频生成流程

这些不是不要做，而是等 `Lesson Builder` 跑通后再扩展。

## 技术架构

第一层：课程数据库

- Curriculum
- Topics
- Standards
- Rubrics
- Lesson templates
- Student pain points

第二层：AI 生成层

- Lesson Plan generation
- Quiz generation
- Homework generation
- Rubric generation
- Slides outline generation
- Audio script generation

第三层：Agent 层

- 记录课程历史
- 记忆学生弱点
- 推荐下一节课
- 根据反馈改写课程
- 给老师生成 follow-up plan

第四层：机构后台

- 班级
- 学生
- 课程包
- 作业与测评
- 家长报告
- 老师权限

## 数据壁垒

代码本身不是壁垒。真正的壁垒来自：

- 机构自己的课程模板
- 老师修订过的 lesson plan
- 学生错题与弱点记录
- 家长反馈
- Rubric 与真实课堂结果的对应关系
- 不同课程体系之间的映射

只要持续沉淀这些数据，项目就不会只是一个普通 AI 工具。

## 商业化路径

To Teacher：

- 19 欧 / 月：基础 lesson package
- 39 欧 / 月：多语言、多课程体系、导出
- 79 欧 / 月：班级记忆、学生弱点追踪

To School：

- 300 欧 / 月：小机构
- 1000 欧 / 月：多老师、多班级
- 3000 欧 / 月：定制课程体系、权限、报告

To Parent：

- 后置，不作为第一阶段核心。

## 90 天路线

0-30 天：

- 完成 AI Lesson Builder 可用版
- 支持本地 fallback 与 OpenAI-compatible API
- 增加导出 Markdown / PDF / PPT 的能力
- 收集真实老师使用反馈

31-60 天：

- 建立课程模板库
- 为英语、数学、中文、西语、法语、编程 AI 建立基础课程标准
- 增加老师手动编辑和版本保存
- 增加课程质量评分

61-90 天：

- 增加班级与学生弱点记录
- 增加下一节课推荐
- 增加家长报告生成
- 准备机构试点版本

## 当前工程落地

本仓库已加入第一版 `AI Lesson Builder`：

- 页面：`lesson-builder.html`
- 前端：`lesson-builder.js`
- 接口：`POST /api/lesson-builder/generate`
- 本地 fallback：未配置 API 也能生成结构化课程包
- LLM 模式：配置 `OPENAI_API_KEY` / `LLM_API_KEY` 后自动调用模型
