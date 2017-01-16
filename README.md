# 石墨文档之 SDK 文档
## 简介
石墨文档 SDK 是一个基于 javascript 的 SDK，只需要在您的网页里引用一个 js 文件，就可以使用石墨文档提供的：
1. 协同编辑
2. 划词评论
3. 历史还原

后续还会根据需求的规划以及开发迭代，会逐步增加诸如文档导入与导出等其他功能。

## 接入流程

### 获取 appId & secret
请发邮件至 [contact@shimo.im](mailto:contact@shimo.im)

### 在页面上引入 js 文件
页面上加载石墨文档 SDK 之前需要先引入 `jQuery@2.2.4` 或以上版本：
```html
<script src="http://code.jquery.com/jquery-2.2.4.min.js"></script>
<script src="http://sdk.shimo.im/shimo.alpha.js"></script>
```

### 初始化SDK
载入 js 后，便可以在全局范围内调用到石墨文档的类 `Shimo`。
为了生成一个石墨文档的实例，你需要提供：
1. 上文提到的 appId & secret
2. 数据签名接口的 url
3. 当前用户信息，主要指姓名与头像

```javascript
const editor = new Shimo({
    appId,
	signUrl,
	user: {
        id,
        name,
        avatar
	}
	...
});
```

目前所有功能都是不可配置的。
## 接口介绍

### 创建文档 create(name) [Promise] 
* name [String] 文档名称
* **Returns**  File [Object] 文档信息

### 获取文档信息 fetch(guid) [Promise]
* guid [String]  文档的 guid
* **Returns** File [Object] 文档信息

### 渲染并启动文档 start(option) [Promise]
* option [Object] 
	* containerId [String] 文档将要渲染到的容器之 id
	* guid [String] 将要渲染的文档之 guid

### 销毁已渲染的文档 destroy()
直接调用即可，将清空DOM，回收 SDK 占用的所有内存。	
如需再次渲染文档，不用再创建一个 `Shimo` 实例，直接 `editor.start(options)` 即可。

