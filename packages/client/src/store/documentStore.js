import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import emoji from 'markdown-it-emoji'
import katexPlugin from 'markdown-it-katex'
import anchorPlugin from 'markdown-it-anchor'
import tocPlugin from 'markdown-it-toc-done-right'
import taskListsPlugin from 'markdown-it-task-lists'
import 'highlight.js/styles/github-dark.css'
import axios from 'axios'

// 全局唯一ID生成器
let nextId = 1

// 初始文档标题
const INITIAL_DOCUMENT_TITLE = '新建文档'

// 默认文档内容
const DEFAULT_DOCUMENT_CONTENT = `### 1. 标题

# 一级标题 加强李信 

## 二级标题 加强李信

### 三级标题 加强李信

#### 四级标题 加强李信

### 2. 无序列表

- 李信 
- 李信 
  - 光信 
  - 暗信

### 3. 有序列表

1. 李信 
2. 李信 


### 4. 粗体和斜体

**这个是粗体李信**

_这个是斜体李信_

**_这个是粗体加斜体的李信_**


### 5. 链接

[点击前往查看李信的英雄介绍](https://pvp.qq.com/web201605/herodetail/lixin.shtml)

### 6. 引用

> 大小姐驾到通通闪开 **--孙尚香**
>>双枪会给出答案  **--马可波罗** 

### 7. 分割线

我就是太阳

--- 
侯非侯，王非王，千乘万骑走北芒

### 8. 删除线

~~加强李信！！~~

### 9. 表格

| 英雄 | 身高(cm) | 位置 | 皮肤数量 |
| :-: | :-: | - | :-: |
| 李信     |  187  |    战士 |3|
| 狄仁杰   |  178  |  射手 |8 |
| 孙尚香 |  165  | 射手 |10|

### 10. 代码块

\`\`\`js 
let powerful = Math.floor(Math.random() * 10); 
const strengThenLx = new Promise((resolve, reject) => { 
  if (powerful === 8){ 
    resolve("加强成功"); 
  } else { 
    reject("加强失败"); 
  } 
}) 
async function main() {
  try {
    const res = await strengThenLx 
    console.log(res);    // 加强成功 
  } catch (error) { 
     console.log(error); // 加强失败 
  }
}
main(); 
\`\`\` 

### 11. HTML
<div><span style="color:red">李信</span>是红色的</div>

### 12. 图片 

本地图片 

![本地图片](/lixin.jpg) 

### 13. 表情

😊 😂 🤔 👍 🎮 ⚔️ 🛡️ 🏆 🔥 ✨

### 14. 数学公式

$$\\sqrt{3x-1}+(1+x)^2$$

### 15. 图表

\`\`\`mermaid
graph TD
A[加强李信] --> B[加强中]
B --> C[加强完成]
\`\`\`

### 16. 任务列表

- [ ] 加强李信
- [x] 加强李信
- [ ] 加强李信

### 17. 饼图

\`\`\`mermaid
pie
    title 加强李信
    "加强李信" : 8
    "加强失败" : 2
\`\`\`
`
// 创建Markdown渲染器
const md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				const highlighted = hljs.highlight(str, {
					language: lang,
					ignoreIllegals: true
				})
				// 添加特定标记以便CSS选择器能更精确地定位
				const processedCode = highlighted.value
					.replace(/\(/g, '<span class="bracket paren-open">(</span>')
					.replace(/\)/g, '<span class="bracket paren-close">)</span>')
					.replace(/\{/g, '<span class="bracket brace-open">{</span>')
					.replace(/\}/g, '<span class="bracket brace-close">}</span>')
					.replace(/\[/g, '<span class="bracket square-open">[</span>')
					.replace(/\]/g, '<span class="bracket square-close">]</span>')

				return `<pre><code class="hljs language-${lang}">${processedCode}</code></pre>`
			} catch (e) {
				console.error('代码高亮失败:', e)
			}
		}
		// 如果语言不存在或出错，使用转义的代码
		return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
	}
})

// 自定义渲染mermaid图表的插件
function mermaidPlugin(md) {
	const originalFence = md.renderer.rules.fence.bind(md.renderer.rules)

	md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
		const token = tokens[idx]
		const code = token.content.trim()

		if (token.info === 'mermaid') {
			// 最简单的实现 - 直接返回mermaid类的div
			return `<div class="mermaid">${code}</div>`
		}

		return originalFence(tokens, idx, options, env, slf)
	}
}

