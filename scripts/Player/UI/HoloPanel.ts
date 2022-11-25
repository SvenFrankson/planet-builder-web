/// <reference path="Pickable.ts"/>

class HoloPanel extends Pickable {

    public holoMesh: BABYLON.Mesh;
    public holoMaterial: HoloPanelMaterial;
    public holoTexture: BABYLON.DynamicTexture;
    public holoSlika: Slika;

    public pointerMesh: BABYLON.Mesh;
    public pointerMaterial: HoloPanelMaterial;
    public pointerTexture: BABYLON.DynamicTexture;
    public pointerElement: SlikaPointer;

    // 24 lines of 80 characters each
    public lines: string[] = [];

    private _angle = 0.8;
    private _radius = 2;
    private _cz = -2;

    private xTextureToPos(x: number): BABYLON.Vector2 {
        let a = (x - this._w / 2) / this._w * this._angle
        return new BABYLON.Vector2(
            Math.sin(a) * this._radius,
            Math.cos(a) * this._radius + this._cz
        );
    }

    private posXToXTexture(posX: number): number {
        let a = Math.asin(posX / this._radius);
        return a * this._w / this._angle + this._w * 0.5;
    }

    private posYToYTexture(posY: number): number {
        let h = this._angle * this._radius / this._w * this._h;
        return - posY / h * this._h + this._h * 0.5;
    }

    constructor(
        public size: number = 1,
        public height: number = 1,
        private _w: number = 1600,
        private _h: number = 1000,
        main: Main
    ) {
        super("holo-panel", main);
        this._angle = this.size / this._radius;
    }

    private async _animatePosY(posYTarget: number, duration: number): Promise<void> {
        return new Promise<void>(resolve => {
            let yZero = this.holoMesh.position.y;
            let t = 0;
            let cb = () => {
                t += this.main.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.holoMesh.position.y = yZero * (1 - f) + posYTarget * f;
                }
                else {
                    this.holoMesh.position.y = posYTarget;
                    this.main.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            }
            this.main.scene.onBeforeRenderObservable.add(cb);
        });
    }

    private async _animateScaleX(xTarget: number, duration: number): Promise<void> {
        return new Promise<void>(resolve => {
            let xZero = this.holoMesh.scaling.x;
            let t = 0;
            let cb = () => {
                t += this.main.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.holoMesh.scaling.x = xZero * (1 - f) + xTarget * f;
                }
                else {
                    this.holoMesh.scaling.x = xTarget;
                    this.main.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            }
            this.main.scene.onBeforeRenderObservable.add(cb);
        });
    }

    private async _animateScaleY(yTarget: number, duration: number): Promise<void> {
        return new Promise<void>(resolve => {
            let yZero = this.holoMesh.scaling.y;
            let t = 0;
            let cb = () => {
                t += this.main.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.holoMesh.scaling.y = yZero * (1 - f) + yTarget * f;
                }
                else {
                    this.holoMesh.scaling.y = yTarget;
                    this.main.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            }
            this.main.scene.onBeforeRenderObservable.add(cb);
        });
    }

    public instantiate(): void {
        super.instantiate();

        let h = this._angle * this._radius / this._w * this._h;

        BABYLON.CreateCylinderVertexData({ height: 0.1, diameter: 0.5 }).applyToMesh(this);
        let frame = BABYLON.MeshBuilder.CreateBox("frame", { size: 0.05 });
        frame.parent = this;
        frame.position.y = this.height - h * 0.5;
        VertexDataLoader.instance.get("holoPanelFrame").then(vertexDatas => {
            let vData = vertexDatas[1];
            vData.applyToMesh(frame);
        })
        let mat = new BABYLON.StandardMaterial("base-material", this.main.scene);
        mat.diffuseColor.copyFromFloats(0.8, 0, 0.2);
        mat.specularColor.copyFromFloats(0, 0, 0);
        this.material = mat;

        this.holoMesh = new BABYLON.Mesh("text-page");
        //this.holoMesh.layerMask = 0x10000000;
        this.holoMesh.parent = this;
        this.holoMesh.position.y = 0;
        this.holoMesh.scaling.x = 0.1;
        this.holoMesh.scaling.y = 0.1;
        this.holoMesh.alphaIndex = 1;

        this.pointerMesh = new BABYLON.Mesh("pointer-mesh");
        this.pointerMesh.position.z = - 0.03;
        this.pointerMesh.parent = this.holoMesh;
        this.pointerMesh.alphaIndex = 2;

        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];
        let normals: number[] = [];

        for (let i = 0; i <= 8; i++) {
            let p = this.xTextureToPos(i * this._w / 8);
            let l = positions.length / 3;
            positions.push(p.x, - h * 0.5, p.y);
            positions.push(p.x, h * 0.5, p.y);
            uvs.push(i / 8, 0);
            uvs.push(i / 8, 1);
            if (i < 8) {
                indices.push(l + 1, l, l + 2);
                indices.push(l + 1, l + 2, l + 3);
            }
        }
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        data.positions = positions;
        data.indices = indices;
        data.uvs = uvs;
        data.normals = normals;

        data.applyToMesh(this.holoMesh);

        data.applyToMesh(this.pointerMesh, true);

        this.holoMaterial = new HoloPanelMaterial("text-page-material", this.main.scene);
        this.holoMesh.material = this.holoMaterial;

        this.holoTexture = new BABYLON.DynamicTexture("text-page-texture", { width: this._w, height: this._h }, this.main.scene, true);
        this.holoTexture.hasAlpha = true;
        this.holoMaterial.holoTexture = this.holoTexture;

        this.holoSlika = new Slika(this._w, this._h, this.holoTexture.getContext(), this.holoTexture);

