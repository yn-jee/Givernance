export class LoadingAnimation {
    constructor(animationPath) {
        this.animationPath = animationPath;
        this.animation = null;
        this.overlay = document.getElementById('loading-overlay');
        this.activeTasks = 0;
    }

    async loadAnimation() {
        const container = document.getElementById('loadingAnimation');
        if (!container) {
            console.error('Animation container not found');
            return;
        }

        try {
            const response = await fetch(this.animationPath);
            if (!response.ok) {
                throw new Error('Failed to load animation data');
            }
            const animationData = await response.json();

            this.animation = lottie.loadAnimation({
                container: container,
                animationData: animationData,
                renderer: 'svg',
                loop: true,
                autoplay: true
            });
        } catch (error) {
            console.error('Error loading the animation:', error);
        }
    }

    startTask() {
        if (this.activeTasks === 0) {
            this.showOverlay();
        }
        this.activeTasks++;
    }

    endTask() {
        this.activeTasks--;
        if (this.activeTasks <= 0) {
            this.hideOverlay();
            this.activeTasks = 0; // Ensure the counter doesn't go negative
        }
    }

    showOverlay() {
        if (this.overlay) {
            this.overlay.style.display = 'flex';
        }
    }

    hideOverlay() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }
}