// 自定义图片渲染以支持懒加载
function lazyLoadImagePlugin(md) {
	const originalImageRender = md.renderer.rules.image || function (tokens, idx, options, env, self) {
		return self.renderToken(tokens, idx, options)
	}

	md.renderer.rules.image = function (tokens, idx, options, env, self) {
		const token = tokens[idx]
		// 添加 loading="lazy" 属性
		token.attrSet('loading', 'lazy')
		// 添加 decoding="async" 以异步解码图片
		token.attrSet('decoding', 'async')

		return originalImageRender(tokens, idx, options, env, self)
	}
}

// 添加插件
md.use(emoji) // emoji表情支持
md.use(mermaidPlugin) // mermaid图表支持
md.use(lazyLoadImagePlugin) // 图片懒加载支持

// 尝试加载其他插件
try {
	md.use(katexPlugin, { throwOnError: false, errorColor: '#cc0000' }) // 数学公式支持
} catch (e) {
	console.warn('无法加载katex插件:', e)
}

try {
	md.use(anchorPlugin, {
		permalink: true,
		permalinkSymbol: '#',
		permalinkClass: 'header-anchor'
	}) // 标题锚点
} catch (e) {
	console.warn('无法加载anchor插件:', e)
}

try {
	md.use(tocPlugin, {
		listType: 'ul',
		listClass: 'toc-list',
		itemClass: 'toc-item',
		linkClass: 'toc-link'
	}) // 目录生成
} catch (e) {
	console.warn('无法加载toc插件:', e)
}

try {
	md.use(taskListsPlugin, { enabled: true }) // 任务列表支持
} catch (e) {
	console.warn('无法加载taskLists插件:', e)
}

// 导出markdown渲染器，供其他组件使用
export const markdownRenderer = md

