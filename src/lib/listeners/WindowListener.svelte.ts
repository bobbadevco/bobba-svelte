class WindowListener {
	count = $state(0);
	windows = $state<number[]>([]);

	public getId() {
		this.count++;
		this.windows.push(this.count);
		return this.count;
	}

	public pushToTop(id: number) {
		const idx = this.windows.indexOf(id);
		this.windows.splice(idx, 1);
		this.windows.push(id);
	}

	private static instance: WindowListener;

	public static getInstance() {
		if (!WindowListener.instance) {
			WindowListener.instance = new WindowListener();
		}
		return WindowListener.instance;
	}
}

export const getWindowListener = () => WindowListener.getInstance();