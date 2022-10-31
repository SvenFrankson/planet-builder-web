class TextPage {

    public baseMesh: BABYLON.Mesh;
    public mesh: BABYLON.Mesh;
    public material: BABYLON.StandardMaterial;
    public meshOnOff: BABYLON.Mesh;
    public materialOnOff: BABYLON.StandardMaterial;
    public texture: BABYLON.DynamicTexture;
    public textureOnOff: BABYLON.DynamicTexture;

    // 24 lines of 80 characters each
    public lines: string[] = [];

    private _w: number = 1600;
    private _h: number = 1000;

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

    constructor(public game: Game | Demo) {

    }

    private async _animatePosY(posYTarget: number, duration: number): Promise<void> {
        return new Promise<void>(resolve => {
            let yZero = this.mesh.position.y;
            let t = 0;
            let cb = () => {
                t += this.game.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.mesh.position.y = yZero * (1 - f) + posYTarget * f;
                }
                else {
                    this.mesh.position.y = posYTarget;
                    this.game.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            }
            this.game.scene.onBeforeRenderObservable.add(cb);
        });
    }

    private async _animateScaleX(xTarget: number, duration: number): Promise<void> {
        return new Promise<void>(resolve => {
            let xZero = this.mesh.scaling.x;
            let t = 0;
            let cb = () => {
                t += this.game.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.mesh.scaling.x = xZero * (1 - f) + xTarget * f;
                }
                else {
                    this.mesh.scaling.x = xTarget;
                    this.game.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            }
            this.game.scene.onBeforeRenderObservable.add(cb);
        });
    }

    private async _animateScaleY(yTarget: number, duration: number): Promise<void> {
        return new Promise<void>(resolve => {
            let yZero = this.mesh.scaling.y;
            let t = 0;
            let cb = () => {
                t += this.game.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.mesh.scaling.y = yZero * (1 - f) + yTarget * f;
                }
                else {
                    this.mesh.scaling.y = yTarget;
                    this.game.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            }
            this.game.scene.onBeforeRenderObservable.add(cb);
        });
    }

    public instantiate(): void {
        this.baseMesh = BABYLON.MeshBuilder.CreateCylinder("text-page-base", { height: 0.1, diameter: 0.5 });

        this.mesh = new BABYLON.Mesh("text-page");
        this.mesh.layerMask = 0x10000000;
        this.mesh.parent = this.baseMesh;
        this.mesh.position.y = 0;
        this.mesh.rotation.y = Math.PI;
        this.mesh.scaling.x = 0.1;
        this.mesh.scaling.y = 0.1;
        this.mesh.alphaIndex = 100;

        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];
        let normals: number[] = [];

        for (let i = 0; i <= 8; i++) {
            let p = this.xTextureToPos(i * 1600 / 8);
            let l = positions.length / 3;
            positions.push(p.x, -0.5, p.y);
            positions.push(p.x, 0.5, p.y);
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

        data.applyToMesh(this.mesh);

        this.material = new BABYLON.StandardMaterial("text-page-material", this.game.scene);
        this.material.useAlphaFromDiffuseTexture = true;
        this.material.specularColor.copyFromFloats(0, 0, 0);
        this.material.emissiveColor.copyFromFloats(1, 1, 1);
        this.mesh.material = this.material;

        this.texture = new BABYLON.DynamicTexture("text-page-texture", { width: this._w, height: this._h }, this.game.scene, true);
        this.texture.hasAlpha = true;
        this.material.diffuseTexture = this.texture;

        this.meshOnOff = new BABYLON.Mesh("text-page");
        this.meshOnOff.layerMask = 0x10000000;
        this.meshOnOff.parent = this.baseMesh;
        this.meshOnOff.position.y = 1.05;
        this.meshOnOff.position.z = 0.05;
        this.meshOnOff.rotation.y = Math.PI;

        data = new BABYLON.VertexData();
        positions = [];
        indices = [];
        uvs = [];
        normals = [];

        for (let i = 0; i <= 2; i++) {
            let p = this.xTextureToPos(730 + 70 * i);
            let l = positions.length / 3;
            positions.push(p.x, -0.07, p.y);
            positions.push(p.x, 0.07, p.y);
            uvs.push(i / 2, 0);
            uvs.push(i / 2, 1);
            if (i < 2) {
                indices.push(l + 1, l, l + 2);
                indices.push(l + 1, l + 2, l + 3);
            }
        }

        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        data.positions = positions;
        data.indices = indices;
        data.uvs = uvs;
        data.normals = normals;

        data.applyToMesh(this.meshOnOff);

        this.materialOnOff = new BABYLON.StandardMaterial("text-page-material-on-off", this.game.scene);
        this.materialOnOff.useAlphaFromDiffuseTexture = true;
        this.materialOnOff.specularColor.copyFromFloats(0, 0, 0);
        this.materialOnOff.emissiveColor.copyFromFloats(1, 1, 1);
        this.meshOnOff.material = this.materialOnOff;

        this.textureOnOff = new BABYLON.DynamicTexture("text-page-texture-on-off", { width: 140, height: 140 }, this.game.scene, true);
        this.textureOnOff.hasAlpha = true;
        this.materialOnOff.diffuseTexture = this.textureOnOff;

        let context = this.textureOnOff.getContext();
        context.clearRect(0, 0, 140, 140);
        let path = TextPage.MakePath([
            50, 20,
            90, 20,
            120, 50,
            120, 90,
            90, 120,
            50, 120,
            20, 90,
            20, 50,
        ]);
        TextPage.FillPath(
            path,
            BABYLON.Color3.FromHexString("#3a3e45"),
            0.8,
            context
        );

        TextPage.DrawGlowPath(
            path,
            10,
            BABYLON.Color3.FromHexString("#2c4b7d"),
            1,
            true,
            true,
            context
        );
        this.textureOnOff.update();

        this.lines[0] = "You know what? It is beets. I've crashed into a beet truck. Jaguar shark! So tell me - does it really exist? Is this my espresso machine? Wh-what is-h-how did you get my espresso machine? Hey, take a look at the earthlings. Goodbye! I was part of something special.";
        this.lines[1] = "Yeah, but John, if The Pirates of the Caribbean breaks down, the pirates don’t eat the tourists. Jaguar shark! So tell me - does it really exist? Did he just throw my cat out of the window? You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager?";
        this.lines[2] = "Forget the fat lady! You're obsessed with the fat lady! Drive us out of here! God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. You know what? It is beets. I've crashed into a beet truck. Hey, you know how I'm, like, always trying to save the planet? Here's my chance.";
        this.lines[3] = "Eventually, you do plan to have dinosaurs on your dinosaur tour, right? Just my luck, no ice. Remind me to thank John for a lovely weekend. This thing comes fully loaded. AM/FM radio, reclining bucket seats, and... power windows. Must go faster... go, go, go, go, go!";
        this.lines[4] = "Checkmate... Must go faster... go, go, go, go, go! Hey, you know how I'm, like, always trying to save the planet? Here's my chance. God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. Checkmate... You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager?";
    }

    public async open(): Promise<void> {
        await this._animatePosY(1.5, 0.3);
        await this._animateScaleX(1, 0.2);
        await this._animateScaleY(1, 0.2);
    }

    public async close(): Promise<void> {
        await this._animateScaleY(0.05, 0.1);
        await this._animateScaleX(0.05, 0.1);
        await this._animatePosY(0, 0.2);
    }

    public setPosition(position: BABYLON.Vector3): void {
        if (this.baseMesh) {
            this.baseMesh.position = position;
        }
    }

    public setTarget(target: BABYLON.Vector3): void {
        let y = this.baseMesh.position.clone().normalize();
        let z = target.subtract(this.baseMesh.position);
        let x = BABYLON.Vector3.Cross(y, z);
        z = BABYLON.Vector3.Cross(x, y);
        this.baseMesh.rotationQuaternion = BABYLON.Quaternion.RotationQuaternionFromAxis(x, y, z);
    }

    public redraw(): void {
        let marginLeft = 142;
        let maxChar = 75;
        let marginTop = 130;
        let fontSize = 30;

        let texW = this._w;
        let texH = this._h;
        let frameOffset = 100;
        let frameW = this._w - 2 * frameOffset;
        let frameH = this._h - 2 * frameOffset;
        let cornerSize = 50;
        let sCornerSize = cornerSize * 0.5;
        let frameX0 = frameOffset;
        let frameX1 = frameOffset + frameW;
        let frameY0 = frameOffset;
        let frameY1 = frameOffset + frameH;

        let grey = new BABYLON.Color3(0.5, 0.5, 0.5);

        let context = this.texture.getContext();
        context.clearRect(0, 0, this._w, this._h);
        
        let decoyPath0 = TextPage.MakePath([
            frameX0 - sCornerSize, frameY0 + frameH * 0.25 + sCornerSize,
            frameX0 - sCornerSize, frameY0 + sCornerSize,
            frameX0 + sCornerSize, frameY0 - sCornerSize,
            frameX0 + frameW * 0.25 + sCornerSize, frameY0 - sCornerSize,
        ]);

        TextPage.DrawGlowPath(
            decoyPath0,
            6,
            BABYLON.Color3.FromHexString("#2c4b7d"),
            1,
            false,
            true,
            context
        );

        let decoyPath1 = TextPage.MakePath([
            frameX1 + sCornerSize, frameY0 + frameH * 0.25 + sCornerSize,
            frameX1 + sCornerSize, frameY0 + sCornerSize,
            frameX1 - sCornerSize, frameY0 - sCornerSize,
            frameX1 - frameW * 0.25 - sCornerSize, frameY0 - sCornerSize,
        ]);

        TextPage.DrawGlowPath(
            decoyPath1,
            6,
            BABYLON.Color3.FromHexString("#2c4b7d"),
            1,
            false,
            true,
            context
        );
        
        let decoyPath2 = TextPage.MakePath([
            frameX1 + sCornerSize, frameY1 - frameH * 0.25 - sCornerSize,
            frameX1 + sCornerSize, frameY1 - sCornerSize,
            frameX1 - sCornerSize, frameY1 + sCornerSize,
            frameX1 - frameW * 0.25 - sCornerSize, frameY1 + sCornerSize,
        ]);

        TextPage.DrawGlowPath(
            decoyPath2,
            6,
            BABYLON.Color3.FromHexString("#2c4b7d"),
            1,
            false,
            true,
            context
        );
        
        let decoyPath3 = TextPage.MakePath([
            frameX0 - sCornerSize, frameY1 - frameH * 0.25 - sCornerSize,
            frameX0 - sCornerSize, frameY1 - sCornerSize,
            frameX0 + sCornerSize, frameY1 + sCornerSize,
            frameX0 + frameW * 0.25 + sCornerSize, frameY1 + sCornerSize,
        ]);

        TextPage.DrawGlowPath(
            decoyPath3,
            6,
            BABYLON.Color3.FromHexString("#2c4b7d"),
            1,
            false,
            true,
            context
        );
        
        let path = TextPage.MakePath([
            frameX0 + cornerSize, frameY0,
            frameX0 + frameW * 0.25, frameY0,
            frameX0 + frameW * 0.25 + cornerSize, frameY0 - cornerSize,
            frameX1 - frameW * 0.25 - cornerSize, frameY0 - cornerSize,
            frameX1 - frameW * 0.25, frameY0,
            frameX1 - cornerSize, frameY0,

            frameX1, frameY0 + cornerSize,
            frameX1, frameY0 + frameH * 0.25,
            frameX1 + cornerSize, frameY0 + frameH * 0.25 + cornerSize,
            frameX1 + cornerSize, frameY1 - frameH * 0.25 - cornerSize,
            frameX1, frameY1 - frameH * 0.25,
            frameX1, frameY1 - cornerSize,

            frameX1 - cornerSize, frameY1,
            frameX1 - frameW * 0.25, frameY1,
            frameX1 - frameW * 0.25 - cornerSize, frameY1 + cornerSize,
            frameX0 + frameW * 0.25 + cornerSize, frameY1 + cornerSize,
            frameX0 + frameW * 0.25, frameY1,
            frameX0 + cornerSize, frameY1,
            
            frameX0, frameY1 - cornerSize,
            frameX0, frameY1 - frameH * 0.25,
            frameX0 - cornerSize, frameY1 - frameH * 0.25 - cornerSize,
            frameX0 - cornerSize, frameY0 + frameH * 0.25 + cornerSize,
            frameX0, frameY0 + frameH * 0.25,
            frameX0, frameY0 + cornerSize,
        ]);

        let nLine = 12;
        let step = frameW / nLine;
        for (let i = 0; i < nLine; i++) {
            let x = frameX0 + step * (i + 0.5);
            let y0 = frameY0;
            let y1 = frameY1;
            if (i >= nLine / 4 && i < 3 * nLine / 4) {
                y0 -= cornerSize;
                y1 += cornerSize;
            }
            TextPage.DrawGlowLine(x, y0, x, y1, 1, grey, 0.7, false, context);
        }

        nLine = 7;
        step = frameH / nLine;
        for (let i = 0; i < nLine; i++) {
            let x0 = frameX0;
            let x1 = frameX1;
            let y = frameY0 + step * (i + 0.5);
            if (i >= 2 && i <= 4) {
                x0 -= cornerSize;
                x1 += cornerSize;
            }
            TextPage.DrawGlowLine(x0, y, x1, y, 1, grey, 0.7, false, context);
        }

        TextPage.FillPath(
            path,
            BABYLON.Color3.FromHexString("#3a3e45"),
            0.8,
            context
        );

        TextPage.DrawGlowPath(
            path,
            10,
            BABYLON.Color3.FromHexString("#2c4b7d"),
            1,
            true,
            true,
            context
        );

        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.font = fontSize.toFixed(0) + "px Consolas";
        let line = this.lines[0];
        let i = 0;
        let ii = 0;
        while (line && ii < 1000 / fontSize) {
            //context.fillText((i + 1).toFixed(0) + ":", marginLeft - 2 * fontSize, marginTop + fontSize * (ii + 1));
            let cutLine = line.substring(0, 100);
            context.fillText(cutLine, marginLeft, marginTop + fontSize * (ii + 1));
            ii++;
            line = line.substring(100);
            while (line.length > 0) {
                cutLine = line.substring(0, 100);
                context.fillText(cutLine, marginLeft, marginTop + fontSize * (ii + 1));
                ii++;
                line = line.substring(100);
            }
            i++;
            line = this.lines[i];
        }
        this.texture.update();
    }

    public static MakePath(points: number[]): BABYLON.Vector2[] {
        let path: BABYLON.Vector2[] = [];
        for (let i = 0; i < points.length / 2; i++) {
            path.push(new BABYLON.Vector2(points[2 * i], points[2 * i + 1]));
        }
        return path;
    }

    public static FillPath(path: BABYLON.Vector2[], color: BABYLON.Color3, alpha: number, context: BABYLON.ICanvasRenderingContext): void {
        context.beginPath();
        context.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            context.lineTo(path[i].x, path[i].y);
        }
        context.closePath();
        let r = color.r * 255;
        let g = color.g * 255;
        let b = color.b * 255;
        context.fillStyle = "rgba(" + r.toFixed(0) + ", " + g.toFixed(0) + ", " + b.toFixed(0) + ", " + alpha.toFixed(2) + ")";
        context.fill();
    }

    public static DrawGlowLine(x0: number, y0: number, x1: number, y1: number, width: number, color: BABYLON.Color3, alpha: number, outline: boolean, context: BABYLON.ICanvasRenderingContext): void {
        TextPage.DrawGlowPath([new BABYLON.Vector2(x0, y0), new BABYLON.Vector2(x1, y1)], width, color, alpha, false, outline, context);
    }

    public static DrawGlowPath(path: BABYLON.Vector2[], width: number, color: BABYLON.Color3, alpha: number, closePath: boolean, outline: boolean, context: BABYLON.ICanvasRenderingContext): void {
        let w2 = width * 10;
        let w = width;
        let rMax = Math.min(1, 2 * color.r);
        let gMax = Math.min(1, 2 * color.g);
        let bMax = Math.min(1, 2 * color.b);
        context.beginPath();
        context.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            context.lineTo(path[i].x, path[i].y);
        }
        if (closePath) {
            context.closePath();
        }

        if (outline) {
            context.lineWidth = w + 4;
            context.strokeStyle = "black";
            context.stroke();
        }
        
        context.lineWidth = w;
        context.strokeStyle = "rgba(" + (color.r * 255).toFixed(0) + ", " + (color.g * 255).toFixed(0) + ", " + (color.b * 255).toFixed(0) + ", " + alpha.toFixed(2) + ")";
        context.stroke();
        
        context.lineWidth = w * 0.5;
        context.strokeStyle = "rgba(" + (rMax * 255).toFixed(0) + ", " + (gMax * 255).toFixed(0) + ", " + (bMax * 255).toFixed(0) + ", " + alpha.toFixed(2) + ")";
        context.stroke();
    }
}