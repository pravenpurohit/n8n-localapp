type Theme = 'light' | 'dark' | 'system';

class ThemeStore {
	theme = $state<Theme>(
		(typeof localStorage !== 'undefined'
			? (localStorage.getItem('theme') as Theme)
			: null) ?? 'system'
	);

	resolvedTheme = $derived<'light' | 'dark'>(
		this.theme === 'system'
			? typeof window !== 'undefined' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
			: this.theme
	);

	constructor() {
		if (typeof window !== 'undefined') {
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
				if (this.theme === 'system') {
					this.applyClass();
				}
			});
			this.applyClass();
		}
	}

	setTheme(theme: Theme): void {
		this.theme = theme;
		localStorage.setItem('theme', theme);
		this.applyClass();
	}

	private applyClass(): void {
		document.documentElement.classList.toggle('dark', this.resolvedTheme === 'dark');
	}
}

export const themeStore = new ThemeStore();
