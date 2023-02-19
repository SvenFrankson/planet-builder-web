class UniqueList<T> {

    private _elements: T[] = [];

    public get length(): number {
        return this._elements.length;
    }

    public get(i: number): T {
        return this._elements[i];
    }

    public getLast(): T {
        return this.get(this.length - 1);
    }

    public indexOf(e: T) {
        return this._elements.indexOf(e);
    }

    public push(e: T) {
        if (this._elements.indexOf(e) === -1) {
            this._elements.push(e);
        }
    }

    public remove(e: T): T {
        let i = this._elements.indexOf(e);
        if (i != -1) {
            this._elements.splice(i, 1);
            return e;
        }
        return undefined;
    }

    public contains(e: T): boolean {
        return this._elements.indexOf(e) != - 1;
    }

    public forEach(callback: (e: T) => void): void {
        this._elements.forEach(e => {
            callback(e);
        });
    }
}