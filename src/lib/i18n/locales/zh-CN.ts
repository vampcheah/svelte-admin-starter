// Simplified Chinese dictionary. Mirrors the shape of en.ts exactly.

export default {
	common: {
		search: '搜索',
		save: '保存',
		cancel: '取消',
		delete: '删除',
		edit: '编辑',
		create: '新建',
		confirm: '确认',
		loading: '加载中',
		logout: '退出登录',
		logoutConfirmTitle: '确认退出登录?',
		logoutConfirmDescription: '退出后需重新登录才能访问你的账户。',
		profile: '个人资料',
		settings: '设置',
		language: '语言',
		theme: '主题',
		actions: '操作',
		close: '关闭'
	},
	auth: {
		signIn: '登录',
		signOut: '退出登录',
		email: '邮箱',
		password: '密码',
		welcomeBack: '欢迎回来'
	},
	dashboard: {
		greeting: '欢迎回来，{name}',
		overview: '概览'
	},
	nav: {
		dashboard: '仪表盘',
		users: '用户',
		components: '组件',
		forms: '表单',
		tables: '表格',
		charts: '图表',
		settings: '设置',
		profile: '个人资料'
	}
} as const;
