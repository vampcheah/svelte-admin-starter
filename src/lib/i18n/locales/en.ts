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
		actions: 'Actions',
		close: 'Close',
		openInNewTab: 'Open in new tab'
	},
	tabs: {
		open: 'Open',
		clone: 'Clone',
		close: 'Close',
		closeAll: 'Close all',
		closeLabel: 'Close {title}'
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