        this.pointerMaterial = new HoloPanelMaterial("text-page-material", this.main.scene);
        this.pointerMaterial.alpha = 0;
        this.pointerMesh.material = this.pointerMaterial;

        this.pointerTexture = new BABYLON.DynamicTexture("text-page-texture", { width: this._w, height: this._h }, this.main.scene, true);
        this.pointerTexture.hasAlpha = true;
        this.pointerMaterial.holoTexture = this.pointerTexture;

        let pointerSlika = new Slika(this._w, this._h, this.pointerTexture.getContext(), this.pointerTexture);
        this.pointerElement = new SlikaPointer(
            new SPosition(this._w * 0.5, this._h * 0.5),
            new SPosition(30, 13),
            new SPosition(this._w - 26, this._h - 21),
            60,
            BABYLON.Color3.FromHexString("#8dd6c0")
        );
        pointerSlika.add(this.pointerElement);

        this.lines[0] = "You know what? It is beets. I've crashed into a beet truck. Jaguar shark! So tell me - does it really exist? Is this my espresso machine? Wh-what is-h-how did you get my espresso machine? Hey, take a look at the earthlings. Goodbye! I was part of something special.";
        this.lines[1] = "Yeah, but John, if The Pirates of the Caribbean breaks down, the pirates don’t eat the tourists. Jaguar shark! So tell me - does it really exist? Did he just throw my cat out of the window? You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager?";
        this.lines[2] = "Forget the fat lady! You're obsessed with the fat lady! Drive us out of here! God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. You know what? It is beets. I've crashed into a beet truck. Hey, you know how I'm, like, always trying to save the planet? Here's my chance.";
        this.lines[3] = "Eventually, you do plan to have dinosaurs on your dinosaur tour, right? Just my luck, no ice. Remind me to thank John for a lovely weekend. This thing comes fully loaded. AM/FM radio, reclining bucket seats, and... power windows. Must go faster... go, go, go, go, go!";
        this.lines[4] = "Checkmate... Must go faster... go, go, go, go, go! Hey, you know how I'm, like, always trying to save the planet? Here's my chance. God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. Checkmate... You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager?";
    
        this.proxyPickMesh = this.holoMesh;

        let off = 5 * Math.random();
        let offPointer = 5 * Math.random();
        this.scene.onBeforeRenderObservable.add(() => {
            off += this.scene.getEngine().getDeltaTime() / 1000 * 0.15;
            offPointer += this.scene.getEngine().getDeltaTime() / 1000 * 0.15;
            if (off > 100) {
                off -= 100;
            }
            if (offPointer > 100) {
                offPointer -= 100;
            }
            this.holoMaterial.offset = off;
            this.pointerMaterial.offset = offPointer;
        });
    }

    public async open(): Promise<void> {
        await this._animatePosY(this.height, 0.3);
        await this._animateScaleX(1, 0.2);
        await this._animateScaleY(1, 0.2);
    }

    public async close(): Promise<void> {
        await this._animateScaleY(0.05, 0.1);
        await this._animateScaleX(0.05, 0.1);
        await this._animatePosY(0, 0.2);
    }

    public setPosition(position: BABYLON.Vector3): void {
        if (this) {
            this.position = position;
        }
    }

    public setTarget(target: BABYLON.Vector3, usePlanetUp: boolean = false): void {
        let y: BABYLON.Vector3;
        if (usePlanetUp && this.position.lengthSquared() != 0) {
            y = this.position.clone().normalize();
        }
        else {
            y = BABYLON.Vector3.Up();
        }
        let z = target.subtract(this.position).normalize().scaleInPlace(-1);
        let x = BABYLON.Vector3.Cross(y, z).normalize();
        z = BABYLON.Vector3.Cross(x, y).normalize();
        this.rotationQuaternion = BABYLON.Quaternion.RotationQuaternionFromAxis(x, y, z);
    }

    public redrawSVG(image: any): void {
        let context = this.holoTexture.getContext();
        context.clearRect(0, 0, this._w, this._h);

        context.drawImage(image, 0, 0, this._w, this._h);
        
        this.holoTexture.update();
    }

    public onHoverStart(): void {
        let mat = this.material;
        if (mat instanceof BABYLON.StandardMaterial) {
            mat.diffuseColor.copyFromFloats(0, 0.8, 0.2);
        }
        this._animatePointerAlpha(1, 0.5);
        this.scene.onBeforeRenderObservable.add(this._updatePointerMesh);
    }

    public onHoverEnd(): void {
        let mat = this.material;
        if (mat instanceof BABYLON.StandardMaterial) {
            mat.diffuseColor.copyFromFloats(0.8, 0, 0.2);
        }
        this._animatePointerAlpha(0, 0.5);
        this.holoSlika.onPointerExit();
        this.scene.onBeforeRenderObservable.removeCallback(this._updatePointerMesh);
    }

    private _updatePointerMesh = () => {
        let local = BABYLON.Vector3.TransformCoordinates(this.inputManager.aimedPosition, this.holoMesh.getWorldMatrix().clone().invert());
        let x = this.posXToXTexture(local.x);
        let y = this.posYToYTexture(local.y);
        this.holoSlika.onPointerMove(x, y);
        this.pointerElement.setPosition(x, y);
    }

    private async _animatePointerAlpha(alphaTarget: number, duration: number): Promise<void> {
        return new Promise<void>(resolve => {
            let alphaZero = this.pointerMaterial.alpha;
            let t = 0;
            let cb = () => {
                t += this.main.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.pointerMaterial.alpha = alphaZero * (1 - f) + alphaTarget * f;
                }
                else {
                    this.pointerMaterial.alpha = alphaTarget;
                    this.main.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            }
            this.main.scene.onBeforeRenderObservable.add(cb);
        });
    }
}