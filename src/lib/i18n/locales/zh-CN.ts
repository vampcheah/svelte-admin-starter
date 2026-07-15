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
		close: '关闭',
		openInNewTab: '在新标签打开'
	},
	tabs: {
		open: '打开',
		clone: '克隆',
		close: '关闭',
		closeAll: '关闭全部',
		closeLabel: '关闭 {title}'
	},
	dateTimePicker: {
		pickDate: '选择日期',
		pickTime: '选择时间',
		pickDateTime: '选择日期和时间',
		selectDate: '选择日期',
		selectTime: '选择时间',
		selectHour: '选择小时',
		selectMinute: '选择分钟',
		date: '日期',
		time: '时间',
		hour: '小时',
		minute: '分钟',
		am: '上午',
		pm: '下午',
		now: '现在',
		clear: '清除',
		apply: '应用'
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
	components: {
		dateTimeTitle: '日期与时间选择器',
		dateTimeDescription: '可交互的日期、时间和日期时间组合字段。'
	},
	nav: {
		dashboard: '仪表盘',
		users: '用户',
		components: '组件',
		icons: '图标',
		forms: '表单',
		tables: '表格',
		charts: '图表',
		settings: '设置',
		profile: '个人资料'
	}
} as const;