// 文档数据存储
export const useDocumentStore = defineStore('document', () => {
	// 所有文档的集合
	const documents = ref([])
	// 当前文档的ID
	const currentDocumentId = ref(null)

	const loading = ref(false)
	const error = ref(null)

	// 计算当前文档对象
	const currentDocument = computed(() => {
		// 在MongoDB中，id是_id
		return (
			documents.value.find((doc) => doc._id === currentDocumentId.value) || null
		)
	})

	// 计算当前文档内容
	const currentContent = computed(() => {
		return currentDocument.value ? currentDocument.value.content : ''
	})

	// 迁移本地数据
	async function migrateLocalData() {
		try {
			const localDocs = localStorage.getItem('documents')
			if (localDocs) {
				const parsedDocs = JSON.parse(localDocs)
				if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
					console.log('发现本地数据，开始迁移...', parsedDocs.length)
					let successCount = 0

					// 先加载当前数据库中的文档，用于去重检查
					let currentDbDocs = []
					try {
						const res = await axios.get('/api/documents')
						currentDbDocs = res.data
					} catch (e) {
						// 忽略错误，假设为空
					}

					// 倒序遍历，这样最早的文档最后创建，保持顺序（或者根据需求调整）
					for (const doc of parsedDocs) {
						try {
							// 检查是否已存在相同标题的文档（简单去重）
							const exists = currentDbDocs.some(d => d.title === doc.title)
							if (!exists) {
								await axios.post('/api/documents', {
									title: doc.title,
									content: doc.content
								})
								successCount++
							}
						} catch (e) {
							console.error('迁移单个文档失败:', doc.title, e)
						}
					}

					if (successCount > 0) {
						console.log(`成功迁移 ${successCount} 个文档`)

						// 迁移完成后，清除本地数据防止重复迁移？
						// 暂时保留，或者重命名 key
						localStorage.removeItem('documents')
						localStorage.setItem('documents_migrated_backup', localDocs)
					}
				}
			}
		} catch (e) {
			console.error('数据迁移失败:', e)
		}
	}

	// 初始化时加载文档
	async function loadDocuments() {
		loading.value = true
		error.value = null
		try {
			// 尝试迁移数据
			await migrateLocalData()

			const response = await axios.get('/api/documents')
			documents.value = response.data

			// 初始化最后保存的内容
			documents.value.forEach(doc => {
				lastSavedContents.set(doc._id, doc.content)
			})

			// 尝试加载设置以获取上次打开的文档
			try {
				const settingsRes = await axios.get('/api/settings')
				if (settingsRes.data && settingsRes.data.currentDocumentId) {
					// 检查该文档是否存在
					const exists = documents.value.find(d => d._id === settingsRes.data.currentDocumentId)
					if (exists) {
						currentDocumentId.value = settingsRes.data.currentDocumentId
					}
				}
			} catch (e) {
				console.warn('无法加载设置', e)
			}

			// 如果没有选中文档且有文档列表，选中第一个
			if (!currentDocumentId.value && documents.value.length > 0) {
				currentDocumentId.value = documents.value[0]._id
			}
			// 如果列表为空，创建默认文档
			else if (documents.value.length === 0) {
				await createDocument('新建文档', DEFAULT_DOCUMENT_CONTENT)
			}
		} catch (err) {
			console.error('加载文档失败:', err)
			error.value = '加载文档失败'
		} finally {
			loading.value = false
		}
	}

	// 创建新文档
	async function createDocument(
		titleOrOptions = INITIAL_DOCUMENT_TITLE,
		optionalContent
	) {
		let title = INITIAL_DOCUMENT_TITLE
		let content = undefined

		if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
			title = titleOrOptions.title || INITIAL_DOCUMENT_TITLE
			content = titleOrOptions.content
		} else {
			title = titleOrOptions || INITIAL_DOCUMENT_TITLE
			content = optionalContent
		}

		try {
			const response = await axios.post('/api/documents', {
				title,
				content
			})
			const newDoc = response.data
			documents.value.unshift(newDoc) // 添加到开头
			currentDocumentId.value = newDoc._id

			// 初始化最后保存的内容
			lastSavedContents.set(newDoc._id, newDoc.content || '')

			// 更新设置
			updateCurrentDocumentSetting(newDoc._id)

			return newDoc._id
		} catch (err) {
			console.error('创建文档失败:', err)
			return null
		}
	}

	// 删除文档
	async function deleteDocument(id) {
		try {
			await axios.delete(`/api/documents/${id}`)

			const index = documents.value.findIndex((doc) => doc._id === id)
			if (index !== -1) {
				documents.value.splice(index, 1)

				// 如果列表为空，自动创建示例文档
				if (documents.value.length === 0) {
					await createDocument('新建文档', DEFAULT_DOCUMENT_CONTENT)
					return
				}

				// 如果删除的是当前文档，切换到其他文档
				if (currentDocumentId.value === id) {
					const nextId = documents.value.length > 0 ? documents.value[0]._id : null
					currentDocumentId.value = nextId
					updateCurrentDocumentSetting(nextId)
				}
			}
		} catch (err) {
			console.error('删除文档失败:', err)
		}
	}

	// 切换当前文档
	function setCurrentDocument(id) {
		// 切换前，立即执行待处理的保存操作
		if (debouncedSave.flush) {
			debouncedSave.flush()
		}

		currentDocumentId.value = id
		updateCurrentDocumentSetting(id)

		// 检查是否有较新的本地备份
		if (currentDocument.value) {
			const backupContent = checkAndRestoreBackup(id, currentDocument.value)
			if (backupContent && backupContent !== currentDocument.value.content) {
				console.log('恢复本地备份内容')
				// 更新 UI 和触发保存
				saveCurrentContent(backupContent)
			}
		}
	}

	// 更新后端设置中的当前文档ID
	async function updateCurrentDocumentSetting(id) {
		try {
			await axios.put('/api/settings', { currentDocumentId: id })
		} catch (e) {
			console.warn('无法保存当前文档设置', e)
		}
	}

	// 防抖函数 (支持立即执行)
	function debounce(func, wait) {
		let timeout
		let args
		let context

		const debounced = function (..._args) {
			context = this
			args = _args
			clearTimeout(timeout)
			timeout = setTimeout(() => {
				func.apply(context, args)
				timeout = null
			}, wait)
		}

		debounced.flush = () => {
			if (timeout) {
				clearTimeout(timeout)
				func.apply(context, args)
				timeout = null
			}
		}

		return debounced
	}

	// 记录每个文档最后一次成功保存到服务器的内容
	const lastSavedContents = new Map()

	// 实际执行服务器保存的函数
	async function saveToServer(content, docId) {
		try {
			// 检查内容是否发生变化
			if (lastSavedContents.has(docId) && lastSavedContents.get(docId) === content) {
				return
			}

			await axios.put(`/api/documents/${docId}`, {
				content
			})

			// 更新最后保存的内容
			lastSavedContents.set(docId, content)
		} catch (err) {
			console.error('自动保存失败:', err)
		}
	}

	// 创建防抖的保存函数 (延迟 2 秒)
	const debouncedSave = debounce(saveToServer, 2000)

	// 保存到本地备份
	function saveToLocalBackup(docId, content, title) {
		try {
			const backup = {
				content,
				title,
				timestamp: Date.now()
			}
			localStorage.setItem(`doc_backup_${docId}`, JSON.stringify(backup))
		} catch (e) {
			console.warn('本地备份失败', e)
		}
	}

	// 从本地备份恢复 (如果有更新的备份)
	function checkAndRestoreBackup(docId, serverDoc) {
		try {
			const backupJson = localStorage.getItem(`doc_backup_${docId}`)
			if (!backupJson) return null

			const backup = JSON.parse(backupJson)
			const serverTime = new Date(serverDoc.updatedAt).getTime()

			// 如果本地备份比服务器版本新 (例如超过 5 秒)，则恢复
			// 这里使用 5 秒缓冲，避免时钟差异导致的误判
			if (backup.timestamp > serverTime + 5000) {
				console.log('发现较新的本地备份，已自动恢复')
				return backup.content
			}
		} catch (e) {
			console.warn('检查本地备份失败', e)
		}
		return null
	}

	// 保存当前文档内容 (包含自动保存和本地备份)
	async function saveCurrentContent(content) {
		if (currentDocument.value) {
			// 1. 立即更新 UI 状态
			currentDocument.value.content = content
			currentDocument.value.updatedAt = new Date().toISOString()

			// 2. 立即保存到本地备份 (作为安全网)
			saveToLocalBackup(currentDocument.value._id, content, currentDocument.value.title)

			// 3. 防抖保存到服务器
			debouncedSave(content, currentDocument.value._id)
		}
	}

	// 保存当前文档 (兼容旧API)
	async function saveCurrentDocument() {
		if (currentDocument.value) {
			try {
				await axios.put(`/api/documents/${currentDocument.value._id}`, {
					content: currentDocument.value.content,
					title: currentDocument.value.title
				})

				// 更新最后保存的内容
				lastSavedContents.set(currentDocument.value._id, currentDocument.value.content)

				return true
			} catch (err) {
				console.error('保存文档失败:', err)
				return false
			}
		}
		return false
	}

	// 旧版兼容函数 (不再使用 localStorage)
	function saveDocuments() {
		// 空实现或警告
		console.warn('saveDocuments is deprecated, use API instead')
	}


	// 重命名文档
	async function renameDocument(id, newTitle) {
		const doc = documents.value.find((doc) => doc._id === id)
		if (doc) {
			// 乐观更新
			doc.title = newTitle
			try {
				await axios.put(`/api/documents/${id}`, { title: newTitle })
			} catch (err) {
				console.error('重命名失败:', err)
			}
		}
	}

	// 同步滚动状态
	const scrollSyncEnabled = ref(false)

	// 大纲显示状态
	const isOutlineOpen = ref(true)

	// 设置同步滚动状态
	function setScrollSyncEnabled(enabled) {
		scrollSyncEnabled.value = enabled
	}

	// 切换大纲显示
	function toggleOutline() {
		isOutlineOpen.value = !isOutlineOpen.value
	}

	// 获取同步滚动状态
	function getScrollSyncEnabled() {
		return scrollSyncEnabled.value
	}

	// 滚动位置信息
	const scrollPosition = ref({
		source: '', // 'editor' 或 'preview'
		percentage: 0 // 滚动百分比 (0-1)
	})

	// 设置滚动位置
	function setScrollPosition(position) {
		scrollPosition.value = position
	}

	// 大纲数据
	const outline = ref([])

	// 渲染Markdown内容
	function renderMarkdown(content) {
		if (!content) {
			outline.value = []
			return ''
		}
		try {
			// 解析 tokens
			const env = {}
			const tokens = md.parse(content, env)
			const newOutline = []

			tokens.forEach((token, index) => {
				if (token.type === 'heading_open') {
					// 获取标题级别 h1 -> 1, h2 -> 2
					const level = parseInt(token.tag.slice(1))

					// 获取标题内容 (下一个 token 是 inline)
					const inlineToken = tokens[index + 1]
					const title = inlineToken ? inlineToken.content : ''

					// 获取 ID (由 markdown-it-anchor 添加)
					const idAttr = token.attrs ? token.attrs.find(attr => attr[0] === 'id') : null
					const slug = idAttr ? idAttr[1] : ''

					if (title && slug) {
						newOutline.push({
							level,
							title,
							slug,
							line: token.map ? token.map[0] : 0
						})
					}
				}
			})

			outline.value = newOutline

			// 使用已解析的 tokens 进行渲染，避免重复解析
			return md.renderer.render(tokens, md.options, env)
		} catch (error) {
			console.error('渲染Markdown失败:', error)
			return '<p class="text-red-500">渲染内容时出错</p>'
		}
	}

	// 初始化时加载文档
	// loadDocuments() // 移除自动调用，由 App.vue 显式调用

	// 导出当前文档为HTML
	function exportAsHtml() {
		const currentDoc = currentDocument.value // 注意这里修正了 this.currentDocument
		if (!currentDoc) return null

		try {
			// 使用已有的markdown渲染器渲染内容
			const htmlContent = renderMarkdown(currentDoc.content)

			// 构建完整的HTML文档
			const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentDoc.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    pre {
      background-color: #f6f8fa;
      border-radius: 3px;
      padding: 16px;
      overflow: auto;
    }
    code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
    img {
      max-width: 100%;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 8px 12px;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin-left: 0;
      color: #666;
    }
    .mermaid {
      text-align: center;
    }
  </style>
  <!-- 如果有mermaid图表，添加mermaid支持 -->
  ${currentDoc.content.includes('```mermaid')
					? '<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script><script>mermaid.initialize({startOnLoad:true});</script>'
					: ''
				}
  <!-- 如果有数学公式，添加KaTeX支持 -->
  ${currentDoc.content.includes('$')
					? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css"><script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js"></script>'
					: ''
				}
</head>
<body>
  <h1>${currentDoc.title}</h1>
  <div class="markdown-content">
    ${htmlContent}
  </div>
</body>
</html>`

			return {
				title: currentDoc.title,
				html: fullHtml
			}
		} catch (error) {
			console.error('HTML导出错误:', error)
			return null
		}
	}


	// 编辑器操作指令
	const editorAction = ref(null)

	// 触发编辑器操作
	function triggerEditorAction(action) {
		editorAction.value = {
			...action,
			timestamp: Date.now() // 添加时间戳确保每次都能触发 watch
		}
	}

	// 上传图片
	async function uploadImage(file) {
		try {
			// 将文件转换为 Base64
			const reader = new FileReader()
			const base64Promise = new Promise((resolve, reject) => {
				reader.onload = () => resolve(reader.result)
				reader.onerror = error => reject(error)
				reader.readAsDataURL(file)
			})
			const base64Data = await base64Promise

			// 上传到服务器
			const response = await axios.post('/api/images', {
				image: base64Data,
				filename: file.name,
				documentId: currentDocument.value?._id
			})

			return response.data.url
		} catch (error) {
			console.error('上传图片失败:', error)
			return null
		}
	}

	// 重置 Store
	function resetStore() {
		documents.value = []
		currentDocumentId.value = null
		error.value = null
		loading.value = false
	}

	return {
		documents,
		currentDocumentId,
		currentDocument,
		currentContent,
		loading,
		error,
		createDocument,
		deleteDocument,
		setCurrentDocument,
		saveCurrentContent,
		saveDocuments,
		loadDocuments,
		renameDocument,
		scrollSyncEnabled,
		setScrollSyncEnabled,
		getScrollSyncEnabled,
		scrollPosition,
		setScrollPosition,
		renderMarkdown,
		outline,
		isOutlineOpen,
		toggleOutline,
		exportAsHtml,
		saveCurrentDocument,
		editorAction,
		triggerEditorAction,
		uploadImage,
		resetStore
	}
})
