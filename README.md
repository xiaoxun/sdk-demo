# 石墨文档之 SDK 文档
## 简介
石墨文档 SDK 是一个基于 javascript 的 SDK，只需要在您的网页里引用一个 js 文件，就可以使用石墨文档提供的：

1. 协同编辑
2. 划词评论
3. 历史还原

暂时没有文件管理和成员管理的功能，后续会根据需求的规划以及开发迭代，会逐步增加诸如文档导入与导出等其他功能。

## 接入流程

### 获取 appId & secret
请发邮件至 [contact@shimo.im](mailto:contact@shimo.im)

### 在页面上引入 js 文件
页面上加载石墨文档 SDK 之前需要先引入 `jQuery@2.2.4` 或以上版本：
```html
<script src="http://code.jquery.com/jquery-2.2.4.min.js"></script>
<script src="https://assets-cdn.shimo.im/assets/scripts/sdk-1.0.0.alpha.debug.js"></script>
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


##### 签名

签名流程:


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


签名代码示例(node.js):


```javascript
// 本代码位于 `./examples/node.js/lib/sign.js`
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

##### 获取文档列表
- method: `GET`
- url: `editors/:guid`
- return: `[{ name, guid, head, pool, content, type, createdAt, updatedAt }, ...]`


##### 获取单个文档
- method: `GET`
- url: `editors/:guid`
- return: `{ name, guid, head, pool, content, type, createdAt, updatedAt }`


##### 创建文档
- method: `POST`
- url: `editors`
- formData: `{ name: 'the name' }`
- return: `{ name, guid, head, pool, content, type, createdAt, updatedAt }`


##### 修改文档
- method: `PATCH`
- url: `editors/:guid`
- formData: `{ name: 'the name' }`
- return: `{ name: 'the name' }`


##### 删除文档
- method: `DELETE`
- url: `editors/:guid`
- return: status-204


##### 获取文档历史
- method: `GET`
- url: `editors/:guid/histories`
- queryString: `{ [lastGuid], [limit=20] }` lastGuid: 上次结果的最后一条记录的 guid, limit: 每次显示条数
- return: `[{ histories: [{ content, deltedAt, guid, type, updatedAt, createdAt }, ...], pool: {...} }]`


##### 获取文档评论概要 (组guid和对应评论数量)
- method: `GET`
- url: `editors/:guid/comments/summary`
- return: `[ { groupGuid: 'xxx', count: 2 }, ...]`


##### 获取文档所有评论
- method: `GET`
- url: `editors/:guid/comments`
- return: `[ { guid, groupGuid, content, title, User({ name, avatar, guid }) } ...]`


##### 还原历史
- method: `POST`
- url: `editors/:guid/revert`
- formData: `{ historyGuid }`
- return `{ ok: true }`


##### 获取某选区的评论列表
- method: `GET`
- url: `editors/:guid/comments/groups/:groupGuid`
- return: `[ { guid, groupGuid, content, title, User({ name, avatar, guid }) } ...]`


##### 删除某选区的所有评论
- method: `DELETE`
- url: `editors/:guid/comments/groups/:groupGuid`
- return: status-204


##### 创建评论
- method: `POST`
- url: `editors/:guid/comments`
- formData: `{ groupGuid, title, content }`
- return: `{ guid, groupGuid, title, content }`


##### 删除某条评论
- method: `DELETE`
- url: `editors/:guid/comments/:commentGuid`
- return: status-204


##### 批量上传图片
- method: `POST`
- url: `editors/:guid/images/prepare`
- formData: `{ fileNames: ['aaa.png', ...] }`
- return: `[{ token, key }, '...']`


##### 批量上传附件
- method: `POST`
- url: `editors/:guid/attachments/prepare`
- formData: `{ fileNames: ['aaa.zip', ...] }`
- return: `[{ token, key }, '...']`


##### 下载附件
- method: `GET`
- url: `editors/:guid/attachments/:attachmentGuid`
- return: redirect


##### 删除附件
- method: `DELETE`
- url: `editors:/guid/attachments/:attachmentGuid`
- return: status-204


##### 获取编写者列表
- method: `GET`
- url: `editors:/guid/collaborators`
- return: `[{ guid, name, avatar }, ...]`



## socket.io 推送内容和格式(仅限文档内)

##### 文档修改推送
```javascript
{
  type: 'editor',
  action: 'update',
  data: { guid, name, head, type, createdAt, updatedAt, deletedAt }
}
```

##### 文档删除推送
```javascript
{
  type: 'editor',
  action: 'delete',
  data: { guid }
}
```

##### 创建评论推送
```javascript
{
  type: 'comment',
  action: 'create',
  data: { guid, title, groupGuid, content, User({ guid, name, avatar }) }
}
```

##### 删除评论推送
```javascript
{
  type: 'comment',
  action: 'delete',
  data: { guid }
}
```

##### 批量删除评论推送
```javascript
{
  type: 'comment',
  action: 'bulkDelete',
  data: { groupGuid }
}
```

#### DEMO

##### node.js
`cd examples/node.js/`


`node server.js`, 如需修改端口号请使用 `PORT=3111 node server.js`


浏览器访问 `http://localhost:3012`
