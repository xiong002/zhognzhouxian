通用的提示词模板，

方便指导 AI （比如你）来完成原型绘制任务。

这个模板旨在明确 AI 的角色、任务、输入、输出和关键要求。

---

**通用提示词模板：HTML 静态页面高保真原型绘制**

**角色设定:**
请扮演一个**资深产品设计师**和**经验丰富的前端开发者**的角色。你需要精确理解产品需求、用户交互细节和视觉规范，并将其转化为外观和交互都接近最终产品的高保真 HTML 静态页面原型。

**核心任务:**
根据提供的项目文档（信息架构、用户流程图、视觉设计稿或规范等），创建一套**高保真度**的 HTML 静态页面原型。

**输入文档:**
*   信息架构 (IA) 文件：`[请在此处填入 IA 文件的路径，例如 @pm-docs/IA-design.md]`
*   用户流程图 (User Flow) 文件：`[请在此处填入用户流程图文件的路径，例如 @pm-docs/user-flews1.0.md]`
*   (关键) 视觉设计稿或风格指南：`[请在此处填入设计稿或规范的路径或描述]`
*   (可选) 其他相关需求或交互说明文档：`[如果还有其他文档，请在此处填入路径]`

**输出要求:**
*   **产出物：** 一系列相互链接、外观和交互精良的**新的** HTML 静态页面文件。
*   **存放位置：** 请将所有新创建的原型相关文件放置在 `[请在此处填入原型存放的目录名，例如 /prototypes]` 目录下。请确保在此目录下创建新文件，而不是修改现有文件（除非有明确指示）。
*   **保真度：** **高保真度**。重点关注**精确的页面布局、信息层级、视觉样式（颜色、字体、间距等需尽量接近设计稿）、核心功能元素的准确呈现与交互模拟、以及流畅的页面间导航跳转**。
*   **内容：** 使用接近真实场景的占位符文本和占位图片填充内容区域。根据 `[请在此处说明占位图来源规则，例如 'prototype-rules.mdc' 中规定的 picsum.photos]` 获取占位图，并注意选择符合内容语境和设计风格的图片。
*   **结构：** 使用语义化的 HTML 标签构建页面结构。
*   **样式：** **强制要求**使用**适合 CDN 引入且组件丰富的 CSS 框架**来实现布局、样式和基础交互，以确保快速开发和高保真度。**强烈建议使用 `[请在此处填入具体的框架名称，例如 'Bootstrap 5' 或 'Foundation']`**。通过框架的 class 和组件，尽可能还原视觉设计。如有必要，可补充少量自定义 CSS。
*   **可交互性：**
    *   页面之间的主要导航链接（导航栏、按钮、卡片链接等）必须是可点击并能正确跳转到对应页面的。
    *   常见的 UI 交互（如下拉菜单、模态框弹出、标签页切换、手风琴折叠等）应使用所选框架提供的 JavaScript 功能进行模拟，使其表现接近真实应用。
    *   表单元素的交互（如输入反馈、下拉选择等）应具备基础的可操作性。

**执行流程:**
1.  **确认理解与规划：** 首先，请确认你已理解任务要求和设计细节，并提出你的具体执行计划，包括：
    *   你打算如何组织 HTML 文件结构？
    *   你确认使用的 CSS 框架（如 Bootstrap 5）及其 CDN 引入方式。
    *   你计划优先构建哪些核心页面和交互流程？
2.  **精细构建：** 按照计划，逐一创建 HTML 文件。利用选定框架的栅格系统、预设样式和组件，精确实现页面布局、视觉细节和内容占位。
3.  **实现交互：** 为需要交互的组件（按钮、链接、菜单、模态框等）添加必要的 HTML 属性（如 `data-bs-*` 属性）和/或引入框架的 JavaScript 文件，以实现高保真的交互模拟。
4.  **链接与测试：** 确保所有页面间的链接正确无误，核心交互流程可以顺畅地模拟完成。

**开始指令:**
请根据以上要求，开始你的工作。首先，请告诉我你的执行计划，特别是你选择的具体框架版本和文件结构方案。

---

**使用说明:**

当需要 AI 执行高保真原型绘制任务时，基于此模板，并将方括号 `[...]` 中的占位符替换成你项目的实际情况即可。确保提供清晰的视觉设计稿或风格指南信息。
