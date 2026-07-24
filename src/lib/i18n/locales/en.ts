// English dictionary. Nested object; looked up by dot-path (e.g. 'common.save').

export default {
	common: {
		search: 'Search',
		save: 'Save',
		cancel: 'Cancel',
		delete: 'Delete',
		edit: 'Edit',
		create: 'Create',
		confirm: 'Confirm',
		loading: 'Loading',
		logout: 'Log out',
		logoutConfirmTitle: 'Log out?',
		logoutConfirmDescription: "You'll need to sign in again to access your account.",
		profile: 'Profile',
		settings: 'Settings',
		language: 'Language',
		theme: 'Theme',
		download: 'Download',
		description: 'Description',
		name: 'Name',
		saving: 'Saving...',
		createFailed: 'Failed to create',
		tabLimitTitle: 'Many tabs open',
		tabLimitDescription: 'You have {count} tabs open. Opening more may affect performance.',
		forceContinue: 'Continue anyway'
	},
	tabs: {
		open: 'Open',
		clone: 'Clone',
		refresh: 'Refresh',
		close: 'Close',
		closeOthers: 'Close others',
		closeLeft: 'Close left',
		closeRight: 'Close right',
		closeAll: 'Close all',
		closeLabel: 'Close {title}',
		navigationLabel: 'Tabs navigation',
		scrollStart: 'Scroll to first tab',
		scrollPrevious: 'Scroll tabs left',
		scrollNext: 'Scroll tabs right',
		scrollEnd: 'Scroll to last tab'
	},
	sales: {
		item: 'Item / Description',
		qty: 'Qty',
		unitPrice: 'Unit price',
		discount: 'Discount %',
		taxable: 'Tax',
		lineTotal: 'Total',
		removeItem: 'Remove line',
		addItem: 'Add line',
		addFromCatalog: 'Add from catalog...',
		noItems: 'No line items',
		subtotal: 'Subtotal',
		tax: 'Tax',
		total: 'Total'
	},
	clients: {
		newClient: 'New client',
		quickCreateHint: 'Quickly add a new client entity',
		nameRequired: 'Client name is required',
		clientCreated: 'Client created'
	},
	download: {
		confirmTitle: 'Confirm download?',
		confirmDesc: 'The file will open or download in a new window.'
	},
	dateTimePicker: {
		pickDate: 'Pick a date',
		pickTime: 'Pick a time',
		pickDateTime: 'Pick a date and time',
		selectDate: 'Select date',
		selectTime: 'Select time',
		selectHour: 'Select hour',
		selectMinute: 'Select minute',
		date: 'Date',
		time: 'Time',
		hour: 'Hour',
		minute: 'Minute',
		am: 'AM',
		pm: 'PM',
		now: 'Now',
		clear: 'Clear',
		apply: 'Apply'
	},
	auth: {
		signIn: 'Sign in',
		signOut: 'Sign out',
		email: 'Email',
		password: 'Password',
		welcomeBack: 'Welcome back'
	},
	dashboard: {
		greeting: 'Welcome back, {name}',
		overview: 'Overview'
	},
	components: {
		dateTimeTitle: 'Date & time pickers',
		dateTimeDescription: 'Interactive date, time and combined date-time fields.'
	},
	nav: {
		dashboard: 'Dashboard',
		users: 'Users',
		components: 'Components',
		icons: 'Icons',
		forms: 'Forms',
		tables: 'Tables',
		charts: 'Charts',
		settings: 'Settings',
		profile: 'Profile'
	}
} as const;
