class Number3D extends BABYLON.LinesMesh {

    public get digitSize(): number {
        return this.height * 0.5;
    }

    public get halfDigitSize(): number {
        return this.digitSize * 0.5;
    }

    public get quaterDigitSize(): number {
        return this.halfDigitSize * 0.5;
    }

    constructor(name: string, public value: number, public height: number = 0.5) {
        super(name);
    }

    private _getDigitLine(n: number): BABYLON.Vector3[] {
        if (n === 0) {
            return [
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(0, 0, 0)
            ]
        }
        if (n === 1) {
            return [
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0)
            ]
        }
        if (n === 2) {
            return [
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0)
            ]
        }
        if (n === 3) {
            return [
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(0, 0, 0)
            ]
        }
        if (n === 4) {
            return [
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0)
            ]
        }
        if (n === 5) {
            return [
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(0, 0, 0)
            ]
        }
        if (n === 6) {
            return [
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0)
            ]
        }
        if (n === 7) {
            return [
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(0, this.digitSize, 0)
            ]
        }
        if (n === 8) {
            return [
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0)
            ]
        }
        if (n === 9) {
            return [
                new BABYLON.Vector3(this.halfDigitSize, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, this.halfDigitSize, 0),
                new BABYLON.Vector3(0, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, this.digitSize, 0),
                new BABYLON.Vector3(this.halfDigitSize, 0, 0),
                new BABYLON.Vector3(0, 0, 0)
            ]
        }
    }

    public redraw(): void {
        let stringValue = this.value.toFixed(0);
        let lines = [];
        let x = 0;
        for (let i = 0; i < stringValue.length; i++) {
            let digit = parseInt(stringValue[i]);
            let digitLines = this._getDigitLine(digit);
            if (digitLines) {
                digitLines.forEach(v => {
                    v.x += x;
                });
                lines.push(digitLines);
            }
            x += this.halfDigitSize + this.quaterDigitSize;
        }
        BABYLON.CreateLineSystemVertexData({ lines: lines }).applyToMesh(this);
    }
}