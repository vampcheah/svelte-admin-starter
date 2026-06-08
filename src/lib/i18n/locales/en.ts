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
		profile: 'Profile',
		settings: 'Settings',
		language: 'Language',
		theme: 'Theme',
		actions: 'Actions',
		close: 'Close'
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
	nav: {
		dashboard: 'Dashboard',
		users: 'Users',
		components: 'Components',
		forms: 'Forms',
		tables: 'Tables',
		charts: 'Charts',
		settings: 'Settings',
		profile: 'Profile'
	}
} as const;
