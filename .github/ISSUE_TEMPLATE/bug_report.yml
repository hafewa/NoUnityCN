name: BUG 反馈
description: 请填写此表单报告你遇到的问题，帮助我们快速定位与修复。
labels: ["bug", "待确认"]
body:
  - type: markdown
    attributes:
      value: |
        感谢你的反馈！请尽量详细填写以下信息，我们将尽快处理。
        ⚠️ 请先确认是否有重复 Issues，避免重复提交。

  - type: input
    id: url
    attributes:
      label: 问题页面 URL
      placeholder: https://example.com/...
      description: 请粘贴发生问题的网页地址。

  - type: textarea
    id: screenshot
    attributes:
      label: 页面截图或报错信息
      description: 推荐上传截图或粘贴控制台报错内容（如有）。
      placeholder: 拖拽上传截图或粘贴错误信息...

  - type: checkboxes
    id: problem-types
    attributes:
      label: 问题类型（可多选）
      options:
        - label: 获取内容错误
        - label: 页面不显示
        - label: 加载失败或加载缓慢
        - label: 页面错位
        - label: 内容缺失
        - label: 开启了 VPN 或代理
        - label: 使用了公司或校园网络

  - type: checkboxes
    id: device
    attributes:
      label: 访问设备类型
      options:
        - label: 手机
        - label: 平板
        - label: 电脑
        - label: 其他设备

  - type: input
    id: os
    attributes:
      label: 操作系统
      placeholder: 例如：Windows 11 / macOS 14 / Android 13

  - type: input
    id: browser
    attributes:
      label: 浏览器及版本
      placeholder: 例如：Chrome 125 / Edge 124

  - type: input
    id: related-issues
    attributes:
      label: 相关或相似的 Issues（如有）
      placeholder: 例如：#12, #33

  - type: textarea
    id: extra-info
    attributes:
      label: 其他补充信息
      description: 包括网络环境、重现步骤、是否必现等。
      placeholder: 请填写任何你觉得有用的信息。
