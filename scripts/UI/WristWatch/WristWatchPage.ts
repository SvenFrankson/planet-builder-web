class WristWatchPage {

    public elements: SlikaElement[] = [];

    public get slika(): Slika {
        return this.wristWatch.slika;
    }

    constructor(public wristWatch: WristWatch) {

    }

    public async show(duration: number): Promise<void> {
        for (let i = 0; i < this.elements.length - 1; i++) {
            let e = this.elements[i];
            if (e instanceof SlikaImage) {
                e.animateSize(1, duration);
            }
            else {
                this.elements[i].animateAlpha(1, duration);
            }
        }
        let e = this.elements[this.elements.length - 1];
        if (e instanceof SlikaImage) {
            await e.animateSize(1, duration);
        }
        else {
            await e.animateAlpha(1, duration);
        }
    }

    public async hide(duration: number): Promise<void> {
        for (let i = 0; i < this.elements.length - 1; i++) {
            let e = this.elements[i];
            if (e instanceof SlikaImage) {
                e.animateSize(0, duration);
            }
            else {
                this.elements[i].animateAlpha(0, duration);
            }
        }
        let e = this.elements[this.elements.length - 1];
        if (e instanceof SlikaImage) {
            await e.animateSize(0, duration);
        }
        else {
            await e.animateAlpha(0, duration);
        }
    }

    public update(): void {}
}