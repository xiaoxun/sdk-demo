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
<script src="https://assets-cdn.shimo.im/assets/scripts/sdk-1.0.0.alpha.js"></script>
```

### 初始化SDK
载入 js 后，便可以在全局范围内调用到石墨文档的类 `Shimo`。
为了生成一个石墨文档的实例，你需要提供：

1. 上文提到的 appId
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
## 接口介绍 - 前端

#### 创建文档 create(name) [Promise]
* name [String] 文档名称
* **Returns**  File [Object] 文档信息

#### 获取文档信息 fetch(guid) [Promise]
* guid [String]  文档的 guid
* **Returns** File [Object] 文档信息

#### 渲染并启动文档 start(option) [Promise]
* option [Object]
	* containerId [String] 文档将要渲染到的容器之 id
	* guid [String] 将要渲染的文档之 guid

#### 销毁已渲染的文档 destroy()
直接调用即可，将清空DOM，回收 SDK 占用的所有内存。
如需再次渲染文档，不用再创建一个 `Shimo` 实例，直接 `editor.start(options)` 即可。


## 接口列表 - 后端

**名词定义** 客户端: 第三方应用程序; 服务端: 石墨 SDK 服务器; 用户端: 用户浏览器


#### 签名

#### 签名流程:
1. 将待发送请求的 queryString 和 formData 拼接成一个对象
1. 生成一个秒为单位的时间戳(有效时间15分钟) timestamp
1. 生成一个长度至少为 5 的随机字符串 nonce
1. 将步骤 1 生成的对象的和 2, 3 的合并
1. 将上步生成的对象的 values 按照 keys 的顺序排序生成数组(过滤掉下划线开头的 key)
1. 将上步生成的数组 push 客户端的 secret
1. 将上步生成的数组使用 `:` 连接
1. 将上步生成的字符串使用 sha-512 加密,生成 signature
1. 在请求的 headers 里加上 Basic Auth 头, 内容为 appKey:signature (*)
1. 将 timestamp 和 nonce 加到请求的 queryString 中
1. 发送请求

> 注: 也可以使用 queryString `_clientId` 和 `_signature` 参数来传 appKey 和 signature

###### 签名代码示例(node.js):

```javascript
const crypto = require('crypto');
const _ = require('lodash');

// obj 为 queryString 和 formData 合并后的对象
function sign(obj, secret) {
  // 生成随机字符串
  const nonce = Math.random().toString(36);
  // 生成时间戳
  const timestamp = parseInt(Date.now() / 1000, 10);
  // 签名
  const signature = _sign(Object.assign({}, filterObject(obj), { nonce, timestamp }), secret);
  return { nonce, timestamp, signature };
}

// 对象签名
function _sign(obj, secret) {
  // 过滤下划线开头的 key
  const plainText = Object.keys(filterObject(obj))
    // 按照 key 排序
    .sort()
    // 拼接 values
    .reduce((result, key) => { return result.concat([encodeURIComponent(obj[key])]); }, [])
    // 末尾加上 secret
    .concat([secret])
    .join(':');

  return crypto.createHash('sha512').update(plainText).digest('hex').toLowerCase();
}

// 过滤掉下划线开头的参数
function filterObject(obj) {
  const signKeys = Object.keys(obj).filter(str => !str.startsWith('_'));
  return _.pick(obj, signKeys);
}
```


