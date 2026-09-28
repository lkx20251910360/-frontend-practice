# 图书馆信息中心

## 一、项目简介

本项目是《软件开发综合实践》期末大作业，主题为校园图书馆信息中心。
提供四个功能区块：首页、图书查询、数据图表、三维展示。
技术栈：Bootstrap 5、jQuery、ECharts、Three.js。

## 二、运行方法

本项目使用本地 JSON 数据加载，需要通过本地服务器运行，不能直接双击 index.html。

运行步骤：

1. 克隆仓库
2. 用 VS Code 打开项目文件夹
3. 安装 Live Server 插件
4. 右键 index.html，选择 Open with Live Server
5. 浏览器访问 http://127.0.0.1:5500/index.html

## 三、目录说明

项目根目录/
├── index.html              主页面
├── README.md               项目说明
├── data/
│   └── books.json          图书数据
└── libs/
    ├── bootstrap.min.css
    ├── bootstrap.bundle.min.js
    ├── jquery-3.7.1.min.js
    ├── echarts.min.js
    ├── three.min.js
    └── OrbitControls.js

## 四、数据和资源来源

数据来源：data/books.json
包含书名、分类、楼层、总藏书量、可借数量、已借出数量等字段。

资源来源：

- Bootstrap 5：https://getbootstrap.com/
- jQuery 3.7.1：https://jquery.com/
- ECharts 5：https://echarts.apache.org/
- Three.js：https://threejs.org/

以上库均为课程允许使用的开源前端库